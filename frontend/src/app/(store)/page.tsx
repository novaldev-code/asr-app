"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Coffee, Leaf, Search, ShieldCheck, Truck } from "lucide-react";
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

function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-ash uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-serif text-3xl leading-[1.1] tracking-[-0.03em] text-bone sm:text-4xl">
          {title}
        </h2>
      </div>
      <Link
        href={href}
        className="group inline-flex items-center gap-1.5 text-sm text-fog transition-colors hover:text-bone"
      >
        {linkLabel}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

export default function HomePage() {
  const products = useDataStore((state) => state.products);
  const categories = useDataStore((state) => state.categories);
  const catalogLoaded = useDataStore((state) => state.catalogLoaded);
  const loadCatalog = useDataStore((state) => state.loadCatalog);
  const featured = products
    .filter((product) => product.isActive && product.featured)
    .slice(0, 4);
  const heroProducts = products.filter((product) => product.isActive).slice(0, 3);

  useEffect(() => {
    if (catalogLoaded) return;
    void loadCatalog().catch(() => {
      // sections fall back to empty states
    });
  }, [catalogLoaded, loadCatalog]);

  return (
    <div className="pb-8">
      <section className="container-page pt-12 pb-20 sm:pt-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="inline-flex items-center gap-2 border-b border-border/50 pb-2 text-[11px] font-medium tracking-[0.22em] text-ash uppercase">
            <Coffee className="size-3.5" /> Sangrai mingguan · Edisi 2026
          </p>
          <h1 className="mt-6 font-serif text-5xl leading-[0.98] tracking-[-0.04em] text-bone sm:text-6xl lg:text-7xl">
            Ritual kopi yang lebih{" "}
            <em className="font-serif italic">tenang.</em>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-fog">
            Dari biji single origin hingga alat seduh manual, temukan
            perlengkapan yang membuat setiap cangkir terasa istimewa.
          </p>

          <form
            action="/products"
            method="get"
            className="relative mt-10 w-full max-w-2xl text-left"
          >
            <label htmlFor="hero-search" className="sr-only">
              Cari produk
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-ash" />
            <input
              id="hero-search"
              name="q"
              placeholder="Cari kopi, drip bag, atau alat seduh…"
              className="h-14 w-full rounded-[24px] border border-border bg-carbon pr-16 pl-12 text-[15px] text-bone outline-none transition-colors placeholder:text-ash focus-visible:border-bone"
            />
            <button
              type="submit"
              aria-label="Cari produk"
              className="absolute top-1/2 right-2.5 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-bone text-pitch transition-colors hover:bg-mist"
            >
              <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {categories.slice(0, 3).map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="rounded-full border border-border px-3.5 py-1.5 text-sm text-fog transition-colors hover:border-bone hover:text-bone"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-3 items-end gap-2.5 sm:gap-5">
          {heroProducts.length > 0
            ? heroProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className={
                    index === 1
                      ? "group relative block aspect-[3/4] overflow-hidden rounded-[24px] border border-border bg-carbon transition-colors hover:border-bone sm:-translate-y-8"
                      : index === 0
                        ? "group relative block aspect-[4/5] overflow-hidden rounded-[24px] border border-border bg-carbon transition-colors hover:border-bone sm:-rotate-2 sm:translate-y-4"
                        : "group relative block aspect-[4/5] overflow-hidden rounded-[24px] border border-border bg-carbon transition-colors hover:border-bone sm:rotate-2 sm:translate-y-4"
                  }
                >
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="aspect-[4/5]"
                    sizes="(max-width: 640px) 30vw, 320px"
                    priority={index === 1}
                  />
                  <div className="absolute inset-x-2 bottom-2 rounded-[10px] border border-border/50 bg-black/70 px-3 py-2 backdrop-blur-sm sm:inset-x-3 sm:bottom-3">
                    <p className="truncate text-xs font-medium text-bone">
                      {product.name}
                    </p>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <Price value={product.price} className="text-[11px] text-fog" />
                      <span className="text-[10px] text-ash">Stok {product.stock}</span>
                    </div>
                  </div>
                </Link>
              ))
            : catalogLoaded
              ? null
              : Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[4/5] animate-pulse rounded-[24px] border border-border bg-carbon"
                  />
                ))}
        </div>

        <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4 border-t border-border/40 pt-6 text-center">
          <div>
            <dt className="text-xs text-ash">Pilihan produk</dt>
            <dd className="mt-1 font-serif text-3xl text-bone">24+</dd>
          </div>
          <div>
            <dt className="text-xs text-ash">Provinsi terlayani</dt>
            <dd className="mt-1 font-serif text-3xl text-bone">38</dd>
          </div>
          <div>
            <dt className="text-xs text-ash">Sangrai</dt>
            <dd className="mt-1 font-serif text-3xl text-bone">Mingguan</dd>
          </div>
        </dl>
      </section>

      <section className="container-page py-14">
        <SectionHeading
          eyebrow="Kategori"
          title="Mulai dari kebutuhan Anda"
          href="/products"
          linkLabel="Lihat semua produk"
        />
        <div className="mt-8 grid gap-0 border-t border-border/40 sm:grid-cols-2 lg:grid-cols-3">
          {!catalogLoaded
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse border-b border-border/40 bg-carbon/60"
                />
              ))
            : null}
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group flex min-h-36 flex-col justify-between gap-6 border-b border-border/40 py-6 pr-6 transition-colors hover:bg-carbon/40 sm:odd:pr-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-serif text-sm text-ash">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex size-8 items-center justify-center rounded-full border border-border/60 text-fog transition-colors group-hover:border-bone group-hover:text-bone">
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
              <div>
                <h3 className="font-serif text-2xl tracking-[-0.02em] text-bone">
                  {category.name}
                </h3>
                <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-fog">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-6">
        <SectionHeading
          eyebrow="Pilihan kami"
          title="Produk unggulan"
          href="/products?sort=popular"
          linkLabel="Semua unggulan"
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {!catalogLoaded
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-80 animate-pulse rounded-[24px] border border-border bg-carbon"
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
            className="mt-8"
          />
        ) : null}
      </section>

      <section className="container-page py-16">
        <div className="grid gap-8 border-y border-border/30 py-10 sm:grid-cols-3">
          {TRUST_ITEMS.map((item, index) => (
            <div key={item.title} className="flex gap-4">
              <span className="font-serif text-sm text-ash">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <item.icon className="size-5 text-bone" />
                <h3 className="mt-4 text-sm font-medium text-bone">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-fog">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-10">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[24px] bg-bone px-6 py-12 text-pitch sm:px-10 sm:py-14 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium tracking-[0.22em] text-pitch/60 uppercase">
              Mulai hari ini
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-[1.05] tracking-[-0.03em] sm:text-5xl">
              Siap memulai ritual kopi Anda?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-pitch/70">
              Buat pesanan dalam beberapa menit. Pilih COD atau transfer bank,
              lalu pantau status pesanan dari akun Anda.
            </p>
          </div>
          <Button
            size="lg"
            className="shrink-0 rounded-full border-pitch bg-pitch px-6 text-bone hover:bg-graphite"
            render={<Link href="/products" />}
          >
            Mulai belanja <ArrowRight />
          </Button>
        </div>
      </section>
    </div>
  );
}
