import { z } from "zod";

export const traceStatusSchema = z.enum(["ok", "error"]);
export const traceSortFieldSchema = z.enum([
  "created_at",
  "started_at",
  "duration_ms",
  "service_name",
  "model_name",
  "status",
]);
export const sortOrderSchema = z.enum(["asc", "desc"]);

const uuidSchema = z.string().uuid();
const isoDatetimeSchema = z.string().datetime({ offset: true });
const jsonRecordSchema = z.record(z.unknown());

export const errorPayloadSchema = z.object({
  type: z.string().min(1),
  message: z.string().min(1),
});

export const sdkInfoSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
});

export const modelInfoSchema = z.object({
  name: z.string().min(1).nullable().optional(),
  provider: z.string().min(1).nullable().optional(),
  temperature: z.number().nullable().optional(),
});

export const tokenUsageSchema = z.object({
  input_tokens: z.number().int().nonnegative().nullable().optional(),
  output_tokens: z.number().int().nonnegative().nullable().optional(),
  total_tokens: z.number().int().nonnegative().nullable().optional(),
});

export const traceSummarySchema = z.object({
  trace_id: uuidSchema,
  project_id: uuidSchema.nullable().optional(),
  name: z.string().min(1),
  service_name: z.string().min(1),
  environment: z.string().min(1),
  status: traceStatusSchema,
  started_at: isoDatetimeSchema,
  ended_at: isoDatetimeSchema,
  duration_ms: z.number().nonnegative(),
  created_at: isoDatetimeSchema,
  sdk: sdkInfoSchema,
  model: modelInfoSchema.nullable().optional(),
  tokens: tokenUsageSchema.nullable().optional(),
  error: errorPayloadSchema.nullable().optional(),
  span_count: z.number().int().nonnegative(),
  tool_call_count: z.number().int().nonnegative(),
  event_count: z.number().int().nonnegative(),
  tags: z.array(z.string()),
});

export const toolCallSchema = z.object({
  tool_call_id: uuidSchema,
  trace_id: uuidSchema,
  span_id: uuidSchema.nullable().optional(),
  name: z.string().min(1),
  status: traceStatusSchema,
  error: errorPayloadSchema.nullable().optional(),
  started_at: isoDatetimeSchema,
  ended_at: isoDatetimeSchema,
  duration_ms: z.number().nonnegative(),
  metadata: jsonRecordSchema,
  arguments: z.unknown().nullable().optional(),
  result: z.unknown().nullable().optional(),
  created_at: isoDatetimeSchema,
  updated_at: isoDatetimeSchema,
});

export const traceEventSchema = z.object({
  event_id: uuidSchema,
  trace_id: uuidSchema,
  span_id: uuidSchema.nullable().optional(),
  name: z.string().min(1),
  event_type: z.string().min(1),
  timestamp: isoDatetimeSchema,
  sequence: z.number().int().nonnegative().nullable().optional(),
  payload: jsonRecordSchema,
  metadata: jsonRecordSchema,
  created_at: isoDatetimeSchema,
  updated_at: isoDatetimeSchema,
});

export const traceSpanSchema = z.object({
  span_id: uuidSchema,
  trace_id: uuidSchema,
  parent_span_id: uuidSchema.nullable().optional(),
  name: z.string().min(1),
  span_type: z.string().min(1).nullable().optional(),
  status: traceStatusSchema,
  error: errorPayloadSchema.nullable().optional(),
  started_at: isoDatetimeSchema,
  ended_at: isoDatetimeSchema,
  duration_ms: z.number().nonnegative(),
  metadata: jsonRecordSchema,
  inputs: jsonRecordSchema.nullable().optional(),
  outputs: jsonRecordSchema.nullable().optional(),
  model: modelInfoSchema.nullable().optional(),
  tokens: tokenUsageSchema.nullable().optional(),
  created_at: isoDatetimeSchema,
  updated_at: isoDatetimeSchema,
});

export const traceDetailSchema = z.object({
  trace_id: uuidSchema,
  project_id: uuidSchema.nullable().optional(),
  name: z.string().min(1),
  service_name: z.string().min(1),
  environment: z.string().min(1),
  status: traceStatusSchema,
  error: errorPayloadSchema.nullable().optional(),
  started_at: isoDatetimeSchema,
  ended_at: isoDatetimeSchema,
  duration_ms: z.number().nonnegative(),
  metadata: jsonRecordSchema,
  tags: z.array(z.string()),
  inputs: jsonRecordSchema.nullable().optional(),
  outputs: jsonRecordSchema.nullable().optional(),
  model: modelInfoSchema.nullable().optional(),
  tokens: tokenUsageSchema.nullable().optional(),
  spans: z.array(traceSpanSchema),
  tool_calls: z.array(toolCallSchema),
  events: z.array(traceEventSchema),
  sdk: sdkInfoSchema,
  created_at: isoDatetimeSchema,
  updated_at: isoDatetimeSchema,
});

export const traceListResponseSchema = z.object({
  items: z.array(traceSummarySchema),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
  total_items: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
});

export type TraceStatus = z.infer<typeof traceStatusSchema>;
export type TraceSortField = z.infer<typeof traceSortFieldSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;
export type ErrorPayload = z.infer<typeof errorPayloadSchema>;
export type SDKInfo = z.infer<typeof sdkInfoSchema>;
export type ModelInfo = z.infer<typeof modelInfoSchema>;
export type TokenUsage = z.infer<typeof tokenUsageSchema>;
export type TraceSummary = z.infer<typeof traceSummarySchema>;
export type TraceSpan = z.infer<typeof traceSpanSchema>;
export type ToolCall = z.infer<typeof toolCallSchema>;
export type TraceEvent = z.infer<typeof traceEventSchema>;
export type TraceDetail = z.infer<typeof traceDetailSchema>;
export type TraceListResponse = z.infer<typeof traceListResponseSchema>;

export interface TraceListFilters {
  page: number;
  pageSize: number;
  search?: string;
  status?: TraceStatus;
  environment?: string;
  sortBy: TraceSortField;
  sortOrder: SortOrder;
}

export interface TraceListSnapshot {
  response: TraceListResponse;
  statusCode: number;
  latencyMs: number;
  receivedAt: string;
}

export interface TraceDetailSnapshot {
  response: TraceDetail;
  statusCode: number;
  latencyMs: number;
  receivedAt: string;
  rawResponse: string;
}

export const TRACE_SORT_OPTIONS: Array<{
  label: string;
  value: TraceSortField;
}> = [
  { label: "Created time", value: "created_at" },
  { label: "Start time", value: "started_at" },
  { label: "Duration", value: "duration_ms" },
  { label: "Service", value: "service_name" },
  { label: "Model", value: "model_name" },
  { label: "Status", value: "status" },
];

export const TRACE_STATUS_OPTIONS: Array<{
  label: string;
  value: TraceStatus;
}> = [
  { label: "Successful", value: "ok" },
  { label: "Errored", value: "error" },
];
