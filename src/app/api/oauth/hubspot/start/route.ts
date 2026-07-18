import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { signState } from "@/lib/oauth-state";

export const runtime = "nodejs";

const HUBSPOT_SCOPES = [
  "crm.objects.contacts.read",
  "crm.objects.deals.read",
  "oauth",
].join(" ");

export async function GET(req: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Optional target workspace — used when an admin connects HubSpot on a
  // client's behalf. workspaces.get authorizes member-or-superadmin.
  const requested = new URL(req.url).searchParams.get("workspaceId");
  let ws:
    | Awaited<ReturnType<typeof fetchQuery<typeof api.workspaces.get>>>
    | undefined;
  if (requested) {
    try {
      ws = await fetchQuery(
        api.workspaces.get,
        { workspaceId: requested as Id<"workspaces"> },
        { token }
      );
    } catch {
      ws = undefined;
    }
  }
  if (!ws) {
    const workspaces = await fetchQuery(api.workspaces.listMine, {}, { token });
    ws = workspaces[0];
  }
  if (!ws) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  const clientId = process.env.HUBSPOT_OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "HUBSPOT_OAUTH_CLIENT_ID not configured" },
      { status: 500 }
    );
  }

  const redirectUri =
    process.env.HUBSPOT_OAUTH_REDIRECT_URI ??
    `${new URL(req.url).origin}/api/oauth/hubspot/callback`;

  // Optional same-origin return path — validated to a relative path so it
  // can't be used as an open redirect.
  const rawReturn = new URL(req.url).searchParams.get("returnTo");
  const returnTo =
    rawReturn && rawReturn.startsWith("/") && !rawReturn.startsWith("//") ? rawReturn : undefined;

  const state = signState({
    workspaceId: ws._id,
    userId: "",
    provider: "hubspot",
    returnTo,
  });

  const authUrl = new URL("https://app.hubspot.com/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", HUBSPOT_SCOPES);
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
