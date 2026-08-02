import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/nucleus/PageShell";
import { useConsole } from "@/components/nucleus/console-context";

export const Route = createFileRoute("/_authenticated/app/audit")({
  head: () => ({
    meta: [
      { title: "Audit Logs — Nucleus Workspace" },
      {
        name: "description",
        content:
          "Immutable SOC2 audit trail of every query, the identity that ran it, and the row-level security filter applied.",
      },
      { property: "og:title", content: "Audit Logs — Nucleus Workspace" },
      { property: "og:description", content: "SOC2 audit trail for enterprise search." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const { auditRows, enterprise, openLicense } = useConsole();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");

  const roles = useMemo(() => ["all", ...new Set(auditRows.map((r) => r.role))], [auditRows]);
  const rows = auditRows.filter(
    (r) =>
      (role === "all" || r.role === role) &&
      (r.query.toLowerCase().includes(q.toLowerCase()) ||
        r.email.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <PageShell
      title="Audit logs"
      description="Append-only record of every retrieval. Each row captures the caller identity, the RLS predicate applied, and the documents returned."
      action={
        <button
          onClick={() =>
            enterprise
              ? toast.success("Audit export queued", { description: "SIEM-ready JSONL, 7-year retention." })
              : openLicense()
          }
          className="flex items-center gap-2 rounded-xl border-2 border-ink bg-card px-4 py-2.5 text-sm font-bold text-foreground shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--ink)]"
        >
          {enterprise ? <Download className="size-4" /> : <Lock className="size-4" />}
          Export to SIEM
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { k: "Events today", v: `${auditRows.length}` },
          { k: "Retention", v: enterprise ? "7 years" : "30 days" },
          { k: "Tamper checks", v: "passing" },
          { k: "Hash chain", v: "sha256" },
        ].map((m) => (
          <div key={m.k} className="bold-panel-soft p-4">
            <div className="font-display text-xl font-extrabold text-foreground">{m.v}</div>
            <div className="text-[11px] text-muted-foreground">{m.k}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by query or user…"
          className="w-full max-w-sm rounded-xl border-2 border-ink bg-card px-3.5 py-2.5 text-sm text-foreground shadow-[4px_4px_0_0_var(--ink)] outline-none placeholder:text-muted-foreground focus:translate-y-0.5 focus:shadow-[2px_2px_0_0_var(--ink)]"
        />
        <div className="flex flex-wrap gap-1.5">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`rounded-full border-2 border-ink px-3 py-1.5 font-mono text-[11px] font-bold ${
                role === r
                  ? "bg-gradient-to-r from-indigo-glow to-fuchsia-glow text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="bold-panel overflow-x-auto">
        <table className="w-full min-w-[54rem] text-left text-xs">
          <thead className="border-b-2 border-ink bg-muted/50">
            <tr className="font-mono uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Identity</th>
              <th className="px-4 py-3">Query</th>
              <th className="px-4 py-3">RLS predicate</th>
              <th className="px-4 py-3">Docs</th>
              <th className="px-4 py-3">Latency</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-hairline last:border-0">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-muted-foreground">
                  {r.timestamp}
                </td>
                <td className="px-4 py-3">
                  <div className="text-foreground">{r.email}</div>
                  <div className="font-mono text-[10px] text-purple-glow">{r.role}</div>
                </td>
                <td className="max-w-[16rem] truncate px-4 py-3 text-foreground">{r.query}</td>
                <td className="px-4 py-3 font-mono text-[10px] text-cyan-glow">{r.rlsFilter}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                  {r.docIds.length}
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                  {r.latency}ms
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No audit events match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!enterprise && (
        <div className="bold-panel-soft flex flex-wrap items-center gap-3 p-5">
          <ShieldCheck className="size-5 text-emerald-glow" />
          <p className="text-sm text-muted-foreground">
            Community edition retains 30 days of audit history. Enterprise unlocks 7-year retention,
            hash-chain verification exports and streaming to Splunk or Datadog.
          </p>
          <button
            onClick={openLicense}
            className="ml-auto rounded-xl border-2 border-ink bg-gradient-to-r from-indigo-glow via-fuchsia-glow to-orange-glow px-4 py-2 text-xs font-bold text-primary-foreground shadow-[4px_4px_0_0_var(--ink)]"
          >
            Activate license
          </button>
        </div>
      )}
    </PageShell>
  );
}
