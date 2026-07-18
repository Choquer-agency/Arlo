import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { encryptCredentials } from "@/lib/crypto";
import { verifyState } from "@/lib/oauth-state";
import { getServiceSecret } from "@/lib/serviceSecret";

export const runtime = "nodejs";

const TEN_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000;

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

  const clientId = process.env.MAILCHIMP_OAUTH_CLIENT_ID;
  const clientSecret = process.env.MAILCHIMP_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "MAILCHIMP_OAUTH_CLIENT_ID / _SECRET not configured" },
      { status: 500 }
    );
  }
  const redirectUri =
    process.env.MAILCHIMP_OAUTH_REDIRECT_URI ??
    `${url.origin}/api/oauth/mailchimp/callback`;

  // Step 1: exchange code for an access token (Mailchimp tokens do not expire).
  const tokenRes = await fetch("https://login.mailchimp.com/oauth2/token", {
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
      { error: "Mailchimp token exchange failed", detail: text },
      { status: 500 }
    );
  }
  const tokens = (await tokenRes.json()) as { access_token: string; scope?: string };

  // Step 2: metadata → data center (dc) + account identity.
  const metaRes = await fetch("https://login.mailchimp.com/oauth2/metadata", {
    headers: { Authorization: `OAuth ${tokens.access_token}` },
  });
  if (!metaRes.ok) {
    const text = await metaRes.text();
    return NextResponse.json(
      { error: "Mailchimp metadata fetch failed", detail: text },
      { status: 500 }
    );
  }
  const metadata = (await metaRes.json()) as {
    dc?: string;
    accountname?: string;
    login?: { email?: string };
  };
  const dc = metadata.dc;
  if (!dc) {
    return NextResponse.json(
      { error: "Mailchimp metadata did not include a data center (dc)" },
      { status: 500 }
    );
  }

  // Step 3: encrypt + store. dc is stored as accountId — the connector builds
  // the API base https://<dc>.api.mailchimp.com/3.0 from it.
  const { ciphertext, iv } = encryptCredentials(
    JSON.stringify({ accessToken: tokens.access_token, refreshToken: "" })
  );

  const connectionId = await fetchMutation(api.platformConnections.upsert, {
    _serviceSecret: getServiceSecret(),
    workspaceId: state.workspaceId as Id<"workspaces">,
    provider: "mailchimp",
    accountEmail: metadata.login?.email ?? metadata.accountname,
    accountId: dc,
    encryptedTokens: ciphertext,
    tokensIv: iv,
    scopes: tokens.scope ?? "mailchimp",
    tokenExpiresAt: Date.now() + TEN_YEARS_MS,
  });

  // Step 4: cache audiences (lists) as availableAccounts.
  let accounts: { id: string; name: string; kind: string }[] = [];
  try {
    const listsRes = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists?count=100`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (listsRes.ok) {
      const lists = (await listsRes.json()) as { lists?: { id?: string; name?: string }[] };
      accounts = (lists.lists ?? []).map((l) => ({
        id: l.id ?? "",
        name: l.name ?? l.id ?? "Audience",
        kind: "mailchimp_audience",
      }));
    }
  } catch {
    // Non-fatal — the connection is stored either way.
  }

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
    new URL(`${dest}${sep}status=ok&provider=mailchimp&accounts=${accounts.length}`, req.url)
  );
}
