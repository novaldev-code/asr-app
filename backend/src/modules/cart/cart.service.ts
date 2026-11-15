import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, eq, sql } from "drizzle-orm";
import { DB, type Database } from "../../db/index.js";
import { cartItems, carts, products } from "../../db/schema/index.js";
import type {
  AddCartItemDto,
  MergeCartDto,
  UpdateCartItemDto,
} from "./cart.dto.js";

type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
type Executor = Database | Transaction;

@Injectable()
export class CartService {
  constructor(@Inject(DB) private readonly db: Database) {}

  async get(userId: string) {
    const cart = await this.ensureCart(this.db, userId);
    return this.loadCart(cart.id);
  }

  async addItem(userId: string, input: AddCartItemDto) {
    const product = await this.getPurchasableProduct(input.productId);
    if (input.quantity > product.stock) {
      throw new ConflictException(
        `Stok ${product.name} tersisa ${product.stock}.`,
      );
    }

    return this.db.transaction(async (tx) => {
      const cart = await this.ensureCart(tx, userId);
      await tx
        .insert(cartItems)
        .values({
          cartId: cart.id,
          productId: product.id,
          quantity: input.quantity,
        })
        .onConflictDoUpdate({
          target: [cartItems.cartId, cartItems.productId],
          set: {
            quantity: sql`LEAST(${cartItems.quantity} + ${input.quantity}, ${product.stock})`,
            updatedAt: new Date(),
          },
        });
      await tx
        .update(carts)
        .set({ updatedAt: new Date() })
        .where(eq(carts.id, cart.id));
      return this.loadCart(cart.id, tx);
    });
  }

  async updateItem(userId: string, itemId: string, input: UpdateCartItemDto) {
    const item = await this.getOwnedItem(userId, itemId);
    const product = await this.getPurchasableProduct(item.productId);
    if (input.quantity > product.stock) {
      throw new ConflictException(
        `Stok ${product.name} tersisa ${product.stock}.`,
      );
    }

    await this.db
      .update(cartItems)
      .set({ quantity: input.quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, itemId));
    return this.get(userId);
  }

  async removeItem(userId: string, itemId: string) {
    await this.getOwnedItem(userId, itemId);
    await this.db.delete(cartItems).where(eq(cartItems.id, itemId));
    return this.get(userId);
  }

  async clear(userId: string) {
    const cart = await this.ensureCart(this.db, userId);
    await this.db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    return this.loadCart(cart.id);
  }

  async merge(userId: string, input: MergeCartDto) {
    const skippedProductIds: string[] = [];
    return this.db.transaction(async (tx) => {
      const cart = await this.ensureCart(tx, userId);
      for (const line of input.items) {
        const [product] = await tx
          .select()
          .from(products)
          .where(and(eq(products.id, line.productId), eq(products.isActive, true)))
          .limit(1);
        if (!product || product.stock < 1) {
          skippedProductIds.push(line.productId);
          continue;
        }
        const quantity = Math.min(line.quantity, product.stock);
        await tx
          .insert(cartItems)
          .values({
            cartId: cart.id,
            productId: product.id,
            quantity,
          })
          .onConflictDoUpdate({
            target: [cartItems.cartId, cartItems.productId],
            set: {
              quantity: sql`LEAST(${cartItems.quantity} + ${quantity}, ${product.stock})`,
              updatedAt: new Date(),
            },
          });
      }
      await tx
        .update(carts)
        .set({ updatedAt: new Date() })
        .where(eq(carts.id, cart.id));
      return {
        data: await this.loadCart(cart.id, tx),
        skippedProductIds,
      };
    });
  }

  async loadCart(cartId: string, executor: Executor = this.db) {
    const [cart] = await executor
      .select()
      .from(carts)
      .where(eq(carts.id, cartId))
      .limit(1);
    if (!cart) throw new NotFoundException("Keranjang tidak ditemukan.");

    const rows = await executor
      .select({
        item: cartItems,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cartId));

    const items = rows.map(({ item, product }) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product,
      lineTotal: product.price * item.quantity,
    }));

    return {
      id: cart.id,
      items,
      subtotal: items.reduce((total, item) => total + item.lineTotal, 0),
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
    };
  }

  async ensureCart(executor: Executor, userId: string) {
    const [inserted] = await executor
      .insert(carts)
      .values({ userId })
      .onConflictDoNothing({ target: carts.userId })
      .returning();
    if (inserted) return inserted;

    const [existing] = await executor
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);
    if (!existing) throw new NotFoundException("Keranjang tidak ditemukan.");
    return existing;
  }

  private async getOwnedItem(userId: string, itemId: string) {
    const [row] = await this.db
      .select({ item: cartItems, cart: carts })
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .where(and(eq(cartItems.id, itemId), eq(carts.userId, userId)))
      .limit(1);
    if (!row) throw new NotFoundException("Item keranjang tidak ditemukan.");
    return row.item;
  }

  private async getPurchasableProduct(productId: string) {
    const [product] = await this.db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.isActive, true)))
      .limit(1);
    if (!product) {
      throw new NotFoundException("Produk tidak ditemukan atau tidak aktif.");
    }
    return product;
  }
}
