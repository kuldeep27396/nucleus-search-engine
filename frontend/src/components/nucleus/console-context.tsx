import { createContext, useContext } from "react";
import type { AuditRow, Persona } from "@/data/nucleus";
import type { AppRole } from "@/lib/rbac";

export type ConsoleValue = {
  email: string;
  accountRole: AppRole;
  isAdmin: boolean;
  persona: Persona;
  previewing: boolean;
  switchPersona: (p: Persona) => void;
  resetPreview: () => void;
  enterprise: boolean;
  activate: () => void;
  openLicense: () => void;
  openAudit: () => void;
  auditRows: AuditRow[];
  addAuditRow: (row: AuditRow) => void;
  queryCount: number;
  bumpQueryCount: () => void;
};

export const ConsoleContext = createContext<ConsoleValue | null>(null);

export function useConsole(): ConsoleValue {
  const ctx = useContext(ConsoleContext);
  if (!ctx) throw new Error("useConsole must be used inside the console layout");
  return ctx;
}
