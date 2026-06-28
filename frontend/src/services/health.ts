import { apiClient } from "@/services/api-client";
import type { HealthApiResponse, HealthStatusView } from "@/types/health";

export async function fetchHealthStatus(): Promise<HealthStatusView> {
  try {
    const result = await apiClient.request<HealthApiResponse>("/health");

    return {
      response: result.data,
      ok: result.ok,
      statusCode: result.statusCode,
      latencyMs: result.latencyMs,
      checkedAt: result.receivedAt,
      lastResponse: result.data
        ? JSON.stringify(result.data, null, 2)
        : "No JSON response body returned.",
      error: result.ok ? null : `Backend returned HTTP ${result.statusCode}.`,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach the backend.";

    return {
      response: null,
      ok: false,
      statusCode: 0,
      latencyMs: 0,
      checkedAt: new Date().toISOString(),
      lastResponse: message,
      error: message,
    };
  }
}
