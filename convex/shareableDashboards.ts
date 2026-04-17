/**
 * Public lookup for the /share/[token] route. Bypasses requireMembership because
 * this is the public surface — but it ONLY returns the fields the public page
 * needs, scoped to the single destination matched by the token hash.
 *
 * SECURITY: the caller gets back the workspaceId + clientId of the matched
 * destination so the /share/[token] route can call fetchDataset with the locked
 * clientId. A leaked token can therefore only reveal its one client's data.
 */
import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireServiceSecret } from "./lib/serviceAuth";

export const resolveByTokenHash = query({
  args: {
    _serviceSecret: v.string(),
    tokenHash: v.string(),
  },
  handler: async (ctx, { _serviceSecret, tokenHash }) => {
    requireServiceSecret(_serviceSecret);
    const dest = await ctx.db
      .query("destinations")
      .withIndex("by_live_token_hash", (q) => q.eq("liveTokenHash", tokenHash))
      .first();
    if (!dest) return null;
    if (dest.kind !== "shareable_dashboard") return null;
    if (dest.status !== "active") return null;
    return {
      destinationId: dest._id,
      workspaceId: dest.workspaceId,
      clientId: dest.clientId,
      config: dest.config,
    };
  },
});
