import { RefreshCcw, ServerCrash } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHealthStatus } from "@/hooks/useHealthStatus";

function formatStatus(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function HealthPage() {
  const { data, isFetching, refetch } = useHealthStatus();

  const response = data?.response ?? null;
  const isConnected = response?.status === "healthy";
  const statusLabel = response ? formatStatus(response.status) : "Unavailable";
  const databaseLabel = response ? formatStatus(response.database) : "Unavailable";

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Backend health</CardTitle>
            <CardDescription>
              Live connectivity check against the FastAPI API and PostgreSQL.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-sm font-medium text-slate-500">Backend status</p>
            <div className="mt-3 flex items-center gap-3">
              <Badge
                className="rounded-full px-3 py-1"
                variant={isConnected ? "default" : "secondary"}
              >
                {statusLabel}
              </Badge>
              <span className="text-sm text-slate-500">
                HTTP {data?.statusCode ?? 0}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-sm font-medium text-slate-500">Database status</p>
            <div className="mt-3 flex items-center gap-3">
              <Badge
                className="rounded-full px-3 py-1"
                variant={response?.database === "connected" ? "default" : "secondary"}
              >
                {databaseLabel}
              </Badge>
              <span className="text-sm text-slate-500">
                {data?.latencyMs ? `${data.latencyMs.toFixed(0)} ms` : "No latency yet"}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 sm:col-span-2">
            <p className="text-sm font-medium text-slate-500">Last response</p>
            <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">
              <code>{data?.lastResponse ?? "No response received yet."}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection details</CardTitle>
          <CardDescription>
            Useful while standing up local development and deployment pipelines.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-sm font-medium text-slate-500">Checked at</p>
            <p className="mt-2 text-base font-semibold text-slate-950">
              {data?.checkedAt
                ? new Date(data.checkedAt).toLocaleString()
                : "Waiting for first response"}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-sm font-medium text-slate-500">Client state</p>
            <p className="mt-2 text-base font-semibold text-slate-950">
              {data?.ok ? "Connected" : "Needs attention"}
            </p>
            {data?.error ? (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <ServerCrash className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{data.error}</span>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-sm font-medium text-slate-500">Endpoint</p>
            <code className="mt-2 block text-sm text-slate-700">GET /health</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
