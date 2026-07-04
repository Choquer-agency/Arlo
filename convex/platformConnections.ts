import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireMembership } from "./lib/currentUser";
import { requireServiceSecret } from "./lib/serviceAuth";
import { isSuperAdmin } from "./lib/admin";

const CLIENT_ASSIGN_FIELDS = [
  "ga4PropertyId",
  "gscSiteUrl",
  "googleAdsCustomerId",
  "youtubeChannelId",
  "gbpLocationName",
] as const;

/**
 * Sanitize connections for a client-facing response.
 *
 * Two concerns:
 *  1. Never ship encrypted tokens to the browser.
 *  2. On an AGENCY-MANAGED workspace, the stored OAuth belongs to the agency and
 *     its `availableAccounts` lists EVERY property the agency's Google can reach
 *     — i.e. all their other clients. A logged-in client must never see that.
 *     So for a non-admin caller on a managed workspace we reveal only the
 *     accounts already assigned to this workspace's own clients, and hide the
 *     agency's email. Super-admins (incl. "Enter workspace") see everything.
 */
async function sanitizeForCaller(
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  connections: Doc<"platformConnections">[]
) {
  const workspace = await ctx.db.get(workspaceId);
  const managed = !!workspace?.managedByAgencyUserId;
  const admin = await isSuperAdmin(ctx);

  let allowed: Set<string> | null = null;
  if (managed && !admin) {
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    allowed = new Set<string>();
    for (const c of clients) {
      for (const f of CLIENT_ASSIGN_FIELDS) {
        const val = c[f];
        if (val) allowed.add(val);
      }
    }
  }

  return connections.map((conn) => {
    // Never ship real tokens to the browser (blanked, not omitted, to keep shape).
    const safe = { ...conn, encryptedTokens: "", tokensIv: "" };
    if (!allowed) return safe;
    return {
      ...safe,
      accountEmail: undefined, // hide the agency's Google identity from the client
      availableAccounts: (conn.availableAccounts ?? []).filter((a) => allowed!.has(a.id)),
    };
  });
}

export const listForWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    await requireMembership(ctx, workspaceId);
    const conns = await ctx.db
      .query("platformConnections")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
    return sanitizeForCaller(ctx, workspaceId, conns);
  },
});

export const getByProvider = query({
  args: { workspaceId: v.id("workspaces"), provider: v.string() },
  handler: async (ctx, { workspaceId, provider }) => {
    await requireMembership(ctx, workspaceId);
    const conn = await ctx.db
      .query("platformConnections")
      .withIndex("by_workspace_provider", (q) =>
        q.eq("workspaceId", workspaceId).eq("provider", provider)
      )
      .first();
    if (!conn) return null;
    const [safe] = await sanitizeForCaller(ctx, workspaceId, [conn]);
    return safe;
  },
});

/**
 * Service-secret variant of `getByProvider`, for trusted server code
 * (buildConnectorContext) that loads a connection outside a user session.
 */
export const getByProviderForService = query({
  args: {
    _serviceSecret: v.string(),
    workspaceId: v.id("workspaces"),
    provider: v.string(),
  },
  handler: async (ctx, { _serviceSecret, workspaceId, provider }) => {
    requireServiceSecret(_serviceSecret);
    return ctx.db
      .query("platformConnections")
      .withIndex("by_workspace_provider", (q) =>
        q.eq("workspaceId", workspaceId).eq("provider", provider)
      )
      .first();
  },
});

export const upsert = mutation({
  args: {
    _serviceSecret: v.string(),
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
  handler: async (ctx, { _serviceSecret, ...args }) => {
    requireServiceSecret(_serviceSecret);
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

export const updateAvailableAccounts = mutation({
  args: {
    _serviceSecret: v.string(),
    connectionId: v.id("platformConnections"),
    availableAccounts: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        kind: v.string(),
      })
    ),
  },
  handler: async (ctx, { _serviceSecret, connectionId, availableAccounts }) => {
    requireServiceSecret(_serviceSecret);
    await ctx.db.patch(connectionId, { availableAccounts });
  },
});

export const updateTokens = mutation({
  args: {
    _serviceSecret: v.string(),
    connectionId: v.id("platformConnections"),
    encryptedTokens: v.string(),
    tokensIv: v.string(),
    tokenExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, { _serviceSecret, connectionId, ...patch }) => {
    requireServiceSecret(_serviceSecret);
    await ctx.db.patch(connectionId, patch);
  },
});

export const markError = mutation({
  args: {
    _serviceSecret: v.string(),
    connectionId: v.id("platformConnections"),
    error: v.string(),
  },
  handler: async (ctx, { _serviceSecret, connectionId, error }) => {
    requireServiceSecret(_serviceSecret);
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
