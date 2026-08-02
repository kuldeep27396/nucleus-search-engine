import { createFileRoute } from "@tanstack/react-router";
import { SiteChrome } from "@/components/marketing/SiteChrome";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Nucleus" },
      {
        name: "description",
        content:
          "The terms covering Nucleus workspaces: acceptable use, uptime commitments, fees, and termination for self-hosted and cloud plans.",
      },
      { property: "og:title", content: "Terms of Service — Nucleus" },
      { property: "og:description", content: "Acceptable use, SLA, fees and termination." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

const sections = [
  { t: "1. Your workspace", b: "You are responsible for the accounts you invite and the sources you connect. Access decisions follow the permissions your connected systems report." },
  { t: "2. Acceptable use", b: "No reverse engineering, resale of the retrieval API, or use to circumvent access controls in your own organization." },
  { t: "3. Fees", b: "Team plans bill per active seat monthly or annually in advance. Enterprise pricing follows the order form. Invoices are due net 30." },
  { t: "4. Service levels", b: "Enterprise includes a 99.9% monthly uptime commitment with service credits. Community and Team are provided as-is." },
  { t: "5. Termination", b: "Either party may terminate for material breach with 30 days' notice to cure. On termination you may export all workspace data for 30 days." },
  { t: "6. Liability", b: "Aggregate liability is capped at the fees paid in the twelve months preceding the claim, except for willful misconduct." },
];

function TermsPage() {
  return (
    <SiteChrome>
      <section className="mx-auto max-w-3xl px-5 pb-24 pt-20">
        <h1 className="font-display text-4xl font-extrabold tracking-tighter text-foreground">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Effective August 2, 2026</p>
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
