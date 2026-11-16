export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DataEnvelope<T> {
  data: T;
}

export interface ListEnvelope<T> {
  data: T[];
  meta: PaginationMeta;
}

interface ErrorBody {
  statusCode?: number;
  code?: string;
  message?: string | string[];
  details?: unknown;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code = "REQUEST_FAILED",
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

function normalizeMessage(message: string | string[] | undefined, fallback: string) {
  if (Array.isArray(message)) return message.join(", ");
  return message || fallback;
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: ErrorBody = {};
  try {
    body = (await response.json()) as ErrorBody;
  } catch {
    body = {};
  }
  const statusCode = body.statusCode ?? response.status;
  const code = body.code ?? `HTTP_${statusCode}`;
  const message = normalizeMessage(
    body.message,
    response.statusText || "Permintaan gagal diproses.",
  );
  return new ApiError(message, statusCode, code, body.details);
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const isForm = init.body instanceof FormData;
  const headers = new Headers(init.headers);
  if (!isForm && init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      cache: "no-store",
      headers,
    });
  } catch {
    throw new ApiError(
      "Tidak dapat terhubung ke server. Periksa koneksi Anda.",
      0,
      "NETWORK_ERROR",
    );
  }

  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function resolveAssetUrl(
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function toQueryString(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}
