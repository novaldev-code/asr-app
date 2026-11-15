"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
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
import { Textarea } from "@/components/ui/textarea";
import { useDataStore } from "@/lib/store/data";
import { categorySchema, type CategoryValues } from "@/lib/validators";
import type { Category } from "@/lib/types";

export function AdminCategories() {
  const categories = useDataStore((state) => state.categories);
  const products = useDataStore((state) => state.products);
  const adminCatalogLoaded = useDataStore((state) => state.adminCatalogLoaded);
  const loadAdminCatalog = useDataStore((state) => state.loadAdminCatalog);
  const saveCategory = useDataStore((state) => state.saveCategory);
  const removeCategory = useDataStore((state) => state.removeCategory);

  useEffect(() => {
    void loadAdminCatalog().catch(() => {
      // grid falls back to empty state
    });
  }, [loadAdminCatalog]);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "" },
  });

  function openCreate() {
    setEditingId(null);
    form.reset({ name: "", description: "" });
    setOpen(true);
  }

  function openEdit(category: Category) {
    setEditingId(category.id);
    form.reset({ name: category.name, description: category.description });
    setOpen(true);
  }

  async function onSubmit(values: CategoryValues) {
    const result = await saveCategory(values, editingId ?? undefined);
    if (result.ok) {
      toast.success(editingId ? "Kategori diperbarui." : "Kategori ditambahkan.");
      setOpen(false);
    } else {
      toast.error(result.message ?? "Gagal menyimpan kategori.");
    }
  }

  if (!adminCatalogLoaded) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Memuat kategori…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Kategori"
        description="Kelompokkan produk agar pelanggan mudah menemukan menu favorit."
        action={
          <Button className="rounded-full" onClick={openCreate}>
            <Plus /> Tambah kategori
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const count = products.filter(
            (product) => product.categoryId === category.id,
          ).length;
          return (
            <div key={category.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <Tags className="size-4" />
                  </span>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.slug}</p>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {count} produk
                </span>
              </div>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">
                {category.description || "Belum ada deskripsi."}
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => openEdit(category)}>
                  <Pencil /> Ubah
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-destructive hover:bg-destructive/10"
                  onClick={async () => {
                    const result = await removeCategory(category.id);
                    if (result.ok) {
                      toast.success("Kategori dihapus.");
                    } else {
                      toast.error(result.message ?? "Kategori gagal dihapus.");
                    }
                  }}
                >
                  <Trash2 /> Hapus
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Ubah kategori" : "Tambah kategori"}</DialogTitle>
            <DialogDescription>
              Nama kategori harus unik. Slug dibuat otomatis dari nama.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="category-name">Nama kategori</Label>
              <Input id="category-name" {...form.register("name")} />
              {form.formState.errors.name ? (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category-description">Deskripsi</Label>
              <Textarea id="category-description" rows={3} {...form.register("description")} />
              {form.formState.errors.description ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="rounded-full">
                Simpan kategori
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
