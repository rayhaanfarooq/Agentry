import { apiClient } from "@/lib/api";

import {
  type TraceListFilters,
  type TraceListSnapshot,
  traceListResponseSchema,
} from "@/features/traces/types";

function buildTraceListQuery(filters: TraceListFilters) {
  const params = new URLSearchParams();

  params.set("page", String(filters.page));
  params.set("page_size", String(filters.pageSize));
  params.set("sort_by", filters.sortBy);
  params.set("sort_order", filters.sortOrder);

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.environment) {
    params.set("environment", filters.environment);
  }

  return params.toString();
}

export async function listTraces(
  filters: TraceListFilters,
): Promise<TraceListSnapshot> {
  const result = await apiClient.request(
    `/v1/traces?${buildTraceListQuery(filters)}`,
    {
      parser: (value) => traceListResponseSchema.parse(value),
    },
  );

  return {
    response: result.data,
    statusCode: result.statusCode,
    latencyMs: result.latencyMs,
    receivedAt: result.receivedAt,
  };
}
