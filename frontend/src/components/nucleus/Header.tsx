import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouterState } from "@tanstack/react-router";
import {
  Atom,
  Building2,
  Check,
  ChevronDown,
  Eye,
  Lock,
  LogOut,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { personas, type Persona } from "@/data/nucleus";

const sectionLabels = {
  "/app": "Search",
  "/app/saved": "Saved answers",
  "/app/connectors": "Connectors",
  "/app/analytics": "Analytics",
  "/app/audit": "Audit logs",
  "/app/settings": "Settings",
} as const;


type Props = {
  persona: Persona;
  onPersonaChange: (p: Persona) => void;
  enterprise: boolean;
  onOpenLicense: () => void;
  onOpenAudit: () => void;
  email: string;
  roleLabel: string;
  canPreviewRoles: boolean;
  previewing: boolean;
  onResetPreview: () => void;
  onSignOut: () => void;
};

function useOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return ref;
}

export function Header({
  persona,
  onPersonaChange,
  enterprise,
  onOpenLicense,
  onOpenAudit,
  email,
  roleLabel,
  canPreviewRoles,
  previewing,
  onResetPreview,
  onSignOut,
}: Props) {
  const [tenantOpen, setTenantOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const tenantRef = useOutside(() => setTenantOpen(false));
  const personaRef = useOutside(() => setPersonaOpen(false));
  const userRef = useOutside(() => setUserOpen(false));
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sectionLabel =
    sectionLabels[pathname.replace(/\/$/, "") as keyof typeof sectionLabels] ?? "Search";


  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2.5 lg:hidden">
          <span className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-glow to-purple-glow shadow-sm">
            <Atom className="size-5 text-primary-foreground" />
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold tracking-tight text-gradient-brand">
              Nucleus Engine
            </div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Enterprise AI Search
            </span>
          </div>
        </div>
        <nav aria-label="Breadcrumb" className="hidden items-center gap-2 text-sm lg:flex">
          <span className="text-muted-foreground">Workspace</span>
          <span className="text-muted-foreground/50">/</span>
          <span className="font-medium text-foreground">{sectionLabel}</span>
          <span className="ml-1 rounded-full border border-cyan-glow/30 bg-cyan-glow/10 px-2.5 py-0.5 text-[11px] font-medium text-cyan-glow">
            VPC Self-Hosted
          </span>
        </nav>



        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* Tenant */}
          <div className="relative" ref={tenantRef}>
            <button
              onClick={() => setTenantOpen((v) => !v)}
              className="flex items-center gap-2 bold-pill px-3 py-2 text-sm text-foreground transition-transform hover:-translate-y-0.5"
            >
              <Building2 className="size-4 text-muted-foreground" />
              Acme Corp
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {tenantOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border-2 border-ink bg-popover p-1.5 shadow-2xl"
                >
                  {["Acme Corp", "Globex Industries", "Initech Labs"].map((t, i) => (
                    <div
                      key={t}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-popover-foreground hover:bg-accent"
                    >
                      <span>{t}</span>
                      {i === 0 ? (
                        <Check className="size-4 text-emerald-glow" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground">isolated</span>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Effective role / admin role preview */}
          <div className="relative" ref={personaRef}>
            <button
              onClick={() => setPersonaOpen((v) => !v)}
              title={
                canPreviewRoles
                  ? "Preview the workspace as another role"
                  : "Your access level comes from your identity token"
              }
              className="flex items-center gap-2 bold-pill bg-gradient-to-r from-indigo-glow/15 to-fuchsia-glow/15 px-3 py-2 text-sm text-foreground transition-transform hover:-translate-y-0.5"
            >
              <span>{persona.emoji}</span>
              {persona.label}
              <code className="hidden rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                {persona.role}
              </code>
              {canPreviewRoles ? (
                <ChevronDown className="size-3.5 text-muted-foreground" />
              ) : (
                <Lock className="size-3 text-muted-foreground" />
              )}
            </button>
            <AnimatePresence>
              {personaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border-2 border-ink bg-popover p-1.5 shadow-2xl"
                >
                  <p className="px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                    Signed in as <span className="text-foreground">{roleLabel}</span>.{" "}
                    {canPreviewRoles
                      ? "Admins can preview retrieval as another role."
                      : "Only a workspace admin can change or preview roles."}
                  </p>
                  {personas.map((p) => (
                    <button
                      key={p.id}
                      disabled={!canPreviewRoles}
                      onClick={() => {
                        onPersonaChange(p);
                        setPersonaOpen(false);
                      }}
                      className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
                    >
                      <span className="text-base">{p.emoji}</span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-popover-foreground">
                          {p.label}
                        </span>
                        <span className="block font-mono text-[10px] text-muted-foreground">
                          ACL: {p.acl.join(", ")}
                        </span>
                      </span>
                      {p.id === persona.id && <Check className="size-4 text-emerald-glow" />}
                    </button>
                  ))}
                  {previewing && (
                    <button
                      onClick={() => {
                        onResetPreview();
                        setPersonaOpen(false);
                      }}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-accent"
                    >
                      <Eye className="size-3.5" />
                      Exit preview, return to my role
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* License */}
          <button
            onClick={onOpenLicense}
            className={
              enterprise
                ? "flex items-center gap-1.5 rounded-full border border-emerald-glow/50 bg-emerald-glow/10 px-3 py-2 text-sm font-medium text-emerald-glow shadow-[0_0_22px_-6px_var(--emerald-glow)]"
                : "flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            <ShieldCheck className="size-4" />
            {enterprise ? "Enterprise Active" : "Community Edition"}
          </button>

          {/* Audit */}
          <button
            onClick={onOpenAudit}
            className="flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-2 text-sm text-foreground transition-colors hover:border-emerald-glow/50"
          >
            <ScrollText className="size-4 text-muted-foreground" />
            <span className="hidden sm:inline">Audit Logs (SOC2)</span>
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-glow opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-glow" />
            </span>
          </button>

          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserOpen((v) => !v)}
              title={email}
              className="flex size-9 items-center justify-center rounded-full border border-hairline bg-gradient-to-br from-indigo-glow/15 to-purple-glow/15 text-xs font-semibold text-indigo-glow"
            >
              {(email || "??").slice(0, 2).toUpperCase()}
            </button>
            <AnimatePresence>
              {userOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 z-50 mt-2 w-60 rounded-2xl border-2 border-ink bg-popover p-1.5 shadow-2xl"
                >
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-medium text-popover-foreground">{email}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{roleLabel}</p>
                  </div>
                  <div className="my-1 h-px bg-hairline" />
                  <button
                    onClick={onSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-popover-foreground hover:bg-accent"
                  >
                    <LogOut className="size-4 text-muted-foreground" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </header>
  );
}
