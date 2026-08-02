import { personas, type Persona } from "@/data/nucleus";

export type AppRole = "intern" | "eng_lead" | "hr_manager" | "admin";

export const roleLabels: Record<AppRole, string> = {
  intern: "Intern",
  eng_lead: "Engineering Lead",
  hr_manager: "HR Manager",
  admin: "Workspace Admin",
};

export const adminPersona: Persona = {
  id: "admin",
  label: "Admin",
  emoji: "🛡️",
  role: "admin",
  email: "admin@acme.com",
  acl: ["group_all", "group_eng", "group_hr"],
};

export function personaForRole(role: AppRole, email?: string): Persona {
  const base =
    role === "admin"
      ? adminPersona
      : (personas.find((p) => p.id === (role === "hr_manager" ? "hr_mgr" : role)) ?? personas[0]!);
  return email ? { ...base, email } : base;
}
