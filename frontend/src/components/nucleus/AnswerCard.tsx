import { useState } from "react";
import { motion } from "motion/react";
import { Check, Copy, ThumbsDown, ThumbsUp, Zap } from "lucide-react";
import type { NucleusDoc, QueryResult } from "@/data/nucleus";

type Props = {
  result: QueryResult;
  visibleDocs: NucleusDoc[];
  latency: number;
};

function CitationPill({ doc, id }: { doc: NucleusDoc | undefined; id: string }) {
  const [hover, setHover] = useState(false);
  const allowed = Boolean(doc);
  return (
    <span
      className="relative inline-block align-baseline"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span
        className={
          allowed
            ? "mx-0.5 cursor-help rounded-md border border-cyan-glow/40 bg-cyan-glow/10 px-1.5 py-0.5 font-mono text-[11px] text-cyan-glow"
            : "mx-0.5 cursor-not-allowed rounded-md border border-amber-glow/40 bg-amber-glow/10 px-1.5 py-0.5 font-mono text-[11px] text-amber-glow"
        }
      >
        [Doc_ID: {id}]
      </span>
      {hover && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 z-30 mb-2 block w-72 -translate-x-1/2 rounded-xl border border-hairline bg-popover p-3 text-left text-xs leading-relaxed text-popover-foreground shadow-2xl"
        >
          {allowed ? (
            <>
              <span className="mb-1 block font-medium text-foreground">{doc!.title}</span>
              <span className="mb-1.5 block font-mono text-[10px] text-muted-foreground">
                {doc!.path}
              </span>
              <span className="block text-muted-foreground">{doc!.snippet}</span>
            </>
          ) : (
            <span className="block text-amber-glow">
              Source hidden by RLS policy for the active role.
            </span>
          )}
        </motion.span>
      )}
    </span>
  );
}

export function AnswerCard({ result, visibleDocs, latency }: Props) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const plain = result.answer
    .map((s) => ("text" in s ? s.text : `[Doc_ID: ${s.citation}]`))
    .join("");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="bold-panel relative overflow-hidden p-6"
    >
      <div className="pointer-events-none absolute -top-24 -left-16 size-64 rounded-full bg-indigo-glow/15 blur-3xl" />
      <div className="relative flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
          <Zap className="size-4 text-amber-glow" />
          Nucleus AI Grounded Answer
        </h2>
        <span className="rounded-full border border-emerald-glow/40 bg-emerald-glow/10 px-2.5 py-1 text-[11px] font-medium text-emerald-glow">
          100% Grounded
        </span>
        <span className="ml-auto rounded-full border border-hairline bg-muted/60 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
          ⚡ {latency}ms
        </span>
      </div>

      <p className="relative mt-4 text-sm leading-7 text-foreground/90">
        {result.answer.map((seg, i) =>
          "text" in seg ? (
            <span key={i}>{seg.text}</span>
          ) : (
            <CitationPill
              key={i}
              id={seg.citation}
              doc={visibleDocs.find((d) => d.id === seg.citation)}
            />
          ),
        )}
      </p>

      <div className="relative mt-5 flex flex-wrap items-center gap-2 border-t border-hairline pt-4">
        <button
          onClick={() => {
            void navigator.clipboard?.writeText(plain);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          className="flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? <Check className="size-3.5 text-emerald-glow" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy Answer"}
        </button>
        <button
          onClick={() => setVote(vote === "up" ? null : "up")}
          aria-label="Helpful"
          className={`rounded-lg border border-hairline p-2 transition-colors ${vote === "up" ? "border-emerald-glow/50 text-emerald-glow" : "text-muted-foreground hover:text-foreground"}`}
        >
          <ThumbsUp className="size-3.5" />
        </button>
        <button
          onClick={() => setVote(vote === "down" ? null : "down")}
          aria-label="Not helpful"
          className={`rounded-lg border border-hairline p-2 transition-colors ${vote === "down" ? "border-destructive/60 text-destructive" : "text-muted-foreground hover:text-foreground"}`}
        >
          <ThumbsDown className="size-3.5" />
        </button>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          RRF hybrid · BM25 + pgvector · {visibleDocs.length} sources retained
        </span>
      </div>
    </motion.div>
  );
}
