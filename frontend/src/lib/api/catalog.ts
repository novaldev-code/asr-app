import {
  apiFetch,
  toQueryString,
  type DataEnvelope,
  type ListEnvelope,
} from "@/lib/api/client";
import type { Category, Product, ShippingRate } from "@/lib/types";

export async function fetchProducts(params: {
  q?: string;
  category?: string;
  featured?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
  page?: number;
  limit?: number;
} = {}): Promise<ListEnvelope<Product>> {
  const query = toQueryString({
    q: params.q,
    category: params.category,
    featured: params.featured,
    sort: params.sort,
    page: params.page,
    limit: params.limit,
  });
  return apiFetch<ListEnvelope<Product>>(`/api/products${query}`);
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const response = await apiFetch<DataEnvelope<Product>>(
    `/api/products/${encodeURIComponent(slug)}`,
  );
  return response.data;
}

export async function fetchCategories(): Promise<Category[]> {
  const response =
    await apiFetch<DataEnvelope<Category[]>>("/api/categories");
  return response.data;
}

export async function fetchShippingQuote(province: string): Promise<{
  province: string;
  cost: number;
  isDefault: boolean;
}> {
  const query = toQueryString({ province });
  const response = await apiFetch<
    DataEnvelope<{ province: string; cost: number; isDefault: boolean }>
  >(`/api/shipping/quote${query}`);
  return response.data;
}

export async function fetchShippingRates(): Promise<ShippingRate[]> {
  const response = await apiFetch<DataEnvelope<ShippingRate[]>>(
    "/api/admin/shipping-rates",
  );
  return response.data;
}
