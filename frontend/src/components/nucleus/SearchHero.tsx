import { forwardRef } from "react";
import { Clock, Loader2, Search, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { queries, sourceFilters, type SourceKind } from "@/data/nucleus";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  filter: SourceKind | "all";
  onFilterChange: (f: SourceKind | "all") => void;
  recent: string[];
  searching: boolean;
};

export const SearchHero = forwardRef<HTMLInputElement, Props>(function SearchHero(
  { value, onChange, onSubmit, filter, onFilterChange, recent, searching },
  ref,
) {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 pt-12 pb-8 text-center md:pt-16">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl font-extrabold tracking-tighter text-foreground md:text-6xl"
      >
        Search everything your company{" "}
        <span className="text-gradient-hot">actually knows</span>
      </motion.h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
        Hybrid retrieval across docs, Slack, Jira and code — grounded answers with citations,
        enforced by PostgreSQL row-level security inside your own VPC.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(value);
        }}
        className="group relative mx-auto mt-8 max-w-3xl"
      >
        <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-indigo-glow/0 via-indigo-glow/30 to-cyan-glow/0 opacity-0 blur-md transition-opacity duration-300 group-focus-within:opacity-100" />
        <div className="relative flex items-center gap-3 rounded-2xl border-2 border-ink bg-card px-5 py-3.5 shadow-[6px_6px_0_0_var(--ink)] transition-shadow group-focus-within:shadow-[6px_6px_0_0_var(--indigo-glow)]">
          {searching ? (
            <Loader2 className="size-5 shrink-0 animate-spin text-indigo-glow" />
          ) : (
            <Search className="size-5 shrink-0 text-muted-foreground" />
          )}
          <input
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask anything about your company knowledge…"
            aria-label="Search company knowledge"
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 rounded-md border border-hairline bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground sm:block">
            ⌘ K
          </kbd>
          <button
            type="submit"
            disabled={searching}
            className="hidden shrink-0 items-center gap-1.5 rounded-xl border-2 border-ink bg-gradient-to-r from-indigo-glow via-fuchsia-glow to-orange-glow px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-50 sm:flex"
          >
            <Sparkles className="size-3.5" />
            Ask
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {sourceFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={
              filter === f.id
                ? "rounded-full border-2 border-ink bg-gradient-to-r from-indigo-glow/20 to-fuchsia-glow/20 px-4 py-1.5 text-sm font-bold text-foreground shadow-[3px_3px_0_0_var(--ink)]"
                : "rounded-full border-2 border-ink/25 bg-card px-4 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-ink hover:text-foreground"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Try
        </span>
        {queries.map((q) => (
          <button
            key={q.id}
            onClick={() => {
              onChange(q.query);
              onSubmit(q.query);
            }}
            className="rounded-full border-2 border-dashed border-ink/30 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-indigo-glow hover:text-indigo-glow"
          >
            {q.query}
          </button>
        ))}
      </div>

      {recent.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Clock className="size-3 text-muted-foreground" />
          {recent.map((q) => (
            <button
              key={q}
              onClick={() => {
                onChange(q);
                onSubmit(q);
              }}
              className="max-w-[16rem] truncate rounded-full border-2 border-ink/20 bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-ink hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </section>
  );
});
