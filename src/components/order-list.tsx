"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Package } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Price } from "@/components/price";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABEL } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useDataStore } from "@/lib/store/data";
import { useSessionStore } from "@/lib/store/session";
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

export function OrderList() {
  const user = useSessionStore((state) => state.user)!;
  const orders = useDataStore((state) => state.orders);
  const ordersLoaded = useDataStore((state) => state.ordersLoaded);
  const loadMyOrders = useDataStore((state) => state.loadMyOrders);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    void loadMyOrders().catch(() => {
      // empty state is shown when the request fails
    });
  }, [loadMyOrders]);

  const myOrders = useMemo(
    () =>
      orders
        .filter((order) => order.userId === user.id)
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [orders, user.id],
  );

  const filtered =
    filter === "all" ? myOrders : myOrders.filter((order) => order.status === filter);

  if (!ordersLoaded) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Memuat pesanan…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Akun"
        title="Pesanan saya"
        description="Pantau status pesanan, unggah bukti pembayaran, dan batalkan pesanan yang masih menunggu."
      />

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

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="size-5" />}
          title={myOrders.length === 0 ? "Belum ada pesanan" : "Tidak ada pesanan di filter ini"}
          description={
            myOrders.length === 0
              ? "Mulai belanja untuk melihat riwayat pesanan Anda di sini."
              : "Coba pilih status lain untuk melihat pesanan."
          }
          action={
            myOrders.length === 0 ? (
              <Button className="rounded-full" render={<Link href="/products" />}>
                Mulai belanja
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-base font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(order.createdAt)} · {order.items.length} jenis produk
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <OrderStatusBadge status={order.status} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                <div className="text-sm text-muted-foreground">
                  {order.items
                    .slice(0, 2)
                    .map((item) => item.productName)
                    .join(", ")}
                  {order.items.length > 2 ? `, +${order.items.length - 2} lainnya` : ""}
                </div>
                <div className="flex items-center gap-3">
                  <Price value={order.total} className="text-base" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    render={<Link href={`/account/orders/${order.orderNumber}`} />}
                  >
                    Detail <ArrowRight />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
