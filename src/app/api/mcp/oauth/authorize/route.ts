import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { sha256hex, randomToken } from "@/lib/mcp-oauth";
import { SITE_URL } from "@/lib/siteConfig";

export const runtime = "nodejs";

interface AuthzParams {
  responseType: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  state: string;
  scope: string;
}

/** Redirect back to the client with an OAuth error (only when redirect_uri is trusted). */
function errorRedirect(redirectUri: string, state: string, error: string, desc?: string): Response {
  const u = new URL(redirectUri);
  u.searchParams.set("error", error);
  if (desc) u.searchParams.set("error_description", desc);
  if (state) u.searchParams.set("state", state);
  return Response.redirect(u.toString(), 302);
}

function htmlError(message: string, status = 400): Response {
  return new Response(
    `<!doctype html><meta charset=utf-8><body style="font:16px system-ui;max-width:32rem;margin:4rem auto;padding:0 1rem;color:#1a1a1a">
     <h1 style="font-size:1.25rem">Authorization error</h1><p>${message}</p></body>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

/** Validate the request and the client/redirect_uri. Returns an error Response or null. */
async function validate(p: AuthzParams): Promise<Response | null> {
  if (!p.clientId || !p.redirectUri) return htmlError("Missing client_id or redirect_uri.");
  const client = await fetchQuery(api.oauth.getClient, { clientId: p.clientId });
  if (!client) return htmlError("Unknown client_id.");
  if (!client.redirectUris.includes(p.redirectUri)) {
    // Do NOT redirect to an unregistered URI — show an error page instead.
    return htmlError("redirect_uri is not registered for this client.");
  }
  // From here, errors may be delivered to the (trusted) redirect_uri.
  if (p.responseType !== "code") {
    return errorRedirect(p.redirectUri, p.state, "unsupported_response_type");
  }
  if (p.codeChallengeMethod !== "S256" || !p.codeChallenge) {
    return errorRedirect(p.redirectUri, p.state, "invalid_request", "PKCE S256 required");
  }
  return null;
}

/**
 * Back-compat: the authorization_endpoint now points at the styled consent
 * PAGE (/oauth/authorize). Any client still using the old cached endpoint is
 * forwarded there with its params intact.
 */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  return Response.redirect(`${SITE_URL}/oauth/authorize?${sp.toString()}`, 302);
}

export async function POST(req: Request) {
  const form = await req.formData();
  const p: AuthzParams = {
    responseType: String(form.get("response_type") ?? ""),
    clientId: String(form.get("client_id") ?? ""),
    redirectUri: String(form.get("redirect_uri") ?? ""),
    codeChallenge: String(form.get("code_challenge") ?? ""),
    codeChallengeMethod: String(form.get("code_challenge_method") ?? ""),
    state: String(form.get("state") ?? ""),
    scope: String(form.get("scope") ?? ""),
  };
  const workspaceId = String(form.get("workspace_id") ?? "");

  const invalid = await validate(p);
  if (invalid) return invalid;

  const token = await convexAuthNextjsToken();
  if (!token) return htmlError("Session expired. Please retry the connection.", 401);
  if (!workspaceId) return htmlError("Missing workspace.", 400);

  // Mint a one-time authorization code, bound server-side to this user +
  // workspace via their session. Only the hash is stored.
  const code = randomToken(32);
  const codeHash = sha256hex(code);
  try {
    await fetchMutation(
      api.oauth.createAuthCode,
      {
        codeHash,
        clientId: p.clientId,
        workspaceId: workspaceId as Id<"workspaces">,
        redirectUri: p.redirectUri,
        codeChallenge: p.codeChallenge,
        scope: p.scope || undefined,
        now: Date.now(),
      },
      { token }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "server_error";
    return errorRedirect(p.redirectUri, p.state, "access_denied", msg);
  }

  const u = new URL(p.redirectUri);
  u.searchParams.set("code", code);
  if (p.state) u.searchParams.set("state", p.state);
  return Response.redirect(u.toString(), 302);
}
