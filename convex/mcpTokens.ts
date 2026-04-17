import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId, requireMembership } from "./lib/currentUser";

export const listMine = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const userId = await requireUserId(ctx);
    await requireMembership(ctx, workspaceId);
    const tokens = await ctx.db
      .query("mcpTokens")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .collect();
    return tokens.filter((t) => !t.revokedAt);
  },
});

export const upsertMyToken = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    tokenHash: v.string(),
    encryptedToken: v.string(),
    tokenIv: v.string(),
    label: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, tokenHash, encryptedToken, tokenIv, label }) => {
    const userId = await requireUserId(ctx);
    await requireMembership(ctx, workspaceId);
    const existing = await ctx.db
      .query("mcpTokens")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .filter((q) => q.eq(q.field("revokedAt"), undefined))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { revokedAt: new Date().toISOString() });
    }
    return ctx.db.insert("mcpTokens", {
      workspaceId,
      userId,
      tokenHash,
      encryptedToken,
      tokenIv,
      label,
      createdAt: new Date().toISOString(),
    });
  },
});

export const revoke = mutation({
  args: { workspaceId: v.id("workspaces"), tokenId: v.id("mcpTokens") },
  handler: async (ctx, { workspaceId, tokenId }) => {
    const userId = await requireUserId(ctx);
    await requireMembership(ctx, workspaceId);
    const token = await ctx.db.get(tokenId);
    if (!token || token.workspaceId !== workspaceId || token.userId !== userId) {
      throw new Error("Token not found");
    }
    await ctx.db.patch(tokenId, { revokedAt: new Date().toISOString() });
  },
});

export const findByHash = query({
  args: { tokenHash: v.string() },
  handler: async (ctx, { tokenHash }) => {
    const token = await ctx.db
      .query("mcpTokens")
      .withIndex("by_hash", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    if (!token || token.revokedAt) return null;
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", token.workspaceId).eq("userId", token.userId)
      )
      .unique();
    if (!member) return null;
    return { token, role: member.role };
  },
});

export const touchLastUsed = mutation({
  args: { tokenId: v.id("mcpTokens") },
  handler: async (ctx, { tokenId }) => {
    await ctx.db.patch(tokenId, { lastUsedAt: new Date().toISOString() });
  },
});
