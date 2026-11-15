"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/format";
import { useDataStore } from "@/lib/store/data";
import { productSchema, type ProductValues } from "@/lib/validators";
import type { Product } from "@/lib/types";

export function AdminProducts() {
  const products = useDataStore((state) => state.products);
  const categories = useDataStore((state) => state.categories);
  const adminCatalogLoaded = useDataStore((state) => state.adminCatalogLoaded);
  const loadAdminCatalog = useDataStore((state) => state.loadAdminCatalog);
  const saveProduct = useDataStore((state) => state.saveProduct);
  const toggleProductActive = useDataStore((state) => state.toggleProductActive);
  const removeProduct = useDataStore((state) => state.removeProduct);

  useEffect(() => {
    void loadAdminCatalog().catch(() => {
      // table falls back to empty state
    });
  }, [loadAdminCatalog]);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const emptyValues: ProductValues = {
    name: "",
    slug: "",
    categoryId: categories[0]?.id ?? "",
    price: 0,
    stock: 0,
    description: "",
    imageUrl: "",
    isActive: true,
    featured: false,
  };

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues,
  });

  const active = useWatch({ control: form.control, name: "isActive" });
  const featured = useWatch({ control: form.control, name: "featured" });
  const categoryId = useWatch({ control: form.control, name: "categoryId" });

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products
      .filter((product) =>
        term
          ? product.name.toLowerCase().includes(term) ||
            product.slug.toLowerCase().includes(term)
          : true,
      )
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [products, query]);

  function openCreate() {
    setEditingId(null);
    form.reset({ ...emptyValues, categoryId: categories[0]?.id ?? "" });
    setOpen(true);
  }

  function openEdit(product: Product) {
    setEditingId(product.id);
    form.reset({
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId ?? "",
      price: product.price,
      stock: product.stock,
      description: product.description,
      imageUrl: product.imageUrl ?? "",
      isActive: product.isActive,
      featured: product.featured,
    });
    setOpen(true);
  }

  async function onSubmit(values: ProductValues) {
    const result = await saveProduct(values, editingId ?? undefined);
    if (result.ok) {
      toast.success(editingId ? "Produk diperbarui." : "Produk baru ditambahkan.");
      setOpen(false);
    } else {
      toast.error(result.message ?? "Gagal menyimpan produk.");
    }
  }

  function categoryName(categoryId: string | null) {
    return categories.find((category) => category.id === categoryId)?.name ?? "Tanpa kategori";
  }

  if (!adminCatalogLoaded) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Memuat produk…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Produk"
        description="Tambah, ubah, dan atur ketersediaan produk kopi Mocha & Co."
        action={
          <Button className="rounded-full" onClick={openCreate}>
            <Plus /> Tambah produk
          </Button>
        }
      />

      <div className="relative sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama atau slug…"
          className="pl-9"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Harga</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Tidak ada produk yang cocok.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="size-10 shrink-0 rounded-lg"
                        sizes="40px"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{product.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{categoryName(product.categoryId)}</TableCell>
                  <TableCell className="text-right text-sm">
                    <Price value={product.price} />
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    <span className={product.stock === 0 ? "font-medium text-destructive" : ""}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge
                        variant="outline"
                        className={
                          product.isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : "border-stone-200 bg-stone-100 text-stone-700"
                        }
                      >
                        {product.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                      {product.featured ? <Badge variant="secondary">Unggulan</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full"
                        onClick={async () => {
                          const result = await toggleProductActive(
                            product.id,
                            !product.isActive,
                          );
                          if (result.ok) {
                            toast.success(
                              product.isActive
                                ? "Produk dinonaktifkan."
                                : "Produk diaktifkan.",
                            );
                          } else {
                            toast.error(result.message ?? "Status produk gagal diubah.");
                          }
                        }}
                      >
                        {product.isActive ? "Off" : "On"}
                        <span className="sr-only">Ubah status</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full"
                        onClick={() => openEdit(product)}
                      >
                        <Pencil />
                        <span className="sr-only">Ubah</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full text-destructive"
                        onClick={async () => {
                          const result = await removeProduct(product.id);
                          if (result.ok) {
                            toast.success(
                              "Produk dinonaktifkan dan disembunyikan dari katalog.",
                            );
                          } else {
                            toast.error(result.message ?? "Produk gagal dinonaktifkan.");
                          }
                        }}
                      >
                        <Trash2 />
                        <span className="sr-only">Nonaktifkan</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Ubah produk" : "Tambah produk"}</DialogTitle>
            <DialogDescription>
              Isi detail produk. Slug unik akan dibuat otomatis bila bentrok.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="product-name">Nama produk</Label>
              <Input
                id="product-name"
                {...form.register("name", {
                  onChange: (event) => {
                    if (!editingId) {
                      form.setValue("slug", slugify(event.target.value));
                    }
                  },
                })}
              />
              {form.formState.errors.name ? (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-slug">Slug</Label>
              <Input id="product-slug" {...form.register("slug")} />
              {form.formState.errors.slug ? (
                <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-category">Kategori</Label>
              <Select
                value={categoryId}
                onValueChange={(value) => form.setValue("categoryId", value ?? "")}
              >
                <SelectTrigger id="product-category" className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.categoryId.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-image">URL gambar</Label>
              <Input
                id="product-image"
                placeholder="https://images.unsplash.com/…"
                {...form.register("imageUrl")}
              />
              {form.formState.errors.imageUrl ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.imageUrl.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-price">Harga (Rp)</Label>
              <Input
                id="product-price"
                type="number"
                min={0}
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price ? (
                <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-stock">Stok</Label>
              <Input
                id="product-stock"
                type="number"
                min={0}
                {...form.register("stock", { valueAsNumber: true })}
              />
              {form.formState.errors.stock ? (
                <p className="text-xs text-destructive">{form.formState.errors.stock.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="product-description">Deskripsi</Label>
              <Textarea id="product-description" rows={4} {...form.register("description")} />
              {form.formState.errors.description ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              ) : null}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(event) => form.setValue("isActive", event.target.checked)}
                className="size-4 rounded border-input accent-primary"
              />
              Tampilkan di katalog
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) => form.setValue("featured", event.target.checked)}
                className="size-4 rounded border-input accent-primary"
              />
              Tandai sebagai unggulan
            </label>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="rounded-full">
                Simpan produk
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
