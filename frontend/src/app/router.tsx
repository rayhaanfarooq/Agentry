import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/common/EmptyState";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { HealthPage } from "@/features/health/pages/HealthPage";
import { TraceDetailPage } from "@/features/traces/pages/TraceDetailPage";
import { TraceListPage } from "@/features/traces/pages/TraceListPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "health",
        element: <HealthPage />,
      },
      {
        path: "traces",
        element: <TraceListPage />,
      },
      {
        path: "traces/:traceId",
        element: <TraceDetailPage />,
      },
      {
        path: "*",
        element: (
          <EmptyState
            title="Page not found"
            description="This route has not been added to the dashboard yet."
          />
        ),
      },
    ],
  },
]);
