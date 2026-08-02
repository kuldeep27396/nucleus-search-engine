import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Code2, Rocket, Terminal } from "lucide-react";
import { SiteChrome } from "@/components/marketing/SiteChrome";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — Nucleus Enterprise Search" },
      {
        name: "description",
        content:
          "Quickstart, connector setup, RLS policy design and the Nucleus search API reference for self-hosted enterprise AI search.",
      },
      { property: "og:title", content: "Documentation — Nucleus Enterprise Search" },
      { property: "og:description", content: "Quickstart, connectors, RLS policies and API reference." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocsPage,
});

const sections = [
  {
    id: "quickstart",
    icon: Rocket,
    title: "Quickstart",
    body: "Run Nucleus locally with Docker Compose, point it at a Postgres 16 instance with pgvector, and index your first space in under ten minutes.",
    code: `docker compose up -d
nucleus init --tenant acme_corp
nucleus connect confluence --space ENG
nucleus index --watch`,
  },
  {
    id: "connectors",
    icon: BookOpen,
    title: "Connectors",
    body: "Each connector declares a scope, a crawl schedule and an ACL resolver. The resolver maps source-native groups onto Nucleus acl_group values written next to every chunk.",
    code: `# nucleus.yaml
connectors:
  - type: slack
    scopes: [channels:history, groups:history]
    acl_resolver: slack_channel_members
    schedule: "*/5 * * * *"`,
  },
  {
    id: "rls",
    icon: Terminal,
    title: "RLS policies",
    body: "Retrieval is filtered by Postgres row-level security so no application bug can widen access. Policies read group claims from the caller's JWT.",
    code: `create policy "read own groups"
on public.chunks for select
to authenticated
using (acl_group = any (
  current_setting('request.jwt.claims', true)::jsonb -> 'groups'
));`,
  },
  {
    id: "api",
    icon: Code2,
    title: "Search API",
    body: "One endpoint returns a grounded answer plus the citations that survived RLS. The bearer token defines what can be retrieved.",
    code: `POST /v1/search
Authorization: Bearer <user-token>

{ "query": "incident severity ladder",
  "filters": { "source": ["docs", "slack"] },
  "top_k": 8 }`,
  },
];

function DocsPage() {
  const [active, setActive] = useState(sections[0]!.id);

  return (
    <SiteChrome>
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-20">
        <h1 className="font-display text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
          Nucleus <span className="text-gradient-hot">documentation</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Everything needed to deploy permission-aware search in your own infrastructure.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-24 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav className="h-max rounded-2xl border-2 border-ink bg-card p-3 shadow-[6px_6px_0_0_var(--ink)] lg:sticky lg:top-24">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => setActive(s.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${
                active === s.id
                  ? "bg-gradient-to-r from-indigo-glow/15 to-fuchsia-glow/15 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <s.icon className="size-4 text-indigo-glow" />
              {s.title}
            </a>
          ))}
        </nav>

        <div className="space-y-6">
          {sections.map((s) => (
            <article
              key={s.id}
              id={s.id}
              className="scroll-mt-24 rounded-2xl border-2 border-ink bg-card p-7 shadow-[8px_8px_0_0_var(--ink)]"
            >
              <h2 className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-foreground">
                <s.icon className="size-5 text-fuchsia-glow" />
                {s.title}
              </h2>
              <p className="mt-2.5 text-sm text-muted-foreground">{s.body}</p>
              <pre className="mt-4 overflow-x-auto rounded-xl border-2 border-ink bg-ink p-4 font-mono text-xs leading-relaxed text-primary-foreground">
                {s.code}
              </pre>
            </article>
          ))}

          <div className="rounded-2xl border-2 border-ink bg-card p-7 shadow-[8px_8px_0_0_var(--ink)]">
            <h2 className="font-display text-lg font-extrabold text-foreground">Next steps</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="rounded-xl border-2 border-ink bg-gradient-to-r from-indigo-glow via-fuchsia-glow to-orange-glow px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow-[4px_4px_0_0_var(--ink)]"
              >
                Create a workspace
              </Link>
              <Link
                to="/contact"
                className="rounded-xl border-2 border-ink bg-card px-5 py-2.5 text-sm font-extrabold text-foreground shadow-[4px_4px_0_0_var(--ink)]"
              >
                Talk to an engineer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
