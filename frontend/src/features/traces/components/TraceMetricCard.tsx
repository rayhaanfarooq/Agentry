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
      <CardContent className="flex items-start gap-4 p-5">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accentClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{helperText}</p>
        </div>
      </CardContent>
    </Card>
  );
}
