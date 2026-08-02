import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AppRole } from "./rbac";

export type Account = {
  email: string;
  displayName: string | null;
  workspaceName: string;
  role: AppRole;
};

export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Account> => {
    const { data, error } = await context.supabase.rpc("bootstrap_current_user", {});
    if (error) throw error;
    const row = (Array.isArray(data) ? data[0] : data) as
      | { display_name: string | null; workspace_name: string; role: AppRole }
      | undefined;
    const claims = context.claims as { email?: string } | null;
    return {
      email: claims?.email ?? "",
      displayName: row?.display_name ?? null,
      workspaceName: row?.workspace_name ?? "Acme Corp",
      role: row?.role ?? "intern",
    };
  });
