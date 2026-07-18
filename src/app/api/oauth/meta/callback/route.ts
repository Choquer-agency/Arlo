import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { encryptCredentials } from "@/lib/crypto";
import { verifyState } from "@/lib/oauth-state";
import { getServiceSecret } from "@/lib/serviceSecret";

export const runtime = "nodejs";

const GRAPH = "https://graph.facebook.com/v19.0";

interface AvailableAccount {
  id: string;
  name: string;
  kind: string;
}

interface Paged<T> {
  data?: T[];
  paging?: { next?: string };
}

/** Follow Graph API cursor pagination (bounded) and return the flat list. */
async function graphList<T>(firstUrl: string): Promise<T[]> {
  const out: T[] = [];
  let url: string | undefined = firstUrl;
  for (let page = 0; url && page < 5; page++) {
    const res = await fetch(url);
    if (!res.ok) break;
    const json = (await res.json()) as Paged<T>;
    out.push(...(json.data ?? []));
    url = json.paging?.next;
  }
  return out;
}

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

  const clientId = process.env.META_OAUTH_CLIENT_ID;
  const clientSecret = process.env.META_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "META_OAUTH_CLIENT_ID / META_OAUTH_CLIENT_SECRET not configured" },
      { status: 500 }
    );
  }
  const redirectUri =
    process.env.META_OAUTH_REDIRECT_URI ?? `${url.origin}/api/oauth/meta/callback`;

  // Step 1: exchange code for a short-lived user token.
  const tokenUrl = new URL(`${GRAPH}/oauth/access_token`);
  tokenUrl.searchParams.set("client_id", clientId);
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("client_secret", clientSecret);
  tokenUrl.searchParams.set("code", code);
  const tokenRes = await fetch(tokenUrl.toString());
  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return NextResponse.json(
      { error: "Meta token exchange failed", detail: text },
      { status: 500 }
    );
  }
  const shortTokens = (await tokenRes.json()) as { access_token: string; expires_in?: number };

  // Step 2: upgrade to a long-lived token (~60 days). Meta has no refresh
  // tokens — when this expires the user re-connects.
  const longUrl = new URL(`${GRAPH}/oauth/access_token`);
  longUrl.searchParams.set("grant_type", "fb_exchange_token");
  longUrl.searchParams.set("client_id", clientId);
  longUrl.searchParams.set("client_secret", clientSecret);
  longUrl.searchParams.set("fb_exchange_token", shortTokens.access_token);
  const longRes = await fetch(longUrl.toString());
  let accessToken = shortTokens.access_token;
  let expiresIn = shortTokens.expires_in ?? 60 * 60; // fall back to short-lived TTL
  if (longRes.ok) {
    const longTokens = (await longRes.json()) as { access_token: string; expires_in?: number };
    accessToken = longTokens.access_token;
    expiresIn = longTokens.expires_in ?? 60 * 24 * 60 * 60; // ~60 days typical
  }

  // Step 3: identify the user.
  const meRes = await fetch(
    `${GRAPH}/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`
  );
  if (!meRes.ok) {
    const text = await meRes.text();
    return NextResponse.json({ error: "Meta /me failed", detail: text }, { status: 500 });
  }
  const me = (await meRes.json()) as { id: string; name?: string; email?: string };

  // Step 4: inventory ad accounts, pages, and linked Instagram accounts.
  const accounts: AvailableAccount[] = [];

  const adAccounts = await graphList<{ id: string; name?: string; account_status?: number }>(
    `${GRAPH}/me/adaccounts?fields=id,name,account_status&limit=200&access_token=${encodeURIComponent(accessToken)}`
  );
  for (const a of adAccounts) {
    accounts.push({
      id: a.id, // e.g. "act_1234567890"
      name: a.name ?? a.id,
      kind: "meta_ad_account",
    });
  }

  const pages = await graphList<{
    id: string;
    name?: string;
    instagram_business_account?: { id: string; username?: string };
  }>(
    `${GRAPH}/me/accounts?fields=id,name,instagram_business_account{id,username}&limit=200&access_token=${encodeURIComponent(accessToken)}`
  );
  for (const p of pages) {
    accounts.push({ id: p.id, name: p.name ?? p.id, kind: "fb_page" });
    if (p.instagram_business_account) {
      accounts.push({
        id: p.instagram_business_account.id,
        name: p.instagram_business_account.username
          ? `@${p.instagram_business_account.username}`
          : p.instagram_business_account.id,
        kind: "ig_account",
      });
    }
  }

  // Step 5: encrypt + store connection. Meta issues no refresh token.
  const { ciphertext, iv } = encryptCredentials(
    JSON.stringify({ accessToken, refreshToken: "" })
  );
  const tokenExpiresAt = Date.now() + expiresIn * 1000;

  const connectionId = await fetchMutation(api.platformConnections.upsert, {
    _serviceSecret: getServiceSecret(),
    workspaceId: state.workspaceId as Id<"workspaces">,
    provider: "meta",
    accountEmail: me.email,
    accountId: me.id,
    encryptedTokens: ciphertext,
    tokensIv: iv,
    scopes:
      "ads_read,read_insights,pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights,business_management",
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
    new URL(`${dest}${sep}status=ok&provider=meta&accounts=${accounts.length}`, req.url)
  );
}
