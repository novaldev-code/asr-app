"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileImage,
  MapPin,
  Package,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import {
  canVerifyPayment,
  nextStatusOptions,
} from "@/lib/order-rules";
import {
  fetchAdminOrderByNumber,
  fetchPaymentProofBlob,
  type AdminOrder,
} from "@/lib/api/orders";
import { useDataStore } from "@/lib/store/data";
import { useSessionStore } from "@/lib/store/session";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AdminOrderDetail({ orderNumber }: { orderNumber: string }) {
  const user = useSessionStore((state) => state.user)!;
  const products = useDataStore((state) => state.products);
  const adminCatalogLoaded = useDataStore((state) => state.adminCatalogLoaded);
  const updateOrderStatus = useDataStore((state) => state.updateOrderStatus);
  const cancelOrder = useDataStore((state) => state.cancelOrder);
  const verifyPayment = useDataStore((state) => state.verifyPayment);
  const loadAdminCatalog = useDataStore((state) => state.loadAdminCatalog);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    try {
      const data = await fetchAdminOrderByNumber(orderNumber);
      setOrder({ ...data, items: data.items ?? [], history: data.history ?? [] });
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    let active = true;
    fetchAdminOrderByNumber(orderNumber)
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
    if (adminCatalogLoaded) return;
    void loadAdminCatalog().catch(() => {
      // product thumbnails are optional
    });
  }, [adminCatalogLoaded, loadAdminCatalog]);

  useEffect(() => {
    if (!order?.paymentProofUrl) return;
    let active = true;
    let objectUrl: string | null = null;
    fetchPaymentProofBlob(order.id)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setProofUrl(objectUrl);
      })
      .catch(() => {
        if (active) setProofUrl(null);
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [order?.id, order?.paymentProofUrl]);

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
      <EmptyState
        icon={<Package className="size-5" />}
        title="Pesanan tidak ditemukan"
        description="Nomor pesanan tidak tersedia."
        action={
          <Button className="rounded-full" render={<Link href="/admin/orders" />}>
            Kembali ke daftar pesanan
          </Button>
        }
      />
    );
  }

  const statusOptions = nextStatusOptions(order, "admin");
  const awaitingVerification = canVerifyPayment(order);
  const history = order.history ?? [];

  async function handleTransition(to: OrderStatus) {
    const result =
      to === "cancelled"
        ? await cancelOrder(order!.orderNumber, "admin", user.id)
        : await updateOrderStatus(order!.orderNumber, to, "admin", user.id);
    if (result.ok) {
      toast.success(
        to === "cancelled"
          ? "Pesanan dibatalkan dan stok dikembalikan."
          : `Status pesanan diubah menjadi ${ORDER_STATUS_LABEL[to]}.`,
      );
      await loadOrder();
    } else {
      toast.error(
        result.message ??
          (to === "cancelled" ? "Gagal membatalkan pesanan." : "Gagal mengubah status."),
      );
    }
  }

  async function handleVerification(decision: "paid" | "rejected") {
    const result = await verifyPayment(order!.orderNumber, decision, user.id);
    if (result.ok) {
      toast.success(
        decision === "paid"
          ? "Pembayaran ditandai lunas."
          : "Bukti pembayaran ditolak. Pembeli dapat mengunggah ulang.",
      );
      await loadOrder();
    } else {
      toast.error(result.message ?? "Gagal memverifikasi pembayaran.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 rounded-full text-muted-foreground"
          render={<Link href="/admin/orders" />}
        >
          <ArrowLeft /> Semua pesanan
        </Button>
        <PageHeader
          eyebrow={formatDateTime(order.createdAt)}
          title={order.orderNumber}
          description={`${order.recipientName} · ${order.phone}`}
          action={
            <div className="flex flex-wrap gap-1.5">
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-heading text-lg font-semibold">Item pesanan</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => {
                const product = products.find((entry) => entry.id === item.productId);
                return (
                  <div key={item.id} className="flex gap-3">
                    <ProductImage
                      src={product?.imageUrl ?? null}
                      alt={item.productName}
                      className="size-14 shrink-0 rounded-xl"
                      sizes="56px"
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
                <dt className="text-muted-foreground">Ongkir</dt>
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
            <div className="mt-3 space-y-2 text-sm">
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
              {order.expiresAt && order.status === "pending" ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Batas bayar</span>
                  <span>{formatDateTime(order.expiresAt)}</span>
                </div>
              ) : null}
            </div>

            <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <FileImage className="size-4 text-caramel" /> Bukti pembayaran
              </p>
              {order.paymentProofUrl ? (
                <div className="mt-2 space-y-3">
                  {proofUrl ? (
                    <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border">
                      <Image
                        src={proofUrl}
                        alt="Bukti pembayaran"
                        fill
                        unoptimized
                        className="object-contain bg-muted"
                      />
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-muted-foreground">
                      {order.paymentProofUrl}
                    </span>
                    {awaitingVerification ? (
                      <div className="flex shrink-0 gap-1.5">
                        <Button
                          size="sm"
                          className="rounded-full"
                          onClick={() => handleVerification("paid")}
                        >
                          <CheckCircle2 /> Lunas
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-destructive"
                          onClick={() => handleVerification("rejected")}
                        >
                          <XCircle /> Tolak
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Belum ada bukti pembayaran yang diunggah.
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Bukti pembayaran hanya dapat diakses oleh admin.
              </p>
            </div>
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
                    <p className="text-sm font-medium">{ORDER_STATUS_LABEL[entry.toStatus]}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(entry.createdAt)}
                      {entry.changedBy ? ` · oleh ${entry.changedBy}` : ""}
                    </p>
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
              <ShieldCheck className="size-4 text-caramel" /> Tindakan admin
            </h2>
            {statusOptions.length === 0 && !awaitingVerification ? (
              <p className="mt-3 rounded-xl bg-secondary/40 p-3 text-sm text-muted-foreground">
                Tidak ada tindakan yang tersedia untuk pesanan ini.
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    variant={status === "cancelled" ? "outline" : "default"}
                    className={cn(
                      "rounded-full",
                      status === "cancelled" && "text-destructive hover:bg-destructive/10",
                    )}
                    onClick={() => handleTransition(status)}
                  >
                    Ubah ke {ORDER_STATUS_LABEL[status]}
                  </Button>
                ))}
                {awaitingVerification ? (
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => handleVerification("paid")}
                  >
                    <CheckCircle2 /> Verifikasi pembayaran
                  </Button>
                ) : null}
              </div>
            )}
            {order.status === "pending" && order.paymentMethod === "bank_transfer" && order.paymentStatus !== "paid" ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Pesanan transfer harus lunas sebelum dapat diproses.
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
              <MapPin className="size-4 text-caramel" /> Pengiriman
            </h2>
            <div className="mt-3 space-y-0.5 text-sm">
              <p className="font-medium">{order.recipientName}</p>
              <p className="text-muted-foreground">{order.phone}</p>
              <p className="pt-1 text-muted-foreground">{order.shippingAddress}</p>
            </div>
          </section>

          {order.notes ? (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-heading text-base font-semibold">Catatan pembeli</h2>
              <p className="mt-2 text-sm text-muted-foreground">{order.notes}</p>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
