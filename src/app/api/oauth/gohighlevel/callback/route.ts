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

  const clientId = process.env.GOHIGHLEVEL_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOHIGHLEVEL_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "GOHIGHLEVEL_OAUTH_CLIENT_ID / _SECRET not configured" },
      { status: 500 }
    );
  }

  // Step 1: exchange code for tokens.
  const tokenRes = await fetch("https://services.leadconnectorhq.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
    }),
  });
  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return NextResponse.json(
      { error: "GoHighLevel token exchange failed", detail: text },
      { status: 500 }
    );
  }
  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    locationId?: string;
    companyId?: string;
    userType?: string;
  };
  const locationId = tokens.locationId;
  if (!locationId) {
    return NextResponse.json(
      {
        error: "GoHighLevel token response did not include a locationId",
        hint: "Make sure the app is installed on a specific location (sub-account), not only at the agency level.",
      },
      { status: 500 }
    );
  }

  // Step 2: resolve the location name for availableAccounts.
  let locationName = locationId;
  let accountEmail: string | undefined;
  try {
    const locRes = await fetch(
      `https://services.leadconnectorhq.com/locations/${encodeURIComponent(locationId)}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Version: "2021-07-28",
          Accept: "application/json",
        },
      }
    );
    if (locRes.ok) {
      const loc = (await locRes.json()) as {
        location?: { name?: string; email?: string };
        name?: string;
      };
      locationName = loc.location?.name ?? loc.name ?? locationId;
      accountEmail = loc.location?.email;
    }
  } catch {
    // Non-fatal — the connection is stored either way.
  }

  // Step 3: encrypt + store. locationId is stored as accountId.
  const { ciphertext, iv } = encryptCredentials(
    JSON.stringify({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? "",
    })
  );
  const tokenExpiresAt = Date.now() + (tokens.expires_in ?? 86400) * 1000;

  const connectionId = await fetchMutation(api.platformConnections.upsert, {
    _serviceSecret: getServiceSecret(),
    workspaceId: state.workspaceId as Id<"workspaces">,
    provider: "gohighlevel",
    accountEmail,
    accountId: locationId,
    encryptedTokens: ciphertext,
    tokensIv: iv,
    scopes: tokens.scope ?? "",
    tokenExpiresAt,
  });

  const accounts = [{ id: locationId, name: locationName, kind: "ghl_location" }];
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
    new URL(`${dest}${sep}status=ok&provider=gohighlevel&accounts=${accounts.length}`, req.url)
  );
}
