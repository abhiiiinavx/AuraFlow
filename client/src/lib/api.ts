import { useAuthStore } from "@/store/authStore";

export const API_URL = import.meta.env.VITE_API_URL ?? "/api";

type ApiOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
  if (options.auth !== false && token && token !== "demo-token") {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: response.statusText }))) as { message?: string };
    throw new Error(error.message ?? "Request failed.");
  }

  return response.json() as Promise<T>;
}

export async function apiBlob(path: string) {
  const token = useAuthStore.getState().token;
  const headers = new Headers();
  if (token && token !== "demo-token") headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { headers });
  if (!response.ok) throw new Error(response.statusText);
  return response.blob();
}
