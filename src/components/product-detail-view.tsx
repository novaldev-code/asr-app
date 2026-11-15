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
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Memuat produk…</p>
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
    <div className="container-page py-8">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground">
          Katalog
        </Link>
        {category ? (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${category.slug}`}
              className="hover:text-foreground"
            >
              {category.name}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="aspect-square"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {category ? (
                <Badge variant="secondary" className="rounded-full">
                  {category.name}
                </Badge>
              ) : null}
              {product.featured ? (
                <Badge className="rounded-full">Unggulan</Badge>
              ) : null}
              <Badge
                variant="outline"
                className={
                  soldOut
                    ? "rounded-full border-rose-200 bg-rose-50 text-rose-700"
                    : "rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
                }
              >
                {soldOut ? "Stok habis" : `Stok ${product.stock}`}
              </Badge>
            </div>
            <h1 className="font-heading text-3xl font-semibold sm:text-4xl">
              {product.name}
            </h1>
            <Price value={product.price} className="text-2xl text-mocha" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Jumlah</p>
                <p className="text-xs text-muted-foreground">
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
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
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
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              Harga dan stok divalidasi kembali saat checkout.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, title: "Ongkir per provinsi", text: "Dihitung otomatis" },
              { icon: ShieldCheck, title: "COD / transfer", text: "Verifikasi admin" },
              { icon: PackageCheck, title: "Dikemas rapi", text: "Aman sampai tujuan" },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-secondary/30 p-3"
              >
                <item.icon className="size-4 text-caramel" />
                <p className="mt-2 text-xs font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-heading text-xl font-semibold">Produk terkait</h2>
            {category ? (
              <Link
                href={`/products?category=${category.slug}`}
                className="text-sm font-medium text-mocha hover:underline"
              >
                Lihat kategori {category.name}
              </Link>
            ) : null}
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} categoryName={category?.name} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
