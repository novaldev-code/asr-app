import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);

export type UserRole = (typeof userRoleEnum.enumValues)[number];

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "completed",
  "cancelled",
]);

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

export const paymentMethodEnum = pgEnum("payment_method", [
  "cod",
  "bank_transfer",
]);

export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];

export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "waiting_verification",
  "paid",
  "rejected",
]);

export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
