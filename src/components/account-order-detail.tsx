"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Banknote, CheckCircle2, Clock3, MapPin, Package, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PaymentProofUpload } from "@/components/payment-proof-upload";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchMyOrderByNumber } from "@/lib/api/orders";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { canSubmitProof, canTransition } from "@/lib/order-rules";
import { useDataStore } from "@/lib/store/data";
import { useSessionStore } from "@/lib/store/session";
import type { Order } from "@/lib/types";

export function AccountOrderDetail({ orderNumber }: { orderNumber: string }) {
  const user = useSessionStore((state) => state.user)!;
  const products = useDataStore((state) => state.products);
  const catalogLoaded = useDataStore((state) => state.catalogLoaded);
  const cancelOrder = useDataStore((state) => state.cancelOrder);
  const loadCatalog = useDataStore((state) => state.loadCatalog);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    try {
      const data = await fetchMyOrderByNumber(orderNumber);
      setOrder({ ...data, items: data.items ?? [], history: data.history ?? [] });
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    let active = true;
    fetchMyOrderByNumber(orderNumber)
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

  useEffect(() => {
    if (catalogLoaded) return;
    void loadCatalog().catch(() => {
      // product thumbnails are optional
    });
  }, [catalogLoaded, loadCatalog]);

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

  if (!order || order.userId !== user.id) {
    return (
      <EmptyState
        icon={<Package className="size-5" />}
        title="Pesanan tidak ditemukan"
        description="Pesanan ini tidak tersedia atau bukan milik akun Anda."
        action={
          <Button className="rounded-full" render={<Link href="/account/orders" />}>
            Kembali ke pesanan
          </Button>
        }
      />
    );
  }

  const canCancel = canTransition(order, "cancelled", "customer");
  const showProof = canSubmitProof(order);
  const history = order.history ?? [];
  const isWaiting = order.paymentStatus === "waiting_verification";
  const isRejected = order.paymentStatus === "rejected";

  async function handleCancel() {
    const result = await cancelOrder(order!.orderNumber, "customer", user.id);
    if (result.ok) {
      toast.success("Pesanan dibatalkan dan stok dikembalikan.");
      await loadOrder();
    } else {
      toast.error(result.message ?? "Gagal membatalkan pesanan.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 rounded-full text-muted-foreground"
          render={<Link href="/account/orders" />}
        >
          <ArrowLeft /> Semua pesanan
        </Button>
        <PageHeader
          eyebrow={formatDateTime(order.createdAt)}
          title={order.orderNumber}
          description="Rincian pesanan, status pembayaran, dan riwayat perjalanan pesanan Anda."
          action={
            canCancel ? (
              <Button
                variant="outline"
                className="rounded-full text-destructive hover:bg-destructive/10"
                onClick={handleCancel}
              >
                <XCircle /> Batalkan pesanan
              </Button>
            ) : null
          }
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <OrderStatusBadge status={order.status} />
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-heading text-lg font-semibold">Produk</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => {
                const product = products.find((entry) => entry.id === item.productId);
                return (
                  <div key={item.id} className="flex gap-3">
                    <ProductImage
                      src={product?.imageUrl ?? null}
                      alt={item.productName}
                      className="size-16 shrink-0 rounded-xl"
                      sizes="64px"
                    />
                    <div className="flex flex-1 items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × <Price value={item.unitPrice} />
                        </p>
                      </div>
                      <Price value={item.lineTotal} className="text-sm" />
                    </div>
                  </div>
                );
              })}
            </div>
            <Separator className="my-4" />
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>
                  <Price value={order.subtotal} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Pengiriman</dt>
                <dd>
                  <Price value={order.shippingCost} />
                </dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd>
                  <Price value={order.total} />
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-heading text-lg font-semibold">Pembayaran</h2>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Metode</span>
                <span className="font-medium">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              {order.paidAt ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dibayar pada</span>
                  <span>{formatDateTime(order.paidAt)}</span>
                </div>
              ) : null}
              {order.paymentProofUrl ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Bukti</span>
                  <span className="truncate text-right font-medium">{order.paymentProofUrl}</span>
                </div>
              ) : null}
            </div>

            {order.paymentMethod === "bank_transfer" ? (
              <div className="mt-4 rounded-xl bg-secondary/40 p-4 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <Banknote className="size-4 text-caramel" /> Transfer ke rekening berikut
                </p>
                <div className="mt-2 space-y-1 text-muted-foreground">
                  <p>BCA · <span className="font-semibold text-foreground">1234567890</span></p>
                  <p>a/n Mocha &amp; Co.</p>
                  <p>Nominal: <Price value={order.total} className="text-foreground" /></p>
                  {order.expiresAt && order.status === "pending" ? (
                    <p className="flex items-center gap-1.5 pt-1 text-xs">
                      <Clock3 className="size-3.5" /> Bayar sebelum {formatDateTime(order.expiresAt)}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {isRejected ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                Bukti pembayaran sebelumnya ditolak. Silakan unggah bukti baru.
              </div>
            ) : null}

            {isWaiting ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <Clock3 className="mt-0.5 size-4 shrink-0" />
                Bukti pembayaran sedang ditinjau admin. Mohon tunggu konfirmasi.
              </div>
            ) : null}

            {order.paymentStatus === "paid" ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                Pembayaran telah dikonfirmasi.
              </div>
            ) : null}

            {showProof ? (
              <div className="mt-4">
                <PaymentProofUpload
                  orderNumber={order.orderNumber}
                  onUploaded={() => {
                    void loadOrder();
                  }}
                />
              </div>
            ) : null}

            {order.paymentMethod === "cod" ? (
              <p className="mt-4 rounded-xl bg-secondary/40 p-3 text-sm text-muted-foreground">
                Pembayaran dilakukan saat pesanan diterima. Status lunas akan
                diperbarui setelah pesanan selesai.
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-heading text-lg font-semibold">Riwayat status</h2>
            <ol className="mt-4 space-y-4">
              {history.map((entry, index) => (
                <li key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-0.5 flex size-6 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
                      {index + 1}
                    </span>
                    {index < history.length - 1 ? (
                      <span className="mt-1 w-px flex-1 bg-border" />
                    ) : null}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-medium">
                      {ORDER_STATUS_LABEL[entry.toStatus]}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
                    {entry.note ? (
                      <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
              <MapPin className="size-4 text-caramel" /> Alamat pengiriman
            </h2>
            <div className="mt-3 space-y-0.5 text-sm">
              <p className="font-medium">{order.recipientName}</p>
              <p className="text-muted-foreground">{order.phone}</p>
              <p className="pt-1 text-muted-foreground">{order.shippingAddress}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
              <Truck className="size-4 text-caramel" /> Pengiriman
            </h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ongkir</span>
                <Price value={order.shippingCost} />
              </div>
              <p className="pt-1 text-xs text-muted-foreground">
                {order.status === "pending"
                  ? "Pesanan menunggu diproses."
                  : order.status === "processing"
                    ? "Pesanan sedang disiapkan."
                    : order.status === "shipped"
                      ? "Pesanan sedang dalam perjalanan."
                      : order.status === "completed"
                        ? "Pesanan telah selesai."
                        : "Pesanan dibatalkan."}
              </p>
            </div>
          </section>

          {order.notes ? (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-heading text-base font-semibold">Catatan</h2>
              <p className="mt-2 text-sm text-muted-foreground">{order.notes}</p>
            </section>
          ) : null}

          <Button variant="outline" className="w-full rounded-full" render={<Link href="/products" />}>
            Belanja lagi
          </Button>
        </aside>
      </div>
    </div>
  );
}
