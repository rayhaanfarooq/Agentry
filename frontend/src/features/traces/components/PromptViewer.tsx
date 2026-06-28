import { Hash, MessageSquareText } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { JsonViewer } from "@/features/traces/components/JsonViewer";
import {
  formatNumber,
  formatTokenTotal,
  stringifyValue,
} from "@/features/traces/lib/formatters";
import {
  buildPromptSections,
  getPrimaryTokens,
} from "@/features/traces/lib/trace-utils";
import type { TraceDetail } from "@/features/traces/types";

interface PromptViewerProps {
  trace: TraceDetail;
}

export function PromptViewer({ trace }: PromptViewerProps) {
  const sections = buildPromptSections(trace);
  const tokens = getPrimaryTokens(trace);

  if (sections.length === 0) {
    return (
      <EmptyState
        title="No prompt payloads were captured for this trace."
        description="The trace exists and can still be inspected through spans, metadata, and raw JSON, but prompt-specific fields were not populated."
        icon={<MessageSquareText className="h-5 w-5" />}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Prompt Viewer</CardTitle>
            <CardDescription>
              Inspect the instruction, user input, retrieved context, and final
              completion without digging through raw payloads.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Total tokens {formatTokenTotal(tokens)}
            </Badge>
            <Badge variant="outline">
              Input {formatNumber(tokens?.input_tokens)}
            </Badge>
            <Badge variant="outline">
              Output {formatNumber(tokens?.output_tokens)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {sections.map((section, index) => (
          <div key={section.id} className="space-y-4">
            <details
              open={index < 2}
              className="rounded-2xl border border-slate-200 bg-slate-50/70"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {section.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {section.description}
                  </p>
                </div>
                <Badge variant="outline">
                  {section.kind === "text" ? "Text" : "JSON"}
                </Badge>
              </summary>
              <div className="border-t border-slate-200 px-4 py-4">
                {section.kind === "text" ? (
                  <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-800">
                    {stringifyValue(section.value)}
                  </pre>
                ) : (
                  <JsonViewer value={section.value} />
                )}
              </div>
            </details>
            {index < sections.length - 1 ? <Separator /> : null}
          </div>
        ))}

        {(trace.inputs || trace.outputs) && sections.length > 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Hash className="h-4 w-4 text-blue-700" />
              Fallback fields remain available in Raw JSON for any payloads that
              do not map cleanly into these sections.
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
