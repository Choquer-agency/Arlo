import { NextResponse } from "next/server";
import Stripe from "stripe";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";

export const runtime = "nodejs";

const PRICE_LOOKUP: Record<string, string | undefined> = {
  solo: process.env.STRIPE_PRICE_SOLO,
  studio: process.env.STRIPE_PRICE_STUDIO,
  agency: process.env.STRIPE_PRICE_AGENCY,
  scale: process.env.STRIPE_PRICE_SCALE,
};

/**
 * Creates a Stripe Checkout Session.
 *
 * Works in two modes:
 *   1. Authenticated (workspace exists) — looks up the workspace's Stripe customer
 *      (or creates one on first checkout) and sets metadata for the webhook to
 *      flip `workspace.plan` after payment.
 *   2. Unauthenticated (no Convex token / demo mode) — creates a session WITHOUT
 *      a preset customer. Stripe collects the email on its hosted checkout and
 *      creates a new customer at checkout time. Useful for the marketing-site
 *      CTA before the user has signed in.
 *
 * In either case the webhook handler is the source of truth for plan changes.
 */
export async function POST(req: Request) {
  const { plan } = (await req.json().catch(() => ({}))) as { plan?: string };
  const priceId = plan ? PRICE_LOOKUP[plan] : undefined;
  if (!priceId) {
    return NextResponse.json(
      { error: `Unknown plan: ${plan}. Make sure STRIPE_PRICE_${(plan ?? "").toUpperCase()} is set.` },
      { status: 400 }
    );
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY not configured" },
      { status: 500 }
    );
  }
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" });
  const origin = new URL(req.url).origin;

  // Try authenticated path first — only activates if Convex is configured
  const convexConfigured = !!process.env.NEXT_PUBLIC_CONVEX_URL;
  let token: string | null = null;
  if (convexConfigured) {
    try {
      token = (await convexAuthNextjsToken()) ?? null;
    } catch {
      token = null;
    }
  }

  let customerId: string | undefined;
  let workspaceId: string | undefined;

  if (token) {
    try {
      const workspaces = await fetchQuery(api.workspaces.listMine, {}, { token });
      const ws = workspaces[0];
      if (ws) {
        workspaceId = ws._id;
        customerId = ws.stripeCustomerId;
        if (!customerId) {
          const customer = await stripe.customers.create({
            name: ws.name,
            metadata: { workspaceId: ws._id },
          });
          customerId = customer.id;
          await fetchMutation(
            api.workspaces.updatePlan,
            { workspaceId: ws._id, plan: ws.plan, stripeCustomerId: customerId },
            { token }
          );
        }
      }
    } catch (err) {
      // Authenticated fetch failed — fall through to guest checkout
      console.warn("Stripe checkout: auth path failed, using guest mode", err);
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_creation: customerId ? undefined : "always",
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${origin}/sign-in?checkout=success&plan=${plan}`,
    cancel_url: `${origin}/?checkout=cancelled`,
    metadata: {
      plan: plan!,
      ...(workspaceId ? { workspaceId } : {}),
    },
    subscription_data: {
      metadata: {
        plan: plan!,
        ...(workspaceId ? { workspaceId } : {}),
      },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
