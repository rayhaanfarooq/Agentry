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
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-6 lg:flex-row lg:px-8">
        <aside className="surface flex w-full shrink-0 flex-col overflow-hidden rounded-xl lg:sticky lg:top-6 lg:w-64 lg:self-start">
          <div className="surface-brand flex items-center gap-3 px-4 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-sm font-semibold text-white ring-1 ring-white/20">
              RL
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-blue-100">
                Runloop
              </p>
              <p className="text-sm font-semibold text-white">Dashboard</p>
            </div>
          </div>

          <nav
            className="flex flex-col gap-1 p-3"
            aria-label="Sidebar navigation"
          >
            {navigation.map(({ label, to, icon: Icon, enabled }) =>
              enabled ? (
                <NavLink
                  key={label}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex h-10 items-center justify-between rounded-[10px] border px-3 text-sm font-medium transition-colors",
                      isActive
                        ? "border-brand-200 bg-brand-50 text-brand-deep"
                        : "border-transparent text-slate-600 hover:border-brand-100 hover:bg-brand-50/70 hover:text-brand-deep",
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
                  className="flex h-10 items-center justify-between rounded-[10px] border border-dashed border-slate-200 px-3 text-sm text-slate-400"
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
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="surface flex flex-col gap-4 rounded-xl border-brand-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="hidden h-10 w-1 rounded-full bg-brand sm:block" />
              <h1 className="text-2xl font-semibold tracking-tight text-brand-deep">
                {getPageTitle(location.pathname)}
              </h1>
            </div>

            <Badge
              variant="outline"
              className="w-fit rounded-md border-brand-200 bg-brand-50 px-3 py-1 text-brand-deep"
            >
              API {VITE_API_URL}
            </Badge>
          </header>

          <main className="flex-1 pb-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
