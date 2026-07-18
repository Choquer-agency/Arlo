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
 * GoHighLevel (LeadConnector) — workspace-level connection scoped to one
 * location. The OAuth callback stores locationId as connection.accountId.
 * Every API call must carry the Version: 2021-07-28 header.
 */

const API_BASE = "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";
const OPP_PAGE_SIZE = 100;
const OPP_MAX = 500;

const CONTACT_METRICS = new Set(["contacts_created"]);
const OPP_METRICS = new Set([
  "opportunities_created",
  "opportunities_won",
  "open_opportunities",
  "pipeline_value",
]);
const KNOWN_METRICS = new Set(Array.from(CONTACT_METRICS).concat(Array.from(OPP_METRICS)));

interface GhlOpportunity {
  id?: string;
  name?: string;
  status?: string; // open | won | lost | abandoned
  monetaryValue?: number;
  createdAt?: string;
  lastStatusChangeAt?: string;
  updatedAt?: string;
}

function ghlHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Version: API_VERSION,
    Accept: "application/json",
  };
}

async function ghlHandleError(res: Response, what: string): Promise<never> {
  const text = (await res.text()).slice(0, 300);
  if (res.status === 401)
    throw new ConnectorError(
      "GoHighLevel rejected the access token (401). Reconnect GoHighLevel on /connections.",
      "auth_expired"
    );
  if (res.status === 429)
    throw new ConnectorError("GoHighLevel rate limit hit (429). Try again shortly.", "rate_limited");
  throw new ConnectorError(`GoHighLevel ${what} failed (${res.status}): ${text}`, "upstream_error");
}

/** Day-level range check on an ISO timestamp; tolerates missing values. */
function inRange(ts: string | undefined, start: string, end: string): boolean {
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

export const gohighlevelConnector: MarketingConnector = {
  platform: "gohighlevel",
  provider: "gohighlevel",
  status: "beta",

  isConfigured(): boolean {
    return true; // workspace-level connection; fetch() raises not_connected when absent
  },

  missingReason(): string {
    return "GoHighLevel isn't connected for this workspace. Connect it on /connections.";
  },

  discover(): DiscoveryResult {
    return {
      platform: "gohighlevel",
      status: "beta",
      metrics: [
        { name: "contacts_created", description: "Contacts added to the location (dateAdded) inside the date range", type: "metric" },
        { name: "opportunities_created", description: "Opportunities created inside the date range (scanned from the most recent 500)", type: "metric" },
        { name: "opportunities_won", description: "Opportunities currently marked won whose last status change fell inside the date range", type: "metric" },
        { name: "open_opportunities", description: "Opportunities currently open — a live snapshot, not affected by the date range", type: "metric" },
        { name: "pipeline_value", description: "Sum of monetary value across currently open opportunities — a live snapshot", type: "metric" },
      ],
      dimensions: [
        { name: "status", description: "One row per opportunity status (open, won, lost, abandoned) with opportunity count and monetary value", type: "dimension" },
      ],
    };
  },

  async fetch(ctx: ConnectorContext, query: MetricQuery): Promise<MetricResult> {
    const conn = await ctx.getConnection("gohighlevel");
    if (!conn) {
      throw new ConnectorError(
        "GoHighLevel isn't connected for this workspace. Connect it on /connections.",
        "not_connected"
      );
    }
    const locationId = conn.accountId;
    if (!locationId) {
      throw new ConnectorError(
        "GoHighLevel connection is missing its location ID. Reconnect GoHighLevel on /connections.",
        "not_connected"
      );
    }

    for (const m of query.metrics) {
      if (!KNOWN_METRICS.has(m)) {
        throw new ConnectorError(
          `Unknown GoHighLevel metric "${m}". Supported: ${Array.from(KNOWN_METRICS).join(", ")}.`,
          "invalid_metric"
        );
      }
    }
    const dimension = query.dimensions?.[0];
    if (dimension && dimension !== "status") {
      throw new ConnectorError(
        `Unknown GoHighLevel dimension "${dimension}". Supported: status.`,
        "invalid_metric"
      );
    }

    const token = await ctx.getAccessToken("gohighlevel");
    const totals: Record<string, number> = {};
    let breakdown: MetricResultRow[] = [];
    const meta: Record<string, unknown> = { locationId };

    if (query.metrics.includes("contacts_created")) {
      const res = await fetch(`${API_BASE}/contacts/search`, {
        method: "POST",
        headers: { ...ghlHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId,
          page: 1,
          pageLimit: 1,
          filters: [
            {
              field: "dateAdded",
              operator: "range",
              value: {
                gte: `${query.dateRange.start}T00:00:00Z`,
                lte: `${query.dateRange.end}T23:59:59Z`,
              },
            },
          ],
        }),
      });
      if (!res.ok) await ghlHandleError(res, "contacts search");
      const json = (await res.json()) as { total?: number };
      totals.contacts_created = Number(json.total ?? 0);
    }

    const wantsOpps = query.metrics.some((m) => OPP_METRICS.has(m)) || dimension === "status";
    if (wantsOpps) {
      const opportunities: GhlOpportunity[] = [];
      let capped = false;
      for (let page = 1; opportunities.length < OPP_MAX; page++) {
        const res = await fetch(
          `${API_BASE}/opportunities/search?location_id=${encodeURIComponent(
            locationId
          )}&limit=${OPP_PAGE_SIZE}&page=${page}`,
          { headers: ghlHeaders(token) }
        );
        if (!res.ok) await ghlHandleError(res, "opportunities search");
        const json = (await res.json()) as {
          opportunities?: GhlOpportunity[];
          meta?: { total?: number; nextPage?: number | null };
        };
        const batch = json.opportunities ?? [];
        opportunities.push(...batch);
        const total = Number(json.meta?.total ?? opportunities.length);
        if (batch.length < OPP_PAGE_SIZE || opportunities.length >= total) break;
        if (opportunities.length >= OPP_MAX) {
          capped = true;
          break;
        }
      }
      if (capped) {
        meta.note = `Opportunity scan capped at ${OPP_MAX} most recent opportunities — totals may undercount for very large locations.`;
      }

      const { start, end } = query.dateRange;
      const open = opportunities.filter((o) => (o.status ?? "").toLowerCase() === "open");
      const value = (o: GhlOpportunity) => Number(o.monetaryValue ?? 0) || 0;

      const oppTotals: Record<string, number> = {
        opportunities_created: opportunities.filter((o) => inRange(o.createdAt, start, end)).length,
        opportunities_won: opportunities.filter(
          (o) =>
            (o.status ?? "").toLowerCase() === "won" &&
            inRange(o.lastStatusChangeAt ?? o.updatedAt ?? o.createdAt, start, end)
        ).length,
        open_opportunities: open.length,
        pipeline_value: open.reduce((s, o) => s + value(o), 0),
      };
      for (const m of query.metrics) {
        if (OPP_METRICS.has(m)) totals[m] = oppTotals[m];
      }

      if (dimension === "status") {
        const byStatus = new Map<string, { count: number; value: number }>();
        for (const o of opportunities) {
          const key = (o.status ?? "unknown").toLowerCase();
          const agg = byStatus.get(key) ?? { count: 0, value: 0 };
          agg.count += 1;
          agg.value += value(o);
          byStatus.set(key, agg);
        }
        breakdown = Array.from(byStatus.entries()).map(([status, agg]) => ({
          dimensions: { status },
          metrics: { opportunities: agg.count, monetary_value: agg.value },
        }));
      }
    }

    breakdown = applySortLimit(breakdown, query);

    return {
      platform: "gohighlevel",
      client: { id: ctx.client._id, name: ctx.client.name, slug: ctx.client.slug },
      dateRange: query.dateRange,
      totals,
      breakdown,
      meta,
    };
  },
};
