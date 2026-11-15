import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgSequence,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth.js";
import { products } from "./catalog.js";
import { addresses } from "./customer.js";
import {
  orderStatusEnum,
  paymentMethodEnum,
  paymentStatusEnum,
} from "./enums.js";

export const orderNumberSequence = pgSequence("order_number_seq", {
  startWith: 1,
});

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    addressId: uuid("address_id").references(() => addresses.id, {
      onDelete: "set null",
    }),
    status: orderStatusEnum("status").default("pending").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    paymentStatus: paymentStatusEnum("payment_status").default("unpaid").notNull(),
    paymentProofUrl: text("payment_proof_url"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    subtotal: integer("subtotal").notNull(),
    shippingCost: integer("shipping_cost").notNull(),
    total: integer("total").notNull(),
    recipientName: text("recipient_name").notNull(),
    phone: text("phone").notNull(),
    shippingAddress: text("shipping_address").notNull(),
    notes: text("notes").default("").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("orders_user_created_idx").on(table.userId, table.createdAt),
    index("orders_status_idx").on(table.status),
    index("orders_payment_status_idx").on(table.paymentStatus),
    index("orders_expires_at_idx").on(table.expiresAt),
    check("orders_subtotal_nonnegative", sql`${table.subtotal} >= 0`),
    check("orders_shipping_cost_nonnegative", sql`${table.shippingCost} >= 0`),
    check(
      "orders_total_matches",
      sql`${table.total} = ${table.subtotal} + ${table.shippingCost}`,
    ),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    productName: text("product_name").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotal: integer("line_total").notNull(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    check("order_items_quantity_positive", sql`${table.quantity} > 0`),
    check("order_items_unit_price_nonnegative", sql`${table.unitPrice} >= 0`),
    check(
      "order_items_line_total_matches",
      sql`${table.lineTotal} = ${table.unitPrice} * ${table.quantity}`,
    ),
  ],
);

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    fromStatus: orderStatusEnum("from_status"),
    toStatus: orderStatusEnum("to_status").notNull(),
    changedBy: text("changed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    note: text("note").default("").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("order_status_history_order_created_idx").on(
      table.orderId,
      table.createdAt,
    ),
  ],
);
