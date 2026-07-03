/**
 * MCP connection token — reveal (GET) and rotate/generate (POST).
 *
 * The token that lives in the user's MCP URL is a random secret. We store only
 * its sha256 hash (for auth lookups) plus an encrypted copy (so we can show the
 * URL again later). Rotating generates a fresh secret and revokes the previous
 * one via upsertMyToken — every device on the old URL stops working until it's
 * repasted.
 */

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { hashToken } from "@/lib/mcp-auth";
import { encryptCredentials, decryptCredentials } from "@/lib/crypto";

export const runtime = "nodejs";

async function currentToken(sessionToken: string, workspaceId: Id<"workspaces">) {
  const tokens = await fetchQuery(
    api.mcpTokens.listMine,
    { workspaceId },
    { token: sessionToken }
  );
  const active = tokens?.[0];
  if (!active) return null;
  try {
    return decryptCredentials(active.encryptedToken, active.tokenIv);
  } catch {
    // Older token stored before encryption, or key mismatch — treat as absent
    // so the client can rotate to a fresh, valid one.
    return null;
  }
}

export async function GET(req: Request) {
  const sessionToken = await convexAuthNextjsToken();
  if (!sessionToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const workspaceId = new URL(req.url).searchParams.get("workspaceId") as Id<"workspaces"> | null;
  if (!workspaceId) return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });

  try {
    const token = await currentToken(sessionToken, workspaceId);
    return NextResponse.json({ token });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to read token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const sessionToken = await convexAuthNextjsToken();
  if (!sessionToken) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { workspaceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const workspaceId = body.workspaceId as Id<"workspaces"> | undefined;
  if (!workspaceId) return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });

  try {
    const plaintext = randomBytes(24).toString("base64url");
    const { ciphertext, iv } = encryptCredentials(plaintext);
    // upsertMyToken revokes the caller's existing active token, then inserts the new one.
    await fetchMutation(
      api.mcpTokens.upsertMyToken,
      {
        workspaceId,
        tokenHash: hashToken(plaintext),
        encryptedToken: ciphertext,
        tokenIv: iv,
        label: "Claude Desktop",
      },
      { token: sessionToken }
    );
    return NextResponse.json({ token: plaintext });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to rotate token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
