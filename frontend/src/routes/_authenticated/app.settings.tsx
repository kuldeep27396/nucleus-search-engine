import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Mail, Plus, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/nucleus/PageShell";
import { useConsole } from "@/components/nucleus/console-context";
import { roleLabels } from "@/lib/rbac";

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Nucleus Workspace" },
      {
        name: "description",
        content:
          "Manage your Nucleus profile, workspace members, role assignments, SSO and data residency settings.",
      },
      { property: "og:title", content: "Settings — Nucleus Workspace" },
      { property: "og:description", content: "Workspace, members and security settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

const tabs = ["Profile", "Members", "Security", "Billing"] as const;

const members = [
  { email: "priya@acme.com", role: "eng_lead", status: "active" },
  { email: "dana@acme.com", role: "hr_manager", status: "active" },
  { email: "sam@acme.com", role: "admin", status: "active" },
  { email: "leo@acme.com", role: "intern", status: "invited" },
];

function SettingsPage() {
  const { email, accountRole, isAdmin, enterprise, openLicense } = useConsole();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Profile");
  const [name, setName] = useState("");
  const [invite, setInvite] = useState("");

  return (
    <PageShell
      title="Settings"
      description="Your profile, workspace membership and security posture."
    >
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl border-2 border-ink px-4 py-2 text-sm font-bold transition-transform ${
              tab === t
                ? "bg-gradient-to-r from-indigo-glow to-fuchsia-glow text-primary-foreground shadow-[4px_4px_0_0_var(--ink)]"
                : "bg-card text-muted-foreground hover:-translate-y-0.5 hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Profile" && (
        <div className="bold-panel max-w-2xl space-y-4 p-6">
          <div>
            <label className="text-xs font-bold text-foreground">Email</label>
            <input
              readOnly
              value={email}
              className="mt-1.5 w-full rounded-xl border-2 border-ink bg-muted px-3.5 py-2.5 text-sm text-muted-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-foreground">Display name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How your name appears in shared answers"
              className="mt-1.5 w-full rounded-xl border-2 border-ink bg-card px-3.5 py-2.5 text-sm text-foreground shadow-[4px_4px_0_0_var(--ink)] outline-none focus:translate-y-0.5 focus:shadow-[2px_2px_0_0_var(--ink)]"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-foreground">Role</label>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border-2 border-ink bg-muted px-3.5 py-2.5 text-sm">
              <ShieldCheck className="size-4 text-emerald-glow" />
              <span className="text-foreground">{roleLabels[accountRole]}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">
                Derived from your identity token
              </span>
            </div>
          </div>
          <button
            onClick={() => toast.success("Profile saved")}
            className="rounded-xl border-2 border-ink bg-gradient-to-r from-indigo-glow via-fuchsia-glow to-orange-glow px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--ink)]"
          >
            Save changes
          </button>
        </div>
      )}

      {tab === "Members" && (
        <div className="space-y-4">
          <div className="bold-panel flex flex-wrap items-end gap-3 p-5">
            <div className="min-w-[16rem] flex-1">
              <label className="text-xs font-bold text-foreground">Invite teammate</label>
              <input
                value={invite}
                onChange={(e) => setInvite(e.target.value)}
                placeholder="name@acme.com"
                className="mt-1.5 w-full rounded-xl border-2 border-ink bg-card px-3.5 py-2.5 text-sm text-foreground shadow-[4px_4px_0_0_var(--ink)] outline-none focus:translate-y-0.5 focus:shadow-[2px_2px_0_0_var(--ink)]"
              />
            </div>
            <button
              onClick={() => {
                if (!isAdmin) {
                  toast.error("Only workspace admins can invite members");
                  return;
                }
                if (!invite.includes("@")) {
                  toast.error("Enter a valid work email");
                  return;
                }
                toast.success(`Invitation sent to ${invite}`);
                setInvite("");
              }}
              className="flex items-center gap-2 rounded-xl border-2 border-ink bg-card px-4 py-2.5 text-sm font-bold text-foreground shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--ink)]"
            >
              <Plus className="size-4" /> Invite
            </button>
          </div>

          <div className="bold-panel overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b-2 border-ink bg-muted/50">
                <tr className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.email} className="border-b border-hairline last:border-0">
                    <td className="flex items-center gap-2 px-4 py-3">
                      <Users className="size-4 text-muted-foreground" />
                      <span className="text-foreground">{m.email}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-purple-glow">{m.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          m.status === "active"
                            ? "border-emerald-glow/50 bg-emerald-glow/10 text-emerald-glow"
                            : "border-amber-glow/50 bg-amber-glow/10 text-amber-glow"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          isAdmin
                            ? toast.info(`Manage role for ${m.email}`)
                            : toast.error("Only workspace admins can change roles")
                        }
                        className="rounded-lg border border-hairline px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Security" && (
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              icon: KeyRound,
              t: "SAML / OIDC single sign-on",
              d: "Federate with Okta, Entra ID or Google Workspace. Group claims map straight to ACLs.",
              cta: enterprise ? "Configure" : "Enterprise only",
            },
            {
              icon: ShieldCheck,
              t: "Row-level security policies",
              d: "Every retrieval is filtered by acl_group membership resolved from the caller's token.",
              cta: "View policies",
            },
            {
              icon: Mail,
              t: "Audit alerting",
              d: "Email or webhook alerts on spikes in RLS denials or unusual query volume.",
              cta: "Set thresholds",
            },
            {
              icon: Users,
              t: "Data residency",
              d: "Pin your index and embeddings to us-east-1, eu-west-1 or ap-south-1.",
              cta: enterprise ? "Change region" : "Enterprise only",
            },
          ].map((c) => (
            <div key={c.t} className="bold-panel p-5">
              <c.icon className="size-5 text-indigo-glow" />
              <h3 className="mt-3 font-display text-base font-bold text-foreground">{c.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{c.d}</p>
              <button
                onClick={() =>
                  c.cta.includes("Enterprise") ? openLicense() : toast.info(`${c.t} — demo only`)
                }
                className="mt-4 rounded-lg border-2 border-ink bg-card px-3 py-2 text-xs font-bold text-foreground shadow-[3px_3px_0_0_var(--ink)] transition-transform hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--ink)]"
              >
                {c.cta}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "Billing" && (
        <div className="bold-panel max-w-2xl p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full border-2 border-ink bg-card px-3 py-1 text-xs font-bold">
              {enterprise ? "Enterprise" : "Community"}
            </span>
            <span className="text-sm text-muted-foreground">
              {enterprise ? "Unlimited queries · 7-year audit retention" : "500 queries / month"}
            </span>
          </div>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            <li>Seats in use: 24</li>
            <li>Indexed objects: 106,563</li>
            <li>Next invoice: {enterprise ? "Sep 1, 2026 · $4,800" : "—"}</li>
          </ul>
          <button
            onClick={() => (enterprise ? toast.info("Invoices emailed to billing@acme.com") : openLicense())}
            className="mt-6 rounded-xl border-2 border-ink bg-gradient-to-r from-indigo-glow via-fuchsia-glow to-orange-glow px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--ink)]"
          >
            {enterprise ? "View invoices" : "Activate Enterprise license"}
          </button>
        </div>
      )}
    </PageShell>
  );
}
