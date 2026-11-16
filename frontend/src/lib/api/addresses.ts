import { apiFetch, type DataEnvelope } from "@/lib/api/client";
import type { Address } from "@/lib/types";
import type { AddressValues } from "@/lib/validators";

export async function fetchAddresses(): Promise<Address[]> {
  const response = await apiFetch<DataEnvelope<Address[]>>("/api/addresses");
  return response.data;
}

export async function createAddress(input: AddressValues): Promise<Address> {
  const response = await apiFetch<DataEnvelope<Address>>("/api/addresses", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function updateAddress(
  id: string,
  input: AddressValues,
): Promise<Address> {
  const response = await apiFetch<DataEnvelope<Address>>(
    `/api/addresses/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function setDefaultAddress(id: string): Promise<Address> {
  const response = await apiFetch<DataEnvelope<Address>>(
    `/api/addresses/${id}/default`,
    { method: "PATCH" },
  );
  return response.data;
}

export async function deleteAddress(id: string): Promise<void> {
  await apiFetch<DataEnvelope<{ deleted: boolean }>>(`/api/addresses/${id}`, {
    method: "DELETE",
  });
}
