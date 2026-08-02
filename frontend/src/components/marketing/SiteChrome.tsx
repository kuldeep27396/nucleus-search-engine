import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Atom } from "lucide-react";

const navLinks = [
  { to: "/pricing", label: "Pricing", hover: "hover:text-orange-glow" },
  { to: "/security", label: "Security", hover: "hover:text-fuchsia-glow" },
  { to: "/docs", label: "Docs", hover: "hover:text-cyan-glow" },
  { to: "/contact", label: "Contact", hover: "hover:text-indigo-glow" },
] as const;

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="grid-backdrop absolute inset-0 opacity-60 [mask-image:radial-gradient(75%_55%_at_50%_0%,#000,transparent)]" />
        <div className="absolute -top-40 -left-24 size-[36rem] rounded-full bg-fuchsia-glow/25 blur-[130px]" />
        <div className="absolute -top-52 right-0 size-[34rem] rounded-full bg-cyan-glow/25 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-40 border-b-2 border-ink bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3.5">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl border-2 border-ink bg-gradient-to-br from-indigo-glow to-fuchsia-glow">
              <Atom className="size-4.5 text-primary-foreground" />
            </span>
            <span className="font-display text-base font-extrabold tracking-tight text-foreground">
              Nucleus
            </span>
          </Link>
          <nav className="ml-6 hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`transition-colors ${l.hover}`}
                activeProps={{ className: "text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
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

      <main>{children}</main>

      <SiteFooter />
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <span className="flex items-center gap-2 font-display text-sm font-extrabold text-foreground">
            <Atom className="size-4 text-fuchsia-glow" />
            Nucleus Engine
          </span>
          <p className="mt-2 max-w-xs text-xs text-muted-foreground">
            Self-hosted enterprise AI search with permission-aware retrieval.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            { to: "/pricing", label: "Pricing" },
            { to: "/security", label: "Security" },
            { to: "/docs", label: "Docs" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { to: "/contact", label: "Contact sales" },
            { to: "/auth", label: "Sign in" },
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            { to: "/privacy", label: "Privacy" },
            { to: "/terms", label: "Terms" },
          ]}
        />
      </div>
      <div className="border-t border-hairline">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs font-semibold text-muted-foreground">
          © {new Date().getFullYear()} Nucleus Labs. SOC2 Type II.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: readonly { to: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-foreground">
        {title}
      </h3>
      <ul className="mt-3 space-y-2 text-xs font-semibold text-muted-foreground">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
