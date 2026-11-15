"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Price } from "@/components/price";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useDataStore } from "@/lib/store/data";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pending", label: ORDER_STATUS_LABEL.pending },
  { value: "processing", label: ORDER_STATUS_LABEL.processing },
  { value: "shipped", label: ORDER_STATUS_LABEL.shipped },
  { value: "completed", label: ORDER_STATUS_LABEL.completed },
  { value: "cancelled", label: ORDER_STATUS_LABEL.cancelled },
];

type DateRange = "all" | "today" | "7d" | "30d";

const DAY = 24 * 60 * 60 * 1000;

export function AdminOrders() {
  const orders = useDataStore((state) => state.adminOrders);
  const adminOrdersLoaded = useDataStore((state) => state.adminOrdersLoaded);
  const loadAdminOrders = useDataStore((state) => state.loadAdminOrders);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [range, setRange] = useState<DateRange>("all");
  const [rangeAnchor, setRangeAnchor] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void loadAdminOrders().catch(() => {
      // table falls back to empty state
    });
  }, [loadAdminOrders]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const now = rangeAnchor;
    return orders
      .filter((order) => (filter === "all" ? true : order.status === filter))
      .filter((order) => {
        if (range === "all" || !now) return true;
        const created = new Date(order.createdAt);
        if (range === "today") {
          return created.toDateString() === new Date(now).toDateString();
        }
        const limit = range === "7d" ? 7 * DAY : 30 * DAY;
        return now - created.getTime() <= limit;
      })
      .filter((order) =>
        term
          ? order.orderNumber.toLowerCase().includes(term) ||
            order.recipientName.toLowerCase().includes(term) ||
            order.phone.includes(term)
          : true,
      )
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [orders, filter, range, rangeAnchor, query]);

  if (!adminOrdersLoaded) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Memuat pesanan…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Pesanan"
        description="Tinjau pembayaran, ubah status pengiriman, dan batalkan pesanan bila diperlukan."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === item.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={range}
            onChange={(event) => {
              setRangeAnchor(Date.now());
              setRange(event.target.value as DateRange);
            }}
            className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Filter tanggal pesanan"
          >
            <option value="all">Semua tanggal</option>
            <option value="today">Hari ini</option>
            <option value="7d">7 hari terakhir</option>
            <option value="30d">30 hari terakhir</option>
          </select>
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nomor, nama, telepon…"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pesanan</TableHead>
              <TableHead>Penerima</TableHead>
              <TableHead>Pembayaran</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Tidak ada pesanan yang cocok dengan filter.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${order.orderNumber}`}
                      className="font-medium hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{order.recipientName}</p>
                    <p className="text-xs text-muted-foreground">{order.phone}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-muted-foreground">
                      {PAYMENT_METHOD_LABEL[order.paymentMethod]}
                    </p>
                    <div className="mt-1">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Price value={order.total} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full"
                      render={<Link href={`/admin/orders/${order.orderNumber}`} />}
                    >
                      <ArrowRight />
                      <span className="sr-only">Detail</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Menampilkan {filtered.length} dari {orders.length} pesanan.
      </p>
    </div>
  );
}
