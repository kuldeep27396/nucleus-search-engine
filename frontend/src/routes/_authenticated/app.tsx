import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Header } from "@/components/nucleus/Header";
import { Sidebar } from "@/components/nucleus/Sidebar";
import { AuditDrawer } from "@/components/nucleus/AuditDrawer";
import { LicenseModal } from "@/components/nucleus/LicenseModal";
import { ConsoleContext, type ConsoleValue } from "@/components/nucleus/console-context";
import { getAccount } from "@/lib/account.functions";
import { personaForRole, roleLabels } from "@/lib/rbac";
import { supabase } from "@/integrations/supabase/client";
import { seedAuditRows, type AuditRow, type Persona } from "@/data/nucleus";

export const Route = createFileRoute("/_authenticated/app")({
  component: ConsoleLayout,
});

function ConsoleLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchAccount = useServerFn(getAccount);
  const { data: account } = useQuery({
    queryKey: ["account"],
    queryFn: () => fetchAccount({}),
  });

  const accountRole = account?.role ?? "intern";
  const isAdmin = accountRole === "admin";
  const [previewPersona, setPreviewPersona] = useState<Persona | null>(null);
  const persona = useMemo(
    () => previewPersona ?? personaForRole(accountRole, account?.email),
    [previewPersona, accountRole, account?.email],
  );

  const [enterprise, setEnterprise] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [licenseOpen, setLicenseOpen] = useState(false);
  const [auditRows, setAuditRows] = useState<AuditRow[]>(seedAuditRows);
  const [queryCount, setQueryCount] = useState(128);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const addAuditRow = useCallback((row: AuditRow) => setAuditRows((rows) => [row, ...rows]), []);

  const switchPersona = useCallback(
    (p: Persona) => {
      if (!isAdmin) {
        toast.error("Your role is set by your identity token", {
          description: `You are signed in as ${roleLabels[accountRole]}. Only a workspace admin can preview other roles.`,
        });
        return;
      }
      setPreviewPersona(p);
      toast.success(`Previewing as ${p.label}`, {
        description: `RLS re-applied · ACL ${p.acl.join(", ")}`,
      });
    },
    [isAdmin, accountRole],
  );

  const activate = useCallback(() => {
    setEnterprise(true);
    toast.success("Enterprise license activated", {
      description: "Unlimited tenants, 7-year audit retention and SSO are now enabled.",
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAuditOpen(false);
        setLicenseOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value: ConsoleValue = {
    email: account?.email ?? "",
    accountRole,
    isAdmin,
    persona,
    previewing: previewPersona !== null,
    switchPersona,
    resetPreview: () => setPreviewPersona(null),
    enterprise,
    activate,
    openLicense: () => setLicenseOpen(true),
    openAudit: () => setAuditOpen(true),
    auditRows,
    addAuditRow,
    queryCount,
    bumpQueryCount: () => setQueryCount((c) => c + 1),
  };

  return (
    <ConsoleContext.Provider value={value}>
      <div className="relative flex min-h-screen">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="grid-backdrop absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_50%_at_50%_0%,#000,transparent)]" />
          <div className="absolute -top-40 left-1/4 size-[38rem] rounded-full bg-indigo-glow/8 blur-[140px]" />
          <div className="absolute top-1/3 -right-32 size-[32rem] rounded-full bg-purple-glow/7 blur-[140px]" />
        </div>

        <Sidebar
          enterprise={enterprise}
          onOpenLicense={() => setLicenseOpen(true)}
          queriesUsed={queryCount}
        />

        <div className="min-w-0 flex-1">
          <Header
            persona={persona}
            onPersonaChange={switchPersona}
            enterprise={enterprise}
            onOpenLicense={() => setLicenseOpen(true)}
            onOpenAudit={() => setAuditOpen(true)}
            email={account?.email ?? ""}
            roleLabel={roleLabels[accountRole]}
            canPreviewRoles={isAdmin}
            previewing={previewPersona !== null}
            onResetPreview={() => setPreviewPersona(null)}
            onSignOut={signOut}
          />
          <Outlet />
        </div>

        <AuditDrawer
          open={auditOpen}
          onClose={() => setAuditOpen(false)}
          rows={auditRows}
          enterprise={enterprise}
        />
        <LicenseModal
          open={licenseOpen}
          onClose={() => setLicenseOpen(false)}
          enterprise={enterprise}
          onActivate={activate}
        />
      </div>
    </ConsoleContext.Provider>
  );
}
