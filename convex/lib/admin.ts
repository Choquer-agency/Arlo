import { QueryCtx, MutationCtx } from "../_generated/server";
import { getCurrentUser } from "./currentUser";
import { isSuperAdminEmail, superAdminEmails } from "./superadmin";

/**
 * Super-admin gate for the unified Arlo/Choquer admin console. Bryce (and anyone
 * on the allowlist) can see and manage every workspace — and, via the membership
 * bypass in currentUser, act inside any client workspace.
 */
export { superAdminEmails };

export async function isSuperAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const user = await getCurrentUser(ctx);
  return isSuperAdminEmail(user?.email);
}

export async function requireSuperAdmin(ctx: QueryCtx | MutationCtx) {
  if (!(await isSuperAdmin(ctx))) throw new Error("Not authorized");
}
