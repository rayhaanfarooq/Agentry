import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand">
          {icon ?? <Inbox className="h-5 w-5" />}
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-2 max-w-prose text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
