import { useEffect, useState, type FormEvent } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  Filter,
  RefreshCcw,
  Search,
  ShieldAlert,
  Waypoints,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { listTraces } from "@/features/traces/api/listTraces";
import { TraceMetricCard } from "@/features/traces/components/TraceMetricCard";
import { TraceStatusBadge } from "@/features/traces/components/TraceStatusBadge";
import {
  formatDateTime,
  formatDuration,
  formatNumber,
  formatTokenTotal,
  shortenId,
} from "@/features/traces/lib/formatters";
import {
  TRACE_SORT_OPTIONS,
  TRACE_STATUS_OPTIONS,
  type SortOrder,
  type TraceListFilters,
  type TraceSortField,
  traceSortFieldSchema,
  traceStatusSchema,
} from "@/features/traces/types";
import { ApiClientError } from "@/lib/api";

const DEFAULT_PAGE_SIZE = 20;

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error while loading traces.";
}

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function parseTraceListFilters(
  searchParams: URLSearchParams,
): TraceListFilters {
  const status = traceStatusSchema.safeParse(searchParams.get("status"));
  const sortBy = traceSortFieldSchema.safeParse(searchParams.get("sort_by"));
  const sortOrder = searchParams.get("sort_order") === "asc" ? "asc" : "desc";
  const search = searchParams.get("search")?.trim() ?? "";
  const environment = searchParams.get("environment")?.trim() ?? "";

  return {
    page: parsePositiveInteger(searchParams.get("page"), 1),
    pageSize: parsePositiveInteger(
      searchParams.get("page_size"),
      DEFAULT_PAGE_SIZE,
    ),
    search: search || undefined,
    status: status.success ? status.data : undefined,
    environment: environment || undefined,
    sortBy: sortBy.success ? sortBy.data : "created_at",
    sortOrder: sortOrder satisfies SortOrder,
  };
}

function LoadingTable() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-3 p-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TraceListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseTraceListFilters(searchParams);
  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");

  useEffect(() => {
    setSearchDraft(filters.search ?? "");
  }, [filters.search]);

  const traceListQuery = useQuery({
    queryKey: [
      "traces",
      filters.page,
      filters.pageSize,
      filters.search,
      filters.status,
      filters.environment,
      filters.sortBy,
      filters.sortOrder,
    ],
    queryFn: () => listTraces(filters),
    placeholderData: keepPreviousData,
  });

  const traces = traceListQuery.data?.response.items ?? [];
  const totalItems = traceListQuery.data?.response.total_items ?? 0;
  const totalPages = traceListQuery.data?.response.total_pages ?? 0;
  const visibleFailures = traces.filter((trace) => trace.status === "error");
  const visibleDurationAverage =
    traces.length > 0
      ? traces.reduce((total, trace) => total + trace.duration_ms, 0) /
        traces.length
      : 0;
  const visibleTokenTotal = traces.reduce(
    (total, trace) => total + (trace.tokens?.total_tokens ?? 0),
    0,
  );

  function updateSearchParams(updates: Record<string, string | undefined>) {
    const nextParams = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    }

    setSearchParams(nextParams);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    updateSearchParams({
      search: searchDraft.trim() || undefined,
      page: "1",
    });
  }

  function resetFilters() {
    setSearchDraft("");
    setSearchParams({
      page: "1",
      page_size: String(DEFAULT_PAGE_SIZE),
      sort_by: "created_at",
      sort_order: "desc",
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Trace Explorer"
        title="Trace Explorer"
        description="Search, sort, and inspect agent executions with the detail needed to debug behavior, latency, and tool usage in seconds."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void traceListQuery.refetch()}
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${traceListQuery.isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        }
      />

      {traceListQuery.isError ? (
        <Alert variant="destructive">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Trace explorer request failed</p>
              <p className="mt-1">{getErrorMessage(traceListQuery.error)}</p>
            </div>
          </div>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <TraceMetricCard
          title="Visible traces"
          value={formatNumber(traces.length)}
          helperText={`${formatNumber(totalItems)} total traces across all pages.`}
          icon={Waypoints}
          accentClassName="bg-blue-50 text-blue-800"
        />
        <TraceMetricCard
          title="Failures on page"
          value={formatNumber(visibleFailures.length)}
          helperText="Runs that surfaced an error in the current result set."
          icon={ShieldAlert}
          accentClassName="bg-red-50 text-red-700"
        />
        <TraceMetricCard
          title="Average duration"
          value={formatDuration(visibleDurationAverage)}
          helperText="Mean run time for traces currently visible in the table."
          icon={Clock3}
        />
        <TraceMetricCard
          title="Visible tokens"
          value={formatNumber(visibleTokenTotal)}
          helperText="Summed token volume from the traces on this page."
          icon={Filter}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters and sorting</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearchSubmit}
            className="grid gap-4 xl:grid-cols-[1.6fr_repeat(5,minmax(0,1fr))]"
          >
            <div className="xl:col-span-1">
              <label
                htmlFor="trace-search"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="trace-search"
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="Trace name, service, or model"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="trace-status"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                Status
              </label>
              <Select
                id="trace-status"
                value={filters.status ?? ""}
                onChange={(event) =>
                  updateSearchParams({
                    status: event.target.value || undefined,
                    page: "1",
                  })
                }
              >
                <option value="">All statuses</option>
                {TRACE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label
                htmlFor="trace-environment"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                Environment
              </label>
              <Input
                id="trace-environment"
                value={filters.environment ?? ""}
                onChange={(event) =>
                  updateSearchParams({
                    environment: event.target.value.trim() || undefined,
                    page: "1",
                  })
                }
                placeholder="production"
              />
            </div>

            <div>
              <label
                htmlFor="trace-sort-by"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                Sort by
              </label>
              <Select
                id="trace-sort-by"
                value={filters.sortBy}
                onChange={(event) =>
                  updateSearchParams({
                    sort_by: event.target.value as TraceSortField,
                    page: "1",
                  })
                }
              >
                {TRACE_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label
                htmlFor="trace-sort-order"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                Order
              </label>
              <Select
                id="trace-sort-order"
                value={filters.sortOrder}
                onChange={(event) =>
                  updateSearchParams({
                    sort_order: event.target.value as SortOrder,
                    page: "1",
                  })
                }
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </Select>
            </div>

            <div>
              <label
                htmlFor="trace-page-size"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                Page size
              </label>
              <Select
                id="trace-page-size"
                value={String(filters.pageSize)}
                onChange={(event) =>
                  updateSearchParams({
                    page_size: event.target.value,
                    page: "1",
                  })
                }
              >
                {[10, 20, 50, 100].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize} per page
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-wrap items-end gap-3 xl:col-span-6">
              <Button type="submit">Apply search</Button>
              <Button type="button" variant="ghost" onClick={resetFilters}>
                Reset filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {traceListQuery.isLoading && !traceListQuery.data ? (
        <LoadingTable />
      ) : null}

      {!traceListQuery.isLoading && traces.length === 0 ? (
        <EmptyState
          title="No traces matched the current filters."
          description="Try broadening the search or resetting the filters. Once the SDK sends execution traces, they will appear here for exploration."
          icon={<Waypoints className="h-5 w-5" />}
        />
      ) : null}

      {traces.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle>Recent traces</CardTitle>
              <p className="text-sm leading-6 text-slate-500">
                Page {filters.page} of {Math.max(totalPages, 1)} ·{" "}
                {formatNumber(totalItems)} total traces · Last response{" "}
                {traceListQuery.data
                  ? `${traceListQuery.data.latencyMs.toFixed(0)} ms`
                  : "pending"}
              </p>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Trace</th>
                  <th className="px-6 py-4 font-semibold">Agent</th>
                  <th className="px-6 py-4 font-semibold">Model</th>
                  <th className="px-6 py-4 font-semibold">Duration</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {traces.map((trace) => (
                  <tr
                    key={trace.trace_id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDateTime(trace.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="min-w-[240px]">
                        <Link
                          to={`/traces/${trace.trace_id}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950 transition-colors hover:text-blue-800"
                        >
                          {trace.name}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <p className="mt-1 text-sm text-slate-500">
                          {shortenId(trace.trace_id)} · {trace.environment}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {trace.service_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {trace.model?.name ?? "Not captured"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {formatDuration(trace.duration_ms)}
                    </td>
                    <td className="px-6 py-4">
                      <TraceStatusBadge status={trace.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {formatTokenTotal(trace.tokens)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      {traces.length > 0 ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-slate-600">
            Showing {(filters.page - 1) * filters.pageSize + 1}-
            {Math.min(filters.page * filters.pageSize, totalItems)} of{" "}
            {formatNumber(totalItems)} traces.
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page <= 1}
              onClick={() =>
                updateSearchParams({
                  page: String(Math.max(filters.page - 1, 1)),
                })
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={totalPages === 0 || filters.page >= totalPages}
              onClick={() =>
                updateSearchParams({
                  page: String(
                    totalPages === 0
                      ? 1
                      : Math.min(filters.page + 1, totalPages),
                  ),
                })
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
