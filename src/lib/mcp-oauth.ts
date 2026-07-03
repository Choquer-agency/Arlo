import { createHash, randomBytes } from "crypto";
import { SITE_URL } from "@/lib/siteConfig";

/** Absolute base URL of this deployment (the OAuth issuer + resource origin). */
export const OAUTH_ISSUER = SITE_URL; // "https://askarlo.app"
export const MCP_RESOURCE = `${SITE_URL}/api/mcp`;

export const AUTHORIZATION_ENDPOINT = `${SITE_URL}/api/mcp/oauth/authorize`;
export const TOKEN_ENDPOINT = `${SITE_URL}/api/mcp/oauth/token`;
export const REGISTRATION_ENDPOINT = `${SITE_URL}/api/mcp/oauth/register`;

/** RFC 9728 — Protected Resource Metadata. Points Claude at our AS. */
export function protectedResourceMetadata() {
  return {
    resource: MCP_RESOURCE,
    authorization_servers: [OAUTH_ISSUER],
    bearer_methods_supported: ["header"],
    resource_documentation: `${SITE_URL}/`,
  };
}

/** RFC 8414 — Authorization Server Metadata. */
export function authorizationServerMetadata() {
  return {
    issuer: OAUTH_ISSUER,
    authorization_endpoint: AUTHORIZATION_ENDPOINT,
    token_endpoint: TOKEN_ENDPOINT,
    registration_endpoint: REGISTRATION_ENDPOINT,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"], // public clients + PKCE
    scopes_supported: ["mcp"],
  };
}

export function sha256hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** base64url(SHA256(verifier)) — the PKCE S256 transform. */
export function pkceS256(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** CORS headers so browserless clients can hit metadata/token endpoints. */
export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, MCP-Protocol-Version",
};

export function json(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...CORS_HEADERS,
      ...(init?.headers ?? {}),
    },
  });
}
