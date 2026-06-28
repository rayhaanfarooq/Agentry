import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  Database,
  RefreshCcw,
  Wrench,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { getTraceDetail } from "@/features/traces/api/getTraceDetail";
import { JsonViewer } from "@/features/traces/components/JsonViewer";
import { MetadataPanel } from "@/features/traces/components/MetadataPanel";
import { PromptViewer } from "@/features/traces/components/PromptViewer";
import { ToolCallsPanel } from "@/features/traces/components/ToolCallsPanel";
import { TraceEventsPanel } from "@/features/traces/components/TraceEventsPanel";
import { TraceMetricCard } from "@/features/traces/components/TraceMetricCard";
import { TraceStatusBadge } from "@/features/traces/components/TraceStatusBadge";
import { TraceTimeline } from "@/features/traces/components/TraceTimeline";
import {
  formatDateTime,
  formatDuration,
  formatNumber,
  formatTokenTotal,
} from "@/features/traces/lib/formatters";
import {
  collectErrors,
  getPrimaryModel,
  getPrimaryTokens,
} from "@/features/traces/lib/trace-utils";
import { ApiClientError } from "@/lib/api";

type TraceDetailTab = "overview" | "prompts" | "tools" | "raw";

const traceDetailTabs: Array<{ id: TraceDetailTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "prompts", label: "Prompts" },
  { id: "tools", label: "Tools & Events" },
  { id: "raw", label: "Raw JSON" },
];

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.statusCode === 404) {
      return "This trace was not found. It may have been deleted or the URL may be incorrect.";
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error while loading the trace.";
}

function LoadingDetailPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-12 w-96 max-w-full" />
        <Skeleton className="h-5 w-full max-w-3xl" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 w-full rounded-2xl" />
        ))}
      </div>

      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-[520px] w-full rounded-2xl" />
    </div>
  );
}

export function TraceDetailPage() {
  const { traceId } = useParams<{ traceId: string }>();
  const [activeTab, setActiveTab] = useState<TraceDetailTab>("overview");

  const traceDetailQuery = useQuery({
    queryKey: ["trace-detail", traceId],
    queryFn: () => getTraceDetail(traceId ?? ""),
    enabled: Boolean(traceId),
  });

  if (!traceId) {
    return (
      <EmptyState
        title="No trace identifier was provided."
        description="Open a trace from the explorer table to inspect its nested spans, prompts, and tool calls."
      />
    );
  }

  if (traceDetailQuery.isLoading && !traceDetailQuery.data) {
    return <LoadingDetailPage />;
  }

  if (traceDetailQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Trace Explorer"
          title="Trace detail"
          description="Something prevented the dashboard from loading this trace."
          actions={
            <Link
              to="/traces"
              className="inline-flex h-9 items-center justify-center rounded-[10px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to traces
            </Link>
          }
        />

        <Alert variant="destructive">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Trace detail request failed</p>
              <p className="mt-1">{getErrorMessage(traceDetailQuery.error)}</p>
            </div>
          </div>
        </Alert>
      </div>
    );
  }

  const trace = traceDetailQuery.data?.response;

  if (!trace) {
    return (
      <EmptyState
        title="No trace data was returned."
        description="The trace detail request completed without a usable payload."
      />
    );
  }

  const model = getPrimaryModel(trace);
  const tokens = getPrimaryTokens(trace);
  const errors = collectErrors(trace);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Trace Explorer"
        title={trace.name}
        description={`Trace ${trace.trace_id} from ${trace.service_name} in ${trace.environment}. Use the timeline, prompt viewer, and raw payloads to understand exactly what happened during this run.`}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              to="/traces"
              className="inline-flex h-9 items-center justify-center rounded-[10px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to traces
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void traceDetailQuery.refetch()}
            >
              <RefreshCcw
                className={`mr-2 h-4 w-4 ${traceDetailQuery.isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        }
      />

      {errors.length > 0 ? (
        <Alert variant="warning">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Errors were captured in this run</p>
              <p className="mt-1">
                {errors.length} trace, span, or tool level failures were
                recorded. Review the overview timeline and tool details below
                for the exact failure points.
              </p>
            </div>
          </div>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TraceMetricCard
          title="Trace status"
          value={trace.status === "ok" ? "Healthy" : "Errored"}
          helperText={`HTTP ${traceDetailQuery.data?.statusCode ?? 200} from GET /v1/traces/${trace.trace_id}.`}
          icon={Database}
          accentClassName={
            trace.status === "ok"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }
        />
        <TraceMetricCard
          title="Duration"
          value={formatDuration(trace.duration_ms)}
          helperText={`Started ${formatDateTime(trace.started_at)}.`}
          icon={Clock3}
        />
        <TraceMetricCard
          title="Tokens"
          value={formatTokenTotal(tokens)}
          helperText={`Input ${formatNumber(tokens?.input_tokens)} · Output ${formatNumber(tokens?.output_tokens)}.`}
          icon={Database}
          accentClassName="bg-blue-50 text-blue-800"
        />
        <TraceMetricCard
          title="Tool activity"
          value={formatNumber(trace.tool_calls.length)}
          helperText={`${formatNumber(trace.spans.length)} spans and ${formatNumber(trace.events.length)} events were recorded.`}
          icon={Wrench}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
        {traceDetailTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            )}
          >
            {tab.label}
          </button>
        ))}

        <div className="ml-auto flex flex-wrap gap-2">
          <TraceStatusBadge status={trace.status} />
          {model?.name ? <Badge variant="outline">{model.name}</Badge> : null}
          <Badge variant="outline">
            {traceDetailQuery.data
              ? `${traceDetailQuery.data.latencyMs.toFixed(0)} ms response`
              : "Pending"}
          </Badge>
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <TraceTimeline trace={trace} />

          <div className="space-y-6">
            <MetadataPanel trace={trace} />

            <Card>
              <CardHeader>
                <CardTitle>Error summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {errors.length > 0 ? (
                  errors.map((item) => (
                    <div
                      key={`${item.scope}-${item.name}-${item.error.type}`}
                      className="rounded-2xl border border-red-200 bg-red-50 p-4"
                    >
                      <p className="text-sm font-semibold text-red-900">
                        {item.scope.toUpperCase()} · {item.name}
                      </p>
                      <p className="mt-2 text-sm font-medium text-red-800">
                        {item.error.type}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-red-700">
                        {item.error.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-slate-600">
                    No trace, span, or tool call errors were recorded in this
                    run.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {activeTab === "prompts" ? <PromptViewer trace={trace} /> : null}

      {activeTab === "tools" ? (
        <div className="space-y-6">
          <ToolCallsPanel toolCalls={trace.tool_calls} />
          <TraceEventsPanel events={trace.events} />
        </div>
      ) : null}

      {activeTab === "raw" ? (
        <Card>
          <CardHeader>
            <CardTitle>Raw JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonViewer
              value={traceDetailQuery.data?.rawResponse ?? trace}
              emptyMessage="No raw response payload is available."
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
