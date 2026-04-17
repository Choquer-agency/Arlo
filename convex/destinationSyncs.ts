import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireClientAccess, requireMembership } from "./lib/currentUser";
import { requireServiceSecret } from "./lib/serviceAuth";

export const listForDestination = query({
  args: { workspaceId: v.id("workspaces"), destinationId: v.id("destinations") },
  handler: async (ctx, { workspaceId, destinationId }) => {
    await requireMembership(ctx, workspaceId);
    const dest = await ctx.db.get(destinationId);
    if (!dest || dest.workspaceId !== workspaceId) return [];
    await requireClientAccess(ctx, workspaceId, dest.clientId);
    return ctx.db
      .query("destinationSyncs")
      .withIndex("by_destination", (q) => q.eq("destinationId", destinationId))
      .collect();
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    destinationId: v.id("destinations"),
    datasetKey: v.string(),
    params: v.any(),
    targetRef: v.optional(v.string()),
    schedule: v.string(),
    enabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireMembership(ctx, args.workspaceId);
    const dest = await ctx.db.get(args.destinationId);
    if (!dest || dest.workspaceId !== args.workspaceId) {
      throw new Error("Destination not found");
    }
    // NDA guard — a scoped member can't attach a sync to a destination they
    // don't have client access to.
    await requireClientAccess(ctx, args.workspaceId, dest.clientId);

    const enabled = args.enabled ?? true;
    const now = new Date().toISOString();
    return ctx.db.insert("destinationSyncs", {
      destinationId: args.destinationId,
      workspaceId: args.workspaceId,
      clientId: dest.clientId, // denormalized from destination — source of truth
      datasetKey: args.datasetKey,
      params: args.params,
      targetRef: args.targetRef,
      schedule: args.schedule,
      enabled,
      nextRunAt: enabled ? Date.now() : undefined,
      createdAt: now,
    });
  },
});

export const toggleEnabled = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    syncId: v.id("destinationSyncs"),
    enabled: v.boolean(),
  },
  handler: async (ctx, { workspaceId, syncId, enabled }) => {
    await requireMembership(ctx, workspaceId);
    const sync = await ctx.db.get(syncId);
    if (!sync || sync.workspaceId !== workspaceId) throw new Error("Sync not found");
    await requireClientAccess(ctx, workspaceId, sync.clientId);
    await ctx.db.patch(syncId, {
      enabled,
      nextRunAt: enabled ? Date.now() : undefined,
    });
  },
});

export const remove = mutation({
  args: { workspaceId: v.id("workspaces"), syncId: v.id("destinationSyncs") },
  handler: async (ctx, { workspaceId, syncId }) => {
    await requireMembership(ctx, workspaceId);
    const sync = await ctx.db.get(syncId);
    if (!sync || sync.workspaceId !== workspaceId) throw new Error("Sync not found");
    await requireClientAccess(ctx, workspaceId, sync.clientId);
    await ctx.db.delete(syncId);
  },
});

/**
 * Run all syncs attached to a destination on the next cron tick. Sets nextRunAt=0
 * so the 1-min cron picks them up immediately; the cron handler advances to the
 * real next interval after the run.
 */
export const runNow = mutation({
  args: { workspaceId: v.id("workspaces"), destinationId: v.id("destinations") },
  handler: async (ctx, { workspaceId, destinationId }) => {
    await requireMembership(ctx, workspaceId);
    const dest = await ctx.db.get(destinationId);
    if (!dest || dest.workspaceId !== workspaceId) throw new Error("Destination not found");
    await requireClientAccess(ctx, workspaceId, dest.clientId);
    const syncs = await ctx.db
      .query("destinationSyncs")
      .withIndex("by_destination", (q) => q.eq("destinationId", destinationId))
      .collect();
    for (const s of syncs) {
      await ctx.db.patch(s._id, { enabled: true, nextRunAt: 0 });
    }
    return syncs.length;
  },
});

// ── Internal: cron runner. ────────────────────────────────────────────────────

/**
 * Returns all enabled syncs whose nextRunAt has passed. Batched small (default 25)
 * so the cron tick stays under the Next.js response budget; the next tick picks
 * up the rest.
 */
export const listDue = query({
  args: {
    _serviceSecret: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { _serviceSecret, limit }) => {
    requireServiceSecret(_serviceSecret);
    const now = Date.now();
    const batch = await ctx.db
      .query("destinationSyncs")
      .withIndex("by_due", (q) => q.eq("enabled", true))
      .take(500);
    return batch.filter((s) => (s.nextRunAt ?? 0) <= now).slice(0, limit ?? 25);
  },
});

export const advance = mutation({
  args: {
    _serviceSecret: v.string(),
    syncId: v.id("destinationSyncs"),
    lastRunAt: v.number(),
    nextRunAt: v.number(),
  },
  handler: async (ctx, { _serviceSecret, syncId, lastRunAt, nextRunAt }) => {
    requireServiceSecret(_serviceSecret);
    await ctx.db.patch(syncId, { lastRunAt, nextRunAt });
  },
});
