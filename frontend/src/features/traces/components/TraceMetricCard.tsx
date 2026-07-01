import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface TraceMetricCardProps {
  title: string;
  value: string;
  helperText: string;
  icon: LucideIcon;
  accentClassName?: string;
}

export function TraceMetricCard({
  title,
  value,
  helperText,
  icon: Icon,
  accentClassName = "bg-slate-100 text-slate-700",
}: TraceMetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentClassName}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">{helperText}</p>
        </div>
      </CardContent>
    </Card>
  );
}
