import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { createApplication } from "../src/app.setup.js";
import { auth } from "../src/auth/auth.js";
import { db } from "../src/db/database.js";
import {
  categories,
  orders,
  products,
  shippingRates,
  users,
} from "../src/db/schema/index.js";
import { OrdersService } from "../src/modules/orders/orders.service.js";

const PASSWORD = "Password123!";
const suffix = Date.now().toString(36);
const customerEmail = `customer-${suffix}@example.com`;
const adminEmail = `admin-${suffix}@example.com`;

const shipping = {
  recipientName: "Nadia Pelanggan",
  phone: "081234567890",
  addressLine: "Jl. Melati No. 12",
  city: "Jakarta Selatan",
  province: "DKI Jakarta",
  postalCode: "12130",
};

describe("storefront API", () => {
  let app: INestApplication;
  let customer: ReturnType<typeof request.agent>;
  let admin: ReturnType<typeof request.agent>;
  let productId: string;

  beforeAll(async () => {
    app = await createApplication();
    await app.init();

    const [category] = await db
      .insert(categories)
      .values({ name: "Biji Kopi", slug: `biji-kopi-${suffix}` })
      .returning();
    const [product] = await db
      .insert(products)
      .values({
        categoryId: category.id,
        name: "Arabika Gayo Premium",
        slug: `arabika-gayo-${suffix}`,
        description: "Biji kopi arabika",
        price: 50_000,
        stock: 10,
        featured: true,
      })
      .returning();
    productId = product.id;

    await db.insert(shippingRates).values({
      province: "DKI Jakarta",
      cost: 15_000,
      isDefault: false,
    });

    await createVerifiedUser("Nadia Pelanggan", customerEmail, "customer");
    await createVerifiedUser("Bagas Admin", adminEmail, "admin");

    customer = request.agent(app.getHttpServer());
    admin = request.agent(app.getHttpServer());

    await customer
      .post("/api/auth/sign-in/email")
      .send({ email: customerEmail, password: PASSWORD })
      .expect(200);
    await admin
      .post("/api/auth/sign-in/email")
      .send({ email: adminEmail, password: PASSWORD })
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  async function createVerifiedUser(
    name: string,
    email: string,
    role: "customer" | "admin",
  ): Promise<string> {
    await auth.api.signUpEmail({
      body: { name, email, password: PASSWORD },
    });
    const [user] = await db
      .update(users)
      .set({ emailVerified: true, role })
      .where(eq(users.email, email))
      .returning({ id: users.id });
    return user.id;
  }

  async function addToCart(productId: string, quantity: number): Promise<void> {
    await customer
      .post("/api/cart/items")
      .send({ productId, quantity })
      .expect(201);
  }

  async function checkout(paymentMethod: "cod" | "bank_transfer") {
    const response = await customer
      .post("/api/orders")
      .send({ shipping, paymentMethod, notes: "" })
      .expect(201);
    return response.body.data as {
      id: string;
      status: string;
      total: number;
      paymentStatus: string;
    };
  }

  it("serves the public catalog", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/products")
      .expect(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: productId, name: "Arabika Gayo Premium" }),
      ]),
    );
    expect(response.body.meta.total).toBe(1);
  });

  it("rejects cart quantities above available stock", async () => {
    const response = await customer
      .post("/api/cart/items")
      .send({ productId, quantity: 20 });
    expect(response.status).toBe(409);
    expect(response.body.message).toContain("tersisa 10");

    await addToCart(productId, 10);
    const cart = await customer.get("/api/cart").expect(200);
    expect(cart.body.data.itemCount).toBe(10);
  });

  it("lets a customer cancel a pending bank transfer and restores stock", async () => {
    await customer.delete("/api/cart").expect(200);
    await addToCart(productId, 2);
    const order = await checkout("bank_transfer");
    expect(order.status).toBe("pending");
    expect(order.total).toBe(115_000);

    const cancelled = await customer
      .post(`/api/orders/${order.id}/cancel`)
      .send({ note: "Salah pilih metode" })
      .expect(201);
    expect(cancelled.body.data.status).toBe("cancelled");

    const [product] = await db
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, productId));
    expect(product.stock).toBe(10);
  });

  it("guards admin transitions and completes a COD order", async () => {
    await addToCart(productId, 2);
    const order = await checkout("cod");

    const customerAttempt = await customer
      .patch(`/api/admin/orders/${order.id}/status`)
      .send({ status: "processing" });
    expect(customerAttempt.status).toBe(403);

    const processed = await admin
      .patch(`/api/admin/orders/${order.id}/status`)
      .send({ status: "processing" })
      .expect(200);
    expect(processed.body.data.status).toBe("processing");

    await admin
      .patch(`/api/admin/orders/${order.id}/status`)
      .send({ status: "shipped" })
      .expect(200);
    const completed = await admin
      .patch(`/api/admin/orders/${order.id}/status`)
      .send({ status: "completed" })
      .expect(200);
    expect(completed.body.data.paymentStatus).toBe("paid");
  });

  it("verifies a bank transfer before processing", async () => {
    await addToCart(productId, 1);
    const order = await checkout("bank_transfer");

    const blocked = await admin
      .patch(`/api/admin/orders/${order.id}/status`)
      .send({ status: "processing" });
    expect(blocked.status).toBe(409);
    expect(blocked.body.code).toBe("INVALID_STATUS_TRANSITION");

    await db
      .update(orders)
      .set({ paymentStatus: "waiting_verification" })
      .where(eq(orders.id, order.id));

    const verified = await admin
      .patch(`/api/admin/orders/${order.id}/payment`)
      .send({ decision: "paid" })
      .expect(200);
    expect(verified.body.data.paymentStatus).toBe("paid");

    const processed = await admin
      .patch(`/api/admin/orders/${order.id}/status`)
      .send({ status: "processing" })
      .expect(200);
    expect(processed.body.data.status).toBe("processing");
  });

  it("expires overdue unpaid bank transfers and restores stock", async () => {
    await addToCart(productId, 1);
    const order = await checkout("bank_transfer");

    await db
      .update(orders)
      .set({ expiresAt: new Date(Date.now() - 60_000) })
      .where(eq(orders.id, order.id));

    const expired = await app.get(OrdersService).expireOrders();
    expect(expired).toBeGreaterThanOrEqual(1);

    const detail = await customer.get(`/api/orders/${order.id}`).expect(200);
    expect(detail.body.data.status).toBe("cancelled");
  });

  it("returns the admin dashboard summary", async () => {
    const response = await admin.get("/api/admin/dashboard").expect(200);
    expect(response.body.data.totalSales).toBeGreaterThan(0);
    expect(response.body.data.recentOrders.length).toBeGreaterThan(0);
  });
});
