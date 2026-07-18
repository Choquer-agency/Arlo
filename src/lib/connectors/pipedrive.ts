import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  MetricResultRow,
  DiscoveryResult,
  ConnectorError,
} from "./types";

/**
 * Pipedrive — workspace-level connection. The OAuth callback stores the
 * company's api_domain (e.g. https://yourco.pipedrive.com) as
 * connection.accountId; all API calls go through that domain.
 */

const KNOWN_METRICS = new Set([
  "deals_created",
  "deals_won",
  "deals_lost",
  "won_value",
  "open_deals",
  "open_pipeline_value",
]);

const PAGE_SIZE = 500;
const MAX_DEALS = 1000;

interface PdDeal {
  id?: number;
  title?: string;
  value?: number | string;
  currency?: string;
  status?: string; // open | won | lost | deleted
  stage_id?: number;
  add_time?: string; // "YYYY-MM-DD HH:MM:SS"
  won_time?: string | null;
  lost_time?: string | null;
}

async function pdGet(apiDomain: string, path: string, token: string): Promise<unknown> {
  const res = await fetch(`${apiDomain}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) {
    const text = (await res.text()).slice(0, 300);
    if (res.status === 401)
      throw new ConnectorError(
        "Pipedrive rejected the access token (401). Reconnect Pipedrive on /connections.",
        "auth_expired"
      );
    if (res.status === 429)
      throw new ConnectorError("Pipedrive rate limit hit (429). Try again shortly.", "rate_limited");
    throw new ConnectorError(`Pipedrive API error ${res.status}: ${text}`, "upstream_error");
  }
  return res.json();
}

/** Compare a Pipedrive timestamp ("YYYY-MM-DD HH:MM:SS") against a YYYY-MM-DD range. */
function inRange(ts: string | null | undefined, start: string, end: string): boolean {
  if (!ts) return false;
  const day = ts.slice(0, 10);
  return day >= start && day <= end;
}

function applySortLimit(rows: MetricResultRow[], query: MetricQuery): MetricResultRow[] {
  let out = rows;
  if (query.sort) {
    const { metric, direction } = query.sort;
    out = [...out].sort((a, b) => {
      const diff = (a.metrics[metric] ?? 0) - (b.metrics[metric] ?? 0);
      return direction === "asc" ? diff : -diff;
    });
  }
  if (query.limit && query.limit > 0) out = out.slice(0, query.limit);
  return out;
}

export const pipedriveConnector: MarketingConnector = {
  platform: "pipedrive",
  provider: "pipedrive",
  status: "beta",

  isConfigured(): boolean {
    return true; // workspace-level connection; fetch() raises not_connected when absent
  },

  missingReason(): string {
    return "Pipedrive isn't connected for this workspace. Connect it on /connections.";
  },

  discover(): DiscoveryResult {
    return {
      platform: "pipedrive",
      status: "beta",
      metrics: [
        { name: "deals_created", description: "Deals created (add_time) inside the date range", type: "metric" },
        { name: "deals_won", description: "Deals marked won (won_time) inside the date range", type: "metric" },
        { name: "deals_lost", description: "Deals marked lost (lost_time) inside the date range", type: "metric" },
        { name: "won_value", description: "Sum of deal value for deals won inside the date range (deal currency, not converted)", type: "metric" },
        { name: "open_deals", description: "Deals currently open — a live snapshot, not affected by the date range", type: "metric" },
        { name: "open_pipeline_value", description: "Sum of deal value across currently open deals — a live snapshot", type: "metric" },
      ],
      dimensions: [
        { name: "stage", description: "One row per pipeline stage, with the currently open deals and pipeline value sitting in that stage", type: "dimension" },
      ],
    };
  },

  async fetch(ctx: ConnectorContext, query: MetricQuery): Promise<MetricResult> {
    const conn = await ctx.getConnection("pipedrive");
    if (!conn) {
      throw new ConnectorError(
        "Pipedrive isn't connected for this workspace. Connect it on /connections.",
        "not_connected"
      );
    }
    const apiDomain = conn.accountId;
    if (!apiDomain || !apiDomain.startsWith("http")) {
      throw new ConnectorError(
        "Pipedrive connection is missing its API domain. Reconnect Pipedrive on /connections.",
        "not_connected"
      );
    }

    for (const m of query.metrics) {
      if (!KNOWN_METRICS.has(m)) {
        throw new ConnectorError(
          `Unknown Pipedrive metric "${m}". Supported: ${Array.from(KNOWN_METRICS).join(", ")}.`,
          "invalid_metric"
        );
      }
    }
    const dimension = query.dimensions?.[0];
    if (dimension && dimension !== "stage") {
      throw new ConnectorError(
        `Unknown Pipedrive dimension "${dimension}". Supported: stage.`,
        "invalid_metric"
      );
    }

    const token = await ctx.getAccessToken("pipedrive");

    // Page through deals (all statuses), capped at MAX_DEALS.
    const deals: PdDeal[] = [];
    let start = 0;
    let capped = false;
    for (;;) {
      const data = (await pdGet(
        apiDomain,
        `/api/v1/deals?status=all_not_deleted&limit=${PAGE_SIZE}&start=${start}`,
        token
      )) as {
        data?: PdDeal[] | null;
        additional_data?: {
          pagination?: { more_items_in_collection?: boolean; next_start?: number };
        };
      };
      deals.push(...(data.data ?? []));
      const pagination = data.additional_data?.pagination;
      if (!pagination?.more_items_in_collection) break;
      if (deals.length >= MAX_DEALS) {
        capped = true;
        break;
      }
      start = pagination.next_start ?? start + PAGE_SIZE;
    }

    const { start: rangeStart, end: rangeEnd } = query.dateRange;
    const num = (v: PdDeal["value"]) => Number(v ?? 0) || 0;

    const openDeals = deals.filter((d) => d.status === "open");
    const wonInRange = deals.filter((d) => d.status === "won" && inRange(d.won_time, rangeStart, rangeEnd));

    const allTotals: Record<string, number> = {
      deals_created: deals.filter((d) => inRange(d.add_time, rangeStart, rangeEnd)).length,
      deals_won: wonInRange.length,
      deals_lost: deals.filter((d) => d.status === "lost" && inRange(d.lost_time, rangeStart, rangeEnd)).length,
      won_value: wonInRange.reduce((s, d) => s + num(d.value), 0),
      open_deals: openDeals.length,
      open_pipeline_value: openDeals.reduce((s, d) => s + num(d.value), 0),
    };
    const totals: Record<string, number> = {};
    for (const m of query.metrics) totals[m] = allTotals[m];

    let breakdown: MetricResultRow[] = [];
    if (dimension === "stage") {
      const stagesData = (await pdGet(apiDomain, "/api/v1/stages", token)) as {
        data?: { id?: number; name?: string; pipeline_name?: string }[] | null;
      };
      const stageNames = new Map<number, string>();
      for (const s of stagesData.data ?? []) {
        if (s.id != null) {
          stageNames.set(s.id, s.pipeline_name ? `${s.pipeline_name} / ${s.name}` : s.name ?? String(s.id));
        }
      }
      const byStage = new Map<number, { count: number; value: number }>();
      for (const d of openDeals) {
        const key = d.stage_id ?? -1;
        const agg = byStage.get(key) ?? { count: 0, value: 0 };
        agg.count += 1;
        agg.value += num(d.value);
        byStage.set(key, agg);
      }
      breakdown = Array.from(byStage.entries()).map(([stageId, agg]) => ({
        dimensions: { stage: stageNames.get(stageId) ?? `Stage ${stageId}` },
        metrics: { open_deals: agg.count, open_pipeline_value: agg.value },
      }));
    }

    breakdown = applySortLimit(breakdown, query);

    const meta: Record<string, unknown> = { apiDomain, dealsScanned: deals.length };
    if (capped) {
      meta.note = `Deal scan capped at ${MAX_DEALS} deals — totals may undercount for very large accounts.`;
    }

    return {
      platform: "pipedrive",
      client: { id: ctx.client._id, name: ctx.client.name, slug: ctx.client.slug },
      dateRange: query.dateRange,
      totals,
      breakdown,
      meta,
    };
  },
};
