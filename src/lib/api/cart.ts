import { apiFetch, type DataEnvelope } from "@/lib/api/client";
import type { Product } from "@/lib/types";

export interface RemoteCartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
  lineTotal: number;
}

export interface RemoteCart {
  id: string;
  items: RemoteCartItem[];
  subtotal: number;
  itemCount: number;
}

export async function fetchCart(): Promise<RemoteCart> {
  const response = await apiFetch<DataEnvelope<RemoteCart>>("/api/cart");
  return response.data;
}

export async function addCartItem(
  productId: string,
  quantity: number,
): Promise<RemoteCart> {
  const response = await apiFetch<DataEnvelope<RemoteCart>>("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
  return response.data;
}

export async function updateCartItem(
  itemId: string,
  quantity: number,
): Promise<RemoteCart> {
  const response = await apiFetch<DataEnvelope<RemoteCart>>(
    `/api/cart/items/${itemId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    },
  );
  return response.data;
}

export async function removeCartItem(itemId: string): Promise<RemoteCart> {
  const response = await apiFetch<DataEnvelope<RemoteCart>>(
    `/api/cart/items/${itemId}`,
    { method: "DELETE" },
  );
  return response.data;
}

export async function clearRemoteCart(): Promise<RemoteCart> {
  const response = await apiFetch<DataEnvelope<RemoteCart>>("/api/cart", {
    method: "DELETE",
  });
  return response.data;
}

export async function mergeRemoteCart(
  items: { productId: string; quantity: number }[],
): Promise<{ data: RemoteCart; skippedProductIds: string[] }> {
  return apiFetch<{ data: RemoteCart; skippedProductIds: string[] }>(
    "/api/cart/merge",
    {
      method: "POST",
      body: JSON.stringify({ items }),
    },
  );
}
