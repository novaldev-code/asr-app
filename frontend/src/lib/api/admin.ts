import {
  apiFetch,
  toQueryString,
  type DataEnvelope,
  type ListEnvelope,
} from "@/lib/api/client";
import type { Category, Product, ShippingRate } from "@/lib/types";
import type {
  CategoryValues,
  ProductValues,
  ShippingValues,
} from "@/lib/validators";

export async function fetchAdminProducts(params: {
  q?: string;
  category?: string;
  isActive?: boolean;
  featured?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
  page?: number;
  limit?: number;
} = {}): Promise<ListEnvelope<Product>> {
  const query = toQueryString({
    q: params.q,
    category: params.category,
    isActive: params.isActive,
    featured: params.featured,
    sort: params.sort,
    page: params.page,
    limit: params.limit,
  });
  return apiFetch<ListEnvelope<Product>>(`/api/admin/products${query}`);
}

function productPayload(input: ProductValues): ProductValues {
  return {
    ...input,
    ...(input.imageUrl ? {} : { imageUrl: undefined }),
  };
}

function productBody(
  input: ProductValues,
  file?: File,
): string | FormData {
  const payload = productPayload(input);
  if (!file) return JSON.stringify(payload);

  const form = new FormData();
  form.append("name", payload.name);
  form.append("slug", payload.slug);
  form.append("categoryId", payload.categoryId);
  form.append("price", String(payload.price));
  form.append("stock", String(payload.stock));
  form.append("description", payload.description);
  if (payload.imageUrl) form.append("imageUrl", payload.imageUrl);
  form.append("isActive", String(payload.isActive));
  form.append("featured", String(payload.featured));
  form.append("image", file);
  return form;
}

export async function createProduct(
  input: ProductValues,
  file?: File,
): Promise<Product> {
  const response = await apiFetch<DataEnvelope<Product>>("/api/admin/products", {
    method: "POST",
    body: productBody(input, file),
  });
  return response.data;
}

export async function updateProduct(
  id: string,
  input: ProductValues,
  file?: File,
): Promise<Product> {
  const response = await apiFetch<DataEnvelope<Product>>(
    `/api/admin/products/${id}`,
    {
      method: "PATCH",
      body: productBody(input, file),
    },
  );
  return response.data;
}

export async function deleteProduct(id: string): Promise<Product> {
  const response = await apiFetch<DataEnvelope<Product>>(
    `/api/admin/products/${id}`,
    { method: "DELETE" },
  );
  return response.data;
}

export async function fetchAdminCategories(): Promise<Category[]> {
  const response =
    await apiFetch<DataEnvelope<Category[]>>("/api/admin/categories");
  return response.data;
}

export async function createCategory(
  input: CategoryValues,
): Promise<Category> {
  const response = await apiFetch<DataEnvelope<Category>>(
    "/api/admin/categories",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function updateCategory(
  id: string,
  input: CategoryValues,
): Promise<Category> {
  const response = await apiFetch<DataEnvelope<Category>>(
    `/api/admin/categories/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiFetch<DataEnvelope<{ deleted: boolean }>>(
    `/api/admin/categories/${id}`,
    { method: "DELETE" },
  );
}

export async function createShippingRate(
  input: ShippingValues,
): Promise<ShippingRate> {
  const response = await apiFetch<DataEnvelope<ShippingRate>>(
    "/api/admin/shipping-rates",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function updateShippingRate(
  id: string,
  input: ShippingValues,
): Promise<ShippingRate> {
  const response = await apiFetch<DataEnvelope<ShippingRate>>(
    `/api/admin/shipping-rates/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function setDefaultShippingRate(
  id: string,
): Promise<ShippingRate> {
  const response = await apiFetch<DataEnvelope<ShippingRate>>(
    `/api/admin/shipping-rates/${id}/default`,
    { method: "PATCH" },
  );
  return response.data;
}

export async function deleteShippingRate(id: string): Promise<void> {
  await apiFetch<DataEnvelope<{ deleted: boolean }>>(
    `/api/admin/shipping-rates/${id}`,
    { method: "DELETE" },
  );
}
