import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Clock3,
  Network,
  Wrench,
} from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { TraceStatusBadge } from "@/features/traces/components/TraceStatusBadge";
import {
  formatDuration,
  formatTokenTotal,
} from "@/features/traces/lib/formatters";
import {
  buildTimelineTree,
  getToolCallCountBySpan,
  type TimelineNode,
} from "@/features/traces/lib/trace-utils";
import type { TraceDetail } from "@/features/traces/types";

interface TraceTimelineProps {
  trace: TraceDetail;
}

interface SpanTimelineNodeProps {
  node: TimelineNode;
  depth: number;
  toolCallCounts: Map<string, number>;
}

function SpanTimelineNode({
  node,
  depth,
  toolCallCounts,
}: SpanTimelineNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const toolCallCount = toolCallCounts.get(node.span.span_id) ?? 0;
  const hasChildren = node.children.length > 0;

  return (
    <div className={cn(depth > 0 ? "border-l border-slate-200 pl-5" : "")}>
      <div className="relative rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => setCollapsed((current) => !current)}
                  className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                  aria-label={collapsed ? "Expand span" : "Collapse span"}
                >
                  {collapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              ) : null}
              <p className="text-sm font-semibold text-slate-950">
                {node.span.name}
              </p>
              {node.span.span_type ? (
                <Badge variant="outline">{node.span.span_type}</Badge>
              ) : null}
              <TraceStatusBadge status={node.span.status} />
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {node.span.model?.name
                ? `Model: ${node.span.model.name}`
                : "No model metadata captured for this span."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {formatDuration(node.span.duration_ms)}
            </Badge>
            <Badge variant="outline">
              Tokens {formatTokenTotal(node.span.tokens)}
            </Badge>
            {toolCallCount > 0 ? (
              <Badge variant="secondary">{toolCallCount} tool calls</Badge>
            ) : null}
          </div>
        </div>

        {node.span.error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">
            <p className="font-semibold">{node.span.error.type}</p>
            <p className="mt-1">{node.span.error.message}</p>
          </div>
        ) : null}
      </div>

      {hasChildren && !collapsed ? (
        <div className="mt-4 space-y-4">
          {node.children.map((childNode) => (
            <SpanTimelineNode
              key={childNode.span.span_id}
              node={childNode}
              depth={depth + 1}
              toolCallCounts={toolCallCounts}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function TraceTimeline({ trace }: TraceTimelineProps) {
  const timeline = buildTimelineTree(trace.spans);
  const toolCallCounts = getToolCallCountBySpan(trace.tool_calls);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Timeline</CardTitle>
        <CardDescription>
          Follow the run from root trace to nested spans, with timing and tool
          activity surfaced in execution order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Network className="h-4 w-4 text-blue-800" />
                <p className="text-sm font-semibold text-slate-950">
                  {trace.name}
                </p>
                <TraceStatusBadge status={trace.status} />
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {trace.service_name} in {trace.environment}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <Clock3 className="mr-1 h-3.5 w-3.5" />
                {formatDuration(trace.duration_ms)}
              </Badge>
              <Badge variant="outline">
                <Wrench className="mr-1 h-3.5 w-3.5" />
                {trace.tool_calls.length} tool calls
              </Badge>
            </div>
          </div>
        </div>

        {timeline.length === 0 ? (
          <EmptyState
            title="No spans were recorded for this trace."
            description="The root trace payload exists, but nested span instrumentation has not been sent yet."
            icon={<Network className="h-5 w-5" />}
          />
        ) : (
          <div className="space-y-4">
            {timeline.map((node) => (
              <SpanTimelineNode
                key={node.span.span_id}
                node={node}
                depth={0}
                toolCallCounts={toolCallCounts}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
