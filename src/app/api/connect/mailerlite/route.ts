import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { encryptCredentials } from "@/lib/crypto";
import { getServiceSecret } from "@/lib/serviceSecret";

export const runtime = "nodejs";

const TEN_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000;

/**
 * POST { workspaceId, apiKey } — store a MailerLite API key as a workspace
 * connection. The key is validated with a real API call before being stored.
 */
export async function POST(req: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: { workspaceId?: string; apiKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { workspaceId, apiKey } = body;
  if (!workspaceId || !apiKey || typeof apiKey !== "string") {
    return NextResponse.json(
      { error: "workspaceId and apiKey are required" },
      { status: 400 }
    );
  }

  // Membership check — workspaces.get throws unless member or superadmin.
  try {
    const ws = await fetchQuery(
      api.workspaces.get,
      { workspaceId: workspaceId as Id<"workspaces"> },
      { token }
    );
    if (!ws) throw new Error("workspace not found");
  } catch {
    return NextResponse.json(
      { error: "You don't have access to this workspace" },
      { status: 403 }
    );
  }

  // Validate the key with a real API call.
  const probe = await fetch("https://connect.mailerlite.com/api/campaigns?limit=1", {
    headers: { Authorization: `Bearer ${apiKey.trim()}`, Accept: "application/json" },
  });
  if (probe.status === 401 || probe.status === 403) {
    return NextResponse.json(
      { error: "MailerLite rejected this API key. Generate a new one under Integrations → API in MailerLite." },
      { status: 400 }
    );
  }
  if (!probe.ok) {
    const text = (await probe.text()).slice(0, 300);
    return NextResponse.json(
      { error: `MailerLite validation failed (${probe.status})`, detail: text },
      { status: 502 }
    );
  }

  const { ciphertext, iv } = encryptCredentials(
    JSON.stringify({ accessToken: apiKey.trim(), refreshToken: "" })
  );

  const connectionId = await fetchMutation(api.platformConnections.upsert, {
    _serviceSecret: getServiceSecret(),
    workspaceId: workspaceId as Id<"workspaces">,
    provider: "mailerlite",
    accountId: "default",
    encryptedTokens: ciphertext,
    tokensIv: iv,
    scopes: "api_key",
    tokenExpiresAt: Date.now() + TEN_YEARS_MS,
  });

  const accounts = [
    { id: "default", name: "MailerLite account", kind: "mailerlite_account" },
  ];
  await fetchMutation(api.platformConnections.updateAvailableAccounts, {
    _serviceSecret: getServiceSecret(),
    connectionId,
    availableAccounts: accounts,
  });

  return NextResponse.json({ ok: true, accounts: accounts.length });
}
