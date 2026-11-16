import type { OrderStatus, PaymentMethod, PaymentStatus, Role } from "@/lib/types";

export const PROVINCES = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Kepulauan Riau",
  "Jambi",
  "Bengkulu",
  "Sumatera Selatan",
  "Kepulauan Bangka Belitung",
  "Lampung",
  "Banten",
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Gorontalo",
  "Sulawesi Tengah",
  "Sulawesi Barat",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Maluku",
  "Maluku Utara",
  "Papua",
  "Papua Barat",
  "Papua Barat Daya",
  "Papua Tengah",
  "Papua Pegunungan",
  "Papua Selatan",
] as const;

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Menunggu",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  pending: "border-border/60 bg-carbon text-fog",
  processing: "border-border bg-graphite text-bone",
  shipped: "border-fog bg-graphite text-bone",
  completed: "border-bone bg-bone text-pitch",
  cancelled: "border-border/60 bg-transparent text-ash",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Belum dibayar",
  waiting_verification: "Menunggu verifikasi",
  paid: "Lunas",
  rejected: "Ditolak",
};

export const PAYMENT_STATUS_CLASS: Record<PaymentStatus, string> = {
  unpaid: "border-border/60 bg-carbon text-fog",
  waiting_verification: "border-fog bg-graphite text-bone",
  paid: "border-bone bg-bone text-pitch",
  rejected: "border-border/60 bg-transparent text-ash",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cod: "Bayar di Tempat (COD)",
  bank_transfer: "Transfer Bank Manual",
};

export const ROLE_LABEL: Record<Role, string> = {
  customer: "Pelanggan",
  admin: "Admin",
};

export const DEMO_ACCOUNTS = {
  customer: {
    name: "Nadia Pelanggan",
    email: "customer@app.test",
    role: "customer" as Role,
  },
  admin: {
    name: "Bagas Admin",
    email: "admin@app.test",
    role: "admin" as Role,
  },
};

export const STORE_NAME = "Mocha & Co.";
export const STORE_TAGLINE = "Kopi hangat, ritual yang tenang.";
export const FREE_SHIPPING_NOTE = "Ongkir flat per provinsi, dihitung otomatis.";
export const DEFAULT_SHIPPING_COST = 25000;
