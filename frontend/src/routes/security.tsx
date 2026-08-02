import { createFileRoute, Link } from "@tanstack/react-router";
import { FileCheck2, Fingerprint, KeyRound, Lock, Network, ScrollText, ShieldCheck } from "lucide-react";
import { SiteChrome } from "@/components/marketing/SiteChrome";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security & Compliance — Nucleus" },
      {
        name: "description",
        content:
          "How Nucleus enforces row-level security, mirrors source ACLs, keeps an immutable SOC2 audit trail and runs fully inside your own VPC.",
      },
      { property: "og:title", content: "Security & Compliance — Nucleus" },
      {
        property: "og:description",
        content: "Permission-aware retrieval, immutable audit trail, self-hosted deployment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SecurityPage,
});

const pillars = [
  {
    icon: ShieldCheck,
    t: "Row-level security at read time",
    d: "Every retrieval runs as the caller. Postgres RLS policies evaluate acl_group membership from the identity token — there is no application-side filter to bypass.",
  },
  {
    icon: Network,
    t: "ACL mirroring on every crawl",
    d: "Connectors write source-native permissions alongside each chunk. Revoke access in Slack or Confluence and the next query reflects it within minutes.",
  },
  {
    icon: ScrollText,
    t: "Immutable audit trail",
    d: "Append-only, hash-chained events capture identity, query, predicate and returned document IDs. Stream to Splunk, Datadog or S3.",
  },
  {
    icon: KeyRound,
    t: "SSO and lifecycle",
    d: "SAML 2.0 and OIDC with SCIM provisioning. Group claims map directly to ACL groups, so deprovisioning is instant.",
  },
  {
    icon: Lock,
    t: "Encryption everywhere",
    d: "TLS 1.3 in transit, AES-256 at rest, per-tenant envelope keys with optional customer-managed KMS.",
  },
  {
    icon: Fingerprint,
    t: "No training on your data",
    d: "Embeddings and indexes never leave your tenant. Enterprise deployments run entirely inside your VPC with no egress to us.",
  },
];

const certs = ["SOC 2 Type II", "ISO 27001", "GDPR", "HIPAA ready", "Pen-tested annually"];

function SecurityPage() {
  return (
    <SiteChrome>
      <section className="mx-auto max-w-5xl px-5 pb-14 pt-20 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-glow/40 bg-emerald-glow/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-glow">
          <FileCheck2 className="size-3" /> Trust center
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
          Search that <span className="text-gradient-hot">can't leak</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
          Nucleus was built permissions-first. Access decisions happen in the database, on every
          single query, against the identity that asked.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {certs.map((c) => (
            <span
              key={c}
              className="rounded-full border-2 border-ink bg-card px-3.5 py-1.5 text-xs font-bold text-foreground shadow-[3px_3px_0_0_var(--ink)]"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 md:grid-cols-2 lg:grid-cols-3">
        {pillars.map((p) => (
          <div
            key={p.t}
            className="rounded-2xl border-2 border-ink bg-card p-6 shadow-[8px_8px_0_0_var(--ink)]"
          >
            <span className="flex size-10 items-center justify-center rounded-xl border-2 border-ink bg-gradient-to-br from-indigo-glow to-fuchsia-glow shadow-[3px_3px_0_0_var(--ink)]">
              <p.icon className="size-5 text-primary-foreground" />
            </span>
            <h2 className="mt-4 font-display text-base font-extrabold text-foreground">{p.t}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-20">
        <div className="rounded-2xl border-2 border-ink bg-card p-7 shadow-[8px_8px_0_0_var(--ink)]">
          <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">
            What a query actually does
          </h2>
          <ol className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            {[
              "Verify the bearer token and resolve the caller's role and group claims.",
              "Open a database session with those claims bound to the request.",
              "Run BM25 + pgvector recall, fused with Reciprocal Rank Fusion.",
              "Postgres RLS drops every chunk the caller cannot read — before rerank.",
              "Cross-encoder reranks only permitted chunks.",
              "Synthesize an answer that can only cite documents already authorized.",
            ].map((s, i) => (
              <li key={s} className="flex gap-3 rounded-xl border border-hairline bg-muted/40 p-3">
                <span className="font-mono text-xs font-bold text-fuchsia-glow">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-24 text-center">
        <h2 className="font-display text-2xl font-extrabold tracking-tighter text-foreground">
          Need our SOC 2 report or a security review?
        </h2>
        <Link
          to="/contact"
          className="mt-5 inline-block rounded-xl border-2 border-ink bg-gradient-to-r from-indigo-glow via-fuchsia-glow to-orange-glow px-6 py-3 text-sm font-extrabold text-primary-foreground shadow-[6px_6px_0_0_var(--ink)] transition-transform hover:translate-y-0.5"
        >
          Contact our security team
        </Link>
      </section>
    </SiteChrome>
  );
}
