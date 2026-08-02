import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Bookmark, Copy, Search, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/nucleus/PageShell";
import { useConsole } from "@/components/nucleus/console-context";

export const Route = createFileRoute("/_authenticated/app/saved")({
  head: () => ({
    meta: [
      { title: "Saved Answers — Nucleus Workspace" },
      {
        name: "description",
        content: "Pinned, shareable AI answers your team has saved from Nucleus enterprise search.",
      },
      { property: "og:title", content: "Saved Answers — Nucleus Workspace" },
      { property: "og:description", content: "Pinned grounded answers for your workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SavedPage,
});

type Saved = {
  id: string;
  question: string;
  answer: string;
  citations: number;
  savedBy: string;
  when: string;
  acl: string;
  collection: string;
};

const initial: Saved[] = [
  {
    id: "s1",
    question: "What is our incident severity ladder?",
    answer:
      "SEV1 pages the on-call within 5 minutes and requires an exec comms bridge. SEV2 is a 30-minute ack, SEV3 is next business day with a written postmortem only if customer-visible.",
    citations: 3,
    savedBy: "priya@acme.com",
    when: "2 days ago",
    acl: "group_eng",
    collection: "Engineering",
  },
  {
    id: "s2",
    question: "How many vacation days carry over each year?",
    answer:
      "Up to 5 unused days roll into Q1 of the following year and expire on March 31. Anything above 5 is paid out at base rate in the January cycle.",
    citations: 2,
    savedBy: "dana@acme.com",
    when: "5 days ago",
    acl: "group_hr",
    collection: "People Ops",
  },
  {
    id: "s3",
    question: "Which regions is the VPC deployment certified for?",
    answer:
      "us-east-1, eu-west-1 and ap-south-1 are SOC2 Type II covered. eu-central-1 is in scope for the next audit window.",
    citations: 4,
    savedBy: "sam@acme.com",
    when: "1 week ago",
    acl: "group_all",
    collection: "Security",
  },
];

function SavedPage() {
  const { persona } = useConsole();
  const [items, setItems] = useState(initial);
  const [q, setQ] = useState("");

  const visible = items.filter(
    (i) =>
      (persona.acl as readonly string[]).includes(i.acl) &&
      (i.question.toLowerCase().includes(q.toLowerCase()) ||
        i.answer.toLowerCase().includes(q.toLowerCase())),
  );
  const hidden = items.length - items.filter((i) => (persona.acl as readonly string[]).includes(i.acl)).length;

  return (
    <PageShell
      title="Saved answers"
      description="Answers your team pinned for reuse. Saved answers respect the same row-level security as live search."
      action={
        <Link
          to="/app"
          className="flex items-center gap-2 rounded-xl border-2 border-ink bg-card px-4 py-2.5 text-sm font-bold text-foreground shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--ink)]"
        >
          <Search className="size-4" /> New search
        </Link>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter saved answers…"
          className="w-full max-w-sm rounded-xl border-2 border-ink bg-card px-3.5 py-2.5 text-sm text-foreground shadow-[4px_4px_0_0_var(--ink)] outline-none placeholder:text-muted-foreground focus:translate-y-0.5 focus:shadow-[2px_2px_0_0_var(--ink)]"
        />
        <span className="rounded-full border border-hairline bg-surface px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
          {visible.length} visible · {hidden} filtered by RLS
        </span>
      </div>

      {visible.map((item, i) => (
        <motion.article
          key={item.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bold-panel p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Bookmark className="size-4 text-fuchsia-glow" />
            <h2 className="font-display text-base font-bold text-foreground">{item.question}</h2>
            <span className="ml-auto rounded-full border-2 border-ink bg-card px-2 py-0.5 font-mono text-[10px] font-bold">
              {item.collection}
            </span>
          </div>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="font-mono">{item.citations} citations</span>
            <span>·</span>
            <span>
              saved by {item.savedBy} · {item.when}
            </span>
            <span className="ml-auto flex items-center gap-2">
              <button
                onClick={() => toast.success("Answer copied to clipboard")}
                className="flex items-center gap-1.5 rounded-lg border border-hairline px-2.5 py-1.5 font-medium text-foreground hover:bg-accent"
              >
                <Copy className="size-3.5" /> Copy
              </button>
              <button
                onClick={() => toast.success("Share link created", { description: "Access still enforced per-viewer by RLS." })}
                className="flex items-center gap-1.5 rounded-lg border border-hairline px-2.5 py-1.5 font-medium text-foreground hover:bg-accent"
              >
                <Share2 className="size-3.5" /> Share
              </button>
              <button
                onClick={() => {
                  setItems((rows) => rows.filter((r) => r.id !== item.id));
                  toast.info("Removed from saved answers");
                }}
                className="flex items-center gap-1.5 rounded-lg border border-hairline px-2.5 py-1.5 font-medium text-destructive hover:bg-accent"
              >
                <Trash2 className="size-3.5" /> Remove
              </button>
            </span>
          </div>
        </motion.article>
      ))}

      {visible.length === 0 && (
        <p className="bold-panel p-8 text-center text-sm text-muted-foreground">
          Nothing saved matches this filter for your role.
        </p>
      )}
    </PageShell>
  );
}
