import { Badge } from "@/components/ui/badge";

import { formatStatusLabel } from "@/features/traces/lib/formatters";
import type { TraceStatus } from "@/features/traces/types";

interface TraceStatusBadgeProps {
  status: TraceStatus;
}

export function TraceStatusBadge({ status }: TraceStatusBadgeProps) {
  return (
    <Badge variant={status === "ok" ? "success" : "danger"}>
      {formatStatusLabel(status)}
    </Badge>
  );
}
