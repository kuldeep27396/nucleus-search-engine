import { motion } from "motion/react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Atom,
  BarChart3,
  Bookmark,
  Cable,
  ScrollText,
  Search,
  Settings2,
  Sparkles,
} from "lucide-react";

const nav = [
  { to: "/app", label: "Search", icon: Search, exact: true },
  { to: "/app/saved", label: "Saved answers", icon: Bookmark, badge: "3" },
  { to: "/app/connectors", label: "Connectors", icon: Cable, badge: "6" },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/audit", label: "Audit logs", icon: ScrollText },
  { to: "/app/settings", label: "Settings", icon: Settings2 },
] as const;

type Props = {
  enterprise: boolean;
  onOpenLicense: () => void;
  queriesUsed: number;
};

export function Sidebar({ enterprise, onOpenLicense, queriesUsed }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const quota = enterprise ? 100000 : 500;
  const pct = Math.min(100, Math.round((queriesUsed / quota) * 100));

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r-2 border-ink bg-card px-3 py-4 lg:flex">
      <Link to="/app" className="flex items-center gap-2.5 px-1 pb-5">
        <span className="flex size-9 items-center justify-center rounded-xl border-2 border-ink bg-gradient-to-br from-indigo-glow via-fuchsia-glow to-orange-glow shadow-[3px_3px_0_0_var(--ink)]">
          <Atom className="size-5 text-primary-foreground" />
        </span>
        <div className="leading-tight">
          <div className="font-display text-base font-extrabold tracking-tight text-foreground">
            Nucleus
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            acme corp
          </span>
        </div>
      </Link>

      <nav className="space-y-1">
        {nav.map((item) => {
          const on = item.to === "/app" ? pathname === "/app" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-transform ${
                on
                  ? "font-bold text-foreground"
                  : "font-medium text-muted-foreground hover:translate-x-0.5 hover:text-foreground"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 -z-10 rounded-xl border-2 border-ink bg-gradient-to-r from-indigo-glow/15 to-fuchsia-glow/15 shadow-[3px_3px_0_0_var(--ink)]"
                />
              )}
              <item.icon className={`size-4 ${on ? "text-indigo-glow" : ""}`} />
              {item.label}
              {"badge" in item && item.badge && (
                <span className="ml-auto rounded-full border-2 border-ink bg-card px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="rounded-xl border-2 border-ink bg-background p-3 shadow-[4px_4px_0_0_var(--ink)]">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-foreground">Query credits</span>
            <span className="font-mono text-muted-foreground">
              {queriesUsed}/{enterprise ? "∞" : quota}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full border-2 border-ink bg-muted">
            <motion.div
              animate={{ width: `${enterprise ? 6 : pct}%` }}
              className="h-full bg-gradient-to-r from-indigo-glow via-fuchsia-glow to-orange-glow"
            />
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Resets in 12 days · {enterprise ? "Enterprise plan" : "Community plan"}
          </p>
        </div>

        {!enterprise && (
          <button
            onClick={onOpenLicense}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-ink bg-gradient-to-r from-indigo-glow via-fuchsia-glow to-orange-glow px-3 py-2.5 text-xs font-bold text-primary-foreground shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--ink)]"
          >
            <Sparkles className="size-3.5" />
            Upgrade to Enterprise
          </button>
        )}
      </div>
    </aside>
  );
}
