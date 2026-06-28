import { Activity, LayoutDashboard } from "lucide-react";
import { NavLink, Route, Routes } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { DashboardPage } from "@/pages/DashboardPage";
import { HealthPage } from "@/pages/HealthPage";
import { cn } from "@/lib/utils";

const navigation = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/health",
    label: "Health",
    icon: Activity,
  },
];

function App() {
  return (
    <div className="min-h-screen bg-page-grid bg-[size:120px_120px]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10">
        <header className="surface sticky top-6 z-10 flex items-center justify-between rounded-full px-5 py-3">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
              AG
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Agentry
              </p>
              <h1 className="text-base font-semibold text-slate-950">
                AI developer infrastructure
              </h1>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors",
                    isActive
                      ? "bg-slate-950 text-white"
                      : "hover:bg-slate-100 hover:text-slate-950",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex-1 py-10">
          <section className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-4 rounded-full px-3 py-1">
                Phase 1 MVP scaffold
              </Badge>
              <h2 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Production-ready foundations for the Agentry platform.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                This dashboard proves the frontend can communicate with the FastAPI
                backend while leaving the core product areas ready for future
                observability, evaluations, tracing, and debugging work.
              </p>
            </div>
          </section>

          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/health" element={<HealthPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
