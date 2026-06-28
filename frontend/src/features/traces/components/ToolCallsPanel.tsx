import { Braces, Wrench } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { JsonViewer } from "@/features/traces/components/JsonViewer";
import { TraceStatusBadge } from "@/features/traces/components/TraceStatusBadge";
import {
  formatDuration,
  formatTitleCase,
} from "@/features/traces/lib/formatters";
import type { ToolCall } from "@/features/traces/types";

interface ToolCallsPanelProps {
  toolCalls: ToolCall[];
}

export function ToolCallsPanel({ toolCalls }: ToolCallsPanelProps) {
  if (toolCalls.length === 0) {
    return (
      <EmptyState
        title="No tool calls were recorded for this trace."
        description="When the agent starts invoking tools, this view will show arguments, results, execution time, and status for each call."
        icon={<Wrench className="h-5 w-5" />}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tool Calls</CardTitle>
        <CardDescription>
          Review the exact inputs, outputs, and execution outcomes for every
          tool used during this run.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {toolCalls.map((toolCall) => (
          <div
            key={toolCall.tool_call_id}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-slate-950">
                    {toolCall.name}
                  </p>
                  <TraceStatusBadge status={toolCall.status} />
                  <Badge variant="outline">
                    {formatDuration(toolCall.duration_ms)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {toolCall.span_id
                    ? `Attached to span ${toolCall.span_id}`
                    : "Captured at the trace root."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.keys(toolCall.metadata).map((key) => (
                  <Badge key={key} variant="secondary">
                    {formatTitleCase(key)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-500">Arguments</p>
                <JsonViewer
                  value={toolCall.arguments}
                  emptyMessage="No structured arguments were captured."
                />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-500">Result</p>
                <JsonViewer
                  value={toolCall.result}
                  emptyMessage="No structured result was captured."
                />
              </div>
            </div>

            {toolCall.error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
                <div className="flex items-center gap-2 font-semibold">
                  <Braces className="h-4 w-4" />
                  {toolCall.error.type}
                </div>
                <p className="mt-2">{toolCall.error.message}</p>
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
