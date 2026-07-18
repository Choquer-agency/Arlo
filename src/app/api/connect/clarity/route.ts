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
 * POST { workspaceId, apiKey } — store a Microsoft Clarity data-export API
 * token (Clarity project → Settings → Data export) as a workspace connection.
 * The token is validated with a real API call before being stored. Note the
 * validation call counts against Clarity's ~10 requests/project/day limit.
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

  // Validate the token with a real API call (3-day live insights probe).
  const probe = await fetch(
    "https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=3",
    { headers: { Authorization: `Bearer ${apiKey.trim()}`, Accept: "application/json" } }
  );
  if (probe.status === 401 || probe.status === 403) {
    return NextResponse.json(
      {
        error:
          "Clarity rejected this API token. Generate one under Settings → Data export in the Clarity project.",
      },
      { status: 400 }
    );
  }
  if (probe.status === 429) {
    return NextResponse.json(
      {
        error:
          "Clarity's data-export API rate limit is exhausted (~10 requests/project/day). Try again tomorrow.",
      },
      { status: 429 }
    );
  }
  if (!probe.ok) {
    const text = (await probe.text()).slice(0, 300);
    return NextResponse.json(
      { error: `Clarity validation failed (${probe.status})`, detail: text },
      { status: 502 }
    );
  }

  const { ciphertext, iv } = encryptCredentials(
    JSON.stringify({ accessToken: apiKey.trim(), refreshToken: "" })
  );

  const connectionId = await fetchMutation(api.platformConnections.upsert, {
    _serviceSecret: getServiceSecret(),
    workspaceId: workspaceId as Id<"workspaces">,
    provider: "clarity",
    accountId: "default",
    encryptedTokens: ciphertext,
    tokensIv: iv,
    scopes: "api_key",
    tokenExpiresAt: Date.now() + TEN_YEARS_MS,
  });

  const accounts = [
    { id: "default", name: "Clarity project", kind: "clarity_project" },
  ];
  await fetchMutation(api.platformConnections.updateAvailableAccounts, {
    _serviceSecret: getServiceSecret(),
    connectionId,
    availableAccounts: accounts,
  });

  return NextResponse.json({ ok: true, accounts: accounts.length });
}
