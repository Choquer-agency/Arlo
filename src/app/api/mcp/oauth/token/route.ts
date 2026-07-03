import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import { encryptCredentials } from "@/lib/crypto";
import { getServiceSecret } from "@/lib/serviceSecret";
import { sha256hex, pkceS256, randomToken, json, CORS_HEADERS } from "@/lib/mcp-oauth";

export const runtime = "nodejs";

/**
 * OAuth 2.1 token endpoint. Only the authorization_code grant with PKCE is
 * supported. The exchange runs on Claude's back channel with no user session,
 * so it authenticates to Convex with the service secret; the user/workspace
 * identity comes solely from the server-stored authorization code.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const grantType = String(form.get("grant_type") ?? "");
  if (grantType !== "authorization_code") {
    return json({ error: "unsupported_grant_type" }, { status: 400 });
  }

  const code = String(form.get("code") ?? "");
  const redirectUri = String(form.get("redirect_uri") ?? "");
  const clientId = String(form.get("client_id") ?? "");
  const codeVerifier = String(form.get("code_verifier") ?? "");

  if (!code || !redirectUri || !clientId || !codeVerifier) {
    return json(
      { error: "invalid_request", error_description: "Missing code, redirect_uri, client_id, or code_verifier" },
      { status: 400 }
    );
  }

  // Mint the access token locally; store only its hash. The MCP endpoint
  // validates incoming Bearer tokens via the same sha256 hash (mcpTokens.by_hash).
  const accessToken = randomToken(32);
  const { ciphertext, iv } = encryptCredentials(accessToken);

  try {
    await fetchMutation(api.oauth.exchangeCode, {
      _serviceSecret: getServiceSecret(),
      codeHash: sha256hex(code),
      clientId,
      redirectUri,
      computedChallenge: pkceS256(codeVerifier),
      accessTokenHash: sha256hex(accessToken),
      encryptedToken: ciphertext,
      tokenIv: iv,
      now: Date.now(),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "invalid_grant";
    // Surface PKCE / code errors as invalid_grant per spec.
    return json({ error: "invalid_grant", error_description: msg }, { status: 400 });
  }

  return json({
    access_token: accessToken,
    token_type: "Bearer",
    scope: "mcp",
  });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
