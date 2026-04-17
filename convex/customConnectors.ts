import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireMembership, requireRole, requireUserId } from "./lib/currentUser";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "connector";
}

const metricField = v.object({ name: v.string(), description: v.string() });

const baseArgs = {
  workspaceId: v.id("workspaces"),
  clientId: v.optional(v.id("clients")),
  name: v.string(),
  description: v.optional(v.string()),
  category: v.string(),
  color: v.string(),
  authType: v.string(),
  authHeaderName: v.optional(v.string()),
  authQueryParam: v.optional(v.string()),
  encryptedCredentials: v.string(),
  credentialsIv: v.string(),
  baseUrl: v.string(),
  queryMethod: v.string(),
  queryPath: v.string(),
  queryParams: v.any(),
  queryBody: v.optional(v.any()),
  extraHeaders: v.optional(v.any()),
  totalsPath: v.string(),
  breakdownPath: v.optional(v.string()),
  metricsMap: v.optional(v.any()),
  metrics: v.array(metricField),
  dimensions: v.array(metricField),
};

export const list = query({
  args: { workspaceId: v.id("workspaces"), clientId: v.optional(v.id("clients")) },
  handler: async (ctx, { workspaceId, clientId }) => {
    await requireMembership(ctx, workspaceId);
    const rows = await ctx.db
      .query("customConnectors")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    if (clientId === undefined) return rows;
    return rows.filter((r) => r.clientId === clientId || r.clientId === undefined);
  },
});

export const getBySlug = query({
  args: { workspaceId: v.id("workspaces"), slug: v.string() },
  handler: async (ctx, { workspaceId, slug }) => {
    await requireMembership(ctx, workspaceId);
    return ctx.db
      .query("customConnectors")
      .withIndex("by_workspace_slug", (q) =>
        q.eq("workspaceId", workspaceId).eq("slug", slug)
      )
      .unique();
  },
});

export const create = mutation({
  args: baseArgs,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await requireMembership(ctx, args.workspaceId);
    const base = slugify(args.name);
    let slug = base;
    let i = 1;
    while (
      await ctx.db
        .query("customConnectors")
        .withIndex("by_workspace_slug", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("slug", slug)
        )
        .unique()
    ) {
      slug = `${base}-${++i}`;
    }
    return ctx.db.insert("customConnectors", {
      ...args,
      slug,
      status: "active",
      createdByUserId: userId,
      createdAt: new Date().toISOString(),
    });
  },
});

export const remove = mutation({
  args: { workspaceId: v.id("workspaces"), connectorId: v.id("customConnectors") },
  handler: async (ctx, { workspaceId, connectorId }) => {
    await requireRole(ctx, workspaceId, "admin");
    const c = await ctx.db.get(connectorId);
    if (!c || c.workspaceId !== workspaceId) throw new Error("Connector not found");
    await ctx.db.delete(connectorId);
  },
});

export const recordTestResult = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    connectorId: v.id("customConnectors"),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { workspaceId, connectorId, error }) => {
    await requireMembership(ctx, workspaceId);
    const c = await ctx.db.get(connectorId);
    if (!c || c.workspaceId !== workspaceId) throw new Error("Connector not found");
    await ctx.db.patch(connectorId, {
      lastTestedAt: new Date().toISOString(),
      lastTestError: error,
      status: error ? "error" : "active",
    });
  },
});
