export type Role = "customer" | "admin";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export type PaymentMethod = "cod" | "bank_transfer";

export type PaymentStatus = "unpaid" | "waiting_verification" | "paid" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  categoryId: string | null;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy: string | null;
  note: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentProofUrl: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  expiresAt: string | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  recipientName: string;
  phone: string;
  shippingAddress: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  history?: OrderStatusHistory[];
}

export interface ShippingRate {
  id: string;
  province: string;
  cost: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
}

export interface PlaceOrderInput {
  userId: string;
  lines: CartLine[];
  address: {
    addressId: string | null;
    recipientName: string;
    phone: string;
    addressLine: string;
    city: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: PaymentMethod;
  notes: string;
}

export type PlaceOrderResult =
  | { ok: true; order: Order }
  | { ok: false; message: string };
