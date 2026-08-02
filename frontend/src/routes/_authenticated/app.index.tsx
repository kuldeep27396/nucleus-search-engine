import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock, Database, Layers, ShieldCheck, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { SearchHero } from "@/components/nucleus/SearchHero";
import { AnswerCard } from "@/components/nucleus/AnswerCard";
import { ResultCard, RestrictedCard } from "@/components/nucleus/ResultCard";
import { ResultSkeleton } from "@/components/nucleus/ResultSkeleton";
import { OnboardingCard } from "@/components/nucleus/OnboardingCard";
import { useConsole } from "@/components/nucleus/console-context";
import { queries, resolveQuery, type Persona, type SourceKind } from "@/data/nucleus";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({
    meta: [
      { title: "Search Console — Nucleus Workspace" },
      {
        name: "description",
        content:
          "Your Nucleus workspace console: grounded AI answers over docs, Slack, Jira and code, filtered live by your role's row-level security policy.",
      },
      { property: "og:title", content: "Search Console — Nucleus Workspace" },
      {
        property: "og:description",
        content: "Permission-aware enterprise search with SOC2 audit logging.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchConsole,
});

function SearchConsole() {
  const { persona, enterprise, auditRows, addAuditRow, bumpQueryCount } = useConsole();

  const [input, setInput] = useState(queries[0]!.query);
  const [submitted, setSubmitted] = useState(queries[0]!.query);
  const [filter, setFilter] = useState<SourceKind | "all">("all");
  const [searching, setSearching] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const result = useMemo(() => resolveQuery(submitted), [submitted]);
  const filtered = useMemo(
    () => result.docs.filter((d) => filter === "all" || d.kind === filter),
    [result, filter],
  );
  const allowed = useMemo(
    () => filtered.filter((d) => persona.acl.includes(d.acl)),
    [filtered, persona],
  );
  const blocked = useMemo(
    () => filtered.filter((d) => !persona.acl.includes(d.acl)),
    [filtered, persona],
  );

  const log = (query: string, p: Persona, docIds: string[], latency: number) =>
    addAuditRow({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19) + "Z",
      email: p.email,
      role: p.role,
      query,
      docIds,
      rlsFilter: `acl_group IN (${p.acl.join(", ")})`,
      latency,
    });

  const runSearch = (value: string) => {
    const next = resolveQuery(value);
    setSearching(true);
    bumpQueryCount();
    setRecent((r) => [value || next.query, ...r.filter((q) => q !== value)].slice(0, 4));
    window.setTimeout(() => {
      setSubmitted(value);
      setSearching(false);
      log(
        value || next.query,
        persona,
        next.docs.filter((d) => persona.acl.includes(d.acl)).map((d) => d.id),
        next.latency,
      );
    }, 520);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const latency = result.latency + allowed.length;

  const steps = [
    { label: "Connect your first source", done: true },
    { label: "Import your directory groups", done: true },
    { label: "Define RLS policies", done: true },
    { label: "Activate Enterprise license", done: enterprise },
    { label: "Invite your team", done: false },
  ];

  return (
    <main className="mx-auto max-w-7xl pb-24">
      <SearchHero
        ref={inputRef}
        value={input}
        onChange={setInput}
        onSubmit={runSearch}
        filter={filter}
        onFilterChange={setFilter}
        recent={recent}
        searching={searching}
      />

      <div className="grid gap-5 px-4 md:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          {searching ? (
            <div className="bold-panel p-6">
              <div className="h-3.5 w-48 animate-pulse rounded bg-muted" />
              <div className="mt-4 space-y-2.5">
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-11/12 animate-pulse rounded bg-muted" />
                <div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ) : (
            <AnswerCard result={result} visibleDocs={allowed} latency={latency} />
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <h2 className="font-display text-sm font-semibold text-foreground">
              Hybrid Search Results
            </h2>
            <span className="rounded-full border border-hairline bg-surface px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
              {allowed.length} retrieved · {blocked.length} filtered by RLS
            </span>
          </div>

          {searching ? (
            <ResultSkeleton />
          ) : (
            <AnimatePresence mode="popLayout">
              {allowed.map((doc, i) => (
                <ResultCard key={doc.id} doc={doc} index={i} />
              ))}
              {blocked.map((doc, i) => (
                <RestrictedCard key={doc.id} doc={doc} index={i} />
              ))}
              {allowed.length === 0 && blocked.length === 0 && (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bold-panel p-6 text-sm text-muted-foreground"
                >
                  No documents in this source for the current query and role.
                </motion.p>
              )}
            </AnimatePresence>
          )}
        </div>

        <aside className="space-y-4">
          <OnboardingCard steps={steps} />

          <div className="bold-panel-soft p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="size-4 text-emerald-glow" />
              Active Security Context
            </h3>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Tenant</dt>
                <dd className="font-mono text-foreground">acme_corp</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Role</dt>
                <dd className="font-mono text-cyan-glow">{persona.role}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">ACL</dt>
                <dd className="font-mono text-purple-glow">{persona.acl.join(", ")}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Edition</dt>
                <dd className={enterprise ? "text-emerald-glow" : "text-muted-foreground"}>
                  {enterprise ? "Enterprise" : "Community"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bold-panel-soft p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <TrendingUp className="size-4 text-indigo-glow" />
              Workspace this week
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                { k: "Searches", v: "1,284" },
                { k: "Answer rate", v: "92%" },
                { k: "P95 latency", v: "184ms" },
                { k: "RLS denials", v: "37" },
              ].map((m) => (
                <div key={m.k} className="rounded-lg border border-hairline bg-muted/50 p-2.5">
                  <div className="font-display text-base font-semibold text-foreground">{m.v}</div>
                  <div className="text-[10px] text-muted-foreground">{m.k}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bold-panel-soft p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Layers className="size-4 text-indigo-glow" />
              Retrieval Pipeline
            </h3>
            <ol className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>1. BM25 lexical recall (Postgres FTS)</li>
              <li>2. pgvector ANN recall (HNSW, 1536-d)</li>
              <li>3. Reciprocal Rank Fusion</li>
              <li>4. RLS filter + cross-encoder rerank</li>
              <li>5. Grounded synthesis with citations</li>
            </ol>
          </div>

          <div className="bold-panel-soft p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Database className="size-4 text-cyan-glow" />
              Connected Sources
            </h3>
            <div className="mt-3 space-y-2 text-[11px]">
              {[
                { s: "Confluence", n: "12,402 docs", ok: true },
                { s: "Slack", n: "88,110 messages", ok: true },
                { s: "Jira", n: "4,209 issues", ok: true },
                { s: "GitHub", n: "1,842 files", ok: true },
                { s: "Google Drive", n: "syncing…", ok: false },
              ].map((c) => (
                <div key={c.s} className="flex items-center gap-2">
                  <span
                    className={`size-1.5 rounded-full ${c.ok ? "bg-emerald-glow" : "bg-amber-glow"}`}
                  />
                  <span className="text-foreground">{c.s}</span>
                  <span className="ml-auto font-mono text-muted-foreground">{c.n}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => toast.info("Open Connectors to manage your sources.")}
              className="mt-3 w-full rounded-lg border border-hairline px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              Add connector
            </button>
          </div>

          <div className="bold-panel-soft p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="size-4 text-purple-glow" />
              Recent activity
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {auditRows.slice(0, 4).map((r) => (
                <li key={r.id} className="truncate">
                  <span className="font-mono text-[10px] text-purple-glow">{r.role}</span> {r.query}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
