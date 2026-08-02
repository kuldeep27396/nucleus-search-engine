import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { SiteChrome } from "@/components/marketing/SiteChrome";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Nucleus Enterprise AI Search" },
      {
        name: "description",
        content:
          "Transparent Nucleus pricing: free Community edition, per-seat Team plan and self-hosted Enterprise with SSO, RLS and 7-year audit retention.",
      },
      { property: "og:title", content: "Pricing — Nucleus Enterprise AI Search" },
      {
        property: "og:description",
        content: "Community, Team and Enterprise plans for permission-aware enterprise search.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Community",
    monthly: 0,
    yearly: 0,
    blurb: "For small teams evaluating permission-aware search.",
    features: ["500 queries / month", "3 connectors", "30-day audit history", "Community support"],
    cta: "Start free",
  },
  {
    name: "Team",
    monthly: 24,
    yearly: 20,
    blurb: "For growing companies that live inside their docs.",
    features: [
      "Unlimited queries",
      "12 connectors",
      "1-year audit history",
      "Role-based access control",
      "Email support, 1 business day",
    ],
    cta: "Start 14-day trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    monthly: null,
    yearly: null,
    blurb: "Self-hosted in your VPC, with your compliance requirements.",
    features: [
      "Everything in Team",
      "Unlimited connectors + custom",
      "7-year audit retention & SIEM export",
      "SAML / OIDC SSO and SCIM",
      "Data residency + 99.9% SLA",
    ],
    cta: "Book a demo",
  },
];

const matrix = [
  { f: "Hybrid BM25 + vector retrieval", c: [true, true, true] },
  { f: "Grounded answers with citations", c: [true, true, true] },
  { f: "Row-level security enforcement", c: [true, true, true] },
  { f: "Admin role preview", c: [false, true, true] },
  { f: "SSO (SAML / OIDC) + SCIM", c: [false, false, true] },
  { f: "Self-hosted in your VPC", c: [false, false, true] },
  { f: "SIEM audit streaming", c: [false, false, true] },
];

const faqs = [
  {
    q: "How is a query counted?",
    a: "One counted query is a single search that returns a grounded answer. Follow-up citations, filters and re-ranks on the same result set are free.",
  },
  {
    q: "Do you train on our data?",
    a: "Never. Embeddings and indexes stay in your tenant, and Enterprise runs entirely inside your own VPC.",
  },
  {
    q: "Can we switch plans mid-cycle?",
    a: "Yes. Upgrades are prorated instantly, downgrades apply at the next renewal date.",
  },
];

function PricingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <SiteChrome>
      <section className="mx-auto max-w-6xl px-5 pb-14 pt-20 text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
          Pricing that scales with <span className="text-gradient-hot">your knowledge base</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
          Start free, grow into per-seat, and self-host when compliance demands it. No retrieval
          surprises, no per-document indexing fees.
        </p>

        <div className="mt-8 inline-flex rounded-xl border-2 border-ink bg-card p-1 shadow-[4px_4px_0_0_var(--ink)]">
          {[
            { k: "Monthly", v: false },
            { k: "Yearly · save 17%", v: true },
          ].map((o) => (
            <button
              key={o.k}
              onClick={() => setYearly(o.v)}
              className={`rounded-lg px-4 py-2 text-sm font-bold ${
                yearly === o.v
                  ? "bg-gradient-to-r from-indigo-glow to-fuchsia-glow text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {o.k}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`flex flex-col rounded-2xl border-2 border-ink p-7 ${
              p.highlight
                ? "bg-ink text-primary-foreground shadow-[10px_10px_0_0_var(--fuchsia-glow)]"
                : "bg-card shadow-[8px_8px_0_0_var(--ink)]"
            }`}
          >
            <h2 className="font-display text-lg font-extrabold">{p.name}</h2>
            <p className={`mt-1 text-sm ${p.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {p.blurb}
            </p>
            <div className="mt-5 font-display text-4xl font-extrabold tracking-tighter">
              {p.monthly === null ? "Custom" : p.monthly === 0 ? "$0" : `$${yearly ? p.yearly : p.monthly}`}
              {p.monthly ? (
                <span className={`text-sm font-bold ${p.highlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  /seat/mo
                </span>
              ) : null}
            </div>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className={`mt-0.5 size-4 shrink-0 ${p.highlight ? "text-cyan-glow" : "text-emerald-glow"}`} />
                  <span className={p.highlight ? "text-primary-foreground/85" : "text-muted-foreground"}>
                    {f}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to={p.name === "Enterprise" ? "/contact" : "/auth"}
              className={`mt-7 rounded-xl border-2 px-4 py-3 text-center text-sm font-extrabold transition-transform hover:translate-y-0.5 ${
                p.highlight
                  ? "border-card bg-card text-foreground"
                  : "border-ink bg-gradient-to-r from-indigo-glow via-fuchsia-glow to-orange-glow text-primary-foreground shadow-[4px_4px_0_0_var(--ink)]"
              }`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-20">
        <h2 className="font-display text-2xl font-extrabold tracking-tighter text-foreground">
          Compare plans
        </h2>
        <div className="mt-5 overflow-x-auto rounded-2xl border-2 border-ink bg-card shadow-[8px_8px_0_0_var(--ink)]">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b-2 border-ink bg-muted/50">
              <tr className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Capability</th>
                <th className="px-5 py-3 text-center">Community</th>
                <th className="px-5 py-3 text-center">Team</th>
                <th className="px-5 py-3 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.f} className="border-b border-hairline last:border-0">
                  <td className="px-5 py-3 text-foreground">{row.f}</td>
                  {row.c.map((on, i) => (
                    <td key={i} className="px-5 py-3 text-center">
                      {on ? (
                        <Check className="mx-auto size-4 text-emerald-glow" />
                      ) : (
                        <Minus className="mx-auto size-4 text-muted-foreground/50" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-24">
        <h2 className="font-display text-2xl font-extrabold tracking-tighter text-foreground">
          Pricing FAQ
        </h2>
        <div className="mt-5 space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="rounded-2xl border-2 border-ink bg-card p-5 shadow-[6px_6px_0_0_var(--ink)]"
            >
              <summary className="cursor-pointer font-display text-sm font-bold text-foreground">
                {f.q}
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </SiteChrome>
  );
}
