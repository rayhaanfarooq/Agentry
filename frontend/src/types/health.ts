export interface HealthApiResponse {
  status: "healthy" | "unhealthy";
  database: "connected" | "disconnected";
}

export interface HealthStatusView {
  response: HealthApiResponse | null;
  ok: boolean;
  statusCode: number;
  latencyMs: number;
  checkedAt: string;
  lastResponse: string;
  error: string | null;
}
