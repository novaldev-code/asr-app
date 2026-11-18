import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { AppError } from "../../common/app-error.js";
import { paginationMeta } from "../../common/pagination.js";
import { env } from "../../config/env.js";
import { DB, type Database } from "../../db/index.js";
import {
  addresses,
  cartItems,
  carts,
  orderItems,
  orders,
  orderStatusHistory,
  products,
  users,
} from "../../db/schema/index.js";
import { CartService } from "../cart/cart.service.js";
import { ShippingService } from "../shipping/shipping.service.js";
import { UploadsService } from "../uploads/uploads.service.js";
import { formatOrderNumber } from "./order-number.js";
import {
  canSubmitProof,
  canTransition,
  canVerifyPayment,
  isExpired,
} from "./order-state.js";
import type {
  AdminOrderQueryDto,
  CancelOrderDto,
  CreateOrderDto,
  OrderQueryDto,
  UpdateOrderStatusDto,
  VerifyPaymentDto,
} from "./orders.dto.js";

@Injectable()
export class OrdersService {
  private expirySweepAt = 0;

  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly cartService: CartService,
    private readonly shippingService: ShippingService,
    private readonly uploads: UploadsService,
  ) {}

  async checkout(userId: string, input: CreateOrderDto) {
    if (input.addressId) {
      const [address] = await this.db
        .select({ id: addresses.id })
        .from(addresses)
        .where(
          and(eq(addresses.id, input.addressId), eq(addresses.userId, userId)),
        )
        .limit(1);
      if (!address) throw new BadRequestException("Alamat tidak ditemukan.");
    }

    return this.db.transaction(async (tx) => {
      const cart = await this.cartService.ensureCart(tx, userId);
      const lines = await tx
        .select()
        .from(cartItems)
        .where(eq(cartItems.cartId, cart.id));

      if (lines.length === 0) {
        throw new BadRequestException("Keranjang masih kosong.");
      }

      const productIds = lines.map((line) => line.productId);
      const lockedProducts = await tx
        .select()
        .from(products)
        .where(inArray(products.id, productIds))
        .orderBy(asc(products.id))
        .for("update");
      const productById = new Map(
        lockedProducts.map((product) => [product.id, product]),
      );

      let subtotal = 0;
      const lineSnapshots: {
        productId: string;
        productName: string;
        unitPrice: number;
        quantity: number;
        lineTotal: number;
      }[] = [];

      for (const line of lines) {
        const product = productById.get(line.productId);
        if (!product || !product.isActive) {
          throw new AppError(
            "PRODUCT_UNAVAILABLE",
            "Ada produk yang tidak lagi tersedia.",
            409,
            { productId: line.productId },
          );
        }
        if (line.quantity > product.stock) {
          throw new AppError(
            "INSUFFICIENT_STOCK",
            `Stok ${product.name} tersisa ${product.stock}.`,
            409,
            {
              productId: product.id,
              productName: product.name,
              available: product.stock,
              requested: line.quantity,
            },
          );
        }
        const lineTotal = product.price * line.quantity;
        subtotal += lineTotal;
        lineSnapshots.push({
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: line.quantity,
          lineTotal,
        });
      }

      const shipping = await this.shippingService.quote(
        input.shipping.province,
        tx,
      );
      const total = subtotal + shipping.cost;
      const now = new Date();
      const expiresAt =
        input.paymentMethod === "bank_transfer"
          ? new Date(now.getTime() + env.ORDER_EXPIRY_HOURS * 60 * 60 * 1000)
          : null;

      const sequenceResult = await tx.execute(
        sql`SELECT nextval('order_number_seq') AS value`,
      );
      const sequence = Number(
        (sequenceResult as unknown as { rows: { value: string }[] }).rows[0]
          ?.value ?? Date.now(),
      );

      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber: formatOrderNumber(sequence, now),
          userId,
          addressId: input.addressId ?? null,
          status: "pending",
          paymentMethod: input.paymentMethod,
          paymentStatus: "unpaid",
          expiresAt,
          subtotal,
          shippingCost: shipping.cost,
          total,
          recipientName: input.shipping.recipientName,
          phone: input.shipping.phone,
          shippingAddress: `${input.shipping.addressLine}, ${input.shipping.city}, ${input.shipping.province} ${input.shipping.postalCode}`,
          notes: input.notes ?? "",
        })
        .returning();

      await tx.insert(orderItems).values(
        lineSnapshots.map((line) => ({
          orderId: order.id,
          productId: line.productId,
          productName: line.productName,
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          lineTotal: line.lineTotal,
        })),
      );

      for (const line of lineSnapshots) {
        const updated = await tx
          .update(products)
          .set({
            stock: sql`${products.stock} - ${line.quantity}`,
            updatedAt: now,
          })
          .where(
            and(
              eq(products.id, line.productId),
              gte(products.stock, line.quantity),
            ),
          )
          .returning({ id: products.id });
        if (updated.length === 0) {
          throw new AppError(
            "INSUFFICIENT_STOCK",
            `Stok ${line.productName} tidak mencukupi.`,
            409,
            { productId: line.productId },
          );
        }
      }

      await tx.insert(orderStatusHistory).values({
        orderId: order.id,
        fromStatus: null,
        toStatus: "pending",
        changedBy: userId,
        note: "Pesanan dibuat pelanggan.",
      });

      await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
      await tx
        .update(carts)
        .set({ updatedAt: now })
        .where(eq(carts.id, cart.id));

      return this.loadOrder(order.id, tx);
    });
  }

  async listForUser(userId: string, query: OrderQueryDto) {
    await this.maybeExpire();
    const conditions = [eq(orders.userId, userId)];
    if (query.status) conditions.push(eq(orders.status, query.status));
    const where = and(...conditions);

    const rows = await this.db
      .select()
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);

    const [totalRow] = await this.db
      .select({ value: count() })
      .from(orders)
      .where(where);

    return {
      data: await this.attachItems(rows),
      meta: paginationMeta(
        query.page,
        query.limit,
        Number(totalRow?.value ?? 0),
      ),
    };
  }

  async getForUser(userId: string, orderId: string) {
    await this.maybeExpire();
    const [order] = await this.db
      .select({ id: orders.id })
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
      .limit(1);
    if (!order) throw new NotFoundException("Pesanan tidak ditemukan.");
    return this.loadOrder(order.id);
  }

  async getForUserByNumber(userId: string, orderNumber: string) {
    await this.maybeExpire();
    const [order] = await this.db
      .select({ id: orders.id })
      .from(orders)
      .where(
        and(eq(orders.orderNumber, orderNumber), eq(orders.userId, userId)),
      )
      .limit(1);
    if (!order) throw new NotFoundException("Pesanan tidak ditemukan.");
    return this.loadOrder(order.id);
  }

  async cancelForUser(
    userId: string,
    orderId: string,
    input: CancelOrderDto,
  ) {
    return this.db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
        .limit(1)
        .for("update");
      if (!order) throw new NotFoundException("Pesanan tidak ditemukan.");

      const transition = canTransition(order, "cancelled", "customer");
      if (!transition.ok) {
        throw new AppError(
          "INVALID_STATUS_TRANSITION",
          transition.reason ?? "Pesanan tidak dapat dibatalkan.",
          409,
        );
      }

      const now = new Date();
      await this.restock(tx, order.id);
      await tx
        .update(orders)
        .set({ status: "cancelled", cancelledAt: now, updatedAt: now })
        .where(eq(orders.id, order.id));
      await tx.insert(orderStatusHistory).values({
        orderId: order.id,
        fromStatus: order.status,
        toStatus: "cancelled",
        changedBy: userId,
        note: input.note ?? "Pesanan dibatalkan pelanggan.",
      });
      return this.loadOrder(order.id, tx);
    });
  }

  async submitPaymentProof(
    userId: string,
    orderId: string,
    file: Express.Multer.File,
  ) {
    return this.db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
        .limit(1)
        .for("update");
      if (!order) throw new NotFoundException("Pesanan tidak ditemukan.");
      if (!canSubmitProof(order)) {
        throw new AppError(
          "PAYMENT_PROOF_NOT_ALLOWED",
          "Bukti pembayaran tidak dapat diunggah pada status ini.",
          409,
        );
      }

      const proofPath = await this.uploads.savePaymentProof(file);
      const now = new Date();
      await tx
        .update(orders)
        .set({
          paymentProofUrl: proofPath,
          paymentStatus: "waiting_verification",
          updatedAt: now,
        })
        .where(eq(orders.id, order.id));

      return this.loadOrder(order.id, tx);
    });
  }

  async getPaymentProof(
    userId: string,
    isAdmin: boolean,
    orderId: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    await this.maybeExpire();
    const order = await this.findOrderForAccess(userId, isAdmin, orderId);
    if (!order.paymentProofUrl) {
      throw new NotFoundException("Bukti pembayaran belum diunggah.");
    }
    const buffer = await this.uploads.readPaymentProof(order.paymentProofUrl);
    return {
      buffer,
      filename: order.paymentProofUrl.split("/").pop() ?? "payment-proof",
    };
  }

  async listForAdmin(query: AdminOrderQueryDto) {
    await this.maybeExpire();
    const conditions = [];
    if (query.status) conditions.push(eq(orders.status, query.status));
    if (query.paymentStatus) {
      conditions.push(eq(orders.paymentStatus, query.paymentStatus));
    }
    if (query.q) {
      const term = `%${query.q}%`;
      conditions.push(
        or(
          ilike(orders.orderNumber, term),
          ilike(orders.recipientName, term),
          ilike(users.name, term),
          ilike(users.email, term),
        )!,
      );
    }
    if (query.from) {
      conditions.push(gte(orders.createdAt, new Date(query.from)));
    }
    if (query.to) {
      conditions.push(lte(orders.createdAt, new Date(query.to)));
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await this.db
      .select({
        order: orders,
        customer: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);

    const [totalRow] = await this.db
      .select({ value: count() })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .where(where);

    const itemsByOrder = await this.itemsByOrder(
      rows.map((row) => row.order.id),
    );

    return {
      data: rows.map((row) => ({
        ...row.order,
        customer: row.customer,
        items: itemsByOrder.get(row.order.id) ?? [],
      })),
      meta: paginationMeta(
        query.page,
        query.limit,
        Number(totalRow?.value ?? 0),
      ),
    };
  }

  async getForAdmin(orderId: string) {
    await this.maybeExpire();
    const order = await this.loadOrder(orderId);
    const [customer] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
      })
      .from(users)
      .where(eq(users.id, order.userId))
      .limit(1);
    return { ...order, customer: customer ?? null };
  }

  async getForAdminByNumber(orderNumber: string) {
    const [order] = await this.db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber))
      .limit(1);
    if (!order) throw new NotFoundException("Pesanan tidak ditemukan.");
    return this.getForAdmin(order.id);
  }

  async transition(
    orderId: string,
    input: UpdateOrderStatusDto,
    adminId: string,
  ) {
    return this.db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1)
        .for("update");
      if (!order) throw new NotFoundException("Pesanan tidak ditemukan.");

      const transition = canTransition(order, input.status, "admin");
      if (!transition.ok) {
        throw new AppError(
          "INVALID_STATUS_TRANSITION",
          transition.reason ?? "Transisi status tidak diizinkan.",
          409,
        );
      }

      const now = new Date();
      const markCodPaid =
        input.status === "completed" &&
        order.paymentMethod === "cod" &&
        order.paymentStatus !== "paid";

      if (input.status === "cancelled") {
        await this.restock(tx, order.id);
      }

      await tx
        .update(orders)
        .set({
          status: input.status,
          ...(input.status === "cancelled" ? { cancelledAt: now } : {}),
          ...(markCodPaid ? { paymentStatus: "paid" as const, paidAt: now } : {}),
          updatedAt: now,
        })
        .where(eq(orders.id, order.id));

      await tx.insert(orderStatusHistory).values({
        orderId: order.id,
        fromStatus: order.status,
        toStatus: input.status,
        changedBy: adminId,
        note: input.note ?? `Status diubah menjadi ${input.status}.`,
      });

      return this.loadOrder(order.id, tx);
    });
  }

  async verifyPayment(
    orderId: string,
    input: VerifyPaymentDto,
    _adminId: string,
  ) {
    return this.db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1)
        .for("update");
      if (!order) throw new NotFoundException("Pesanan tidak ditemukan.");
      if (!canVerifyPayment(order)) {
        throw new AppError(
          "PAYMENT_VERIFICATION_NOT_ALLOWED",
          "Pembayaran tidak dapat diverifikasi pada status ini.",
          409,
        );
      }

      const now = new Date();
      await tx
        .update(orders)
        .set({
          paymentStatus: input.decision,
          ...(input.decision === "paid" ? { paidAt: now } : {}),
          updatedAt: now,
        })
        .where(eq(orders.id, order.id));

      return this.loadOrder(order.id, tx);
    });
  }

  private async maybeExpire(): Promise<void> {
    const now = Date.now();
    if (now - this.expirySweepAt < 5 * 60_000) return;
    this.expirySweepAt = now;
    try {
      await this.expireOrders(new Date(now));
    } catch {
      // Best effort; the daily Vercel Cron remains the backstop.
    }
  }

  async expireOrders(now = new Date()): Promise<number> {
    const candidates = await this.db
      .select({ id: orders.id })
      .from(orders)
      .where(
        and(
          eq(orders.status, "pending"),
          eq(orders.paymentMethod, "bank_transfer"),
          inArray(orders.paymentStatus, ["unpaid", "rejected"]),
          lte(orders.expiresAt, now),
        ),
      )
      .limit(100);

    let expired = 0;
    for (const candidate of candidates) {
      if (await this.expireOne(candidate.id, now)) expired += 1;
    }
    return expired;
  }

  async dashboard() {
    await this.maybeExpire();
    const [pendingRow] = await this.db
      .select({ value: count() })
      .from(orders)
      .where(eq(orders.status, "pending"));
    const [waitingRow] = await this.db
      .select({ value: count() })
      .from(orders)
      .where(eq(orders.paymentStatus, "waiting_verification"));
    const [lowStockRow] = await this.db
      .select({ value: count() })
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          lte(products.stock, env.LOW_STOCK_THRESHOLD),
        ),
      );
    const [salesRow] = await this.db
      .select({
        value: sql<number>`coalesce(sum(${orders.total}), 0)`,
      })
      .from(orders)
      .where(ne(orders.status, "cancelled"));

    const recentOrders = await this.db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5);

    return {
      data: {
        newOrders: Number(pendingRow?.value ?? 0),
        waitingVerification: Number(waitingRow?.value ?? 0),
        lowStockProducts: Number(lowStockRow?.value ?? 0),
        totalSales: Number(salesRow?.value ?? 0),
        recentOrders,
      },
    };
  }

  private async expireOne(orderId: string, now: Date): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1)
        .for("update");
      if (!order || !isExpired(order, now)) return false;

      await this.restock(tx, order.id);
      await tx
        .update(orders)
        .set({ status: "cancelled", cancelledAt: now, updatedAt: now })
        .where(eq(orders.id, order.id));
      await tx.insert(orderStatusHistory).values({
        orderId: order.id,
        fromStatus: order.status,
        toStatus: "cancelled",
        changedBy: null,
        note: "Dibatalkan otomatis karena batas waktu pembayaran terlampaui.",
      });
      return true;
    });
  }

  private async restock(tx: any, orderId: string): Promise<void> {
    const items = await tx
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      if (!item.productId) continue;
      await tx
        .update(products)
        .set({
          stock: sql`${products.stock} + ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(products.id, item.productId));
    }
  }

  private async loadOrder(orderId: string, executor: any = this.db) {
    const [order] = await executor
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!order) throw new NotFoundException("Pesanan tidak ditemukan.");

    const items = await executor
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
    const history = await executor
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(asc(orderStatusHistory.createdAt));

    return { ...order, items, history };
  }

  private async findOrderForAccess(
    userId: string,
    isAdmin: boolean,
    orderId: string,
  ) {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(
        isAdmin
          ? eq(orders.id, orderId)
          : and(eq(orders.id, orderId), eq(orders.userId, userId)),
      )
      .limit(1);
    if (!order) throw new NotFoundException("Pesanan tidak ditemukan.");
    return order;
  }

  private async attachItems<T extends { id: string }>(rows: T[]) {
    const itemsByOrder = await this.itemsByOrder(rows.map((row) => row.id));
    return rows.map((row) => ({
      ...row,
      items: itemsByOrder.get(row.id) ?? [],
    }));
  }

  private async itemsByOrder(orderIds: string[]) {
    if (orderIds.length === 0) return new Map<string, (typeof orderItems.$inferSelect)[]>();
    const items = await this.db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));
    const grouped = new Map<string, (typeof orderItems.$inferSelect)[]>();
    for (const item of items) {
      const list = grouped.get(item.orderId) ?? [];
      list.push(item);
      grouped.set(item.orderId, list);
    }
    return grouped;
  }
}
