import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { getServiceSecret } from "@/lib/serviceSecret";
import { getWorkspaceAccessToken } from "@/lib/mcp-context";
import { probeGoogleAccounts } from "@/lib/googleProbe";

export const runtime = "nodejs";

/**
 * Re-probe Google for the workspace's available accounts and refresh the cached
 * list. Lets a user who just created a GA4 property (or GSC site, Ads customer,
 * etc.) pick it up without disconnecting and re-authing — the stored token is
 * reused (and silently refreshed if expired).
 */
export async function POST(req: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { workspaceId?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const workspaceId = body.workspaceId as Id<"workspaces"> | undefined;
  if (!workspaceId) {
    return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
  }

  // Authorize: workspaces.get runs requireMembership and throws for non-members.
  try {
    const ws = await fetchQuery(api.workspaces.get, { workspaceId }, { token });
    if (!ws) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: "Not authorized for this workspace" }, { status: 403 });
  }

  const conn = await fetchQuery(api.platformConnections.getByProviderForService, {
    _serviceSecret: getServiceSecret(),
    workspaceId,
    provider: "google",
  });
  if (!conn) {
    return NextResponse.json(
      { error: "No Google connection for this workspace" },
      { status: 400 }
    );
  }

  let accessToken: string;
  try {
    accessToken = await getWorkspaceAccessToken("google", workspaceId);
  } catch (e) {
    return NextResponse.json(
      { error: "Could not refresh Google token", detail: (e as Error).message },
      { status: 502 }
    );
  }

  const accounts = await probeGoogleAccounts(accessToken);

  await fetchMutation(api.platformConnections.updateAvailableAccounts, {
    _serviceSecret: getServiceSecret(),
    connectionId: conn._id,
    availableAccounts: accounts,
  });

  return NextResponse.json({ ok: true, accounts: accounts.length });
}
