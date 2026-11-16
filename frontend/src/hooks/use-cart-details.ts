"use client";

import { useMemo } from "react";
import { useCartStore } from "@/lib/store/cart";
import type { Product } from "@/lib/types";

export interface CartDetailLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

export function useCartDetails() {
  const items = useCartStore((state) => state.items);

  return useMemo(() => {
    const lines: CartDetailLine[] = items.map((line) => ({
      product: line.product,
      quantity: line.quantity,
      lineTotal: line.lineTotal,
    }));
    return {
      lines,
      subtotal: lines.reduce((total, line) => total + line.lineTotal, 0),
      count: lines.reduce((total, line) => total + line.quantity, 0),
    };
  }, [items]);
}
