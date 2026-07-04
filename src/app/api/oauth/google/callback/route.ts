import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { encryptCredentials } from "@/lib/crypto";
import { verifyState } from "@/lib/oauth-state";
import { getServiceSecret } from "@/lib/serviceSecret";
import { probeGoogleAccounts } from "@/lib/googleProbe";

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
    // Dump every query param so we can see what Google actually sent back.
    const allParams: Record<string, string> = {};
    url.searchParams.forEach((v, k) => {
      allParams[k] = v;
    });
    return NextResponse.json(
      {
        error: "Missing code or state",
        receivedParams: allParams,
        hint:
          allParams.hd
            ? `Your Google account is in a Workspace (${allParams.hd}). If the admin hasn't approved this app, Google silently drops the code. Try a personal @gmail.com account, or have the Workspace admin approve the app at admin.google.com → Security → API controls.`
            : "Google returned without a code or error. Make sure your email is added as a test user on the OAuth consent screen.",
      },
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

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET!;
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI ??
    `${url.origin}/api/oauth/google/callback`;

  // Step 1: exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
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
    refresh_token?: string;
    expires_in: number;
    scope: string;
    id_token?: string;
  };

  // Step 2: fetch user info
  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const userInfo = (await userInfoRes.json()) as {
    id: string;
    email: string;
    name?: string;
  };

  // Step 3: encrypt + store connection
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
    provider: "google",
    accountEmail: userInfo.email,
    accountId: userInfo.id,
    encryptedTokens: ciphertext,
    tokensIv: iv,
    scopes: tokens.scope,
    tokenExpiresAt,
  });

  // Step 4: probe Google APIs to cache availableAccounts
  const accounts = await probeGoogleAccounts(tokens.access_token);

  await fetchMutation(api.platformConnections.updateAvailableAccounts, {
    _serviceSecret: getServiceSecret(),
    connectionId,
    availableAccounts: accounts,
  });

  return NextResponse.redirect(
    new URL(`/connections?status=ok&accounts=${accounts.length}`, req.url)
  );
}
