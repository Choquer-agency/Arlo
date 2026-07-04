import { QueryCtx, MutationCtx } from "../_generated/server";
import { getCurrentUser } from "./currentUser";

/**
 * Super-admin gate for the unified Arlo/Choquer admin console. Bryce (and anyone
 * on the allowlist) can see and manage every workspace. Defaults cover the known
 * owner emails; override with SUPERADMIN_EMAILS (comma-separated) on the Convex
 * deployment without a code change.
 */
const DEFAULT_SUPERADMINS = [
  "bryce@choquer.agency",
  "hello@choquer.agency",
  "bryce@choquercreative.com",
];

export function superAdminEmails(): string[] {
  const env = process.env.SUPERADMIN_EMAILS;
  const list = env ? env.split(",").map((e) => e.trim()) : DEFAULT_SUPERADMINS;
  return list.map((e) => e.toLowerCase()).filter(Boolean);
}

export async function isSuperAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const user = await getCurrentUser(ctx);
  const email = user?.email?.toLowerCase();
  if (!email) return false;
  return superAdminEmails().includes(email);
}

export async function requireSuperAdmin(ctx: QueryCtx | MutationCtx) {
  if (!(await isSuperAdmin(ctx))) throw new Error("Not authorized");
}
