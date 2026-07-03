import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import { randomToken, json, CORS_HEADERS } from "@/lib/mcp-oauth";

export const runtime = "nodejs";

/**
 * Dynamic Client Registration (RFC 7591). Public by spec — anyone may register
 * a client. Registration alone grants no access; every authorize/token call
 * re-validates the client_id + exact redirect_uri, and access is only ever
 * issued after a logged-in user approves. Public clients only (PKCE required,
 * no client secret).
 */
export async function POST(req: Request) {
  let body: { redirect_uris?: unknown; client_name?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_client_metadata", error_description: "Body must be JSON" }, { status: 400 });
  }

  const redirectUris = Array.isArray(body.redirect_uris)
    ? body.redirect_uris.filter((u): u is string => typeof u === "string")
    : [];
  if (redirectUris.length === 0) {
    return json(
      { error: "invalid_redirect_uri", error_description: "redirect_uris is required" },
      { status: 400 }
    );
  }
  // Only allow https redirect URIs (or localhost for local dev clients).
  for (const uri of redirectUris) {
    try {
      const u = new URL(uri);
      const isLocal = u.hostname === "localhost" || u.hostname === "127.0.0.1";
      if (u.protocol !== "https:" && !isLocal) {
        return json(
          { error: "invalid_redirect_uri", error_description: `redirect_uri must be https: ${uri}` },
          { status: 400 }
        );
      }
    } catch {
      return json(
        { error: "invalid_redirect_uri", error_description: `Malformed redirect_uri: ${uri}` },
        { status: 400 }
      );
    }
  }

  const clientId = randomToken(24);
  const clientName = typeof body.client_name === "string" ? body.client_name : undefined;

  await fetchMutation(api.oauth.registerClient, { clientId, clientName, redirectUris });

  return json(
    {
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      redirect_uris: redirectUris,
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code"],
      response_types: ["code"],
      client_name: clientName,
    },
    { status: 201 }
  );
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
