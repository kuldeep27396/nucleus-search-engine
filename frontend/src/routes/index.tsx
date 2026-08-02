import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/marketing/SiteChrome";
import { motion } from "motion/react";
import {
  Atom,
  ArrowRight,
  Cable,
  Check,
  Cpu,
  Database,
  Lock,
  ScrollText,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nucleus — Self-Hosted Enterprise AI Search" },
      {
        name: "description",
        content:
          "Nucleus is the self-hosted Glean alternative: grounded AI answers across Confluence, Slack, Jira and code — secured by Postgres row-level security and SOC2 audit logs, inside your own VPC.",
      },
      { property: "og:title", content: "Nucleus — Self-Hosted Enterprise AI Search" },
      {
        property: "og:description",
        content:
          "Grounded answers over your internal knowledge, with permission-aware retrieval and SOC2 audit logging in your own cloud.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const accents = [
  { chip: "bg-indigo-glow", tint: "hover:bg-indigo-glow/8", text: "text-indigo-glow" },
  { chip: "bg-fuchsia-glow", tint: "hover:bg-fuchsia-glow/8", text: "text-fuchsia-glow" },
  { chip: "bg-orange-glow", tint: "hover:bg-orange-glow/10", text: "text-orange-glow" },
  { chip: "bg-cyan-glow", tint: "hover:bg-cyan-glow/8", text: "text-cyan-glow" },
  { chip: "bg-emerald-glow", tint: "hover:bg-emerald-glow/8", text: "text-emerald-glow" },
  { chip: "bg-purple-glow", tint: "hover:bg-purple-glow/8", text: "text-purple-glow" },
] as const;

const features = [
  {
    icon: Search,
    title: "Hybrid retrieval",
    body: "BM25 lexical recall fused with pgvector ANN through Reciprocal Rank Fusion, then reranked by a cross-encoder.",
  },
  {
    icon: ShieldCheck,
    title: "Permission-aware by design",
    body: "Row-level security runs inside Postgres, so documents outside your ACL never reach the retriever — or the model.",
  },
  {
    icon: Cpu,
    title: "Grounded answers only",
    body: "Every sentence carries an inline citation back to the source chunk. No citation, no claim.",
  },
  {
    icon: Cable,
    title: "40+ connectors",
    body: "Confluence, Slack, Jira, GitHub, Drive, Notion and Salesforce sync incrementally with per-object permissions.",
  },
  {
    icon: ScrollText,
    title: "SOC2 audit inspector",
    body: "Every query, identity, RLS predicate and returned document ID is written to an immutable audit ledger.",
  },
  {
    icon: Database,
    title: "Runs in your VPC",
    body: "Single Helm chart, your Postgres, your object storage. No document ever leaves your network boundary.",
  },
];

const plans = [
  {
    name: "Community",
    price: "Free",
    note: "Self-hosted, single tenant",
    perks: ["500 queries / month", "3 connectors", "30-day audit retention", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Enterprise",
    price: "$24",
    note: "per seat / month, billed annually",
    perks: [
      "Unlimited queries & tenants",
      "All 40+ connectors",
      "7-year immutable audit retention",
      "SAML SSO, SCIM & custom RBAC",
      "99.9% SLA and named support",
    ],
    cta: "Book a demo",
    highlight: true,
  },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="grid-backdrop absolute inset-0 opacity-60 [mask-image:radial-gradient(75%_55%_at_50%_0%,#000,transparent)]" />
        <div className="absolute -top-40 -left-24 size-[36rem] rounded-full bg-fuchsia-glow/25 blur-[130px]" />
        <div className="absolute -top-52 right-0 size-[34rem] rounded-full bg-cyan-glow/25 blur-[130px]" />
        <div className="absolute top-[38%] left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-orange-glow/12 blur-[150px]" />
      </div>

      <header className="sticky top-0 z-40 border-b-2 border-ink bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3.5">
          <span className="flex size-9 items-center justify-center rounded-xl border-2 border-ink bg-gradient-to-br from-indigo-glow to-fuchsia-glow">
            <Atom className="size-4.5 text-primary-foreground" />
          </span>
          <span className="font-display text-base font-extrabold tracking-tight text-foreground">
            Nucleus
          </span>
          <nav className="ml-6 hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex">
            <a href="#platform" className="transition-colors hover:text-indigo-glow">
              Platform
            </a>
            <Link to="/security" className="transition-colors hover:text-fuchsia-glow">
              Security
            </Link>
            <Link to="/pricing" className="transition-colors hover:text-orange-glow">
              Pricing
            </Link>
            <Link to="/docs" className="transition-colors hover:text-cyan-glow">
              Docs
            </Link>
            <Link to="/contact" className="transition-colors hover:text-indigo-glow">
              Contact
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/auth"
              className="rounded-xl px-3.5 py-2 text-sm font-bold text-foreground transition-colors hover:bg-accent"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="bold-shadow-brand flex items-center gap-1.5 rounded-xl border-2 border-ink bg-ink px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              Get started
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-20 text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-indigo-glow/30 bg-indigo-glow/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-indigo-glow">
              <Sparkles className="size-3" />
              SOC2 Type II · Self-hosted · Postgres RLS
            </span>
            <h1 className="mx-auto mt-7 max-w-4xl font-display text-5xl font-extrabold leading-[0.95] tracking-tighter text-foreground sm:text-7xl">
              The <span className="text-gradient-hot">search engine</span>
              <br />
              for enterprise data
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base font-medium text-muted-foreground sm:text-lg">
              Nucleus is the self-hosted alternative to Glean. It indexes your docs, Slack, Jira and
              code, and answers questions with citations — filtered by row-level security so people
              only ever see what their role allows.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/auth"
                className="bold-shadow-brand flex items-center gap-2 rounded-xl border-2 border-ink bg-ink px-7 py-3.5 text-sm font-extrabold text-primary-foreground"
              >
                Start free workspace
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#platform"
                className="rounded-xl border-2 border-ink bg-card px-7 py-3.5 text-sm font-extrabold text-foreground transition-colors hover:bg-accent"
              >
                See how retrieval works
              </a>
            </div>
            <p className="mt-5 text-xs font-medium text-muted-foreground">
              No credit card · Deploys with one Helm chart · Your data never leaves your VPC
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="relative mx-auto mt-16 max-w-4xl"
          >
            <div className="absolute -inset-3 -rotate-1 rounded-[2.5rem] bg-gradient-to-tr from-cyan-glow via-fuchsia-glow to-orange-glow opacity-20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border-2 border-ink bg-card text-left shadow-[14px_14px_0_0_var(--ink)]">
              <div className="flex items-center gap-2 border-b-2 border-ink bg-ink px-4 py-3">
                <span className="size-3 rounded-full bg-orange-glow" />
                <span className="size-3 rounded-full bg-amber-glow" />
                <span className="size-3 rounded-full bg-emerald-glow" />
                <span className="ml-3 font-mono text-[11px] text-primary-foreground/70">
                  nucleus.acme.internal
                </span>
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-center gap-2 rounded-xl border-2 border-ink bg-surface px-4 py-3 text-sm font-semibold text-foreground">
                  <Search className="size-4 text-indigo-glow" />
                  What is our on-call escalation policy for Sev1 incidents?
                  <kbd className="ml-auto rounded border-2 border-hairline bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    ⌘K
                  </kbd>
                </div>
                <div className="rounded-xl border-2 border-indigo-glow/25 bg-indigo-glow/6 p-4 text-sm leading-relaxed text-foreground">
                  Sev1 pages the primary on-call within 5 minutes and auto-escalates to the
                  engineering lead after 15
                  <sup className="ml-0.5 rounded bg-indigo-glow/15 px-1 font-mono text-[10px] text-indigo-glow">
                    1
                  </sup>
                  . A public incident channel is opened automatically
                  <sup className="ml-0.5 rounded bg-fuchsia-glow/15 px-1 font-mono text-[10px] text-fuchsia-glow">
                    2
                  </sup>
                  .
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="rounded-full border-2 border-emerald-glow/35 bg-emerald-glow/10 px-2.5 py-1 text-emerald-glow">
                    4 documents retrieved
                  </span>
                  <span className="rounded-full border-2 border-orange-glow/40 bg-orange-glow/12 px-2.5 py-1 text-orange-glow">
                    2 filtered by RLS
                  </span>
                  <span className="rounded-full border-2 border-hairline bg-surface px-2.5 py-1 font-mono text-muted-foreground">
                    184ms p95
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-45">
            {["NORTHWIND", "GLOBEX", "INITECH", "UMBRELLA", "SOYLENT"].map((c) => (
              <span
                key={c}
                className="font-display text-base font-black tracking-[0.2em] text-foreground"
              >
                {c}
              </span>
            ))}
          </div>
        </section>

        <section id="platform" className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="max-w-3xl font-display text-3xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
            One index. Every source.{" "}
            <span className="text-gradient-hot">Zero permission leaks.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-base font-medium text-muted-foreground">
            Retrieval and authorization are the same operation in Nucleus — not two systems you hope
            stay in sync.
          </p>
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const a = accents[i % accents.length]!;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.06 }}
                  className={`bold-card bold-card-lift p-7 ${a.tint}`}
                >
                  <div
                    className={`flex size-12 items-center justify-center rounded-xl border-2 border-ink ${a.chip}`}
                  >
                    <f.icon className="size-5.5 text-primary-foreground" />
                  </div>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className={`font-mono text-xs font-black ${a.text}`}>
                      0{i + 1}
                    </span>
                    <h3 className="font-display text-lg font-extrabold text-foreground">
                      {f.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                    {f.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section id="security" className="mx-auto max-w-6xl px-5 py-20">
          <div className="bold-card grid gap-10 p-8 lg:grid-cols-2 lg:p-12">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-glow/35 bg-emerald-glow/10 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-emerald-glow">
                <Lock className="size-3" />
                Security posture
              </span>
              <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tighter text-foreground">
                Role-based access, enforced at the row
              </h2>
              <p className="mt-4 text-sm font-medium leading-relaxed text-muted-foreground">
                Your access level is resolved from your signed identity token on every request and
                pushed straight into a Postgres RLS predicate. The application layer cannot widen
                it, and neither can a prompt.
              </p>
              <ul className="mt-6 space-y-3 text-sm font-medium">
                {[
                  "Roles stored separately from profiles — no privilege escalation surface",
                  "Immutable audit ledger with query, identity and RLS predicate",
                  "SAML SSO, SCIM provisioning and custom role mapping",
                  "Data residency in your own cloud account",
                ].map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-muted-foreground">
                    <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-glow">
                      <Check className="size-3 text-primary-foreground" />
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-ink bg-surface p-6">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-foreground">
                <Users className="size-4 text-fuchsia-glow" />
                Visibility by role
              </div>
              <div className="mt-5 space-y-3">
                {(
                  [
                    ["Intern", "Handbooks, public docs", "1 ACL group", "border-l-cyan-glow"],
                    [
                      "Engineering Lead",
                      "+ architecture, incidents, repos",
                      "2 ACL groups",
                      "border-l-indigo-glow",
                    ],
                    [
                      "HR Manager",
                      "+ compensation, people records",
                      "2 ACL groups",
                      "border-l-fuchsia-glow",
                    ],
                    [
                      "Workspace Admin",
                      "Everything + role administration",
                      "3 ACL groups",
                      "border-l-orange-glow",
                    ],
                  ] as const
                ).map(([role, scope, acl, bar]) => (
                  <div
                    key={role}
                    className={`rounded-xl border-2 border-l-8 border-ink bg-card px-4 py-3 text-xs ${bar}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-foreground">{role}</span>
                      <span className="shrink-0 font-mono text-[10px] font-bold text-muted-foreground">
                        {acl}
                      </span>
                    </div>
                    <p className="mt-1 font-medium text-muted-foreground">{scope}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-5xl px-5 py-20">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
            Straightforward pricing
          </h2>
          <p className="mt-3 text-center text-base font-medium text-muted-foreground">
            Start free on your own infrastructure. Upgrade when compliance asks.
          </p>
          <div className="mt-12 grid gap-7 md:grid-cols-2">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-3xl border-2 border-ink p-8 ${
                  p.highlight
                    ? "bg-gradient-to-br from-indigo-glow via-purple-glow to-fuchsia-glow text-primary-foreground shadow-[10px_10px_0_0_var(--ink)]"
                    : "bg-card shadow-[8px_8px_0_0_var(--ink)]"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3.5 right-6 rounded-full border-2 border-ink bg-orange-glow px-3 py-1 text-[10px] font-black uppercase tracking-wider text-ink">
                    Most popular
                  </span>
                )}
                <h3
                  className={`font-display text-sm font-black uppercase tracking-[0.18em] ${
                    p.highlight ? "text-primary-foreground/80" : "text-indigo-glow"
                  }`}
                >
                  {p.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-extrabold tracking-tighter">
                    {p.price}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      p.highlight ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {p.note}
                  </span>
                </div>
                <ul className="mt-7 space-y-3 text-sm font-medium">
                  {p.perks.map((perk) => (
                    <li
                      key={perk}
                      className={`flex items-start gap-2.5 ${
                        p.highlight ? "text-primary-foreground/90" : "text-muted-foreground"
                      }`}
                    >
                      <Check
                        className={`mt-0.5 size-4 shrink-0 ${
                          p.highlight ? "text-primary-foreground" : "text-emerald-glow"
                        }`}
                      />
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className={`mt-8 flex items-center justify-center rounded-xl border-2 border-ink px-4 py-3 text-sm font-extrabold transition-transform hover:translate-y-0.5 ${
                    p.highlight ? "bg-card text-foreground" : "bg-ink text-primary-foreground"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-24">
          <div className="relative overflow-hidden rounded-3xl border-2 border-ink bg-ink p-10 shadow-[10px_10px_0_0_var(--indigo-glow)]">
            <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-fuchsia-glow/40 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-24 left-10 size-64 rounded-full bg-cyan-glow/30 blur-[90px]" />
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tighter text-primary-foreground sm:text-3xl">
                  Ready to search your company's brain?
                </h2>
                <p className="mt-2 text-sm font-medium text-primary-foreground/70">
                  Spin up a workspace in under a minute — no credit card required.
                </p>
              </div>
              <Link
                to="/auth"
                className="flex items-center gap-2 rounded-xl border-2 border-card bg-card px-6 py-3.5 text-sm font-extrabold text-foreground transition-transform hover:translate-y-0.5"
              >
                Create free workspace
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
