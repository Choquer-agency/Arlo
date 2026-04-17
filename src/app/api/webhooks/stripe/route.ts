import { NextResponse } from "next/server";
import Stripe from "stripe";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export const runtime = "nodejs";

const PRICE_TO_PLAN: Record<string, string> = {};
if (process.env.STRIPE_PRICE_SOLO) PRICE_TO_PLAN[process.env.STRIPE_PRICE_SOLO] = "solo";
if (process.env.STRIPE_PRICE_STUDIO) PRICE_TO_PLAN[process.env.STRIPE_PRICE_STUDIO] = "studio";
if (process.env.STRIPE_PRICE_AGENCY) PRICE_TO_PLAN[process.env.STRIPE_PRICE_AGENCY] = "agency";
if (process.env.STRIPE_PRICE_SCALE) PRICE_TO_PLAN[process.env.STRIPE_PRICE_SCALE] = "scale";

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });
  const sig = req.headers.get("stripe-signature") ?? "";
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.metadata?.workspaceId as Id<"workspaces"> | undefined;
        const plan = session.metadata?.plan ?? "studio";
        if (workspaceId) {
          await fetchMutation(api.workspaces.updatePlan, {
            workspaceId,
            plan,
            stripeCustomerId:
              typeof session.customer === "string" ? session.customer : session.customer?.id,
            stripeSubscriptionId:
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id,
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const workspaceId = sub.metadata?.workspaceId as Id<"workspaces"> | undefined;
        const priceId = sub.items.data[0]?.price.id ?? "";
        const plan = sub.status === "canceled" ? "free" : PRICE_TO_PLAN[priceId] ?? "studio";
        if (workspaceId) {
          await fetchMutation(api.workspaces.updatePlan, {
            workspaceId,
            plan,
            stripeSubscriptionId: sub.id,
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const workspaceId = sub.metadata?.workspaceId as Id<"workspaces"> | undefined;
        if (workspaceId) {
          await fetchMutation(api.workspaces.updatePlan, {
            workspaceId,
            plan: "free",
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error("stripe webhook handler error", err);
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
