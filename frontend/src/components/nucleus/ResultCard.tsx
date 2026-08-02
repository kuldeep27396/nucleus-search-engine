import { motion } from "motion/react";
import { FileCode2, FileText, HardDrive, Hash, Lock, Ticket } from "lucide-react";
import { aclLabels, type NucleusDoc } from "@/data/nucleus";

const icons = {
  Markdown: FileText,
  PDF: FileText,
  Drive: HardDrive,
  Slack: Hash,
  Jira: Ticket,
  Code: FileCode2,
} as const;

export function ResultCard({ doc, index }: { doc: NucleusDoc; index: number }) {
  const Icon = icons[doc.format];
  const parts = doc.snippet.split(doc.highlight);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bold-panel-soft p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Icon className="size-4 text-cyan-glow" />
        <h3 className="text-sm font-semibold text-foreground">{doc.title}</h3>
        <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {doc.path}
        </code>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          Doc_ID: {doc.id}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {parts[0]}
        <mark className="rounded bg-amber-glow/20 px-1 text-amber-glow">{doc.highlight}</mark>
        {parts[1]}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-hairline bg-muted/60 px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
          RRF Fusion Score {doc.score}
        </span>
        <span
          className={
            doc.acl === "group_all"
              ? "rounded-full border border-cyan-glow/40 bg-cyan-glow/10 px-2.5 py-1 text-[10px] text-cyan-glow"
              : "rounded-full border border-purple-glow/40 bg-purple-glow/10 px-2.5 py-1 text-[10px] text-purple-glow"
          }
        >
          {aclLabels[doc.acl]}
        </span>
        <span className="rounded-full border border-hairline px-2.5 py-1 text-[10px] text-muted-foreground">
          {doc.format}
        </span>
      </div>
    </motion.article>
  );
}

export function RestrictedCard({ doc, index }: { doc: NucleusDoc; index: number }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bold-panel-soft border-amber-glow bg-amber-glow/8 p-5"
    >
      <div className="flex items-center gap-2">
        <Lock className="size-4 text-amber-glow" />
        <h3 className="text-sm font-semibold text-amber-glow">
          ⛔ Access Restricted by PostgreSQL Row-Level Security (RLS)
        </h3>
      </div>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">
        Document <span className="font-mono text-foreground">{doc.id}</span> matched the query
        but was filtered out before retrieval. Your role lacks the{" "}
        <span className="font-mono text-amber-glow">{doc.acl}</span> grant.
      </p>
      <code className="mt-3 block rounded-lg border border-hairline bg-muted px-3 py-2 font-mono text-[10px] text-muted-foreground">
        USING (acl_group = ANY(current_setting(&apos;nucleus.acl&apos;)::text[]))
      </code>
      <span className="mt-3 inline-block text-[10px] text-muted-foreground">
        Denial event written to the append-only audit log · index {index + 1}
      </span>
    </motion.article>
  );
}
