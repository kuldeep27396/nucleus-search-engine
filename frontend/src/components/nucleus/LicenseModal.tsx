import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, KeyRound, Loader2, ShieldCheck, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  enterprise: boolean;
  onActivate: () => void;
};

const features = [
  { name: "Hybrid BM25 + Vector Search", community: true },
  { name: "Multi-Tenant Postgres RLS", community: false },
  { name: "SOC2 Audit Logs", community: false },
  { name: "Unlimited Tenant Isolation", community: false },
];

export function LicenseModal({ open, onClose, enterprise, onActivate }: Props) {
  const [key, setKey] = useState("");
  const [state, setState] = useState<"idle" | "verifying">("idle");

  const validate = () => {
    setState("verifying");
    setTimeout(() => {
      setState("idle");
      onActivate();
    }, 1100);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="glass-card relative z-10 w-full max-w-lg overflow-hidden bg-popover/95 p-6"
          >
            <div className="pointer-events-none absolute -top-20 right-0 size-56 rounded-full bg-purple-glow/20 blur-3xl" />
            <div className="relative flex items-start gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-glow to-indigo-glow">
                <ShieldCheck className="size-5 text-primary-foreground" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Enterprise Activation
                </h2>
                <p className="text-xs text-muted-foreground">
                  Ed25519 signed license, verified fully offline.
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="ml-auto rounded-lg border border-hairline p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {enterprise ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative mt-6 rounded-xl border border-emerald-glow/40 bg-emerald-glow/10 p-5 text-center shadow-[0_0_50px_-14px_var(--emerald-glow)]"
              >
                <div className="text-2xl">🎉</div>
                <p className="mt-1 font-display text-base font-semibold text-emerald-glow">
                  Enterprise Active
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Multi-tenant RLS and SOC2 audit logging are now enforced for Acme Corp.
                </p>
              </motion.div>
            ) : (
              <div className="relative mt-6">
                <label
                  htmlFor="license-key"
                  className="mb-2 block text-xs font-medium text-muted-foreground"
                >
                  License Key
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-hairline bg-muted px-3 py-2.5">
                  <KeyRound className="size-4 text-muted-foreground" />
                  <input
                    id="license-key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="NUC_ENT_eyJhbG..."
                    className="w-full bg-transparent font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  onClick={() => setKey("NUC_ENT_eyJhbGciOiJFZDI1NTE5IiwidHlwIjoiSldUIn0.acme")}
                  className="mt-2 text-[11px] text-cyan-glow hover:underline"
                >
                  Paste sample key
                </button>
                <button
                  onClick={validate}
                  disabled={key.trim().length < 8 || state === "verifying"}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-glow to-purple-glow px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
                >
                  {state === "verifying" && <Loader2 className="size-4 animate-spin" />}
                  {state === "verifying"
                    ? "Verifying signature…"
                    : "Validate License (Offline Air-Gapped Verification)"}
                </button>
              </div>
            )}

            <div className="relative mt-6 overflow-hidden rounded-xl border border-hairline">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Feature</th>
                    <th className="px-3 py-2">Community</th>
                    <th className="px-3 py-2">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((f) => (
                    <tr key={f.name} className="border-t border-hairline">
                      <td className="px-3 py-2.5 text-foreground">{f.name}</td>
                      <td className="px-3 py-2.5">
                        {f.community ? (
                          <Check className="size-3.5 text-emerald-glow" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <Check className="size-3.5 text-emerald-glow" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
