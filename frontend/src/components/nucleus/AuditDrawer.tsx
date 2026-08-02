import { AnimatePresence, motion } from "motion/react";
import { Lock, X } from "lucide-react";
import type { AuditRow } from "@/data/nucleus";

type Props = { open: boolean; onClose: () => void; rows: AuditRow[]; enterprise: boolean };

export function AuditDrawer({ open, onClose, rows, enterprise }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-3xl flex-col border-l border-hairline bg-popover/95 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-b border-hairline px-6 py-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  SOC2 Audit Inspector
                </h2>
                <p className="text-xs text-muted-foreground">
                  Every retrieval event, immutable and timestamped.
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close audit log"
                className="ml-auto rounded-lg border border-hairline p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 px-6 py-3">
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-glow/40 bg-emerald-glow/10 px-3 py-1 text-[11px] text-emerald-glow">
                <Lock className="size-3" />
                Append-Only Immutable Audit Log (DPDP / SOC2 Compliant)
              </span>
              {!enterprise && (
                <span className="rounded-full border border-amber-glow/40 bg-amber-glow/10 px-3 py-1 text-[11px] text-amber-glow">
                  Community Edition · 24h retention
                </span>
              )}
            </div>

            <div className="scrollbar-slim flex-1 overflow-auto px-6 pb-8">
              <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-xs">
                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Query</th>
                    <th className="px-3 py-2">Docs</th>
                    <th className="px-3 py-2">RLS Filter</th>
                    <th className="px-3 py-2">ms</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="bg-surface">
                      <td className="rounded-l-lg px-3 py-3 font-mono text-[10px] text-muted-foreground">
                        {r.timestamp}
                      </td>
                      <td className="px-3 py-3 text-foreground">{r.email}</td>
                      <td className="px-3 py-3">
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-cyan-glow">
                          {r.role}
                        </code>
                      </td>
                      <td className="max-w-[180px] truncate px-3 py-3 text-muted-foreground">
                        {r.query}
                      </td>
                      <td className="px-3 py-3 font-mono text-[10px] text-purple-glow">
                        {r.docIds.length ? r.docIds.join(", ") : "—"}
                      </td>
                      <td className="px-3 py-3 font-mono text-[10px] text-muted-foreground">
                        {r.rlsFilter}
                      </td>
                      <td className="rounded-r-lg px-3 py-3 font-mono text-[10px] text-emerald-glow">
                        {r.latency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
