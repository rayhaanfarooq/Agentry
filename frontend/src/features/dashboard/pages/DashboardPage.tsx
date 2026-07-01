import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  Clock3,
  Network,
} from "lucide-react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listTraces } from "@/features/traces/api/listTraces";
import { TraceMetricCard } from "@/features/traces/components/TraceMetricCard";
import { TraceStatusBadge } from "@/features/traces/components/TraceStatusBadge";
import {
  formatDateTime,
  formatDuration,
  formatNumber,
  shortenId,
} from "@/features/traces/lib/formatters";
import { cn } from "@/lib/utils";

const gettingStartedLinks = [
  {
    label: "View traces",
    description: "Browse agent runs and inspect execution details.",
    to: "/traces",
  },
  {
    label: "Check health",
    description: "Verify backend, database, and Supabase connectivity.",
    to: "/health",
  },
] as const;

function MetricSkeleton() {
  return <Skeleton className="h-[104px] w-full rounded-xl" />;
}

export function DashboardPage() {
  const recentTracesQuery = useQuery({
    queryKey: ["dashboard", "recent-traces"],
    queryFn: () =>
      listTraces({
        page: 1,
        pageSize: 5,
        sortBy: "created_at",
        sortOrder: "desc",
      }),
  });

  const errorTracesQuery = useQuery({
    queryKey: ["dashboard", "error-traces"],
    queryFn: () =>
      listTraces({
        page: 1,
        pageSize: 1,
        status: "error",
        sortBy: "created_at",
        sortOrder: "desc",
      }),
  });

  const recentTraces = recentTracesQuery.data?.response.items ?? [];
  const totalTraces = recentTracesQuery.data?.response.total_items ?? 0;
  const errorCount = errorTracesQuery.data?.response.total_items ?? 0;
  const averageDuration =
    recentTraces.length > 0
      ? recentTraces.reduce((total, trace) => total + trace.duration_ms, 0) /
        recentTraces.length
      : null;
  const lastIngestedAt = recentTraces[0]?.created_at ?? null;
  const isLoading =
    recentTracesQuery.isLoading || errorTracesQuery.isLoading;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-brand-200 bg-brand-50 px-6 py-5">
        <PageHeader description="Monitor agent executions, inspect traces, and review infrastructure health from one place." />
      </div>

      <section
        aria-label="Trace metrics"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {isLoading ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          <>
            <TraceMetricCard
              title="Total traces"
              value={formatNumber(totalTraces)}
              helperText="Stored agent runs available in Trace Explorer."
              icon={Network}
              accentClassName="bg-brand text-white"
            />
            <TraceMetricCard
              title="Failed traces"
              value={formatNumber(errorCount)}
              helperText="Executions that ended with an error status."
              icon={AlertTriangle}
              accentClassName="bg-red-50 text-red-600"
            />
            <TraceMetricCard
              title="Avg duration"
              value={
                averageDuration === null
                  ? "—"
                  : formatDuration(averageDuration)
              }
              helperText="Mean latency across the five most recent traces."
              icon={Clock3}
              accentClassName="bg-brand-100 text-brand-deep"
            />
            <TraceMetricCard
              title="Last ingested"
              value={
                lastIngestedAt === null ? "—" : formatDateTime(lastIngestedAt)
              }
              helperText="Most recent trace received by the backend."
              icon={Activity}
              accentClassName="bg-brand-100 text-brand"
            />
          </>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="min-w-0">
          {isLoading ? (
            <Card>
              <CardContent className="space-y-3 p-6">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full rounded-lg" />
                ))}
              </CardContent>
            </Card>
          ) : totalTraces === 0 ? (
            <EmptyState
              title="No traces yet"
              description="Run the dummy agent or send traces through the SDK to populate this view."
              icon={<Network className="h-5 w-5 text-brand" />}
            />
          ) : (
            <Card className="overflow-hidden">
              <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-brand-100 bg-brand-50/80">
                <CardTitle className="text-brand-deep">Recent traces</CardTitle>
                <Link
                  to="/traces"
                  className="text-sm font-semibold text-brand hover:text-brand-hover"
                >
                  View all
                </Link>
              </CardHeader>
              <CardContent className="px-0 pb-2">
                <ul className="divide-y divide-slate-200">
                  {recentTraces.map((trace) => (
                    <li key={trace.trace_id}>
                      <Link
                        to={`/traces/${trace.trace_id}`}
                        className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-brand-50/80"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-medium text-slate-950">
                              {trace.name}
                            </p>
                            <TraceStatusBadge status={trace.status} />
                          </div>
                          <p className="mt-1 font-mono text-xs text-slate-500">
                            {trace.service_name} · {shortenId(trace.trace_id)}
                          </p>
                        </div>
                        <div className="hidden shrink-0 text-right sm:block">
                          <p className="text-sm font-medium text-brand-deep">
                            {formatDuration(trace.duration_ms)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDateTime(trace.created_at)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-brand/60" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-brand-100 bg-brand-50/80">
            <CardTitle className="text-brand-deep">Getting started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 bg-white pt-2">
            {gettingStartedLinks.map(({ label, description, to }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-lg px-3 py-3",
                  "text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-deep",
                )}
              >
                <span>
                  <span className="block text-sm font-semibold text-brand-deep">
                    {label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {description}
                  </span>
                </span>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand/70" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
