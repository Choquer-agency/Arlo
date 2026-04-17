/**
 * Destination test-connection endpoint — used by the in-app wizard before the
 * user saves credentials. Runs the adapter's testConnection(credentials, config)
 * and returns its result as JSON. Does NOT persist anything.
 *
 * Auth: same Convex session as the rest of (app)/* — we accept a logged-in user
 * and then trust the workspaceId they send. The test action only uses external
 * HTTP (e.g. posting to a webhook URL the user just typed), not Convex data, so
 * there's no scoping risk here.
 */
import { NextResponse } from "next/server";
import { getAdapter, hasAdapter } from "@/lib/destinations/registry";

export const runtime = "nodejs";

interface TestBody {
  kind?: string;
  credentials?: unknown;
  config?: unknown;
}

export async function POST(req: Request) {
  let body: TestBody;
  try {
    body = (await req.json()) as TestBody;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const kind = body.kind;
  if (!kind || !hasAdapter(kind)) {
    return NextResponse.json(
      { ok: false, message: `Unknown destination kind: ${kind}` },
      { status: 400 }
    );
  }

  try {
    const adapter = getAdapter(kind);
    const result = await adapter.testConnection(body.credentials, body.config ?? {});
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : String(err) },
      { status: 200 }
    );
  }
}
