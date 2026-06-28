import type { TokenUsage, TraceStatus } from "@/features/traces/types";

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export function formatDuration(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Unknown";
  }

  if (value < 1000) {
    return `${value.toFixed(0)} ms`;
  }

  const seconds = value / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(seconds >= 10 ? 1 : 2)} s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Unknown";
  }

  return new Intl.NumberFormat().format(value);
}

export function formatTokenTotal(tokens: TokenUsage | null | undefined) {
  if (!tokens) {
    return "Unknown";
  }

  if (tokens.total_tokens !== null && tokens.total_tokens !== undefined) {
    return formatNumber(tokens.total_tokens);
  }

  if (
    tokens.input_tokens !== null &&
    tokens.input_tokens !== undefined &&
    tokens.output_tokens !== null &&
    tokens.output_tokens !== undefined
  ) {
    return formatNumber(tokens.input_tokens + tokens.output_tokens);
  }

  return "Unknown";
}

export function formatStatusLabel(status: TraceStatus) {
  return status === "ok" ? "OK" : "Error";
}

export function formatTitleCase(value: string) {
  return value
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function shortenId(value: string, length = 8) {
  return value.slice(0, length);
}

export function stringifyValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
