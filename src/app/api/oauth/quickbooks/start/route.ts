import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { signState } from "@/lib/oauth-state";
import { isQuickbooksAllowed } from "@/lib/featureGates";

export const runtime = "nodejs";

// QuickBooks Online — accounting scope only (read via Reports + Query APIs).
const QBO_SCOPE = "com.intuit.quickbooks.accounting";

export async function GET(req: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Private beta gate — only allowlisted users can start the QuickBooks flow.
  const me = await fetchQuery(api.users.me, {}, { token });
  if (!isQuickbooksAllowed(me?.email)) {
    return NextResponse.json(
      { error: "QuickBooks is in private beta." },
      { status: 403 }
    );
  }

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

  const clientId = process.env.QUICKBOOKS_OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "QUICKBOOKS_OAUTH_CLIENT_ID not configured" },
      { status: 500 }
    );
  }

  const redirectUri =
    process.env.QUICKBOOKS_OAUTH_REDIRECT_URI ??
    `${new URL(req.url).origin}/api/oauth/quickbooks/callback`;

  const state = signState({
    workspaceId: ws._id,
    userId: "",
    provider: "quickbooks",
  });

  const authUrl = new URL("https://appcenter.intuit.com/connect/oauth2");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", QBO_SCOPE);
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
