import type { Order, OrderStatus, Role } from "@/lib/types";

export function canTransition(
  order: Order,
  to: OrderStatus,
  role: Role,
): boolean {
  if (order.status === "completed" || order.status === "cancelled") return false;

  if (to === "cancelled") {
    if (role === "customer") return order.status === "pending";
    return order.status === "pending" || order.status === "processing";
  }

  if (role !== "admin") return false;

  if (to === "processing") {
    return (
      order.status === "pending" &&
      (order.paymentMethod === "cod" || order.paymentStatus === "paid")
    );
  }
  if (to === "shipped") return order.status === "processing";
  if (to === "completed") return order.status === "shipped";

  return false;
}

export function nextStatusOptions(order: Order, role: Role): OrderStatus[] {
  const options: OrderStatus[] = [];
  (["processing", "shipped", "completed", "cancelled"] as OrderStatus[]).forEach(
    (status) => {
      if (canTransition(order, status, role)) options.push(status);
    },
  );
  return options;
}

export function canVerifyPayment(order: Order): boolean {
  return (
    order.paymentMethod === "bank_transfer" &&
    order.paymentStatus === "waiting_verification" &&
    order.status !== "cancelled" &&
    order.status !== "completed"
  );
}

export function canSubmitProof(order: Order): boolean {
  return (
    order.paymentMethod === "bank_transfer" &&
    (order.paymentStatus === "unpaid" || order.paymentStatus === "rejected") &&
    order.status !== "cancelled" &&
    order.status !== "completed"
  );
}

export function isOrderExpired(order: Order, now = new Date()): boolean {
  return Boolean(
    order.expiresAt &&
      order.status === "pending" &&
      order.paymentMethod === "bank_transfer" &&
      order.paymentStatus === "unpaid" &&
      new Date(order.expiresAt).getTime() < now.getTime(),
  );
}
