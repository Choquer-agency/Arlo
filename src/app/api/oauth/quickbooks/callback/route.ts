import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { encryptCredentials } from "@/lib/crypto";
import { verifyState } from "@/lib/oauth-state";
import { getServiceSecret } from "@/lib/serviceSecret";

export const runtime = "nodejs";

const TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

function apiBase(): string {
  return process.env.QUICKBOOKS_ENV === "sandbox"
    ? "https://sandbox-quickbooks.api.intuit.com"
    : "https://quickbooks.api.intuit.com";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateToken = url.searchParams.get("state");
  const realmId = url.searchParams.get("realmId"); // Intuit sends the company id here
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/connections?error=${error}`, req.url));
  }
  if (!code || !stateToken || !realmId) {
    return NextResponse.json(
      { error: "Missing code, state, or realmId from Intuit" },
      { status: 400 }
    );
  }

  let state: { workspaceId: string; provider: string };
  try {
    state = verifyState(stateToken);
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid or expired state", detail: (e as Error).message },
      { status: 400 }
    );
  }

  const clientId = process.env.QUICKBOOKS_OAUTH_CLIENT_ID!;
  const clientSecret = process.env.QUICKBOOKS_OAUTH_CLIENT_SECRET!;
  const redirectUri =
    process.env.QUICKBOOKS_OAUTH_REDIRECT_URI ??
    `${url.origin}/api/oauth/quickbooks/callback`;

  // Step 1: exchange code for tokens (Intuit wants HTTP Basic auth)
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
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
      { error: "Token exchange failed", detail: text },
      { status: 500 }
    );
  }
  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  // Step 2: fetch company info so the connection shows a human name
  let companyName = `QuickBooks company ${realmId}`;
  try {
    const infoRes = await fetch(
      `${apiBase()}/v3/company/${realmId}/companyinfo/${realmId}?minorversion=70`,
      { headers: { Authorization: `Bearer ${tokens.access_token}`, Accept: "application/json" } }
    );
    if (infoRes.ok) {
      const info = (await infoRes.json()) as { CompanyInfo?: { CompanyName?: string } };
      companyName = info.CompanyInfo?.CompanyName ?? companyName;
    }
  } catch {
    // non-fatal — keep the fallback name
  }

  // Step 3: encrypt + store connection (realmId doubles as the account id)
  const { ciphertext, iv } = encryptCredentials(
    JSON.stringify({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    })
  );
  const tokenExpiresAt = Date.now() + tokens.expires_in * 1000;

  const connectionId = await fetchMutation(api.platformConnections.upsert, {
    _serviceSecret: getServiceSecret(),
    workspaceId: state.workspaceId as Id<"workspaces">,
    provider: "quickbooks",
    accountEmail: companyName,
    accountId: realmId,
    encryptedTokens: ciphertext,
    tokensIv: iv,
    scopes: "com.intuit.quickbooks.accounting",
    tokenExpiresAt,
  });

  await fetchMutation(api.platformConnections.updateAvailableAccounts, {
    _serviceSecret: getServiceSecret(),
    connectionId,
    availableAccounts: [{ id: realmId, name: companyName, kind: "qbo_company" }],
  });

  // Behind a tunnel (ngrok) the reconstructed req.url can come out as
  // https://localhost:<port>, which browsers reject. Anchor the post-connect
  // redirect to the registered redirect URI's origin instead.
  const appOrigin = process.env.QUICKBOOKS_OAUTH_REDIRECT_URI
    ? new URL(process.env.QUICKBOOKS_OAUTH_REDIRECT_URI).origin
    : url.origin;
  return NextResponse.redirect(new URL(`/connections?status=ok&provider=quickbooks`, appOrigin));
}
