"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Clock3,
  Package,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/status-badge";
import { PageHeader } from "@/components/page-header";
import { Price } from "@/components/price";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { useDataStore } from "@/lib/store/data";

export function AdminDashboard() {
  const orders = useDataStore((state) => state.adminOrders);
  const products = useDataStore((state) => state.products);
  const categories = useDataStore((state) => state.categories);
  const dashboard = useDataStore((state) => state.dashboard);
  const adminOrdersLoaded = useDataStore((state) => state.adminOrdersLoaded);
  const adminCatalogLoaded = useDataStore((state) => state.adminCatalogLoaded);
  const loadAdminOrders = useDataStore((state) => state.loadAdminOrders);
  const loadAdminCatalog = useDataStore((state) => state.loadAdminCatalog);
  const loadDashboard = useDataStore((state) => state.loadDashboard);

  useEffect(() => {
    void Promise.all([
      loadAdminOrders(),
      loadAdminCatalog(),
      loadDashboard(),
    ]).catch(() => {
      // dashboard falls back to empty state
    });
  }, [loadAdminOrders, loadAdminCatalog, loadDashboard]);

  const revenue = orders
    .filter((order) => order.paymentStatus === "paid" && order.status !== "cancelled")
    .reduce((total, order) => total + order.total, 0);
  const waitingVerification = orders.filter(
    (order) => order.paymentStatus === "waiting_verification",
  );
  const activeOrders = orders.filter(
    (order) => order.status === "pending" || order.status === "processing",
  );
  const lowStock = products
    .filter((product) => product.isActive && product.stock <= 5)
    .sort((a, b) => a.stock - b.stock);
  const recentOrders =
    dashboard?.recentOrders?.length
      ? dashboard.recentOrders
      : [...orders]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 5);

  const stats = [
    {
      label: "Pendapatan lunas",
      value: <Price value={revenue} className="text-2xl text-bone" />,
      icon: TrendingUp,
      hint: "Dari pesanan berstatus lunas",
    },
    {
      label: "Pesanan aktif",
      value: String(activeOrders.length),
      icon: ReceiptText,
      hint: "Menunggu atau sedang diproses",
    },
    {
      label: "Perlu verifikasi",
      value: String(dashboard?.waitingVerification ?? waitingVerification.length),
      icon: Clock3,
      hint: "Bukti transfer menunggu ditinjau",
    },
    {
      label: "Stok menipis",
      value: String(dashboard?.lowStockProducts ?? lowStock.length),
      icon: Package,
      hint: "Produk aktif dengan stok ≤ 5",
    },
  ];

  if (!adminOrdersLoaded || !adminCatalogLoaded) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[24px] border border-border bg-carbon p-10 text-center">
        <div className="size-8 animate-spin rounded-full border-2 border-graphite border-t-bone" />
        <p className="text-sm text-fog">Memuat ringkasan toko…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        display
        eyebrow="Admin"
        title="Ringkasan toko"
        description="Pantau performa penjualan, verifikasi pembayaran, dan kelola katalog Mocha & Co."
        action={
          <Button className="rounded-full" render={<Link href="/admin/orders" />}>
            Kelola pesanan <ArrowRight />
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[24px] border border-border bg-carbon p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-ash">{stat.label}</p>
              <span className="flex size-8 items-center justify-center rounded-full border border-border bg-background text-fog">
                <stat.icon className="size-4" />
              </span>
            </div>
            <div className="mt-4 font-serif text-3xl tracking-[-0.02em] text-bone">{stat.value}</div>
            <p className="mt-1 text-xs text-ash">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="rounded-[24px] border border-border bg-carbon p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl tracking-[-0.02em]">Pesanan terbaru</h2>
              <p className="text-sm text-fog">Lima pesanan terakhir masuk.</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full" render={<Link href="/admin/orders" />}>
              Lihat semua <ArrowRight />
            </Button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor</TableHead>
                  <TableHead>Pembeli</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.orderNumber}`}
                        className="font-medium hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                      <p className="text-xs text-ash">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">{order.recipientName}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <OrderStatusBadge status={order.status} />
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Price value={order.total} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-[24px] border border-border bg-carbon p-5">
            <h2 className="flex items-center gap-2 font-serif text-2xl tracking-[-0.02em]">
              <Banknote className="size-4 text-fog" /> Perlu verifikasi
            </h2>
            {waitingVerification.length === 0 ? (
              <p className="mt-3 rounded-[10px] border border-border/50 bg-background/50 p-3 text-sm text-fog">
                Tidak ada bukti pembayaran yang menunggu.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {waitingVerification.slice(0, 4).map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.orderNumber}`}
                    className="flex items-center justify-between rounded-[10px] border border-border px-3 py-2 text-sm transition-colors hover:bg-graphite/40"
                  >
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-ash">{order.recipientName}</p>
                    </div>
                    <Price value={order.total} className="text-sm" />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[24px] border border-border bg-carbon p-5">
            <h2 className="flex items-center gap-2 font-serif text-2xl tracking-[-0.02em]">
              <AlertTriangle className="size-4 text-fog" /> Stok menipis
            </h2>
            {lowStock.length === 0 ? (
              <p className="mt-3 rounded-[10px] border border-border/50 bg-background/50 p-3 text-sm text-fog">
                Semua produk memiliki stok aman.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {lowStock.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    href="/admin/products"
                    className="flex items-center justify-between rounded-[10px] border border-border px-3 py-2 text-sm transition-colors hover:bg-graphite/40"
                  >
                    <span className="truncate pr-2">{product.name}</span>
                    <span className="shrink-0 text-xs font-medium text-fog">
                      {product.stock} tersisa
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[24px] border border-border bg-carbon p-5">
            <h2 className="flex items-center gap-2 font-serif text-2xl tracking-[-0.02em]">
              <ShieldCheck className="size-4 text-fog" /> Katalog
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-[10px] border border-border/50 bg-background/50 p-3">
                <p className="text-ash">Produk aktif</p>
                <p className="font-heading text-xl font-semibold">
                  {products.filter((product) => product.isActive).length}
                </p>
              </div>
              <div className="rounded-[10px] border border-border/50 bg-background/50 p-3">
                <p className="text-ash">Kategori</p>
                <p className="font-heading text-xl font-semibold">{categories.length}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
