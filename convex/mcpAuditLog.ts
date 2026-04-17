import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireMembership, requireRole } from "./lib/currentUser";

export const record = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.optional(v.id("users")),
    tokenId: v.optional(v.id("mcpTokens")),
    tool: v.string(),
    args: v.any(),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
    durationMs: v.number(),
    clientId: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("mcpAuditLog", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});

export const listWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { workspaceId, limit }) => {
    await requireRole(ctx, workspaceId, "admin");
    return ctx.db
      .query("mcpAuditLog")
      .withIndex("by_workspace_created", (q) => q.eq("workspaceId", workspaceId))
      .order("desc")
      .take(limit ?? 100);
  },
});

export const listMine = query({
  args: { workspaceId: v.id("workspaces"), limit: v.optional(v.number()) },
  handler: async (ctx, { workspaceId, limit }) => {
    const member = await requireMembership(ctx, workspaceId);
    return ctx.db
      .query("mcpAuditLog")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", member.userId)
      )
      .order("desc")
      .take(limit ?? 50);
  },
});

export const listForClient = query({
  args: { workspaceId: v.id("workspaces"), clientId: v.id("clients"), limit: v.optional(v.number()) },
  handler: async (ctx, { workspaceId, clientId, limit }) => {
    await requireMembership(ctx, workspaceId);
    const rows = await ctx.db
      .query("mcpAuditLog")
      .withIndex("by_client", (q) => q.eq("clientId", clientId))
      .order("desc")
      .take(limit ?? 20);
    return rows.filter((r) => r.workspaceId === workspaceId);
  },
});
