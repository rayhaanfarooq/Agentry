import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Cloud,
  Database,
  RefreshCcw,
  Server,
  TimerReset,
  Waypoints,
} from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getHealth } from "@/features/health/api/getHealth";
import { HealthCard } from "@/features/health/components/HealthCard";
import { ApiClientError } from "@/lib/api";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error while checking backend health.";
}

export function HealthPage() {
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 30000,
  });

  const healthData = healthQuery.data;
  const state = healthQuery.isLoading
    ? "loading"
    : healthQuery.isError
      ? "error"
      : (healthData?.state ?? "unhealthy");

  const stateAlert =
    state === "healthy"
      ? {
          variant: "success" as const,
          title: "Healthy response received",
          message:
            "The dashboard reached the FastAPI backend successfully, PostgreSQL responded, and Supabase project connectivity passed.",
        }
      : state === "unhealthy"
        ? {
            variant: "warning" as const,
            title: "Infrastructure check reported an issue",
            message:
              "The frontend reached the API, but either PostgreSQL or the Supabase project connectivity check did not pass.",
          }
        : state === "error"
          ? {
              variant: "destructive" as const,
              title: "Health request failed",
              message: getErrorMessage(healthQuery.error),
            }
          : {
              variant: "default" as const,
              title: "Checking backend health",
              message:
                "Waiting for the first response from the FastAPI backend and its PostgreSQL plus Supabase health checks.",
            };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Health"
        title="Health"
        description="Verify that the dashboard can communicate with the FastAPI backend and that PostgreSQL plus the configured Supabase project are reachable."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void healthQuery.refetch()}
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${healthQuery.isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        }
      />

      <Alert variant={stateAlert.variant}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">{stateAlert.title}</p>
            <p className="mt-1">{stateAlert.message}</p>
          </div>
        </div>
      </Alert>

      {healthQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-4 p-5">
                <Skeleton className="h-11 w-11 rounded-2xl" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {healthData ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <HealthCard
              title="Backend status"
              value={healthData.response.api}
              helperText={`HTTP ${healthData.statusCode} returned from GET /health, so the FastAPI runtime is responding.`}
              icon={Server}
              tone={
                healthData.response.api === "healthy" ? "healthy" : "unhealthy"
              }
            />
            <HealthCard
              title="Overall health"
              value={healthData.response.status}
              helperText="Aggregate status reported by the backend after all infrastructure checks finish."
              icon={Waypoints}
              tone={
                healthData.response.status === "healthy"
                  ? "healthy"
                  : "unhealthy"
              }
            />
            <HealthCard
              title="Database status"
              value={healthData.response.database}
              helperText="Reported by the backend after a real PostgreSQL connectivity check."
              icon={Database}
              tone={
                healthData.response.database === "connected"
                  ? "healthy"
                  : "unhealthy"
              }
            />
            <HealthCard
              title="Supabase status"
              value={healthData.response.supabase}
              helperText="Validated by the backend against the configured Supabase project endpoint."
              icon={Cloud}
              tone={
                healthData.response.supabase === "connected"
                  ? "healthy"
                  : "unhealthy"
              }
            />
            <HealthCard
              title="App version"
              value={healthData.response.version}
              helperText="Version returned by the FastAPI backend health response."
              icon={Waypoints}
            />
            <HealthCard
              title="Last checked"
              value={formatTimestamp(healthData.checkedAt)}
              helperText="The most recent time the dashboard completed a health request."
              icon={Activity}
            />
            <HealthCard
              title="Request latency"
              value={`${healthData.latencyMs.toFixed(0)} ms`}
              helperText="Measured in the browser for the full request-response round trip."
              icon={TimerReset}
              tone={
                healthData.latencyMs > 1200
                  ? "warning"
                  : healthData.response.status === "healthy"
                    ? "healthy"
                    : "neutral"
              }
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Raw JSON response</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">
                  <code>{healthData.rawResponse}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Endpoint</p>
                  <code className="mt-2 block text-sm text-slate-800">
                    GET /health
                  </code>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-slate-500">State</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {state === "healthy"
                      ? "Healthy"
                      : state === "unhealthy"
                        ? "Unhealthy"
                        : "Error"}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Developer note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    This page is the Phase 1 proof that React, TanStack Query,
                    FastAPI, PostgreSQL, and the Supabase infrastructure layer
                    are wired together correctly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
