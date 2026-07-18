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

  const clientId = process.env.SALESFORCE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "SALESFORCE_OAUTH_CLIENT_ID / SALESFORCE_OAUTH_CLIENT_SECRET not configured" },
      { status: 500 }
    );
  }
  const redirectUri =
    process.env.SALESFORCE_OAUTH_REDIRECT_URI ?? `${url.origin}/api/oauth/salesforce/callback`;

  // Step 1: exchange code for tokens. Response carries instance_url (the org's
  // API host) and an identity URL.
  const tokenRes = await fetch("https://login.salesforce.com/services/oauth2/token", {
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
      { error: "Salesforce token exchange failed", detail: text },
      { status: 500 }
    );
  }
  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    instance_url: string;
    id: string; // identity URL
    scope?: string;
  };

  // Step 2: identity — username / display name for the connection label.
  let username = "";
  let displayName = "";
  try {
    const idRes = await fetch(tokens.id, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (idRes.ok) {
      const identity = (await idRes.json()) as {
        username?: string;
        display_name?: string;
        email?: string;
      };
      username = identity.username ?? identity.email ?? "";
      displayName = identity.display_name ?? "";
    }
  } catch {
    // Non-fatal — we fall back to the instance URL as the label.
  }

  // Best-effort org name for a friendlier account label.
  let orgName = "";
  try {
    const orgRes = await fetch(
      `${tokens.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(
        "SELECT Name FROM Organization LIMIT 1"
      )}`,
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );
    if (orgRes.ok) {
      const org = (await orgRes.json()) as { records?: { Name?: string }[] };
      orgName = org.records?.[0]?.Name ?? "";
    }
  } catch {
    // Non-fatal.
  }

  // Step 3: encrypt + store. CRITICAL: accountId = instance_url — the
  // connector reads it off the connection doc (it cannot decrypt tokens).
  const { ciphertext, iv } = encryptCredentials(
    JSON.stringify({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? "",
    })
  );
  // Salesforce doesn't return expires_in for web-server flow; access tokens
  // live for the org's session timeout (default 2h). Refresh conservatively.
  const tokenExpiresAt = Date.now() + 30 * 60 * 1000;

  const connectionId = await fetchMutation(api.platformConnections.upsert, {
    _serviceSecret: getServiceSecret(),
    workspaceId: state.workspaceId as Id<"workspaces">,
    provider: "salesforce",
    accountEmail: username || undefined,
    accountId: tokens.instance_url,
    encryptedTokens: ciphertext,
    tokensIv: iv,
    scopes: tokens.scope ?? "api refresh_token",
    tokenExpiresAt,
  });

  await fetchMutation(api.platformConnections.updateAvailableAccounts, {
    _serviceSecret: getServiceSecret(),
    connectionId,
    availableAccounts: [
      {
        id: tokens.instance_url,
        name: orgName || displayName || username || tokens.instance_url,
        kind: "sf_org",
      },
    ],
  });

  const dest =
    state.returnTo && state.returnTo.startsWith("/") && !state.returnTo.startsWith("//")
      ? state.returnTo
      : "/connections";
  const sep = dest.includes("?") ? "&" : "?";
  return NextResponse.redirect(
    new URL(`${dest}${sep}status=ok&provider=salesforce`, req.url)
  );
}
