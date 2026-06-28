import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type HealthCardTone = "healthy" | "unhealthy" | "warning" | "neutral";

interface HealthCardProps {
  title: string;
  value: string;
  helperText: string;
  icon: LucideIcon;
  tone?: HealthCardTone;
}

const toneMap = {
  healthy: {
    badgeVariant: "success" as const,
    iconClassName: "bg-emerald-50 text-emerald-700",
  },
  unhealthy: {
    badgeVariant: "danger" as const,
    iconClassName: "bg-red-50 text-red-700",
  },
  warning: {
    badgeVariant: "warning" as const,
    iconClassName: "bg-amber-50 text-amber-700",
  },
  neutral: {
    badgeVariant: "outline" as const,
    iconClassName: "bg-slate-100 text-slate-700",
  },
};

export function HealthCard({
  title,
  value,
  helperText,
  icon: Icon,
  tone = "neutral",
}: HealthCardProps) {
  const presentation = toneMap[tone];

  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-5">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${presentation.iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Badge variant={presentation.badgeVariant}>{value}</Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{helperText}</p>
        </div>
      </CardContent>
    </Card>
  );
}
