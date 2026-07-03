import { createHash } from "crypto";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export interface McpCaller {
  workspaceId: Id<"workspaces">;
  userId: Id<"users">;
  tokenId: Id<"mcpTokens">;
  role: "owner" | "admin" | "member";
}

export function hashToken(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

export async function authenticateMcpRequest(
  req: Request
): Promise<{ caller: McpCaller } | { response: Response }> {
  const url = new URL(req.url);
  const header = req.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const provided = bearer || url.searchParams.get("token") || "";

  if (!provided) return { response: unauthorized("Missing MCP token") };

  const hash = hashToken(provided);

  try {
    const result = await fetchQuery(api.mcpTokens.findByHash, { tokenHash: hash });
    if (!result) return { response: unauthorized("Invalid or revoked token") };

    // Don't block the hot path on updating lastUsedAt.
    fetchMutation(api.mcpTokens.touchLastUsed, { tokenId: result.token._id }).catch(
      () => {}
    );

    return {
      caller: {
        workspaceId: result.token.workspaceId,
        userId: result.token.userId,
        tokenId: result.token._id,
        role: result.role as McpCaller["role"],
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Auth error";
    return { response: unauthorized(message) };
  }
}

function unauthorized(reason: string): Response {
  // Point clients at our Protected Resource Metadata (RFC 9728) so Claude and
  // other MCP clients can discover the OAuth authorization server and run the
  // full auth-code + PKCE flow instead of failing.
  const resourceMetadata =
    "https://askarlo.app/.well-known/oauth-protected-resource";
  return new Response(JSON.stringify({ error: "Unauthorized", reason }), {
    status: 401,
    headers: {
      "Content-Type": "application/json",
      "WWW-Authenticate": `Bearer realm="arlo-mcp", resource_metadata="${resourceMetadata}"`,
    },
  });
}
