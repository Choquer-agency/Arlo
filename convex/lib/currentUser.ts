import { QueryCtx, MutationCtx } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "../_generated/dataModel";

export async function requireUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return ctx.db.get(userId);
}

export async function requireMembership(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">
): Promise<Doc<"members">> {
  const userId = await requireUserId(ctx);
  const member = await ctx.db
    .query("members")
    .withIndex("by_workspace_user", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId)
    )
    .unique();
  if (!member) throw new Error("Not a member of this workspace");
  return member;
}

const ROLE_TIER: Record<string, number> = { owner: 30, admin: 20, member: 10 };

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  minRole: "owner" | "admin" | "member"
): Promise<Doc<"members">> {
  const member = await requireMembership(ctx, workspaceId);
  if ((ROLE_TIER[member.role] ?? 0) < ROLE_TIER[minRole]) {
    throw new Error(`Requires ${minRole} role or higher`);
  }
  return member;
}

/**
 * NDA scoping guard. Called by every destination/sync mutation that accepts a
 * clientId. A member with a non-null clientScope can ONLY operate on clients in
 * that list; unrestricted members (null clientScope, typically owners/admins)
 * pass through. Returns "not found" rather than "access denied" so the existence
 * of out-of-scope clients doesn't leak.
 */
export async function requireClientAccess(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  clientId: Id<"clients"> | undefined
): Promise<Doc<"members">> {
  const member = await requireMembership(ctx, workspaceId);
  if (clientId === undefined) {
    // Workspace-wide action — only unrestricted members can create those.
    if (member.clientScope && member.clientScope.length > 0) {
      throw new Error("Client not found");
    }
    return member;
  }
  const client = await ctx.db.get(clientId);
  if (!client || client.workspaceId !== workspaceId) {
    throw new Error("Client not found");
  }
  if (member.clientScope && !member.clientScope.includes(clientId)) {
    throw new Error("Client not found");
  }
  return member;
}

/**
 * Returns the subset of clientIds this member is allowed to see. Unrestricted
 * members get back the full list unchanged. Used by destinations.listForWorkspace.
 */
export function filterVisibleClients<T extends { _id: Id<"clients"> }>(
  member: Doc<"members">,
  clients: T[]
): T[] {
  if (!member.clientScope) return clients;
  const allowed = new Set(member.clientScope);
  return clients.filter((c) => allowed.has(c._id));
}
