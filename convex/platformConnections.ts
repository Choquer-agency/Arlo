import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireMembership } from "./lib/currentUser";

export const listForWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    await requireMembership(ctx, workspaceId);
    return ctx.db
      .query("platformConnections")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const getByProvider = query({
  args: { workspaceId: v.id("workspaces"), provider: v.string() },
  handler: async (ctx, { workspaceId, provider }) => {
    await requireMembership(ctx, workspaceId);
    return ctx.db
      .query("platformConnections")
      .withIndex("by_workspace_provider", (q) =>
        q.eq("workspaceId", workspaceId).eq("provider", provider)
      )
      .first();
  },
});

export const upsert = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    provider: v.string(),
    accountEmail: v.optional(v.string()),
    accountId: v.optional(v.string()),
    encryptedTokens: v.string(),
    tokensIv: v.string(),
    scopes: v.string(),
    tokenExpiresAt: v.optional(v.number()),
    addedByUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("platformConnections")
      .withIndex("by_workspace_provider", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("provider", args.provider)
      )
      .first();
    const now = new Date().toISOString();
    if (existing) {
      await ctx.db.patch(existing._id, {
        accountEmail: args.accountEmail,
        accountId: args.accountId,
        encryptedTokens: args.encryptedTokens,
        tokensIv: args.tokensIv,
        scopes: args.scopes,
        tokenExpiresAt: args.tokenExpiresAt,
        status: "active",
        lastError: undefined,
        lastVerifiedAt: now,
      });
      return existing._id;
    }
    return ctx.db.insert("platformConnections", {
      ...args,
      status: "active",
      lastVerifiedAt: now,
      createdAt: now,
    });
  },
});

export const updateAvailableAccounts = internalMutation({
  args: {
    connectionId: v.id("platformConnections"),
    availableAccounts: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        kind: v.string(),
      })
    ),
  },
  handler: async (ctx, { connectionId, availableAccounts }) => {
    await ctx.db.patch(connectionId, { availableAccounts });
  },
});

export const updateTokens = internalMutation({
  args: {
    connectionId: v.id("platformConnections"),
    encryptedTokens: v.string(),
    tokensIv: v.string(),
    tokenExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, { connectionId, ...patch }) => {
    await ctx.db.patch(connectionId, patch);
  },
});

export const markError = internalMutation({
  args: { connectionId: v.id("platformConnections"), error: v.string() },
  handler: async (ctx, { connectionId, error }) => {
    await ctx.db.patch(connectionId, { status: "error", lastError: error });
  },
});

export const disconnect = mutation({
  args: { workspaceId: v.id("workspaces"), connectionId: v.id("platformConnections") },
  handler: async (ctx, { workspaceId, connectionId }) => {
    await requireMembership(ctx, workspaceId);
    const conn = await ctx.db.get(connectionId);
    if (!conn || conn.workspaceId !== workspaceId) throw new Error("Connection not found");
    await ctx.db.delete(connectionId);
  },
});
