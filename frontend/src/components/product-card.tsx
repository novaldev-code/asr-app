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
        "group flex flex-col overflow-hidden rounded-[24px] border border-border bg-card transition-colors hover:border-bone/60",
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
          className="aspect-[4/5]"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-1.5">
          {product.featured ? (
            <Badge variant="secondary" className="rounded-full">
              Unggulan
            </Badge>
          ) : null}
          {soldOut ? (
            <Badge
              variant="outline"
              className="rounded-full border-border/60 bg-black/60 text-bone backdrop-blur-sm"
            >
              Stok habis
            </Badge>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1.5">
          {categoryName ? (
            <p className="text-[11px] font-medium tracking-[0.16em] text-ash uppercase">
              {categoryName}
            </p>
          ) : null}
          <h3 className="text-base leading-snug font-medium text-bone">
            <Link href={`/products/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-fog">
            {product.description}
          </p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <div className="flex flex-col gap-0.5">
            <Price value={product.price} className="text-base text-bone" />
            <span className="text-xs text-ash">
              {soldOut ? "Tidak tersedia" : `Stok ${product.stock}`}
            </span>
          </div>
          <AddToCartButton
            product={product}
            size="sm"
            variant="outline"
            label="Tambah"
          />
        </div>
      </div>
    </article>
  );
}
