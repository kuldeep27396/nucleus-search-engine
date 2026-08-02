import { createFileRoute } from "@tanstack/react-router";
import { SiteChrome } from "@/components/marketing/SiteChrome";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Nucleus" },
      {
        name: "description",
        content:
          "How Nucleus handles workspace data, embeddings, audit logs and subprocessors. We never train on customer content.",
      },
      { property: "og:title", content: "Privacy Policy — Nucleus" },
      { property: "og:description", content: "Data handling, retention and subprocessors." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    t: "What we store",
    b: "Account email, display name, workspace membership and role assignment. Indexed content and embeddings live in your tenant database and, for Enterprise, never leave your VPC.",
  },
  {
    t: "What we never do",
    b: "We do not train models on customer content, sell data, or grant employees standing access to your index. Support access is time-boxed and requires your written approval.",
  },
  {
    t: "Audit logs",
    b: "Query audit events are retained for 30 days on Community and up to 7 years on Enterprise. Events record identity, query text, the RLS predicate applied and returned document IDs.",
  },
  {
    t: "Subprocessors",
    b: "Cloud hosting, transactional email and error monitoring. The current list is available on request and updated with 30 days' notice before any change.",
  },
  {
    t: "Your rights",
    b: "Export or delete your workspace data at any time from Settings, or by emailing privacy@nucleus.dev. Deletion completes within 30 days including backups.",
  },
];

function PrivacyPage() {
  return (
    <SiteChrome>
      <section className="mx-auto max-w-3xl px-5 pb-24 pt-20">
        <h1 className="font-display text-4xl font-extrabold tracking-tighter text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated August 2, 2026</p>
        <div className="mt-8 space-y-4">
          {sections.map((s) => (
            <article
              key={s.t}
              className="rounded-2xl border-2 border-ink bg-card p-6 shadow-[6px_6px_0_0_var(--ink)]"
            >
              <h2 className="font-display text-base font-extrabold text-foreground">{s.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.b}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteChrome>
  );
}
