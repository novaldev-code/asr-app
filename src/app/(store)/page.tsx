"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowRight,
  Coffee,
  Leaf,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Price } from "@/components/price";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/lib/store/data";

const TRUST_ITEMS = [
  {
    icon: Truck,
    title: "Ongkir transparan",
    description: "Tarif flat per provinsi, dihitung otomatis saat checkout.",
  },
  {
    icon: ShieldCheck,
    title: "Bayar fleksibel",
    description: "Pilih COD atau transfer bank manual dengan verifikasi admin.",
  },
  {
    icon: Leaf,
    title: "Biji pilihan",
    description: "Kopi Nusantara yang disangrai segar dan dikemas hati-hati.",
  },
];

export default function HomePage() {
  const products = useDataStore((state) => state.products);
  const categories = useDataStore((state) => state.categories);
  const catalogLoaded = useDataStore((state) => state.catalogLoaded);
  const loadCatalog = useDataStore((state) => state.loadCatalog);
  const featured = products.filter((product) => product.isActive && product.featured).slice(0, 4);
  const heroProduct = featured[0] ?? products.find((product) => product.isActive);

  useEffect(() => {
    if (catalogLoaded) return;
    void loadCatalog().catch(() => {
      // sections fall back to empty states
    });
  }, [catalogLoaded, loadCatalog]);

  return (
    <div className="pb-8">
      <section className="relative overflow-hidden border-b border-border/70 bg-[radial-gradient(circle_at_20%_20%,var(--color-secondary),transparent_55%),radial-gradient(circle_at_80%_0%,var(--color-accent),transparent_45%)]">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-mocha">
              <Sparkles className="size-3.5" /> Baru: Paket Ngopi Pagi
            </span>
            <div className="space-y-4">
              <h1 className="max-w-xl text-balance font-heading text-4xl leading-[1.08] font-semibold sm:text-5xl lg:text-6xl">
                Kopi hangat untuk ritual yang lebih tenang.
              </h1>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                Dari biji single origin hingga alat seduh manual, temukan
                perlengkapan yang membuat setiap cangkir terasa istimewa.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="rounded-full px-5"
                render={<Link href="/products" />}
              >
                Jelajahi katalog <ArrowRight />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-5"
                render={<Link href="/products?category=drip-bag" />}
              >
                Lihat drip bag
              </Button>
            </div>
            <dl className="grid max-w-lg grid-cols-3 gap-4 border-t border-border/70 pt-6">
              <div>
                <dt className="text-xs text-muted-foreground">Pilihan produk</dt>
                <dd className="font-heading text-2xl font-semibold">24+</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Provinsi terlayani</dt>
                <dd className="font-heading text-2xl font-semibold">38</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Sangrai</dt>
                <dd className="font-heading text-2xl font-semibold">Mingguan</dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            {heroProduct ? (
              <Link
                href={`/products/${heroProduct.slug}`}
                className="group relative block overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl"
              >
                <ProductImage
                  src={heroProduct.imageUrl}
                  alt={heroProduct.name}
                  className="aspect-[4/5]"
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent p-6 pt-16 text-white">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">
                    Paling dicari
                  </p>
                  <h2 className="mt-1 font-heading text-2xl font-semibold">
                    {heroProduct.name}
                  </h2>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Price value={heroProduct.price} className="text-white" />
                    <span className="text-white/75">· Stok {heroProduct.stock}</span>
                  </div>
                </div>
              </Link>
            ) : catalogLoaded ? null : (
              <div className="aspect-[4/5] w-full animate-pulse rounded-[2rem] border border-border bg-muted" />
            )}
            <div className="absolute -right-3 -top-4 hidden rotate-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-md sm:block">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Coffee className="size-4 text-caramel" />
                Fresh roast
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">Dikemas setelah dipesan</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-caramel">
              Kategori
            </p>
            <h2 className="mt-1 font-heading text-2xl font-semibold">Mulai dari kebutuhan Anda</h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-medium text-mocha hover:underline"
          >
            Lihat semua produk <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {!catalogLoaded
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-2xl border border-border bg-muted"
                />
              ))
            : null}
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/40"
            >
              <div>
                <h3 className="font-heading text-lg font-semibold">{category.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
              </div>
              <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-caramel">
              Pilihan kami
            </p>
            <h2 className="mt-1 font-heading text-2xl font-semibold">Produk unggulan</h2>
          </div>
          <Link
            href="/products?sort=popular"
            className="inline-flex items-center gap-1 text-sm font-medium text-mocha hover:underline"
          >
            Semua unggulan <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {!catalogLoaded
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-2xl border border-border bg-muted"
                />
              ))
            : null}
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={
                categories.find((category) => category.id === product.categoryId)?.name
              }
            />
          ))}
        </div>
        {catalogLoaded && featured.length === 0 ? (
          <EmptyState
            title="Belum ada produk unggulan"
            description="Admin dapat menandai produk sebagai unggulan dari dashboard."
            className="mt-6"
          />
        ) : null}
      </section>

      <section className="container-page py-14">
        <div className="grid gap-4 rounded-3xl border border-border bg-secondary/50 p-6 sm:grid-cols-3 sm:p-8">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-mocha shadow-sm">
                <item.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-heading text-base font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-10">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-10">
          <div className="absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-24 size-40 rounded-full bg-white/10" />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-xl space-y-2">
              <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
                Siap memulai ritual kopi Anda?
              </h2>
              <p className="text-sm leading-relaxed text-primary-foreground/80">
                Buat pesanan dalam beberapa menit. Pilih COD atau transfer bank,
                lalu pantau status pesanan dari akun Anda.
              </p>
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-5"
              render={<Link href="/products" />}
            >
              Mulai belanja <ArrowRight />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
