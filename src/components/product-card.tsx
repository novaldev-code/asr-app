import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Price } from "@/components/price";
import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  categoryName,
  className,
}: {
  product: Product;
  categoryName?: string;
  className?: string;
}) {
  const soldOut = product.stock <= 0;

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block"
        aria-label={`Lihat detail ${product.name}`}
      >
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="aspect-[4/3]"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.featured ? (
            <Badge className="rounded-full bg-primary text-primary-foreground">
              Unggulan
            </Badge>
          ) : null}
          {soldOut ? (
            <Badge variant="outline" className="rounded-full bg-background/90 text-foreground">
              Stok habis
            </Badge>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          {categoryName ? (
            <p className="text-xs font-medium uppercase tracking-wider text-caramel">
              {categoryName}
            </p>
          ) : null}
          <h3 className="font-heading text-base leading-snug font-semibold">
            <Link href={`/products/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <div className="flex flex-col">
            <Price value={product.price} className="text-base" />
            <span className="text-xs text-muted-foreground">
              {soldOut ? "Tidak tersedia" : `Stok ${product.stock}`}
            </span>
          </div>
          <AddToCartButton product={product} size="sm" label="Tambah" />
        </div>
      </div>
    </article>
  );
}
