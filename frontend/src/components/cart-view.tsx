"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { QuantityStepper } from "@/components/quantity-stepper";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartDetails } from "@/hooks/use-cart-details";
import { useCartStore } from "@/lib/store/cart";

export function CartView() {
  const { lines, subtotal, count } = useCartDetails();
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const status = useCartStore((state) => state.status);

  if (status === "idle" || status === "loading") {
    return (
      <div className="container-page py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-[24px] border border-border bg-carbon p-10 text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-graphite border-t-bone" />
          <p className="text-sm text-fog">Memuat keranjang…</p>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-page py-14">
        <EmptyState
          icon={<ShoppingBag className="size-5" />}
          title="Keranjang Anda masih kosong"
          description="Jelajahi katalog dan tambahkan produk favorit untuk mulai belanja."
          action={
            <Button className="rounded-full" render={<Link href="/products" />}>
              Mulai belanja <ArrowRight />
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <PageHeader
        display
        eyebrow="Keranjang"
        title={`${count} item siap dipesan`}
        description="Periksa jumlah dan produk sebelum melanjutkan ke checkout."
        action={
          <Button
            variant="ghost"
            className="rounded-full text-fog"
            onClick={async () => {
              await clear();
              toast.success("Keranjang dikosongkan.");
            }}
          >
            Kosongkan keranjang
          </Button>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3">
          {lines.map(({ product, quantity, lineTotal }) => (
            <div
              key={product.id}
              className="flex flex-col gap-4 rounded-[24px] border border-border bg-carbon p-4 sm:flex-row"
            >
              <Link
                href={`/products/${product.slug}`}
                className="w-full shrink-0 overflow-hidden rounded-[10px] sm:w-24"
              >
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  className="aspect-square sm:size-24"
                  sizes="96px"
                />
              </Link>
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-base font-medium text-bone hover:underline"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-fog">
                      <Price value={product.price} /> / item
                    </p>
                    {product.stock < quantity ? (
                      <p className="mt-1 text-xs font-medium text-bone">
                        Stok tersisa {product.stock}. Kurangi jumlah untuk melanjutkan.
                      </p>
                    ) : null}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Hapus ${product.name} dari keranjang`}
                    className="text-ash hover:text-bone"
                    onClick={async () => {
                      const result = await removeItem(product.id);
                      if (result.ok) {
                        toast.success(`${product.name} dihapus dari keranjang.`);
                      } else {
                        toast.error(result.message ?? "Gagal menghapus produk.");
                      }
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <QuantityStepper
                    value={quantity}
                    max={Math.max(1, product.stock)}
                    onChange={async (next) => {
                      const result = await setQuantity(product.id, next);
                      if (!result.ok) {
                        toast.error(
                          result.message ?? "Jumlah produk gagal diperbarui.",
                        );
                      }
                    }}
                  />
                  <Price value={lineTotal} className="text-base" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-[24px] border border-border bg-carbon p-5 lg:sticky lg:top-28">
          <h2 className="font-serif text-2xl tracking-[-0.02em]">Ringkasan</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ash">Subtotal ({count} item)</dt>
              <dd>
                <Price value={subtotal} />
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ash">Ongkir</dt>
              <dd className="text-ash">Dihitung saat checkout</dd>
            </div>
          </dl>
          <Separator className="my-4" />
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total sementara</span>
            <Price value={subtotal} />
          </div>
          <Button
            size="lg"
            className="mt-5 w-full rounded-full"
            render={<Link href="/checkout" />}
          >
            Lanjut ke checkout <ArrowRight />
          </Button>
          <Button
            variant="ghost"
            className="mt-2 w-full rounded-full"
            render={<Link href="/products" />}
          >
            Tambah produk lain
          </Button>
          <p className="mt-3 text-center text-xs text-ash">
            Stok dikurangi setelah pesanan berhasil dibuat.
          </p>
        </aside>
      </div>
    </div>
  );
}
