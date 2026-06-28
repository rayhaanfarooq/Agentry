import { API_URL } from "@/lib/env";

export interface ApiResult<T> {
  data: T | null;
  ok: boolean;
  statusCode: number;
  latencyMs: number;
  receivedAt: string;
}

class ApiClient {
  async request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
    const start = performance.now();
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers,
      },
      ...init,
    });
    const latencyMs = performance.now() - start;
    const receivedAt = new Date().toISOString();

    const text = await response.text();
    const data = text ? (JSON.parse(text) as T) : null;

    return {
      data,
      ok: response.ok,
      statusCode: response.status,
      latencyMs,
      receivedAt,
    };
  }
}

export const apiClient = new ApiClient();
