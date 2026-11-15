"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  size = "default",
  label = "Tambah ke keranjang",
}: {
  product: Product;
  quantity?: number;
  className?: string;
  size?: "default" | "sm" | "lg";
  label?: string;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const soldOut = product.stock <= 0 || !product.isActive;

  return (
    <Button
      type="button"
      size={size}
      disabled={soldOut}
      className={cn("rounded-full", className)}
      onClick={async () => {
        const result = await addItem(product, quantity);
        if (result.ok) {
          toast.success(`${product.name} ditambahkan ke keranjang.`);
        } else {
          toast.error(result.message ?? "Keranjang gagal diperbarui.");
        }
      }}
    >
      <ShoppingBag />
      {soldOut ? "Stok habis" : label}
    </Button>
  );
}
