import { action, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { createAccount, modifyAccountCredentials } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";
import { getCurrentUser } from "./lib/currentUser";
import type { Id } from "./_generated/dataModel";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "business";
}

/**
 * Agency provisioning: create a client's Arlo account (email + temp password),
 * a single-business workspace on a complimentary trial, and the business record.
 * Runs as an action because credential creation needs the action runtime; the
 * super-admin check + DB writes happen in mutations it calls.
 */
export const provisionClient = action({
  args: {
    email: v.string(),
    tempPassword: v.string(),
    businessName: v.string(),
    websiteUrl: v.optional(v.string()),
    contactName: v.optional(v.string()),
    plan: v.string(),
    trialDays: v.number(),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; error?: string; workspaceId?: Id<"workspaces"> }> => {
    const isAdmin = await ctx.runQuery(api.admin.amISuperAdmin, {});
    if (!isAdmin) return { ok: false, error: "Not authorized" };

    const me = await ctx.runQuery(api.users.me, {});
    if (!me) return { ok: false, error: "Not authorized" };

    const email = args.email.trim().toLowerCase();

    // Create the email/password auth account + user. Fails if the email is taken.
    let userId: Id<"users">;
    try {
      const created = await createAccount(ctx, {
        provider: "password",
        account: { id: email, secret: args.tempPassword },
        profile: { email, name: args.contactName || args.businessName },
      });
      userId = created.user._id as Id<"users">;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create account";
      return {
        ok: false,
        error: message.includes("already")
          ? `An account already exists for ${email}.`
          : message,
      };
    }

    const workspaceId: Id<"workspaces"> = await ctx.runMutation(
      internal.provisioning.setupProvisionedWorkspace,
      {
        userId,
        agencyUserId: me._id as Id<"users">,
        businessName: args.businessName,
        websiteUrl: args.websiteUrl,
        plan: args.plan,
        trialDays: args.trialDays,
      }
    );

    return { ok: true, workspaceId };
  },
});

/** Internal: build the workspace + membership + business for a provisioned client. */
export const setupProvisionedWorkspace = internalMutation({
  args: {
    userId: v.id("users"),
    agencyUserId: v.id("users"),
    businessName: v.string(),
    websiteUrl: v.optional(v.string()),
    plan: v.string(),
    trialDays: v.number(),
  },
  handler: async (ctx, { userId, agencyUserId, businessName, websiteUrl, plan, trialDays }) => {
    const now = new Date().toISOString();
    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();

    const base = slugify(businessName);
    let slug = base;
    let i = 1;
    while (await ctx.db.query("workspaces").withIndex("by_slug", (q) => q.eq("slug", slug)).unique()) {
      slug = `${base}-${++i}`;
    }

    const workspaceId = await ctx.db.insert("workspaces", {
      name: businessName.trim(),
      slug,
      workspaceType: "solo",
      plan,
      trialEndsAt,
      createdAt: now,
      managedByAgencyUserId: agencyUserId,
      provisioningPending: true,
    });
    await ctx.db.insert("members", {
      workspaceId,
      userId,
      role: "owner",
      acceptedAt: now,
      createdAt: now,
    });
    await ctx.db.insert("clients", {
      workspaceId,
      name: businessName.trim(),
      slug: slugify(businessName),
      websiteUrl,
      createdAt: now,
    });
    return workspaceId;
  },
});

/** Whether the signed-in user still needs to finish provisioning setup. */
export const myProvisioningState = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const membership = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (!membership) return { pending: false };
    const ws = await ctx.db.get(membership.workspaceId);
    return {
      pending: !!ws?.provisioningPending,
      workspaceId: ws?._id ?? null,
      businessName: ws?.name ?? null,
      trialEndsAt: ws?.trialEndsAt ?? null,
      email: user.email ?? null,
    };
  },
});

/**
 * First-login: the provisioned client sets their own password. Changes the
 * credential (action runtime) then clears the pending flag.
 */
export const completeProvisioning = action({
  args: { newPassword: v.string() },
  handler: async (ctx, { newPassword }): Promise<{ ok: boolean; error?: string }> => {
    const state = await ctx.runQuery(api.provisioning.myProvisioningState, {});
    if (!state || !state.pending || !state.email) {
      return { ok: false, error: "Nothing to complete." };
    }
    if (newPassword.length < 8) {
      return { ok: false, error: "Password must be at least 8 characters." };
    }
    try {
      await modifyAccountCredentials(ctx, {
        provider: "password",
        account: { id: state.email.toLowerCase(), secret: newPassword },
      });
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Could not set password" };
    }
    if (state.workspaceId) {
      await ctx.runMutation(internal.provisioning.clearPending, {
        workspaceId: state.workspaceId,
      });
    }
    return { ok: true };
  },
});

export const clearPending = internalMutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    await ctx.db.patch(workspaceId, { provisioningPending: false });
  },
});

/** Skip password change but still dismiss onboarding (client keeps temp password). */
export const dismissProvisioning = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const membership = await ctx.db
      .query("members")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", user._id)
      )
      .unique();
    if (!membership) throw new Error("Not a member");
    await ctx.db.patch(workspaceId, { provisioningPending: false });
  },
});
