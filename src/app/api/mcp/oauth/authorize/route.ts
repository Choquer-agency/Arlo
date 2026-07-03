import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { sha256hex, randomToken, AUTHORIZATION_ENDPOINT } from "@/lib/mcp-oauth";
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

function readParams(sp: URLSearchParams): AuthzParams {
  return {
    responseType: sp.get("response_type") ?? "",
    clientId: sp.get("client_id") ?? "",
    redirectUri: sp.get("redirect_uri") ?? "",
    codeChallenge: sp.get("code_challenge") ?? "",
    codeChallengeMethod: sp.get("code_challenge_method") ?? "",
    state: sp.get("state") ?? "",
    scope: sp.get("scope") ?? "",
  };
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

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const p = readParams(sp);

  const invalid = await validate(p);
  if (invalid) return invalid;

  // Require a logged-in Arlo user. If not, send them to sign in and come back
  // to this exact authorize URL.
  const token = await convexAuthNextjsToken();
  if (!token) {
    const back = `${AUTHORIZATION_ENDPOINT}?${sp.toString()}`;
    const signIn = new URL("/sign-in", SITE_URL);
    signIn.searchParams.set("redirectTo", back.replace(SITE_URL, ""));
    return Response.redirect(signIn.toString(), 302);
  }

  const workspaces = await fetchQuery(api.workspaces.listMine, {}, { token });
  const ws = workspaces[0];
  if (!ws) {
    return htmlError("You have no Arlo workspace yet. Finish onboarding first.", 409);
  }

  // Consent screen — a same-origin form that POSTs back to approve.
  const hidden = Object.entries({
    response_type: p.responseType,
    client_id: p.clientId,
    redirect_uri: p.redirectUri,
    code_challenge: p.codeChallenge,
    code_challenge_method: p.codeChallengeMethod,
    state: p.state,
    scope: p.scope,
  })
    .map(
      ([k, v]) =>
        `<input type=hidden name="${k}" value="${String(v).replace(/"/g, "&quot;")}">`
    )
    .join("");

  return new Response(
    `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
     <body style="font:16px/1.5 system-ui;max-width:30rem;margin:4rem auto;padding:0 1.25rem;color:#1a1a1a">
       <h1 style="font-size:1.4rem;margin-bottom:.25rem">Connect to ARLO</h1>
       <p style="color:#555">An app wants to read your Arlo data on your behalf.</p>
       <div style="background:#f4f4f2;border-radius:.5rem;padding:1rem;margin:1.25rem 0">
         <div><strong>Workspace:</strong> ${ws.name ?? "your workspace"}</div>
         <div style="color:#555;font-size:.9rem;margin-top:.35rem">
           Grants read access to the clients &amp; connected platforms in this workspace, scoped to your account.
         </div>
       </div>
       <form method="post" action="${AUTHORIZATION_ENDPOINT}">
         ${hidden}
         <input type=hidden name="workspace_id" value="${ws._id}">
         <div style="display:flex;gap:.75rem;margin-top:1rem">
           <button type=submit style="background:#c6f24e;border:0;border-radius:.5rem;padding:.7rem 1.25rem;font:inherit;font-weight:600;cursor:pointer">Approve</button>
           <a href="${p.redirectUri ? errorUrl(p.redirectUri, p.state) : SITE_URL}" style="padding:.7rem 1.25rem;text-decoration:none;color:#555">Deny</a>
         </div>
       </form>
     </body>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  );
}

function errorUrl(redirectUri: string, state: string): string {
  const u = new URL(redirectUri);
  u.searchParams.set("error", "access_denied");
  if (state) u.searchParams.set("state", state);
  return u.toString();
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
