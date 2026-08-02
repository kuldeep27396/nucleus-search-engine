import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Atom, ArrowLeft, Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to Nucleus — Enterprise AI Search Console" },
      {
        name: "description",
        content:
          "Sign in to your Nucleus workspace to search internal knowledge with role-based access control and SOC2 audit logging.",
      },
      { property: "og:title", content: "Sign in to Nucleus" },
      {
        property: "og:description",
        content: "Access your Nucleus workspace — RBAC-secured enterprise AI search.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        navigate({ to: "/app", replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/app",
            data: { display_name: name },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success("Check your email", {
            description: "Confirm your address to activate your Nucleus workspace.",
          });
          return;
        }
        toast.success("Workspace created");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/app" },
    });
    setBusy(false);
    if (error) {
      toast.error("Google sign-in failed: " + error.message);
      return;
    }
  };

  return (
    <div className="relative flex min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="grid-backdrop absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_50%_at_50%_0%,#000,transparent)]" />
        <div className="absolute -top-40 left-1/4 size-[38rem] rounded-full bg-indigo-glow/8 blur-[140px]" />
      </div>

      <div className="flex w-full flex-col justify-center px-5 py-10 sm:px-10 lg:w-[52%]">
        <div className="mx-auto w-full max-w-sm">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to nucleus.dev
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-glow to-purple-glow shadow-sm">
              <Atom className="size-5 text-primary-foreground" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              Nucleus
            </span>
          </div>

          <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-foreground">
            {mode === "signin" ? "Sign in to your workspace" : "Create your workspace"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Your access level is resolved from your identity token."
              : "New accounts start with the Intern access level until an admin grants more."}
          </p>

          {sent ? (
            <div className="glass-card mt-7 p-5 text-sm">
              <ShieldCheck className="size-5 text-emerald-glow" />
              <p className="mt-2 font-medium text-foreground">Confirm your email</p>
              <p className="mt-1 text-muted-foreground">
                We sent a confirmation link to <span className="text-foreground">{email}</span>.
                Open it to finish activating your workspace.
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={google}
                disabled={busy}
                className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-xl border border-hairline bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.29 9.14 4.75 12 4.75Z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-hairline" />
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  or work email
                </span>
                <span className="h-px flex-1 bg-hairline" />
              </div>

              <form onSubmit={submit} className="space-y-3">
                {mode === "signup" && (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    autoComplete="name"
                    className="w-full rounded-xl border border-hairline bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-indigo-glow/60"
                  />
                )}
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-hairline bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-indigo-glow/60"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className="w-full rounded-xl border border-hairline bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-indigo-glow/60"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-glow to-purple-glow px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  {mode === "signin" ? "Sign in" : "Create workspace"}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                {mode === "signin" ? "New to Nucleus?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="font-medium text-indigo-glow hover:underline"
                >
                  {mode === "signin" ? "Create a workspace" : "Sign in"}
                </button>
              </p>
            </>
          )}

          <p className="mt-8 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="size-3" />
            SSO/SAML available on Enterprise
          </p>
        </div>
      </div>

      <div className="hidden flex-1 items-center border-l border-hairline bg-card/50 px-12 lg:flex">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            Access is decided by your token, not the UI
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Nucleus resolves your role from your signed identity token on every request. Retrieval
            runs behind Postgres row-level security, so documents you aren't cleared for never
            reach the model — or your screen.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              ["Intern", "Company-wide handbooks and public docs"],
              ["Engineering Lead", "Adds architecture, incidents and private repos"],
              ["HR Manager", "Adds compensation bands and people records"],
              ["Workspace Admin", "Full visibility plus role administration"],
            ].map(([role, scope]) => (
              <li key={role} className="glass-card flex items-start gap-3 p-3.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-glow" />
                <span>
                  <span className="block font-medium text-foreground">{role}</span>
                  <span className="block text-xs text-muted-foreground">{scope}</span>
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
