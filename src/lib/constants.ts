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
  pending:
    "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-500/15 dark:text-amber-200",
  processing:
    "bg-sky-100 text-sky-900 border-sky-200 dark:bg-sky-500/15 dark:text-sky-200",
  shipped:
    "bg-violet-100 text-violet-900 border-violet-200 dark:bg-violet-500/15 dark:text-violet-200",
  completed:
    "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200",
  cancelled:
    "bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-500/15 dark:text-rose-200",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Belum dibayar",
  waiting_verification: "Menunggu verifikasi",
  paid: "Lunas",
  rejected: "Ditolak",
};

export const PAYMENT_STATUS_CLASS: Record<PaymentStatus, string> = {
  unpaid: "bg-stone-100 text-stone-800 border-stone-200",
  waiting_verification: "bg-amber-100 text-amber-900 border-amber-200",
  paid: "bg-emerald-100 text-emerald-900 border-emerald-200",
  rejected: "bg-rose-100 text-rose-900 border-rose-200",
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
