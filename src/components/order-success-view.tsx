"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, CreditCard, ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Price } from "@/components/price";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchMyOrderByNumber } from "@/lib/api/orders";
import { PAYMENT_METHOD_LABEL } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Order } from "@/lib/types";

export function OrderSuccessView({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetchMyOrderByNumber(orderNumber)
      .then((data) => {
        if (active) {
          setOrder({ ...data, items: data.items ?? [], history: data.history ?? [] });
        }
      })
      .catch(() => {
        if (active) setOrder(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Memuat pesanan…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-14">
        <EmptyState
          title="Pesanan tidak ditemukan"
          description="Nomor pesanan tidak ditemukan. Buka halaman pesanan untuk melihat riwayat."
          action={
            <Button className="rounded-full" render={<Link href="/account/orders" />}>
              Lihat pesanan saya
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-sm">
          <span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-7" />
          </span>
          <h1 className="mt-4 font-heading text-2xl font-semibold sm:text-3xl">
            Pesanan berhasil dibuat
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Terima kasih, {order.recipientName}. Simpan nomor pesanan berikut untuk
            memantau status.
          </p>
          <div className="mt-5 rounded-2xl border border-dashed border-primary/40 bg-secondary/50 px-6 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Nomor pesanan
            </p>
            <p className="mt-1 font-heading text-2xl font-semibold tracking-wide">
              {order.orderNumber}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CreditCard className="size-4 text-caramel" /> Pembayaran
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {PAYMENT_METHOD_LABEL[order.paymentMethod]}
            </p>
            {order.paymentMethod === "bank_transfer" ? (
              order.paymentStatus === "paid" ? (
                <p className="mt-2 text-xs text-emerald-700">
                  Pembayaran sudah terverifikasi.
                </p>
              ) : (
                <div className="mt-3 rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Transfer ke:</p>
                  <p>Bank Mocha Nusantara</p>
                  <p>No. rekening 123-456-7890</p>
                  <p>a.n. Mocha &amp; Co.</p>
                  <p className="mt-2">
                    Unggah bukti transfer paling lambat{" "}
                    {order.expiresAt ? formatDateTime(order.expiresAt) : "24 jam"}.
                  </p>
                </div>
              )
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Bayar saat pesanan tiba. Admin akan menandai lunas setelah pesanan
                selesai.
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="size-4 text-caramel" /> Pengiriman
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {order.recipientName} · {order.phone}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{order.shippingAddress}</p>
            {order.notes ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Catatan: {order.notes}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold">Rincian pesanan</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <Price value={item.lineTotal} className="text-sm" />
              </li>
            ))}
          </ul>
          <Separator className="my-3" />
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>
                <Price value={order.subtotal} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Ongkir</dt>
              <dd>
                <Price value={order.shippingCost} />
              </dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>
                <Price value={order.total} className="text-mocha" />
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            className="rounded-full"
            render={<Link href={`/account/orders/${order.orderNumber}`} />}
          >
            Lihat detail pesanan
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            render={<Link href="/products" />}
          >
            <ShoppingBag /> Lanjut belanja
          </Button>
        </div>
      </div>
    </div>
  );
}
