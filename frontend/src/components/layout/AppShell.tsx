import {
  Activity,
  ChevronRight,
  LayoutDashboard,
  Network,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { getAppEnv } from "@/lib/env";
import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "Dashboard",
    to: "/",
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    label: "Health",
    to: "/health",
    icon: Activity,
    enabled: true,
  },
  {
    label: "Traces",
    to: "/traces",
    icon: Network,
    enabled: true,
  },
  {
    label: "Evals",
    to: "/evals",
    icon: ShieldCheck,
    enabled: false,
  },
  {
    label: "Settings",
    to: "/settings",
    icon: Settings,
    enabled: false,
  },
];

function getPageTitle(pathname: string) {
  const activeItem = [...navigation]
    .filter((item) => item.enabled)
    .sort((left, right) => right.to.length - left.to.length)
    .find((item) =>
      item.to === "/"
        ? pathname === "/"
        : pathname === item.to || pathname.startsWith(`${item.to}/`),
    );
  return activeItem?.label ?? "Dashboard";
}

export function AppShell() {
  const location = useLocation();
  const { VITE_API_URL } = getAppEnv();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row lg:px-8">
        <aside className="surface flex w-full shrink-0 flex-col rounded-2xl p-4 lg:sticky lg:top-4 lg:w-72 lg:self-start">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
              AG
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Runloop
              </p>
              <h1 className="text-base font-semibold text-slate-950">
                Dashboard
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            The authenticated product surface for traces, evals, and operational
            review workflows.
          </p>

          <nav
            className="mt-6 flex flex-col gap-2"
            aria-label="Sidebar navigation"
          >
            {navigation.map(({ label, to, icon: Icon, enabled }) =>
              enabled ? (
                <NavLink
                  key={label}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between rounded-xl border border-transparent px-3 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "border-slate-200 bg-slate-100 text-slate-950"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                    )
                  }
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </NavLink>
              ) : (
                <div
                  key={label}
                  aria-disabled="true"
                  className="flex items-center justify-between rounded-xl border border-dashed border-slate-200 px-3 py-3 text-sm text-slate-400"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  <Badge
                    variant="outline"
                    className="rounded-md px-2 py-0.5 text-[11px]"
                  >
                    Soon
                  </Badge>
                </div>
              ),
            )}
          </nav>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              Phase 1 foundation
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Routing, API connectivity, and UI structure are ready for future
              Runloop product surfaces.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="surface flex flex-col gap-4 rounded-2xl px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Current section
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                {getPageTitle(location.pathname)}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className="rounded-md border-blue-100 bg-blue-50 px-3 py-1 text-blue-800"
              >
                API {VITE_API_URL}
              </Badge>
              <Badge variant="outline" className="rounded-md px-3 py-1">
                React + FastAPI
              </Badge>
            </div>
          </header>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
