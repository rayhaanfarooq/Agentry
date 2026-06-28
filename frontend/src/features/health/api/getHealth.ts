import { apiClient } from "@/lib/api";

import {
  healthResponseSchema,
  type HealthSnapshot,
} from "@/features/health/types";

export async function getHealth(): Promise<HealthSnapshot> {
  const result = await apiClient.request("/health", {
    parser: (value) => healthResponseSchema.parse(value),
  });

  return {
    response: result.data,
    statusCode: result.statusCode,
    latencyMs: result.latencyMs,
    checkedAt: result.receivedAt,
    rawResponse: JSON.stringify(result.data, null, 2),
    state: result.data.status,
  };
}
