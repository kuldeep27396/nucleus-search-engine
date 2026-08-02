import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, CheckCircle2, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { SiteChrome } from "@/components/marketing/SiteChrome";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Sales — Nucleus" },
      {
        name: "description",
        content:
          "Book a Nucleus demo, request a SOC 2 report, or talk to an engineer about self-hosting permission-aware enterprise search in your VPC.",
      },
      { property: "og:title", content: "Contact Sales — Nucleus" },
      { property: "og:description", content: "Book a demo or request a security review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const topics = ["Book a demo", "Security review", "Self-hosting", "Pricing question"];

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", topic: topics[0]!, message: "" });

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.includes("@") || !form.name.trim()) {
      toast.error("Add your name and a valid work email");
      return;
    }
    setSent(true);
    toast.success("Thanks — we'll reply within one business day.");
  };

  return (
    <SiteChrome>
      <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-24 pt-20 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
            Talk to <span className="text-gradient-hot">Nucleus</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Tell us about your knowledge stack and compliance needs. A solutions engineer — not a
            chatbot — replies within one business day.
          </p>

          {sent ? (
            <div className="mt-8 rounded-2xl border-2 border-ink bg-card p-8 shadow-[8px_8px_0_0_var(--emerald-glow)]">
              <CheckCircle2 className="size-8 text-emerald-glow" />
              <h2 className="mt-3 font-display text-xl font-extrabold text-foreground">
                Request received
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a confirmation to {form.email}. Expect a reply about “{form.topic}” shortly.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-5 rounded-xl border-2 border-ink bg-card px-4 py-2.5 text-sm font-bold text-foreground shadow-[4px_4px_0_0_var(--ink)]"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="mt-8 space-y-4 rounded-2xl border-2 border-ink bg-card p-7 shadow-[8px_8px_0_0_var(--ink)]"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <input
                    value={form.name}
                    onChange={set("name")}
                    className={inputCls}
                    placeholder="Alex Rivera"
                  />
                </Field>
                <Field label="Work email">
                  <input
                    value={form.email}
                    onChange={set("email")}
                    className={inputCls}
                    placeholder="alex@company.com"
                  />
                </Field>
                <Field label="Company">
                  <input
                    value={form.company}
                    onChange={set("company")}
                    className={inputCls}
                    placeholder="Acme Corp"
                  />
                </Field>
                <Field label="Topic">
                  <select value={form.topic} onChange={set("topic")} className={inputCls}>
                    {topics.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="What are you trying to solve?">
                <textarea
                  value={form.message}
                  onChange={set("message")}
                  rows={5}
                  className={inputCls}
                  placeholder="We have 40k Confluence pages and strict HR data separation…"
                />
              </Field>
              <button
                type="submit"
                className="rounded-xl border-2 border-ink bg-gradient-to-r from-indigo-glow via-fuchsia-glow to-orange-glow px-6 py-3 text-sm font-extrabold text-primary-foreground shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--ink)]"
              >
                Send message
              </button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          {[
            { icon: CalendarClock, t: "30-minute demo", d: "Live walkthrough of RLS-filtered retrieval on your use case." },
            { icon: Mail, t: "security@nucleus.dev", d: "SOC 2 report, pen-test summary and DPA requests." },
            { icon: MessageSquare, t: "Community Slack", d: "2,400 engineers running self-hosted Nucleus." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border-2 border-ink bg-card p-5 shadow-[6px_6px_0_0_var(--ink)]">
              <c.icon className="size-5 text-indigo-glow" />
              <h2 className="mt-2.5 font-display text-sm font-extrabold text-foreground">{c.t}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </aside>
      </section>
    </SiteChrome>
  );
}

const inputCls =
  "w-full rounded-xl border-2 border-ink bg-background px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:shadow-[3px_3px_0_0_var(--ink)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-foreground">{label}</span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}
