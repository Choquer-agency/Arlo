import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireSuperAdmin } from "./lib/admin";

const CATEGORIES = ["bug", "feature", "enterprise", "pricing", "general"] as const;

function normalizeCategory(raw: string | undefined): string {
  const c = (raw ?? "").toLowerCase().trim();
  return (CATEGORIES as readonly string[]).includes(c) ? c : "general";
}

/**
 * Public: store an inbound contact submission. Called server-side from the
 * /api/contact route (which also forwards to Formspark for email). No auth —
 * anyone can leave a message — but the route does the honeypot/spam filtering
 * before it ever reaches here.
 */
export const submit = mutation({
  args: {
    category: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    message: v.optional(v.string()),
    needs: v.optional(v.string()),
    companySize: v.optional(v.string()),
    clientCount: v.optional(v.string()),
    referral: v.optional(v.string()),
    selectedPackage: v.optional(v.string()),
    source: v.optional(v.string()),
    pageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("contactMessages", {
      ...args,
      category: normalizeCategory(args.category),
      status: "new",
      createdAt: new Date().toISOString(),
    });
    return { id };
  },
});

/** Admin: the full inbox, newest first. Super-admin only. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);
    const rows = await ctx.db
      .query("contactMessages")
      .withIndex("by_created")
      .order("desc")
      .collect();
    return rows;
  },
});

/** Admin: move a message between new / read / archived. Super-admin only. */
export const setStatus = mutation({
  args: {
    id: v.id("contactMessages"),
    status: v.union(v.literal("new"), v.literal("read"), v.literal("archived")),
  },
  handler: async (ctx, { id, status }) => {
    await requireSuperAdmin(ctx);
    await ctx.db.patch(id, { status });
  },
});
