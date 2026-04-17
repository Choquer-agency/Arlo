import { NextResponse } from "next/server";
import Stripe from "stripe";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const workspaces = await fetchQuery(api.workspaces.listMine, {}, { token });
  const ws = workspaces[0];
  if (!ws?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing customer yet" }, { status: 400 });
  }
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" });
  const origin = new URL(req.url).origin;
  const portal = await stripe.billingPortal.sessions.create({
    customer: ws.stripeCustomerId,
    return_url: `${origin}/settings/billing`,
  });
  return NextResponse.json({ url: portal.url });
}
