import { apiClient } from "@/lib/api";

import {
  type TraceDetailSnapshot,
  traceDetailSchema,
} from "@/features/traces/types";

export async function getTraceDetail(
  traceId: string,
): Promise<TraceDetailSnapshot> {
  const result = await apiClient.request(`/v1/traces/${traceId}`, {
    parser: (value) => traceDetailSchema.parse(value),
  });

  return {
    response: result.data,
    statusCode: result.statusCode,
    latencyMs: result.latencyMs,
    receivedAt: result.receivedAt,
    rawResponse: JSON.stringify(result.data, null, 2),
  };
}
