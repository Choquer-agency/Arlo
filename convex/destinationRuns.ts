import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireClientAccess, requireMembership } from "./lib/currentUser";

export const listForDestination = query({
  args: {
    workspaceId: v.id("workspaces"),
    destinationId: v.id("destinations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { workspaceId, destinationId, limit }) => {
    await requireMembership(ctx, workspaceId);
    const dest = await ctx.db.get(destinationId);
    if (!dest || dest.workspaceId !== workspaceId) return [];
    await requireClientAccess(ctx, workspaceId, dest.clientId);
    return ctx.db
      .query("destinationRuns")
      .withIndex("by_destination_started", (q) => q.eq("destinationId", destinationId))
      .order("desc")
      .take(limit ?? 20);
  },
});

export const recordStart = internalMutation({
  args: {
    destinationId: v.id("destinations"),
    syncId: v.optional(v.id("destinationSyncs")),
    workspaceId: v.id("workspaces"),
    clientId: v.optional(v.id("clients")),
    startedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("destinationRuns", {
      ...args,
      status: "running",
      createdAt: new Date().toISOString(),
    });
  },
});

export const recordFinish = internalMutation({
  args: {
    runId: v.id("destinationRuns"),
    status: v.string(), // "success" | "error"
    finishedAt: v.number(),
    durationMs: v.number(),
    rowsWritten: v.optional(v.number()),
    bytesWritten: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, { runId, ...patch }) => {
    await ctx.db.patch(runId, patch);
  },
});
