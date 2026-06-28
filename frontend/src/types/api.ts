export interface ApiResponse<T> {
  data: T;
  ok: boolean;
  statusCode: number;
  latencyMs: number;
  receivedAt: string;
  rawBody: string;
}

export interface ApiRequestOptions<T> {
  init?: RequestInit;
  parser?: (value: unknown) => T;
}
