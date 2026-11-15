"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDataStore } from "@/lib/store/data";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
  { value: "recommended", label: "Rekomendasi" },
  { value: "popular", label: "Terpopuler" },
  { value: "newest", label: "Terbaru" },
  { value: "price-asc", label: "Harga terendah" },
  { value: "price-desc", label: "Harga tertinggi" },
  { value: "name", label: "Nama A–Z" },
];

function sortProducts(products: Product[], sort: string): Product[] {
  const copy = [...products];
  switch (sort) {
    case "newest":
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "id"));
    case "popular":
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

export function CatalogView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const products = useDataStore((state) => state.products);
  const categories = useDataStore((state) => state.categories);
  const catalogLoaded = useDataStore((state) => state.catalogLoaded);
  const loadCatalog = useDataStore((state) => state.loadCatalog);

  useEffect(() => {
    if (catalogLoaded) return;
    void loadCatalog().catch(() => {
      // empty state is shown when the request fails
    });
  }, [catalogLoaded, loadCatalog]);

  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "recommended";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    if (!("page" in updates)) params.delete("page");
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    const active = products.filter((product) => product.isActive);
    const byCategory = category
      ? active.filter(
          (product) =>
            categories.find((item) => item.id === product.categoryId)?.slug === category,
        )
      : active;
    const bySearch = search
      ? byCategory.filter(
          (product) =>
            product.name.toLowerCase().includes(search) ||
            product.description.toLowerCase().includes(search),
        )
      : byCategory;
    return sortProducts(bySearch, sort);
  }, [products, categories, query, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const hasFilters = Boolean(query || category || (sort && sort !== "recommended"));

  return (
    <div className="container-page py-10">
      <PageHeader
        eyebrow="Katalog"
        title="Temukan kopi dan perlengkapan favorit Anda"
        description="Cari berdasarkan nama, filter kategori, lalu urutkan sesuai kebutuhan. Produk dengan stok habis tetap ditampilkan."
      />

      <div className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => updateParams({ q: event.target.value })}
              placeholder="Cari produk, misalnya 'gayo' atau 'drip bag'"
              aria-label="Cari produk"
              className="h-10 rounded-full pl-9"
            />
          </div>
          <label className="sr-only" htmlFor="filter-category">
            Kategori
          </label>
          <select
            id="filter-category"
            value={category}
            onChange={(event) => updateParams({ category: event.target.value || null })}
            className="h-10 rounded-full border border-input bg-background px-4 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Semua kategori</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="filter-sort">
            Urutkan
          </label>
          <select
            id="filter-sort"
            value={sort}
            onChange={(event) => updateParams({ sort: event.target.value })}
            className="h-10 rounded-full border border-input bg-background px-4 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {hasFilters ? (
            <Button
              variant="ghost"
              className="h-10 rounded-full"
              onClick={() => router.replace(pathname, { scroll: false })}
            >
              <X /> Reset
            </Button>
          ) : (
            <span className="hidden h-10 items-center gap-2 rounded-full border border-border px-4 text-xs text-muted-foreground lg:flex">
              <SlidersHorizontal className="size-3.5" /> {filtered.length} produk
            </span>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground lg:hidden">
          {filtered.length} produk ditemukan
        </p>
      </div>

      <div className="mt-6">
        {!catalogLoaded ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
            <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">Memuat katalog…</p>
          </div>
        ) : paginated.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {paginated.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categoryName={
                  categories.find((item) => item.id === product.categoryId)?.name
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Search className="size-5" />}
            title="Produk tidak ditemukan"
            description="Coba kata kunci lain atau hapus filter yang aktif."
            action={
              <Button
                className="rounded-full"
                onClick={() => router.replace(pathname, { scroll: false })}
              >
                Hapus semua filter
              </Button>
            }
          />
        )}
      </div>

      {totalPages > 1 ? (
        <nav
          className="mt-8 flex items-center justify-center gap-2"
          aria-label="Navigasi halaman katalog"
        >
          <Button
            variant="outline"
            className="rounded-full"
            disabled={safePage <= 1}
            onClick={() => updateParams({ page: String(safePage - 1) })}
          >
            Sebelumnya
          </Button>
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            return (
              <Button
                key={pageNumber}
                variant={pageNumber === safePage ? "default" : "outline"}
                size="sm"
                className="size-9 rounded-full p-0"
                onClick={() => updateParams({ page: String(pageNumber) })}
                aria-current={pageNumber === safePage ? "page" : undefined}
              >
                {pageNumber}
              </Button>
            );
          })}
          <Button
            variant="outline"
            className="rounded-full"
            disabled={safePage >= totalPages}
            onClick={() => updateParams({ page: String(safePage + 1) })}
          >
            Berikutnya
          </Button>
        </nav>
      ) : null}
    </div>
  );
}
