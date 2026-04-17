import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  filterVisibleClients,
  requireClientAccess,
  requireMembership,
} from "./lib/currentUser";

/**
 * List destinations in a workspace. Filters out destinations scoped to clients
 * the caller doesn't have access to — the existence of out-of-scope destinations
 * must not leak (NDA).
 */
export const listForWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const member = await requireMembership(ctx, workspaceId);
    const all = await ctx.db
      .query("destinations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    if (!member.clientScope) return all;
    const allowed = new Set(member.clientScope);
    return all.filter(
      // Workspace-wide destinations (clientId=null) hidden from scoped members.
      (d) => d.clientId !== undefined && allowed.has(d.clientId)
    );
  },
});

export const listForClient = query({
  args: { workspaceId: v.id("workspaces"), clientId: v.id("clients") },
  handler: async (ctx, { workspaceId, clientId }) => {
    await requireClientAccess(ctx, workspaceId, clientId);
    return ctx.db
      .query("destinations")
      .withIndex("by_workspace_client", (q) =>
        q.eq("workspaceId", workspaceId).eq("clientId", clientId)
      )
      .collect();
  },
});

export const get = query({
  args: { workspaceId: v.id("workspaces"), destinationId: v.id("destinations") },
  handler: async (ctx, { workspaceId, destinationId }) => {
    await requireMembership(ctx, workspaceId);
    const dest = await ctx.db.get(destinationId);
    if (!dest || dest.workspaceId !== workspaceId) return null;
    // Enforce scope on the destination's client assignment.
    await requireClientAccess(ctx, workspaceId, dest.clientId);
    return dest;
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    clientId: v.optional(v.id("clients")),
    kind: v.string(),
    mode: v.string(),
    name: v.string(),
    authType: v.string(),
    encryptedCredentials: v.string(),
    credentialsIv: v.string(),
    tokenExpiresAt: v.optional(v.number()),
    config: v.any(),
    liveTokenHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const member = await requireClientAccess(ctx, args.workspaceId, args.clientId);
    const now = new Date().toISOString();
    return ctx.db.insert("destinations", {
      workspaceId: args.workspaceId,
      clientId: args.clientId,
      kind: args.kind,
      mode: args.mode,
      name: args.name.trim(),
      status: "active",
      authType: args.authType,
      encryptedCredentials: args.encryptedCredentials,
      credentialsIv: args.credentialsIv,
      tokenExpiresAt: args.tokenExpiresAt,
      config: args.config,
      liveTokenHash: args.liveTokenHash,
      createdByUserId: member.userId,
      createdAt: now,
    });
  },
});

export const pause = mutation({
  args: { workspaceId: v.id("workspaces"), destinationId: v.id("destinations") },
  handler: async (ctx, { workspaceId, destinationId }) => {
    await requireMembership(ctx, workspaceId);
    const dest = await ctx.db.get(destinationId);
    if (!dest || dest.workspaceId !== workspaceId) throw new Error("Destination not found");
    await requireClientAccess(ctx, workspaceId, dest.clientId);
    await ctx.db.patch(destinationId, { status: "paused" });
  },
});

export const resume = mutation({
  args: { workspaceId: v.id("workspaces"), destinationId: v.id("destinations") },
  handler: async (ctx, { workspaceId, destinationId }) => {
    await requireMembership(ctx, workspaceId);
    const dest = await ctx.db.get(destinationId);
    if (!dest || dest.workspaceId !== workspaceId) throw new Error("Destination not found");
    await requireClientAccess(ctx, workspaceId, dest.clientId);
    await ctx.db.patch(destinationId, { status: "active", lastError: undefined });
  },
});

export const remove = mutation({
  args: { workspaceId: v.id("workspaces"), destinationId: v.id("destinations") },
  handler: async (ctx, { workspaceId, destinationId }) => {
    await requireMembership(ctx, workspaceId);
    const dest = await ctx.db.get(destinationId);
    if (!dest || dest.workspaceId !== workspaceId) throw new Error("Destination not found");
    await requireClientAccess(ctx, workspaceId, dest.clientId);
    // Cascade delete syncs.
    const syncs = await ctx.db
      .query("destinationSyncs")
      .withIndex("by_destination", (q) => q.eq("destinationId", destinationId))
      .collect();
    for (const s of syncs) await ctx.db.delete(s._id);
    await ctx.db.delete(destinationId);
  },
});

// ── Internal: used by the cron runner (/api/cron/destinations). ──────────────

export const internalGet = internalQuery({
  args: { destinationId: v.id("destinations") },
  handler: async (ctx, { destinationId }) => {
    return ctx.db.get(destinationId);
  },
});

export const internalMarkRun = internalMutation({
  args: {
    destinationId: v.id("destinations"),
    status: v.string(), // "active" | "error"
    lastRunAt: v.string(),
    lastError: v.optional(v.string()),
  },
  handler: async (ctx, { destinationId, status, lastRunAt, lastError }) => {
    await ctx.db.patch(destinationId, { status, lastRunAt, lastError });
  },
});
