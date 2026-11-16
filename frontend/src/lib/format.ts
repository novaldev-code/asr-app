import { format } from "date-fns";
import { id } from "date-fns/locale";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, "d MMMM yyyy", { locale: id });
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, "d MMM yyyy, HH:mm", { locale: id });
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatOrderNumber(sequence: number, date = new Date()): string {
  const stamp = format(date, "yyyyMMdd");
  return `ORD-${stamp}-${String(sequence).padStart(4, "0")}`;
}

export function shortOrderNumber(orderNumber: string): string {
  return orderNumber.replace("ORD-", "");
}
