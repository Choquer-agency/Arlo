import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import { signState } from "@/lib/oauth-state";

export const runtime = "nodejs";

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/adwords",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
  "https://www.googleapis.com/auth/business.manage",
].join(" ");

export async function GET(req: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const workspaces = await fetchQuery(api.workspaces.listMine, {}, { token });
  const ws = workspaces[0];
  if (!ws) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "GOOGLE_OAUTH_CLIENT_ID not configured" },
      { status: 500 }
    );
  }

  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI ??
    `${new URL(req.url).origin}/api/oauth/google/callback`;

  const state = signState({
    workspaceId: ws._id,
    userId: "", // populated via token query in callback if needed
    provider: "google",
  });

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", GOOGLE_SCOPES);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("include_granted_scopes", "true");
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
