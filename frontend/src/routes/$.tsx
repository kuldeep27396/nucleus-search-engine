import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/marketing/SiteChrome";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Page not found — Nucleus" },
      { name: "description", content: "This Nucleus page does not exist." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <SiteChrome>
      <section className="mx-auto max-w-2xl px-5 pb-32 pt-28 text-center">
        <p className="font-display text-7xl font-extrabold tracking-tighter text-gradient-hot">404</p>
        <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-foreground">
          We couldn't retrieve that page
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The link may be broken, or the content may be outside your permissions.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-xl border-2 border-ink bg-gradient-to-r from-indigo-glow via-fuchsia-glow to-orange-glow px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow-[4px_4px_0_0_var(--ink)]"
          >
            Back home
          </Link>
          <Link
            to="/app"
            className="rounded-xl border-2 border-ink bg-card px-5 py-2.5 text-sm font-extrabold text-foreground shadow-[4px_4px_0_0_var(--ink)]"
          >
            Open the console
          </Link>
        </div>
      </section>
    </SiteChrome>
  );
}
