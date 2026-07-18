import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  MetricResultRow,
  DiscoveryResult,
  ConnectorError,
} from "./types";

const HUBSPOT_API = "https://api.hubapi.com";
/** Max records paged through when summing amounts / grouping by stage. */
const SUM_CAP = 200;

const SUPPORTED_METRICS = [
  "contacts_created",
  "deals_created",
  "deals_won",
  "deals_won_value",
  "open_deals",
  "open_deal_value",
];

interface SearchFilter {
  propertyName: string;
  operator: "EQ" | "BETWEEN" | "GTE" | "LTE";
  value?: string;
  highValue?: string;
}

interface SearchResponse {
  total: number;
  results?: { id: string; properties?: Record<string, string | null> }[];
  paging?: { next?: { after?: string } };
}

function mapHttpError(status: number, body: string): ConnectorError {
  if (status === 401) {
    return new ConnectorError(
      `HubSpot access token is invalid or expired — reconnect HubSpot on /connections. (${body})`,
      "auth_expired"
    );
  }
  if (status === 429) {
    return new ConnectorError(`HubSpot API rate limit hit — retry shortly. (${body})`, "rate_limited");
  }
  return new ConnectorError(`HubSpot API error (${status}): ${body}`, "upstream_error");
}

async function search(
  accessToken: string,
  objectType: "contacts" | "deals",
  filters: SearchFilter[],
  opts: { limit: number; after?: string; properties?: string[] } = { limit: 1 }
): Promise<SearchResponse> {
  const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/${objectType}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filterGroups: [{ filters }],
      limit: opts.limit,
      after: opts.after,
      properties: opts.properties,
    }),
  });
  if (!res.ok) throw mapHttpError(res.status, await res.text());
  return (await res.json()) as SearchResponse;
}

/** Count matching records via the search `total` field (no paging needed). */
async function count(
  accessToken: string,
  objectType: "contacts" | "deals",
  filters: SearchFilter[]
): Promise<number> {
  const res = await search(accessToken, objectType, filters, { limit: 1 });
  return res.total;
}

/**
 * Page through matching deals (up to SUM_CAP) and collect the requested
 * properties. Returns whether the cap truncated the result set.
 */
async function collectDeals(
  accessToken: string,
  filters: SearchFilter[],
  properties: string[]
): Promise<{ rows: Record<string, string | null>[]; total: number; capped: boolean }> {
  const rows: Record<string, string | null>[] = [];
  let after: string | undefined;
  let total = 0;
  while (rows.length < SUM_CAP) {
    const page = await search(accessToken, "deals", filters, {
      limit: Math.min(100, SUM_CAP - rows.length),
      after,
      properties,
    });
    total = page.total;
    for (const r of page.results ?? []) rows.push(r.properties ?? {});
    after = page.paging?.next?.after;
    if (!after || !(page.results ?? []).length) break;
  }
  return { rows, total, capped: total > rows.length };
}

function sumAmount(rows: Record<string, string | null>[]): number {
  return rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
}

export const hubspotConnector: MarketingConnector = {
  platform: "hubspot",
  provider: "hubspot",
  status: "beta",

  isConfigured(): boolean {
    return true; // workspace-level connection; fetch() raises not_connected when absent
  },

  missingReason(): string {
    return "HubSpot isn't connected for this workspace. Connect it on /connections.";
  },

  discover(): DiscoveryResult {
    return {
      platform: "hubspot",
      status: "beta",
      metrics: [
        { name: "contacts_created", description: "Contacts created during the date range (by createdate)", type: "metric" },
        { name: "deals_created", description: "Deals created during the date range (by createdate)", type: "metric" },
        { name: "deals_won", description: "Deals closed-won during the date range (hs_is_closed_won with closedate in range)", type: "metric" },
        { name: "deals_won_value", description: `Sum of the amount on deals closed-won in the date range (sums up to ${SUM_CAP} deals; result notes when capped)`, type: "metric" },
        { name: "open_deals", description: "Deals currently open — a point-in-time snapshot, not bound to the date range", type: "metric" },
        { name: "open_deal_value", description: `Sum of the amount on currently open deals — point-in-time snapshot (sums up to ${SUM_CAP} deals)`, type: "metric" },
      ],
      dimensions: [
        {
          name: "stage",
          description: `Group deals created in the date range by pipeline stage (dealstage internal name). Each row carries deal_count and deal_value; aggregated client-side over up to ${SUM_CAP} deals.`,
          type: "dimension",
        },
      ],
    };
  },

  async fetch(ctx: ConnectorContext, query: MetricQuery): Promise<MetricResult> {
    for (const m of query.metrics) {
      if (!SUPPORTED_METRICS.includes(m)) {
        throw new ConnectorError(
          `Unknown HubSpot metric "${m}". Supported: ${SUPPORTED_METRICS.join(", ")}`,
          "invalid_metric"
        );
      }
    }
    const dimension = query.dimensions?.[0];
    if (dimension && dimension !== "stage") {
      throw new ConnectorError(
        `Unknown HubSpot dimension "${dimension}". Supported: stage`,
        "invalid_metric"
      );
    }

    const conn = await ctx.getConnection("hubspot");
    if (!conn) {
      throw new ConnectorError(
        "HubSpot isn't connected for this workspace. Connect it on /connections.",
        "not_connected"
      );
    }
    const accessToken = await ctx.getAccessToken("hubspot");

    const startMs = Date.parse(`${query.dateRange.start}T00:00:00Z`);
    const endMs = Date.parse(`${query.dateRange.end}T23:59:59.999Z`);
    const createdInRange: SearchFilter = {
      propertyName: "createdate",
      operator: "BETWEEN",
      value: String(startMs),
      highValue: String(endMs),
    };
    const closedInRange: SearchFilter = {
      propertyName: "closedate",
      operator: "BETWEEN",
      value: String(startMs),
      highValue: String(endMs),
    };
    const isWon: SearchFilter = { propertyName: "hs_is_closed_won", operator: "EQ", value: "true" };
    const isOpen: SearchFilter = { propertyName: "hs_is_closed", operator: "EQ", value: "false" };

    const totals: Record<string, number> = {};
    const meta: Record<string, unknown> = { portalId: conn.accountId };
    const cappedNotes: string[] = [];

    for (const m of query.metrics) {
      switch (m) {
        case "contacts_created":
          totals[m] = await count(accessToken, "contacts", [createdInRange]);
          break;
        case "deals_created":
          totals[m] = await count(accessToken, "deals", [createdInRange]);
          break;
        case "deals_won":
          totals[m] = await count(accessToken, "deals", [isWon, closedInRange]);
          break;
        case "deals_won_value": {
          const { rows, total, capped } = await collectDeals(
            accessToken,
            [isWon, closedInRange],
            ["amount"]
          );
          totals[m] = sumAmount(rows);
          if (capped) cappedNotes.push(`deals_won_value summed first ${rows.length} of ${total} deals`);
          break;
        }
        case "open_deals":
          totals[m] = await count(accessToken, "deals", [isOpen]);
          break;
        case "open_deal_value": {
          const { rows, total, capped } = await collectDeals(accessToken, [isOpen], ["amount"]);
          totals[m] = sumAmount(rows);
          if (capped) cappedNotes.push(`open_deal_value summed first ${rows.length} of ${total} deals`);
          break;
        }
      }
    }

    let breakdown: MetricResultRow[] = [];
    if (dimension === "stage") {
      const { rows, total, capped } = await collectDeals(
        accessToken,
        [createdInRange],
        ["dealstage", "amount"]
      );
      if (capped) cappedNotes.push(`stage breakdown aggregated first ${rows.length} of ${total} deals`);
      const byStage = new Map<string, { deal_count: number; deal_value: number }>();
      for (const r of rows) {
        const stage = r.dealstage ?? "(no stage)";
        const agg = byStage.get(stage) ?? { deal_count: 0, deal_value: 0 };
        agg.deal_count += 1;
        agg.deal_value += Number(r.amount) || 0;
        byStage.set(stage, agg);
      }
      breakdown = Array.from(byStage.entries()).map(([stage, agg]) => ({
        dimensions: { stage },
        metrics: { deal_count: agg.deal_count, deal_value: agg.deal_value },
      }));
      if (query.sort) {
        const { metric, direction } = query.sort;
        breakdown.sort((a, b) => {
          const diff = (a.metrics[metric] ?? 0) - (b.metrics[metric] ?? 0);
          return direction === "asc" ? diff : -diff;
        });
      }
      if (query.limit && query.limit > 0) breakdown = breakdown.slice(0, query.limit);
      meta.stageBreakdownNote =
        "stage rows report deal_count and deal_value for deals created in the range, keyed by the dealstage internal name";
    }

    if (cappedNotes.length) meta.caps = cappedNotes;
    if (query.metrics.includes("open_deals") || query.metrics.includes("open_deal_value")) {
      meta.snapshotNote = "open_deals / open_deal_value are current snapshots, not bound to the date range";
    }

    return {
      platform: "hubspot",
      client: { id: ctx.client._id, name: ctx.client.name, slug: ctx.client.slug },
      dateRange: query.dateRange,
      totals,
      breakdown,
      meta,
    };
  },
};
