import type {
  ErrorPayload,
  ModelInfo,
  TokenUsage,
  ToolCall,
  TraceDetail,
  TraceEvent,
  TraceSpan,
} from "@/features/traces/types";

interface PromptSection {
  id: string;
  title: string;
  description: string;
  value: unknown;
  kind: "text" | "json";
}

export interface TimelineNode {
  span: TraceSpan;
  children: TimelineNode[];
}

const promptCandidates: Array<{
  id: string;
  title: string;
  description: string;
  keys: string[];
}> = [
  {
    id: "system-prompt",
    title: "System Prompt",
    description: "Instruction layer captured for the run.",
    keys: ["system_prompt", "systemPrompt", "system", "instructions"],
  },
  {
    id: "user-prompt",
    title: "User Prompt",
    description: "Primary user or task input sent into the agent.",
    keys: ["user_prompt", "userPrompt", "prompt", "query", "input"],
  },
  {
    id: "retrieved-context",
    title: "Retrieved Context",
    description: "Context and memory retrieved before generation.",
    keys: [
      "retrieved_context",
      "retrievedContext",
      "context",
      "memory",
      "documents",
    ],
  },
  {
    id: "completion",
    title: "Completion",
    description: "Final model or agent output captured by the trace.",
    keys: ["completion", "response", "output", "answer", "assistant_response"],
  },
];

type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getFromRecord(record: JsonRecord | null | undefined, keys: string[]) {
  if (!record) {
    return undefined;
  }

  return keys.find((key) => key in record)
    ? record[keys.find((key) => key in record) as keyof JsonRecord]
    : undefined;
}

function getDisplayKind(value: unknown): "text" | "json" {
  if (typeof value === "string") {
    return "text";
  }

  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return "text";
  }

  return "json";
}

function collectPromptSources(trace: TraceDetail) {
  const llmSpan = trace.spans.find((span) =>
    [span.span_type, span.name].some((value) =>
      value?.toLowerCase().includes("llm"),
    ),
  );

  return [
    trace.inputs ?? null,
    trace.outputs ?? null,
    llmSpan?.inputs ?? null,
    llmSpan?.outputs ?? null,
  ];
}

export function buildPromptSections(trace: TraceDetail): PromptSection[] {
  const sections: PromptSection[] = [];
  const sources = collectPromptSources(trace);

  for (const candidate of promptCandidates) {
    let resolvedValue: unknown;

    for (const source of sources) {
      if (!isJsonRecord(source)) {
        continue;
      }

      resolvedValue = getFromRecord(source, candidate.keys);
      if (resolvedValue !== undefined) {
        break;
      }
    }

    if (resolvedValue === undefined || resolvedValue === null) {
      continue;
    }

    sections.push({
      id: candidate.id,
      title: candidate.title,
      description: candidate.description,
      value: resolvedValue,
      kind: getDisplayKind(resolvedValue),
    });
  }

  if (sections.length > 0) {
    return sections;
  }

  if (trace.inputs && Object.keys(trace.inputs).length > 0) {
    sections.push({
      id: "trace-inputs",
      title: "Trace Inputs",
      description: "Structured inputs captured at the trace root.",
      value: trace.inputs,
      kind: "json",
    });
  }

  if (trace.outputs && Object.keys(trace.outputs).length > 0) {
    sections.push({
      id: "trace-outputs",
      title: "Trace Outputs",
      description: "Structured outputs captured at the trace root.",
      value: trace.outputs,
      kind: "json",
    });
  }

  return sections;
}

export function buildTimelineTree(spans: TraceSpan[]): TimelineNode[] {
  const sortedSpans = [...spans].sort(
    (left, right) =>
      new Date(left.started_at).getTime() -
      new Date(right.started_at).getTime(),
  );
  const nodes = new Map<string, TimelineNode>();

  for (const span of sortedSpans) {
    nodes.set(span.span_id, { span, children: [] });
  }

  const roots: TimelineNode[] = [];

  for (const span of sortedSpans) {
    const node = nodes.get(span.span_id);
    if (!node) {
      continue;
    }

    if (span.parent_span_id && nodes.has(span.parent_span_id)) {
      nodes.get(span.parent_span_id)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function getPrimaryModel(trace: TraceDetail): ModelInfo | null {
  return (
    trace.model ??
    trace.spans.find((span) => span.model?.name || span.model?.provider)
      ?.model ??
    null
  );
}

export function getPrimaryTokens(trace: TraceDetail): TokenUsage | null {
  if (trace.tokens) {
    return trace.tokens;
  }

  return (
    trace.spans.find(
      (span) =>
        span.tokens?.total_tokens ||
        span.tokens?.input_tokens ||
        span.tokens?.output_tokens,
    )?.tokens ?? null
  );
}

export function getToolCallCountBySpan(toolCalls: ToolCall[]) {
  const counts = new Map<string, number>();

  for (const toolCall of toolCalls) {
    if (!toolCall.span_id) {
      continue;
    }

    counts.set(toolCall.span_id, (counts.get(toolCall.span_id) ?? 0) + 1);
  }

  return counts;
}

export function collectErrors(trace: TraceDetail) {
  const errors: Array<{
    scope: string;
    name: string;
    error: ErrorPayload;
  }> = [];

  if (trace.error) {
    errors.push({
      scope: "trace",
      name: trace.name,
      error: trace.error,
    });
  }

  for (const span of trace.spans) {
    if (span.error) {
      errors.push({
        scope: "span",
        name: span.name,
        error: span.error,
      });
    }
  }

  for (const toolCall of trace.tool_calls) {
    if (toolCall.error) {
      errors.push({
        scope: "tool",
        name: toolCall.name,
        error: toolCall.error,
      });
    }
  }

  return errors;
}

export function getSpanLabel(span: TraceSpan) {
  return span.span_type ? `${span.name} · ${span.span_type}` : span.name;
}

export function summarizeEvent(event: TraceEvent) {
  if (event.sequence !== null && event.sequence !== undefined) {
    return `#${event.sequence} · ${event.event_type}`;
  }

  return event.event_type;
}
