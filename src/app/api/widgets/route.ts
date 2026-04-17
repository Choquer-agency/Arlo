/**
 * Dashboard widget data endpoint. Wraps fetchDataset() — the same chokepoint
 * MCP's marketing_query tool calls — so dashboard widgets fetch the same live
 * source data Claude does, just from React instead.
 *
 * Auth flow:
 *   1. Read Convex auth token from session cookie.
 *   2. Validate the user is a member of the requested workspace.
 *   3. Validate (workspace, client) ownership and pass clientId LOCKED to fetchDataset.
 *
 * Widget specs are server-validated against an allowlist (WIDGET_SPECS) so a
 * compromised client can't request arbitrary metric/dimension combinations.
 */

import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { fetchDataset } from "@/lib/datasets/fetchDataset";
import type { DateRangeInput } from "@/lib/connectors/types";
import { ConnectorError } from "@/lib/connectors/types";
import { getWidgetSpec, type WidgetKind, WIDGET_SPECS } from "@/lib/widgets/specs";

export const runtime = "nodejs";

interface WidgetRequest {
  workspaceId: Id<"workspaces">;
  clientId: Id<"clients">;
  kind: WidgetKind;
  dateRange: DateRangeInput;
}

export async function POST(req: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: WidgetRequest;
  try {
    body = (await req.json()) as WidgetRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.workspaceId || !body.clientId || !body.kind || !body.dateRange) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!(body.kind in WIDGET_SPECS)) {
    return NextResponse.json({ error: `Unknown widget kind: ${body.kind}` }, { status: 400 });
  }

  // Membership check — fetchDataset uses fetchQuery internally too, but doing
  // this explicitly gives us a clean 403 instead of an opaque downstream error.
  let workspaces;
  try {
    workspaces = await fetchQuery(api.workspaces.listMine, {}, { token });
  } catch {
    return NextResponse.json({ error: "Auth check failed" }, { status: 401 });
  }
  if (!workspaces.some((w: { _id: string }) => w._id === body.workspaceId)) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const spec = getWidgetSpec(body.kind);

  try {
    const result = await fetchDataset({
      workspaceId: body.workspaceId,
      clientId: body.clientId, // LOCKED — NDA scoping enforced by fetchDataset
      platform: spec.platform,
      metrics: spec.metrics,
      dimensions: spec.dimensions,
      limit: spec.limit,
      dateRange: body.dateRange,
    });
    return NextResponse.json(result, {
      headers: {
        // Browser cache for 60s — a dashboard refresh within a minute reuses
        // the response without hitting the source API again.
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (err) {
    if (err instanceof ConnectorError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.code === "not_connected" || err.code === "missing_id" ? 412 : 502 }
      );
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
