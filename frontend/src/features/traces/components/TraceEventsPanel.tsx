import { BellRing } from "lucide-react";

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
import { formatDateTime } from "@/features/traces/lib/formatters";
import { summarizeEvent } from "@/features/traces/lib/trace-utils";
import type { TraceEvent } from "@/features/traces/types";

interface TraceEventsPanelProps {
  events: TraceEvent[];
}

export function TraceEventsPanel({ events }: TraceEventsPanelProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No trace events were emitted."
        description="Event annotations such as token updates, checkpoints, and custom markers will appear here when they are sent by the SDK."
        icon={<BellRing className="h-5 w-5" />}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trace Events</CardTitle>
        <CardDescription>
          Ordered annotations emitted throughout the run, including token usage
          and custom markers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div
            key={event.event_id}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-950">
                  {event.name}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {formatDateTime(event.timestamp)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{summarizeEvent(event)}</Badge>
                {event.span_id ? (
                  <Badge variant="secondary">Span linked</Badge>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-500">Payload</p>
                <JsonViewer
                  value={event.payload}
                  emptyMessage="No payload was attached to this event."
                />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-500">Metadata</p>
                <JsonViewer
                  value={event.metadata}
                  emptyMessage="No metadata was attached to this event."
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
