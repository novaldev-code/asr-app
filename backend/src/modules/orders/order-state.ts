import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "../../db/schema/index.js";

export type Role = "customer" | "admin";

export interface OrderState {
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}

export interface TransitionResult {
  ok: boolean;
  reason?: string;
}

export function canTransition(
  order: OrderState,
  to: OrderStatus,
  role: Role,
): TransitionResult {
  if (order.status === "completed" || order.status === "cancelled") {
    return {
      ok: false,
      reason: "Pesanan pada status final tidak dapat diubah.",
    };
  }

  if (to === "cancelled") {
    if (role === "customer") {
      return order.status === "pending"
        ? { ok: true }
        : {
            ok: false,
            reason: "Pelanggan hanya dapat membatalkan pesanan yang masih menunggu.",
          };
    }
    return order.status === "pending" || order.status === "processing"
      ? { ok: true }
      : {
          ok: false,
          reason: "Pesanan ini tidak dapat dibatalkan pada status saat ini.",
        };
  }

  if (role !== "admin") {
    return { ok: false, reason: "Hanya admin yang dapat mengubah status ini." };
  }

  if (to === "processing") {
    if (order.status !== "pending") {
      return {
        ok: false,
        reason: "Hanya pesanan menunggu yang dapat diproses.",
      };
    }
    if (order.paymentMethod === "bank_transfer" && order.paymentStatus !== "paid") {
      return {
        ok: false,
        reason: "Pesanan transfer hanya dapat diproses setelah pembayaran lunas.",
      };
    }
    return { ok: true };
  }

  if (to === "shipped") {
    return order.status === "processing"
      ? { ok: true }
      : { ok: false, reason: "Hanya pesanan yang diproses yang dapat dikirim." };
  }

  if (to === "completed") {
    return order.status === "shipped"
      ? { ok: true }
      : { ok: false, reason: "Hanya pesanan yang dikirim yang dapat diselesaikan." };
  }

  return { ok: false, reason: "Transisi status tidak diizinkan." };
}

export function canVerifyPayment(order: OrderState): boolean {
  return (
    order.paymentMethod === "bank_transfer" &&
    order.paymentStatus === "waiting_verification" &&
    order.status !== "cancelled" &&
    order.status !== "completed"
  );
}

export function canSubmitProof(order: OrderState): boolean {
  return (
    order.paymentMethod === "bank_transfer" &&
    (order.paymentStatus === "unpaid" || order.paymentStatus === "rejected") &&
    order.status !== "cancelled" &&
    order.status !== "completed"
  );
}

export function isExpired(
  order: Pick<OrderState, "status" | "paymentMethod" | "paymentStatus"> & {
    expiresAt: Date | null;
  },
  now = new Date(),
): boolean {
  return Boolean(
    order.expiresAt &&
      order.status === "pending" &&
      order.paymentMethod === "bank_transfer" &&
      (order.paymentStatus === "unpaid" || order.paymentStatus === "rejected") &&
      order.expiresAt.getTime() <= now.getTime(),
  );
}
