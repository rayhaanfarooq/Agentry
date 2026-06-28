import { CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { stringifyValue } from "@/features/traces/lib/formatters";

interface JsonViewerProps {
  value: unknown;
  emptyMessage?: string;
  className?: string;
}

function isEmptyValue(value: unknown) {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
}

export function JsonViewer({
  value,
  emptyMessage = "No data was captured for this field.",
  className,
}: JsonViewerProps) {
  if (isEmptyValue(value)) {
    return <CardDescription>{emptyMessage}</CardDescription>;
  }

  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100",
        className,
      )}
    >
      <code>{stringifyValue(value)}</code>
    </pre>
  );
}
