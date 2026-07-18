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

  const clientId = process.env.PIPEDRIVE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.PIPEDRIVE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "PIPEDRIVE_OAUTH_CLIENT_ID / _SECRET not configured" },
      { status: 500 }
    );
  }
  const redirectUri =
    process.env.PIPEDRIVE_OAUTH_REDIRECT_URI ??
    `${url.origin}/api/oauth/pipedrive/callback`;

  // Step 1: exchange code — Pipedrive's token endpoint wants HTTP Basic auth.
  const tokenRes = await fetch("https://oauth.pipedrive.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return NextResponse.json(
      { error: "Pipedrive token exchange failed", detail: text },
      { status: 500 }
    );
  }
  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    api_domain?: string;
  };
  const apiDomain = tokens.api_domain;
  if (!apiDomain) {
    return NextResponse.json(
      { error: "Pipedrive token response did not include api_domain" },
      { status: 500 }
    );
  }

  // Step 2: identify the user + company.
  let accountEmail: string | undefined;
  let accounts: { id: string; name: string; kind: string }[] = [];
  try {
    const meRes = await fetch(`${apiDomain}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (meRes.ok) {
      const me = (await meRes.json()) as {
        data?: { email?: string; company_id?: number; company_name?: string };
      };
      accountEmail = me.data?.email;
      accounts = [
        {
          id: String(me.data?.company_id ?? apiDomain),
          name: me.data?.company_name ?? apiDomain.replace(/^https?:\/\//, ""),
          kind: "pd_company",
        },
      ];
    }
  } catch {
    // Non-fatal — the connection is stored either way.
  }

  // Step 3: encrypt + store. api_domain is stored as accountId — the connector
  // uses it as the API base.
  const { ciphertext, iv } = encryptCredentials(
    JSON.stringify({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? "",
    })
  );
  const tokenExpiresAt = Date.now() + (tokens.expires_in ?? 3600) * 1000;

  const connectionId = await fetchMutation(api.platformConnections.upsert, {
    _serviceSecret: getServiceSecret(),
    workspaceId: state.workspaceId as Id<"workspaces">,
    provider: "pipedrive",
    accountEmail,
    accountId: apiDomain,
    encryptedTokens: ciphertext,
    tokensIv: iv,
    scopes: tokens.scope ?? "",
    tokenExpiresAt,
  });

  await fetchMutation(api.platformConnections.updateAvailableAccounts, {
    _serviceSecret: getServiceSecret(),
    connectionId,
    availableAccounts: accounts,
  });

  const dest =
    state.returnTo && state.returnTo.startsWith("/") && !state.returnTo.startsWith("//")
      ? state.returnTo
      : "/connections";
  const sep = dest.includes("?") ? "&" : "?";
  return NextResponse.redirect(
    new URL(`${dest}${sep}status=ok&provider=pipedrive&accounts=${accounts.length}`, req.url)
  );
}
