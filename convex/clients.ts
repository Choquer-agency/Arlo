import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireMembership } from "./lib/currentUser";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "client";
}

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, { workspaceId, includeArchived }) => {
    await requireMembership(ctx, workspaceId);
    const all = await ctx.db
      .query("clients")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return includeArchived ? all : all.filter((c) => !c.archivedAt);
  },
});

export const get = query({
  args: { workspaceId: v.id("workspaces"), clientId: v.id("clients") },
  handler: async (ctx, { workspaceId, clientId }) => {
    await requireMembership(ctx, workspaceId);
    const client = await ctx.db.get(clientId);
    if (!client || client.workspaceId !== workspaceId) return null;
    return client;
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    websiteUrl: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, name, websiteUrl }) => {
    await requireMembership(ctx, workspaceId);
    const base = slugify(name);
    let slug = base;
    let i = 1;
    while (
      await ctx.db
        .query("clients")
        .withIndex("by_workspace_slug", (q) => q.eq("workspaceId", workspaceId).eq("slug", slug))
        .unique()
    ) {
      slug = `${base}-${++i}`;
    }
    const now = new Date().toISOString();
    return ctx.db.insert("clients", {
      workspaceId,
      name: name.trim(),
      slug,
      websiteUrl,
      createdAt: now,
    });
  },
});

const assignmentFields = {
  ga4PropertyId: v.optional(v.string()),
  gscSiteUrl: v.optional(v.string()),
  googleAdsCustomerId: v.optional(v.string()),
  googleAdsLoginCustomerId: v.optional(v.string()),
  youtubeChannelId: v.optional(v.string()),
  gbpLocationName: v.optional(v.string()),
  metaAdAccountId: v.optional(v.string()),
  metaPageId: v.optional(v.string()),
  linkedinAdAccountUrn: v.optional(v.string()),
  tiktokAdvertiserId: v.optional(v.string()),
  shopifyStoreDomain: v.optional(v.string()),
  stripeAccountId: v.optional(v.string()),
  hubspotPortalId: v.optional(v.string()),
  mailerliteAccountId: v.optional(v.string()),
  mailchimpAccountId: v.optional(v.string()),
};

export const updateAssignments = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    clientId: v.id("clients"),
    ...assignmentFields,
  },
  handler: async (ctx, args) => {
    const { workspaceId, clientId, ...rest } = args;
    await requireMembership(ctx, workspaceId);
    const client = await ctx.db.get(clientId);
    if (!client || client.workspaceId !== workspaceId) throw new Error("Client not found");
    await ctx.db.patch(clientId, rest);
  },
});

export const archive = mutation({
  args: { workspaceId: v.id("workspaces"), clientId: v.id("clients") },
  handler: async (ctx, { workspaceId, clientId }) => {
    await requireMembership(ctx, workspaceId);
    const client = await ctx.db.get(clientId);
    if (!client || client.workspaceId !== workspaceId) throw new Error("Client not found");
    await ctx.db.patch(clientId, { archivedAt: new Date().toISOString() });
  },
});

export const unarchive = mutation({
  args: { workspaceId: v.id("workspaces"), clientId: v.id("clients") },
  handler: async (ctx, { workspaceId, clientId }) => {
    await requireMembership(ctx, workspaceId);
    const client = await ctx.db.get(clientId);
    if (!client || client.workspaceId !== workspaceId) throw new Error("Client not found");
    await ctx.db.patch(clientId, { archivedAt: undefined });
  },
});
