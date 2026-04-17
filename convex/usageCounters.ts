import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireMembership } from "./lib/currentUser";

function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7);
}

export const incrementToolCall = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    isInsight: v.optional(v.boolean()),
    tokensIn: v.optional(v.number()),
    tokensOut: v.optional(v.number()),
  },
  handler: async (ctx, { workspaceId, isInsight, tokensIn, tokensOut }) => {
    const period = currentPeriod();
    const existing = await ctx.db
      .query("usageCounters")
      .withIndex("by_workspace_period", (q) =>
        q.eq("workspaceId", workspaceId).eq("period", period)
      )
      .unique();
    const now = new Date().toISOString();
    if (!existing) {
      await ctx.db.insert("usageCounters", {
        workspaceId,
        period,
        toolCalls: 1,
        insightsCalls: isInsight ? 1 : 0,
        tokensIn: tokensIn ?? 0,
        tokensOut: tokensOut ?? 0,
        updatedAt: now,
      });
      return;
    }
    await ctx.db.patch(existing._id, {
      toolCalls: existing.toolCalls + 1,
      insightsCalls: existing.insightsCalls + (isInsight ? 1 : 0),
      tokensIn: existing.tokensIn + (tokensIn ?? 0),
      tokensOut: existing.tokensOut + (tokensOut ?? 0),
      updatedAt: now,
    });
  },
});

export const getCurrentPeriod = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    await requireMembership(ctx, workspaceId);
    const period = currentPeriod();
    const row = await ctx.db
      .query("usageCounters")
      .withIndex("by_workspace_period", (q) =>
        q.eq("workspaceId", workspaceId).eq("period", period)
      )
      .unique();
    return (
      row ?? {
        workspaceId,
        period,
        toolCalls: 0,
        insightsCalls: 0,
        tokensIn: 0,
        tokensOut: 0,
      }
    );
  },
});
