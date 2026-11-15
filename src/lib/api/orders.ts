import {
  API_BASE_URL,
  apiFetch,
  toQueryString,
  type DataEnvelope,
  type ListEnvelope,
} from "@/lib/api/client";
import type {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/lib/types";

export interface CheckoutInput {
  addressId?: string;
  shipping: {
    recipientName: string;
    phone: string;
    addressLine: string;
    city: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: PaymentMethod;
  notes?: string;
}

export async function checkout(input: CheckoutInput): Promise<Order> {
  const response = await apiFetch<DataEnvelope<Order>>("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function fetchMyOrders(params: {
  status?: OrderStatus;
  page?: number;
  limit?: number;
} = {}): Promise<ListEnvelope<Order>> {
  const query = toQueryString({
    status: params.status,
    page: params.page,
    limit: params.limit,
  });
  return apiFetch<ListEnvelope<Order>>(`/api/orders${query}`);
}

export async function fetchMyOrderByNumber(
  orderNumber: string,
): Promise<Order> {
  const response = await apiFetch<DataEnvelope<Order>>(
    `/api/orders/by-number/${encodeURIComponent(orderNumber)}`,
  );
  return response.data;
}

export async function cancelMyOrder(
  orderId: string,
  note?: string,
): Promise<Order> {
  const response = await apiFetch<DataEnvelope<Order>>(
    `/api/orders/${orderId}/cancel`,
    {
      method: "POST",
      body: JSON.stringify({ note }),
    },
  );
  return response.data;
}

export async function uploadPaymentProof(
  orderId: string,
  file: File,
): Promise<Order> {
  const form = new FormData();
  form.append("proof", file);
  const response = await apiFetch<DataEnvelope<Order>>(
    `/api/orders/${orderId}/payment-proof`,
    { method: "POST", body: form },
  );
  return response.data;
}

export async function fetchPaymentProofBlob(orderId: string): Promise<Blob> {
  const response = await fetch(
    `${API_BASE_URL}/api/orders/${orderId}/payment-proof`,
    { credentials: "include", cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error("Bukti pembayaran tidak dapat dimuat.");
  }
  return response.blob();
}

export interface AdminOrder extends Order {
  customer: { id: string; name: string; email: string } | null;
}

export async function fetchAdminOrders(params: {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  q?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ListEnvelope<AdminOrder>> {
  const query = toQueryString({
    status: params.status,
    paymentStatus: params.paymentStatus,
    q: params.q,
    from: params.from,
    to: params.to,
    page: params.page,
    limit: params.limit,
  });
  return apiFetch<ListEnvelope<AdminOrder>>(`/api/admin/orders${query}`);
}

export async function fetchAdminOrderByNumber(
  orderNumber: string,
): Promise<AdminOrder> {
  const response = await apiFetch<DataEnvelope<AdminOrder>>(
    `/api/admin/orders/by-number/${encodeURIComponent(orderNumber)}`,
  );
  return response.data;
}

export async function updateOrderStatus(
  orderId: string,
  status: Exclude<OrderStatus, "pending">,
  note?: string,
): Promise<Order> {
  const response = await apiFetch<DataEnvelope<Order>>(
    `/api/admin/orders/${orderId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    },
  );
  return response.data;
}

export async function verifyOrderPayment(
  orderId: string,
  decision: "paid" | "rejected",
): Promise<Order> {
  const response = await apiFetch<DataEnvelope<Order>>(
    `/api/admin/orders/${orderId}/payment`,
    {
      method: "PATCH",
      body: JSON.stringify({ decision }),
    },
  );
  return response.data;
}

export interface AdminDashboard {
  newOrders: number;
  waitingVerification: number;
  lowStockProducts: number;
  totalSales: number;
  recentOrders: Order[];
}

export async function fetchAdminDashboard(): Promise<AdminDashboard> {
  const response =
    await apiFetch<DataEnvelope<AdminDashboard>>("/api/admin/dashboard");
  return response.data;
}
