"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { EmptyState } from "@/components/empty-state";
import { Price } from "@/components/price";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { QuantityStepper } from "@/components/quantity-stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchProductBySlug } from "@/lib/api/catalog";
import { useDataStore } from "@/lib/store/data";
import type { Product } from "@/lib/types";

export function ProductDetailView({ slug }: { slug: string }) {
  const products = useDataStore((state) => state.products);
  const categories = useDataStore((state) => state.categories);
  const catalogLoaded = useDataStore((state) => state.catalogLoaded);
  const loadCatalog = useDataStore((state) => state.loadCatalog);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let active = true;
    fetchProductBySlug(slug)
      .then((data) => {
        if (active) setProduct(data);
      })
      .catch(() => {
        if (active) setProduct(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (catalogLoaded) return;
    void loadCatalog().catch(() => {
      // related products are optional
    });
  }, [catalogLoaded, loadCatalog]);

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-[24px] border border-border bg-carbon p-10 text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-graphite border-t-bone" />
          <p className="text-sm text-fog">Memuat produk…</p>
        </div>
      </div>
    );
  }

  if (!product || !product.isActive) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<PackageCheck className="size-5" />}
          title="Produk tidak tersedia"
          description="Produk ini sedang tidak ditampilkan di katalog. Silakan lihat produk lain."
          action={
            <Button className="rounded-full" render={<Link href="/products" />}>
              <ArrowLeft /> Kembali ke katalog
            </Button>
          }
        />
      </div>
    );
  }

  const category = categories.find((item) => item.id === product.categoryId);
  const related = products
    .filter(
      (item) =>
        item.isActive &&
        item.categoryId === product.categoryId &&
        item.id !== product.id,
    )
    .slice(0, 4);
  const soldOut = product.stock <= 0;
  const maxQuantity = Math.max(1, product.stock);

  return (
    <div className="container-page py-10">
      <nav
        className="flex flex-wrap items-center gap-1.5 text-xs text-ash"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="transition-colors hover:text-bone">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/products" className="transition-colors hover:text-bone">
          Katalog
        </Link>
        {category ? (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${category.slug}`}
              className="transition-colors hover:text-bone"
            >
              {category.name}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span className="text-fog">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="overflow-hidden rounded-[24px] border border-border bg-carbon lg:sticky lg:top-28 lg:h-fit">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="aspect-square"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {category ? (
                <Badge variant="secondary" className="rounded-full">
                  {category.name}
                </Badge>
              ) : null}
              {product.featured ? (
                <Badge variant="outline" className="rounded-full">
                  Unggulan
                </Badge>
              ) : null}
              <Badge
                variant="outline"
                className={
                  soldOut
                    ? "rounded-full border-border/60 bg-transparent text-ash"
                    : "rounded-full border-border bg-carbon text-fog"
                }
              >
                {soldOut ? "Stok habis" : `Stok ${product.stock}`}
              </Badge>
            </div>
            <h1 className="mt-5 font-serif text-4xl leading-[1.05] tracking-[-0.036em] text-bone sm:text-5xl">
              {product.name}
            </h1>
            <Price value={product.price} className="mt-4 font-serif text-3xl text-bone" />
            <p className="mt-5 max-w-xl text-base leading-relaxed text-fog">
              {product.description}
            </p>
          </div>

          <div className="rounded-[24px] border border-border bg-carbon p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-bone">Jumlah</p>
                <p className="text-xs text-ash">
                  Maksimal {product.stock} item sesuai stok tersedia.
                </p>
              </div>
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                max={maxQuantity}
                disabled={soldOut}
              />
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <AddToCartButton
                product={product}
                quantity={quantity}
                size="lg"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                render={<Link href="/cart" />}
              >
                Lihat keranjang
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-ash">
              <CheckCircle2 className="size-3.5 text-fog" />
              Harga dan stok divalidasi kembali saat checkout.
            </p>
          </div>

          <div className="grid gap-0 border-t border-border/30 sm:grid-cols-3">
            {[
              { icon: Truck, title: "Ongkir per provinsi", text: "Dihitung otomatis" },
              { icon: ShieldCheck, title: "COD / transfer", text: "Verifikasi admin" },
              { icon: PackageCheck, title: "Dikemas rapi", text: "Aman sampai tujuan" },
            ].map((item) => (
              <div key={item.title} className="border-b border-border/30 py-4 sm:pr-4">
                <item.icon className="size-4 text-fog" />
                <p className="mt-3 text-xs font-medium text-bone">{item.title}</p>
                <p className="mt-0.5 text-xs text-ash">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium tracking-[0.22em] text-ash uppercase">
                Lanjut jelajah
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-[-0.03em] text-bone">
                Produk terkait
              </h2>
            </div>
            {category ? (
              <Link
                href={`/products?category=${category.slug}`}
                className="text-sm text-fog transition-colors hover:text-bone hover:underline"
              >
                Lihat kategori {category.name}
              </Link>
            ) : null}
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} categoryName={category?.name} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
