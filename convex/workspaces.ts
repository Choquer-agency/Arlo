import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId, requireMembership } from "./lib/currentUser";
import { isSuperAdminEmail } from "./lib/superadmin";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "workspace";
}

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const memberships = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const workspaces = await Promise.all(
      memberships.map(async (m) => {
        const ws = await ctx.db.get(m.workspaceId);
        return ws ? { ...ws, role: m.role } : null;
      })
    );
    return workspaces.filter((w): w is NonNullable<typeof w> => w !== null);
  },
});

export const get = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    await requireMembership(ctx, workspaceId);
    return ctx.db.get(workspaceId);
  },
});

/**
 * The workspace the app should operate on right now. Normally the user's own
 * first workspace. If a super-admin passes `actingWorkspaceId` (via "Enter
 * workspace"), returns that client's workspace instead, flagged as impersonating
 * — every workspace-scoped query then targets it. Non-admins can't impersonate.
 */
export const resolveActive = query({
  args: { actingWorkspaceId: v.optional(v.id("workspaces")) },
  handler: async (ctx, { actingWorkspaceId }) => {
    const userId = await requireUserId(ctx);

    if (actingWorkspaceId) {
      const me = await ctx.db.get(userId);
      if (isSuperAdminEmail(me?.email)) {
        const ws = await ctx.db.get(actingWorkspaceId);
        if (ws) return { ...ws, role: "owner", impersonating: true };
      }
      // Not an admin (or workspace gone) — fall through to own workspace.
    }

    const membership = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!membership) return null;
    const ws = await ctx.db.get(membership.workspaceId);
    if (!ws) return null;
    return { ...ws, role: membership.role, impersonating: false };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    workspaceType: v.optional(
      v.union(v.literal("solo"), v.literal("agency"))
    ),
    // When true, skip auto-creating the solo business — the onboarding wizard
    // creates it itself (with a website) so solo + agency share one add-business step.
    skipAutoClient: v.optional(v.boolean()),
  },
  handler: async (ctx, { name, workspaceType, skipAutoClient }) => {
    const userId = await requireUserId(ctx);
    const type = workspaceType ?? "agency";
    const base = slugify(name);
    let slug = base;
    let i = 1;
    while (
      await ctx.db.query("workspaces").withIndex("by_slug", (q) => q.eq("slug", slug)).unique()
    ) {
      slug = `${base}-${++i}`;
    }
    const now = new Date().toISOString();
    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const workspaceId = await ctx.db.insert("workspaces", {
      name: name.trim(),
      slug,
      workspaceType: type,
      plan: type === "solo" ? "solo" : "free",
      trialEndsAt: trialEnd,
      createdAt: now,
    });
    await ctx.db.insert("members", {
      workspaceId,
      userId,
      role: "owner",
      acceptedAt: now,
      createdAt: now,
    });

    // For the solo flow, auto-create the user's business as the single client
    // so they don't land on an empty "add a client" screen (unless the caller
    // opts out — e.g. the onboarding wizard creates the business itself).
    if (type === "solo" && !skipAutoClient) {
      const businessName = name.trim();
      await ctx.db.insert("clients", {
        workspaceId,
        name: businessName,
        slug: slugify(businessName),
        createdAt: now,
      });
    }

    return { workspaceId, slug, workspaceType: type };
  },
});

export const updatePlan = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    plan: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, plan, stripeCustomerId, stripeSubscriptionId }) => {
    const patch: Record<string, unknown> = { plan };
    if (stripeCustomerId) patch.stripeCustomerId = stripeCustomerId;
    if (stripeSubscriptionId) patch.stripeSubscriptionId = stripeSubscriptionId;
    await ctx.db.patch(workspaceId, patch);
  },
});
