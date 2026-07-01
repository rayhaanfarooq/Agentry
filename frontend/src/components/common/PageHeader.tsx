import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  description: string;
  title?: string;
  eyebrow?: string;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        title ? "border-b border-slate-200 pb-6" : null,
      )}
    >
      <div className="max-w-prose">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <h1
            className={cn(
              "text-2xl font-semibold tracking-tight text-slate-950",
              eyebrow ? "mt-2" : null,
            )}
          >
            {title}
          </h1>
        ) : null}
        <p
          className={cn(
            "text-sm leading-6 text-slate-600",
            title ? "mt-3" : null,
          )}
        >
          {description}
        </p>
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </section>
  );
}
