import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireSuperAdmin, isSuperAdmin } from "./lib/admin";
import { getCurrentUser } from "./lib/currentUser";
import type { Doc } from "./_generated/dataModel";

const GOOGLE_SOURCE_FIELDS = [
  "ga4PropertyId",
  "gscSiteUrl",
  "googleAdsCustomerId",
  "youtubeChannelId",
  "gbpLocationName",
] as const;

function liveSourceCount(client: Doc<"clients">): number {
  return GOOGLE_SOURCE_FIELDS.filter((f) => !!client[f]).length;
}

/** Is the current user allowed to see the admin console? Drives nav + route guard. */
export const amISuperAdmin = query({
  args: {},
  handler: async (ctx) => isSuperAdmin(ctx),
});

/** Every workspace in Arlo, enriched for the CRM table. Super-admin only. */
export const listWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);
    const workspaces = await ctx.db.query("workspaces").collect();

    return Promise.all(
      workspaces.map(async (ws) => {
        const members = await ctx.db
          .query("members")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", ws._id))
          .collect();
        const ownerMember = members.find((m) => m.role === "owner") ?? members[0];
        const owner = ownerMember ? await ctx.db.get(ownerMember.userId) : null;

        const clients = await ctx.db
          .query("clients")
          .withIndex("by_workspace_archived", (q) =>
            q.eq("workspaceId", ws._id).eq("archivedAt", undefined)
          )
          .collect();

        const tokens = await ctx.db
          .query("mcpTokens")
          .withIndex("by_workspace_user", (q) => q.eq("workspaceId", ws._id))
          .collect();
        const lastMcpUsedAt = tokens
          .map((t) => t.lastUsedAt)
          .filter((x): x is string => !!x)
          .sort()
          .at(-1) ?? null;

        const connections = await ctx.db
          .query("platformConnections")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", ws._id))
          .collect();

        return {
          _id: ws._id,
          name: ws.name,
          workspaceType: ws.workspaceType,
          plan: ws.plan,
          trialEndsAt: ws.trialEndsAt ?? null,
          createdAt: ws.createdAt,
          managedByAgency: !!ws.managedByAgencyUserId,
          stripeCustomerId: ws.stripeCustomerId ?? null,
          ownerEmail: owner?.email ?? null,
          ownerName: owner?.name ?? null,
          memberCount: members.length,
          clientCount: clients.length,
          websites: clients.map((c) => c.websiteUrl).filter((x): x is string => !!x),
          liveSources: clients.reduce((sum, c) => sum + liveSourceCount(c), 0),
          googleConnected: connections.some(
            (c) => c.provider === "google" && c.status === "active"
          ),
          lastMcpUsedAt,
        };
      })
    );
  },
});

/** Deep detail for one workspace — clients, members, connections. Super-admin only. */
export const getWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    await requireSuperAdmin(ctx);
    const ws = await ctx.db.get(workspaceId);
    if (!ws) return null;

    const members = await ctx.db
      .query("members")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    const memberRows = await Promise.all(
      members.map(async (m) => {
        const u = await ctx.db.get(m.userId);
        return { role: m.role, email: u?.email ?? null, name: u?.name ?? null };
      })
    );

    const clients = await ctx.db
      .query("clients")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    const connections = await ctx.db
      .query("platformConnections")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    return {
      workspace: {
        _id: ws._id,
        name: ws.name,
        plan: ws.plan,
        workspaceType: ws.workspaceType,
        trialEndsAt: ws.trialEndsAt ?? null,
        createdAt: ws.createdAt,
        managedByAgency: !!ws.managedByAgencyUserId,
      },
      members: memberRows,
      clients: clients.map((c) => ({
        _id: c._id,
        name: c.name,
        websiteUrl: c.websiteUrl ?? null,
        archived: !!c.archivedAt,
        liveSources: liveSourceCount(c),
      })),
      connections: connections.map((c) => ({
        provider: c.provider,
        status: c.status,
        accountEmail: c.accountEmail ?? null,
      })),
    };
  },
});

/** Push the trial end out (or in) by N days. Super-admin only. */
export const extendTrial = mutation({
  args: { workspaceId: v.id("workspaces"), days: v.number() },
  handler: async (ctx, { workspaceId, days }) => {
    await requireSuperAdmin(ctx);
    const ws = await ctx.db.get(workspaceId);
    if (!ws) throw new Error("Workspace not found");
    const base = ws.trialEndsAt ? new Date(ws.trialEndsAt).getTime() : Date.now();
    const next = new Date(base + days * 24 * 60 * 60 * 1000).toISOString();
    await ctx.db.patch(workspaceId, { trialEndsAt: next });
    return next;
  },
});

/** Directly set a workspace's plan (comp, upgrade, downgrade). Super-admin only. */
export const setPlan = mutation({
  args: { workspaceId: v.id("workspaces"), plan: v.string() },
  handler: async (ctx, { workspaceId, plan }) => {
    await requireSuperAdmin(ctx);
    await ctx.db.patch(workspaceId, { plan });
  },
});

/** Flag/unflag a workspace as agency-managed. Super-admin only. */
export const setManaged = mutation({
  args: { workspaceId: v.id("workspaces"), managed: v.boolean() },
  handler: async (ctx, { workspaceId, managed }) => {
    await requireSuperAdmin(ctx);
    const me = await getCurrentUser(ctx);
    await ctx.db.patch(workspaceId, {
      managedByAgencyUserId: managed ? me?._id : undefined,
    });
  },
});
