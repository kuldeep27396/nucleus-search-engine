import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Cable, Check, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/nucleus/PageShell";

export const Route = createFileRoute("/_authenticated/app/connectors")({
  head: () => ({
    meta: [
      { title: "Connectors — Nucleus Workspace" },
      {
        name: "description",
        content:
          "Connect Confluence, Slack, Jira, GitHub, Drive and more. Nucleus mirrors each source's native permissions into row-level security.",
      },
      { property: "og:title", content: "Connectors — Nucleus Workspace" },
      { property: "og:description", content: "Manage indexed sources and permission sync." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConnectorsPage,
});

type Conn = {
  id: string;
  name: string;
  blurb: string;
  items: string;
  status: "connected" | "syncing" | "available";
  lastSync: string;
  color: string;
};

const initial: Conn[] = [
  { id: "confluence", name: "Confluence", blurb: "Spaces, pages, attachments", items: "12,402 docs", status: "connected", lastSync: "4 min ago", color: "from-indigo-glow to-cyan-glow" },
  { id: "slack", name: "Slack", blurb: "Public + permitted private channels", items: "88,110 messages", status: "connected", lastSync: "1 min ago", color: "from-fuchsia-glow to-purple-glow" },
  { id: "jira", name: "Jira", blurb: "Issues, comments, sprints", items: "4,209 issues", status: "connected", lastSync: "12 min ago", color: "from-cyan-glow to-indigo-glow" },
  { id: "github", name: "GitHub", blurb: "Code, PRs, READMEs", items: "1,842 files", status: "connected", lastSync: "8 min ago", color: "from-orange-glow to-fuchsia-glow" },
  { id: "gdrive", name: "Google Drive", blurb: "Docs, Sheets, Slides", items: "initial crawl 62%", status: "syncing", lastSync: "in progress", color: "from-emerald-glow to-cyan-glow" },
  { id: "notion", name: "Notion", blurb: "Wikis and databases", items: "—", status: "available", lastSync: "never", color: "from-purple-glow to-indigo-glow" },
  { id: "zendesk", name: "Zendesk", blurb: "Tickets and macros", items: "—", status: "available", lastSync: "never", color: "from-amber-glow to-orange-glow" },
  { id: "salesforce", name: "Salesforce", blurb: "Accounts, opportunities", items: "—", status: "available", lastSync: "never", color: "from-cyan-glow to-emerald-glow" },
];

const statusStyle: Record<Conn["status"], string> = {
  connected: "border-emerald-glow/50 bg-emerald-glow/10 text-emerald-glow",
  syncing: "border-amber-glow/50 bg-amber-glow/10 text-amber-glow",
  available: "border-hairline bg-surface text-muted-foreground",
};

function ConnectorsPage() {
  const [conns, setConns] = useState(initial);
  const connected = conns.filter((c) => c.status !== "available").length;

  return (
    <PageShell
      title="Connectors"
      description="Every connector syncs its native ACLs on each crawl, so retrieval permissions always match the source of truth."
      action={
        <button
          onClick={() => toast.info("Connector marketplace opens next — 40+ sources available.")}
          className="flex items-center gap-2 rounded-xl border-2 border-ink bg-gradient-to-r from-indigo-glow via-fuchsia-glow to-orange-glow px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--ink)]"
        >
          <Plus className="size-4" /> Add connector
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { k: "Connected sources", v: `${connected}` },
          { k: "Indexed objects", v: "106,563" },
          { k: "Permission sync", v: "every 5 min" },
        ].map((m) => (
          <div key={m.k} className="bold-panel-soft p-5">
            <div className="font-display text-2xl font-extrabold text-foreground">{m.v}</div>
            <div className="mt-1 text-xs text-muted-foreground">{m.k}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {conns.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bold-panel flex flex-col p-5"
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex size-10 items-center justify-center rounded-xl border-2 border-ink bg-gradient-to-br ${c.color} shadow-[3px_3px_0_0_var(--ink)]`}
              >
                <Cable className="size-5 text-primary-foreground" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-base font-bold text-foreground">{c.name}</h2>
                <p className="text-xs text-muted-foreground">{c.blurb}</p>
              </div>
              <span
                className={`ml-auto rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusStyle[c.status]}`}
              >
                {c.status}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <dt className="text-muted-foreground">Indexed</dt>
                <dd className="font-mono text-foreground">{c.items}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last sync</dt>
                <dd className="font-mono text-foreground">{c.lastSync}</dd>
              </div>
            </dl>

            <div className="mt-4 flex gap-2">
              {c.status === "available" ? (
                <button
                  onClick={() => {
                    setConns((rows) =>
                      rows.map((r) =>
                        r.id === c.id ? { ...r, status: "syncing", lastSync: "in progress", items: "initial crawl 3%" } : r,
                      ),
                    );
                    toast.success(`${c.name} connected`, { description: "Initial crawl and ACL sync started." });
                  }}
                  className="flex-1 rounded-lg border-2 border-ink bg-card px-3 py-2 text-xs font-bold text-foreground shadow-[3px_3px_0_0_var(--ink)] transition-transform hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--ink)]"
                >
                  Connect
                </button>
              ) : (
                <>
                  <button
                    onClick={() => toast.success(`Re-crawl queued for ${c.name}`)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-xs font-medium text-foreground hover:bg-accent"
                  >
                    <RefreshCw className="size-3.5" /> Sync now
                  </button>
                  <button
                    onClick={() => toast.info(`${c.name} settings — scopes, filters and schedule.`)}
                    className="flex-1 rounded-lg border border-hairline px-3 py-2 text-xs font-medium text-foreground hover:bg-accent"
                  >
                    Configure
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bold-panel-soft p-5">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
          <Check className="size-4 text-emerald-glow" /> Permission mirroring
        </h3>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Nucleus never stores a flattened copy of your access rules. Each crawl writes the source
          object's group membership into <code className="font-mono text-xs">acl_group</code>, and
          every query is evaluated against the caller's identity token at read time.
        </p>
      </div>
    </PageShell>
  );
}
