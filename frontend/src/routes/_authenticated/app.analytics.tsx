import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Download } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/nucleus/PageShell";

export const Route = createFileRoute("/_authenticated/app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Nucleus Workspace" },
      {
        name: "description",
        content:
          "Search volume, answer quality, latency and RLS denial analytics for your Nucleus workspace.",
      },
      { property: "og:title", content: "Analytics — Nucleus Workspace" },
      { property: "og:description", content: "Measure search adoption and answer quality." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnalyticsPage,
});

const ranges = ["7d", "30d", "90d"] as const;

const volume = [42, 58, 51, 74, 96, 88, 120, 104, 133, 148, 129, 165, 154, 182];

const topQueries = [
  { q: "What is our incident severity ladder?", n: 214, trend: 12 },
  { q: "How do I request a production access grant?", n: 168, trend: 8 },
  { q: "Parental leave policy for contractors", n: 141, trend: -4 },
  { q: "Where is the Q3 revenue forecast?", n: 118, trend: 22 },
  { q: "How to rotate service account keys", n: 97, trend: -9 },
];

const gaps = [
  { q: "SOC2 evidence for subprocessor list", reason: "No indexed document" },
  { q: "2026 sales comp plan", reason: "Blocked by RLS for 31 users" },
  { q: "Runbook: pgvector index rebuild", reason: "Low confidence answer" },
];

function AnalyticsPage() {
  const [range, setRange] = useState<(typeof ranges)[number]>("30d");
  const max = Math.max(...volume);

  return (
    <PageShell
      title="Analytics"
      description="Adoption, answer quality and access-control signal across the workspace."
      action={
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border-2 border-ink bg-card p-1 shadow-[4px_4px_0_0_var(--ink)]">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  range === r
                    ? "bg-gradient-to-r from-indigo-glow to-fuchsia-glow text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={() => toast.success("CSV export queued", { description: "You'll get an email when it's ready." })}
            className="flex items-center gap-2 rounded-xl border-2 border-ink bg-card px-3.5 py-2.5 text-sm font-bold text-foreground shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--ink)]"
          >
            <Download className="size-4" /> Export
          </button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { k: "Searches", v: "8,412", d: 18 },
          { k: "Answer rate", v: "92%", d: 3 },
          { k: "P95 latency", v: "184ms", d: -11 },
          { k: "RLS denials", v: "37", d: -22 },
        ].map((m, i) => (
          <motion.div
            key={m.k}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bold-panel p-5"
          >
            <div className="text-xs font-medium text-muted-foreground">{m.k}</div>
            <div className="mt-1.5 font-display text-3xl font-extrabold tracking-tighter text-foreground">
              {m.v}
            </div>
            <div
              className={`mt-1.5 flex items-center gap-1 text-[11px] font-bold ${
                m.d >= 0 ? "text-emerald-glow" : "text-orange-glow"
              }`}
            >
              {m.d >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {Math.abs(m.d)}% vs previous {range}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bold-panel p-5">
        <h2 className="font-display text-sm font-bold text-foreground">Search volume</h2>
        <div className="mt-5 flex h-48 items-end gap-1.5">
          {volume.map((v, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(v / max) * 100}%` }}
              transition={{ delay: i * 0.03 }}
              className="flex-1 rounded-t-md border-2 border-ink bg-gradient-to-t from-indigo-glow via-fuchsia-glow to-orange-glow"
              title={`${v} searches`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>start of {range}</span>
          <span>today</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bold-panel p-5">
          <h2 className="font-display text-sm font-bold text-foreground">Top queries</h2>
          <ul className="mt-3 space-y-3">
            {topQueries.map((t) => (
              <li key={t.q} className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate text-foreground">{t.q}</span>
                <span className="font-mono text-xs text-muted-foreground">{t.n}</span>
                <span
                  className={`w-12 text-right font-mono text-[11px] font-bold ${
                    t.trend >= 0 ? "text-emerald-glow" : "text-orange-glow"
                  }`}
                >
                  {t.trend >= 0 ? "+" : ""}
                  {t.trend}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bold-panel p-5">
          <h2 className="font-display text-sm font-bold text-foreground">Knowledge gaps</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Queries that returned no grounded answer for at least 10 people.
          </p>
          <ul className="mt-3 space-y-3">
            {gaps.map((g) => (
              <li key={g.q} className="rounded-xl border border-hairline bg-muted/40 p-3">
                <div className="text-sm font-medium text-foreground">{g.q}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{g.reason}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bold-panel p-5">
        <h2 className="font-display text-sm font-bold text-foreground">Usage by role</h2>
        <div className="mt-4 space-y-3">
          {[
            { r: "Engineering Lead", pct: 46, c: "from-indigo-glow to-cyan-glow" },
            { r: "Intern", pct: 27, c: "from-fuchsia-glow to-purple-glow" },
            { r: "HR Manager", pct: 19, c: "from-orange-glow to-amber-glow" },
            { r: "Workspace Admin", pct: 8, c: "from-emerald-glow to-cyan-glow" },
          ].map((row) => (
            <div key={row.r} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-xs text-foreground">{row.r}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full border-2 border-ink bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${row.pct}%` }}
                  className={`h-full bg-gradient-to-r ${row.c}`}
                />
              </div>
              <span className="w-10 text-right font-mono text-[11px] text-muted-foreground">
                {row.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
