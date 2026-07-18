import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { encryptCredentials } from "@/lib/crypto";
import { verifyState } from "@/lib/oauth-state";
import { getServiceSecret } from "@/lib/serviceSecret";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateToken = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/connections?error=${error}`, req.url));
  }
  if (!code || !stateToken) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  let state: { workspaceId: string; provider: string; returnTo?: string };
  try {
    state = verifyState(stateToken);
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid or expired state", detail: (e as Error).message },
      { status: 400 }
    );
  }

  const clientId = process.env.HUBSPOT_OAUTH_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "HUBSPOT_OAUTH_CLIENT_ID / HUBSPOT_OAUTH_CLIENT_SECRET not configured" },
      { status: 500 }
    );
  }
  const redirectUri =
    process.env.HUBSPOT_OAUTH_REDIRECT_URI ?? `${url.origin}/api/oauth/hubspot/callback`;

  // Step 1: exchange code for tokens.
  const tokenRes = await fetch("https://api.hubapi.com/oauth/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });
  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return NextResponse.json(
      { error: "HubSpot token exchange failed", detail: text },
      { status: 500 }
    );
  }
  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  // Step 2: portal + user info from the access-token introspection endpoint.
  const infoRes = await fetch(
    `https://api.hubapi.com/oauth/v1/access-tokens/${encodeURIComponent(tokens.access_token)}`
  );
  if (!infoRes.ok) {
    const text = await infoRes.text();
    return NextResponse.json(
      { error: "HubSpot token introspection failed", detail: text },
      { status: 500 }
    );
  }
  const info = (await infoRes.json()) as {
    hub_id: number;
    hub_domain?: string;
    user?: string;
    scopes?: string[];
  };
  const hubId = String(info.hub_id);

  // Step 3: encrypt + store connection.
  const { ciphertext, iv } = encryptCredentials(
    JSON.stringify({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token })
  );
  const tokenExpiresAt = Date.now() + tokens.expires_in * 1000;

  const connectionId = await fetchMutation(api.platformConnections.upsert, {
    _serviceSecret: getServiceSecret(),
    workspaceId: state.workspaceId as Id<"workspaces">,
    provider: "hubspot",
    accountEmail: info.user,
    accountId: hubId,
    encryptedTokens: ciphertext,
    tokensIv: iv,
    scopes: (info.scopes ?? []).join(" "),
    tokenExpiresAt,
  });

  await fetchMutation(api.platformConnections.updateAvailableAccounts, {
    _serviceSecret: getServiceSecret(),
    connectionId,
    availableAccounts: [
      { id: hubId, name: info.hub_domain ?? `Portal ${hubId}`, kind: "hubspot_portal" },
    ],
  });

  const dest =
    state.returnTo && state.returnTo.startsWith("/") && !state.returnTo.startsWith("//")
      ? state.returnTo
      : "/connections";
  const sep = dest.includes("?") ? "&" : "?";
  return NextResponse.redirect(
    new URL(`${dest}${sep}status=ok&provider=hubspot`, req.url)
  );
}
