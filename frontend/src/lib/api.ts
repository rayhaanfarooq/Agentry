import { getAppEnv } from "@/lib/env";
import type { ApiRequestOptions, ApiResponse } from "@/types/api";

export class ApiClientError extends Error {
  statusCode?: number;
  rawBody?: string;
  latencyMs?: number;
  originalError?: unknown;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      rawBody?: string;
      latencyMs?: number;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = options?.statusCode;
    this.rawBody = options?.rawBody;
    this.latencyMs = options?.latencyMs;
    this.originalError = options?.cause;
  }
}

class ApiClient {
  constructor(private readonly resolveBaseUrl: () => string) {}

  async request<T>(
    path: string,
    options: ApiRequestOptions<T> = {},
  ): Promise<ApiResponse<T>> {
    const start = performance.now();
    const receivedAt = new Date().toISOString();
    const baseUrl = this.resolveBaseUrl();

    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...options.init?.headers,
        },
        ...options.init,
      });
    } catch (error) {
      throw new ApiClientError(`Unable to reach ${path}.`, { cause: error });
    }

    const latencyMs = performance.now() - start;
    const rawBody = await response.text();

    let parsedBody: unknown = null;
    if (rawBody) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch (error) {
        throw new ApiClientError(
          `Expected a JSON response from ${path}, but received invalid JSON.`,
          {
            statusCode: response.status,
            rawBody,
            latencyMs,
            cause: error,
          },
        );
      }
    }

    try {
      const data = options.parser
        ? options.parser(parsedBody)
        : (parsedBody as T);

      return {
        data,
        ok: response.ok,
        statusCode: response.status,
        latencyMs,
        receivedAt,
        rawBody,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The response payload could not be parsed.";

      throw new ApiClientError(
        `Invalid response shape from ${path}: ${message}`,
        {
          statusCode: response.status,
          rawBody,
          latencyMs,
          cause: error,
        },
      );
    }
  }
}

export const apiClient = new ApiClient(() => getAppEnv().VITE_API_URL);
