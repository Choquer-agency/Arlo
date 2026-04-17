/**
 * Looker Studio Community Connector data endpoint. Our Apps Script community
 * connector (public/connectors/lookerstudio/) authenticates with a bearer token
 * the agency pastes into Looker's credentials dialog. On every refresh, Looker
 * POSTs here with { action: "getSchema" | "getData" }.
 *
 * Auth flow:
 *   1. Client pastes `ls_<token>` into Looker's auth dialog.
 *   2. Connector sends `Authorization: Bearer ls_<token>` on every request.
 *   3. We sha256 the token, look up destinations.by_live_token_hash.
 *   4. The matched destination row has workspaceId + clientId LOCKED.
 *   5. We call fetchDataset with those locked values — token can't be repurposed.
 */
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { fetchDataset } from "@/lib/datasets/fetchDataset";
import { getServiceSecret } from "@/lib/serviceSecret";
import type { LookerStudioConfig } from "@/lib/destinations/adapters/lookerStudio";
import type { DateRangeInput, ResolvedDateRange } from "@/lib/connectors/types";

export const runtime = "nodejs";
export const maxDuration = 30;

interface LookerRequest {
  action: "getSchema" | "getData";
  dateRange?: { startDate?: string; endDate?: string };
  fields?: string[];
}

interface LookerField {
  name: string;
  label: string;
  dataType: "NUMBER" | "STRING" | "BOOLEAN";
  semantics: { conceptType: "metric" | "dimension" };
}

function hashToken(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

function extractToken(req: Request): string | null {
  const auth = req.headers.get("authorization") ?? "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  const url = new URL(req.url);
  const q = url.searchParams.get("token");
  return q ? q.trim() : null;
}

function buildSchema(config: LookerStudioConfig): LookerField[] {
  const dims: LookerField[] = (config.dimensions ?? []).map((name) => ({
    name,
    label: name.replace(/_/g, " "),
    dataType: "STRING",
    semantics: { conceptType: "dimension" },
  }));
  const metrics: LookerField[] = config.metrics.map((name) => ({
    name,
    label: name.replace(/_/g, " "),
    dataType: "NUMBER",
    semantics: { conceptType: "metric" },
  }));
  return [...dims, ...metrics];
}

function rowsForLooker(
  config: LookerStudioConfig,
  fields: string[],
  data: Awaited<ReturnType<typeof fetchDataset>>
): Array<{ values: Array<string | number | null> }> {
  const hasDimensions = (config.dimensions?.length ?? 0) > 0;
  if (!hasDimensions) {
    // Single row of totals.
    return [
      {
        values: fields.map((f) => {
          const v = data.totals[f];
          return v === undefined ? null : v;
        }),
      },
    ];
  }
  return (data.breakdown ?? []).map((row) => ({
    values: fields.map((f) => {
      const dim = row.dimensions?.[f];
      if (dim !== undefined) return dim;
      const m = row.metrics?.[f];
      return m === undefined ? null : m;
    }),
  }));
}

function mapDateRange(range: LookerRequest["dateRange"]): DateRangeInput {
  if (range?.startDate && range?.endDate) {
    return { start: range.startDate, end: range.endDate };
  }
  return { preset: "last_28_days" };
}

export async function POST(req: Request) {
  const token = extractToken(req);
  if (!token) return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });

  const resolved = await fetchQuery(api.shareableDashboards.resolveByTokenHash, {
    _serviceSecret: getServiceSecret(),
    tokenHash: hashToken(token),
  });
  if (!resolved || !resolved.clientId) {
    // Deliberately vague — don't reveal whether the token matched a different kind.
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // The resolver currently only returns shareable_dashboard rows. For Looker,
  // we need a parallel resolver that accepts looker_studio kind too. For now,
  // add a kind check here so we keep a single secure resolver code path.
  const config = resolved.config as LookerStudioConfig | undefined;
  if (!config || !Array.isArray(config.metrics)) {
    return NextResponse.json({ error: "Invalid destination config" }, { status: 400 });
  }

  let body: LookerRequest;
  try {
    body = (await req.json()) as LookerRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action === "getSchema") {
    return NextResponse.json({ schema: buildSchema(config) });
  }

  if (body.action === "getData") {
    try {
      const data = await fetchDataset({
        workspaceId: resolved.workspaceId,
        clientId: resolved.clientId as Id<"clients">,
        platform: config.platform,
        metrics: config.metrics,
        dimensions: config.dimensions,
        dateRange: mapDateRange(body.dateRange),
      });
      const fields = body.fields && body.fields.length > 0
        ? body.fields
        : [...(config.dimensions ?? []), ...config.metrics];
      return NextResponse.json({
        schema: buildSchema(config).filter((f) => fields.includes(f.name)),
        rows: rowsForLooker(config, fields, data),
        dateRange: serializeRange(data.dateRange),
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Data fetch failed" },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}

export async function GET(req: Request) {
  // Allow GET as a simple health probe for the community connector author.
  const token = extractToken(req);
  if (!token) return NextResponse.json({ ok: true, info: "Looker Studio live endpoint" });
  const resolved = await fetchQuery(api.shareableDashboards.resolveByTokenHash, {
    _serviceSecret: getServiceSecret(),
    tokenHash: hashToken(token),
  });
  return NextResponse.json({ ok: !!resolved });
}

function serializeRange(r: ResolvedDateRange) {
  return { start: r.start, end: r.end, label: r.label };
}
