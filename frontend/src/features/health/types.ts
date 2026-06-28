import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.enum(["healthy", "unhealthy"]),
  api: z.enum(["healthy", "unhealthy"]),
  database: z.enum(["connected", "disconnected"]),
  supabase: z.enum(["connected", "disconnected"]),
  version: z.string().min(1),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export interface HealthSnapshot {
  response: HealthResponse;
  statusCode: number;
  latencyMs: number;
  checkedAt: string;
  rawResponse: string;
  state: "healthy" | "unhealthy";
}
