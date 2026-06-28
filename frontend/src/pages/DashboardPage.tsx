import { ArrowUpRight, DatabaseZap, Radar, Workflow } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const roadmapItems = [
  {
    title: "Observability",
    description: "Trace agent execution paths and inspect runtime behavior.",
    icon: Radar,
  },
  {
    title: "Evaluations",
    description: "Benchmark prompts, tools, and workflows with repeatable checks.",
    icon: Workflow,
  },
  {
    title: "Data foundation",
    description: "Keep the platform grounded in a clean SQLAlchemy + PostgreSQL core.",
    icon: DatabaseZap,
  },
];

export function DashboardPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard scaffold</CardTitle>
          <CardDescription>
            The product surface is intentionally minimal for this milestone. This
            page exists to establish routing, layout, styling, and shared UI
            primitives for future work.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {roadmapItems.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-slate-950 text-white">
        <CardHeader>
          <CardTitle className="text-white">Milestone focus</CardTitle>
          <CardDescription className="text-slate-300">
            This foundation keeps product scope tight while setting us up for clean
            expansion in later phases.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            "Backend architecture and configuration",
            "PostgreSQL connectivity through SQLAlchemy",
            "Typed frontend API access and health visibility",
            "Independent dashboard and landing page applications",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <span className="text-sm text-slate-100">{item}</span>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
