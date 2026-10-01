import type { Product, ApiResponse } from "../types/product";

const BASE_URL = import.meta.env.VITE_BFF_URL ?? "http://localhost:3000";

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.message ?? json.errors?.join(", ") ?? "Request failed");
  return json;
}

export const productApi = {
  getAll: () => request<Product[]>("/products"),

  create: (product: Product) =>
    request<Product>("/products", { method: "POST", body: JSON.stringify(product) }),

  update: (code: string, product: Product) =>
    request<Product>(`/products/${code}`, { method: "PUT", body: JSON.stringify(product) }),

  remove: (code: string) =>
    request<never>(`/products/${code}`, { method: "DELETE" }),
};
