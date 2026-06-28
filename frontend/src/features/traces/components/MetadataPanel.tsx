import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  formatDateTime,
  formatDuration,
  formatNumber,
  formatTokenTotal,
} from "@/features/traces/lib/formatters";
import {
  getPrimaryModel,
  getPrimaryTokens,
} from "@/features/traces/lib/trace-utils";
import type { TraceDetail } from "@/features/traces/types";

interface MetadataPanelProps {
  trace: TraceDetail;
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-sm leading-6 text-slate-800">{value}</p>
    </div>
  );
}

export function MetadataPanel({ trace }: MetadataPanelProps) {
  const model = getPrimaryModel(trace);
  const tokens = getPrimaryTokens(trace);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata</CardTitle>
        <CardDescription>
          Execution context, model configuration, and platform-level trace
          attributes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <MetadataRow label="Trace ID" value={trace.trace_id} />
        <MetadataRow label="Service" value={trace.service_name} />
        <MetadataRow label="Environment" value={trace.environment} />
        <MetadataRow label="Status" value={trace.status} />
        <MetadataRow label="Started" value={formatDateTime(trace.started_at)} />
        <MetadataRow label="Ended" value={formatDateTime(trace.ended_at)} />
        <MetadataRow
          label="Latency"
          value={formatDuration(trace.duration_ms)}
        />
        <MetadataRow label="Model" value={model?.name ?? "No model captured"} />
        <MetadataRow
          label="Provider"
          value={model?.provider ?? "No provider captured"}
        />
        <MetadataRow
          label="Temperature"
          value={
            model?.temperature !== null && model?.temperature !== undefined
              ? String(model.temperature)
              : "Not captured"
          }
        />
        <MetadataRow label="Tokens" value={formatTokenTotal(tokens)} />
        <MetadataRow
          label="Input tokens"
          value={formatNumber(tokens?.input_tokens)}
        />
        <MetadataRow
          label="Output tokens"
          value={formatNumber(tokens?.output_tokens)}
        />
        <MetadataRow
          label="SDK"
          value={`${trace.sdk.name} ${trace.sdk.version}`}
        />

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">Tags</p>
          {trace.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {trace.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-600">
              No tags were attached to this trace.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
