import { Boxes, Clock3, Network } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const futureAreas = [
  {
    title: "Traces",
    description:
      "Agent execution timelines and tool-call inspection will appear here.",
    icon: Network,
  },
  {
    title: "Evaluations",
    description:
      "Regression checks and benchmark results will connect into this surface.",
    icon: Boxes,
  },
  {
    title: "Runtime review",
    description:
      "Latency, token usage, and operational diagnostics will follow later.",
    icon: Clock3,
  },
];

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title="Dashboard"
        description="This initial dashboard is intentionally minimal. It establishes the authenticated shell and leaves space for future trace, eval, and project workflows."
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <EmptyState
          title="Traces will appear here once the SDK is connected."
          description="After backend instrumentation is wired up, Runloop will show agent traces, tool calls, and execution metadata in this space."
          icon={<Network className="h-5 w-5" />}
        />

        <Card>
          <CardHeader>
            <CardTitle>Phase 1 focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {futureAreas.map(({ title, description, icon: Icon }, index) => (
              <div key={title} className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {description}
                    </p>
                  </div>
                </div>
                {index < futureAreas.length - 1 ? <Separator /> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
