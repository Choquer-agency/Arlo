import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireMembership, requireRole, requireUserId } from "./lib/currentUser";

export const list = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    await requireMembership(ctx, workspaceId);
    const members = await ctx.db
      .query("members")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return Promise.all(
      members.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return {
          _id: m._id,
          role: m.role,
          acceptedAt: m.acceptedAt,
          createdAt: m.createdAt,
          user: user
            ? { _id: user._id, email: user.email, name: user.name, image: user.image }
            : null,
        };
      })
    );
  },
});

export const myMembership = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const userId = await requireUserId(ctx);
    return ctx.db
      .query("members")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();
  },
});

export const updateRole = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    memberId: v.id("members"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, { workspaceId, memberId, role }) => {
    await requireRole(ctx, workspaceId, "admin");
    const target = await ctx.db.get(memberId);
    if (!target || target.workspaceId !== workspaceId) throw new Error("Member not found");
    await ctx.db.patch(memberId, { role });
  },
});

export const remove = mutation({
  args: { workspaceId: v.id("workspaces"), memberId: v.id("members") },
  handler: async (ctx, { workspaceId, memberId }) => {
    await requireRole(ctx, workspaceId, "admin");
    const target = await ctx.db.get(memberId);
    if (!target || target.workspaceId !== workspaceId) throw new Error("Member not found");
    if (target.role === "owner") throw new Error("Cannot remove workspace owner");
    await ctx.db.delete(memberId);
  },
});
