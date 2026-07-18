import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  MetricResultRow,
  DiscoveryResult,
  ConnectorError,
} from "./types";

const GRAPH = "https://graph.facebook.com/v19.0";

/**
 * Requested metric name → Graph Insights API field it needs.
 * conversions / conversion_value are derived from the actions / action_values
 * arrays rather than being first-class fields.
 */
const METRIC_FIELDS: Record<string, string> = {
  impressions: "impressions",
  clicks: "clicks",
  ctr: "ctr",
  cpc: "cpc",
  spend: "spend",
  reach: "reach",
  frequency: "frequency",
  conversions: "actions",
  conversion_value: "action_values",
};

/** Metrics that can be summed across rows; the rest are re-derived. */
const ADDITIVE = new Set([
  "impressions",
  "clicks",
  "spend",
  "reach",
  "conversions",
  "conversion_value",
]);

interface ActionEntry {
  action_type: string;
  value: string;
}

interface InsightsRow {
  impressions?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  spend?: string;
  reach?: string;
  frequency?: string;
  actions?: ActionEntry[];
  action_values?: ActionEntry[];
  campaign_name?: string;
  campaign_id?: string;
  date_start?: string;
  date_stop?: string;
}

/**
 * Sum conversion-type actions. "purchase" and "lead" are Meta's omni rollups —
 * when present we skip the pixel-level offsite_conversion.* variants they
 * already include to avoid double counting.
 */
function sumConversionActions(entries: ActionEntry[] | undefined): number {
  if (!entries?.length) return 0;
  const types = new Set(entries.map((e) => e.action_type));
  let total = 0;
  for (const e of entries) {
    const t = e.action_type;
    if (t === "purchase" || t === "lead") {
      total += Number(e.value) || 0;
    } else if (t.startsWith("offsite_conversion.")) {
      if (t.endsWith("purchase") && types.has("purchase")) continue;
      if (t.endsWith("lead") && types.has("lead")) continue;
      total += Number(e.value) || 0;
    }
  }
  return total;
}

function rowMetrics(row: InsightsRow, metrics: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of metrics) {
    if (m === "conversions") out[m] = sumConversionActions(row.actions);
    else if (m === "conversion_value") out[m] = sumConversionActions(row.action_values);
    else out[m] = Number(row[m as keyof InsightsRow] ?? 0) || 0;
  }
  return out;
}

function mapGraphError(status: number, body: string): ConnectorError {
  let code: number | undefined;
  let message = body;
  try {
    const parsed = JSON.parse(body) as { error?: { code?: number; message?: string } };
    code = parsed.error?.code;
    message = parsed.error?.message ?? body;
  } catch {
    // keep raw body
  }
  if (status === 401 || code === 190) {
    return new ConnectorError(
      `Meta access token is invalid or expired — reconnect Meta on /connections. (${message})`,
      "auth_expired"
    );
  }
  if (status === 429 || code === 4 || code === 17 || code === 32 || code === 613) {
    return new ConnectorError(`Meta API rate limit hit — retry shortly. (${message})`, "rate_limited");
  }
  return new ConnectorError(`Meta Ads API error (${status}): ${message}`, "upstream_error");
}

export const metaAdsConnector: MarketingConnector = {
  platform: "meta_ads",
  provider: "meta",
  status: "beta",

  isConfigured(): boolean {
    // Workspace-level connection; fetch() falls back to the single available
    // ad account when the client has no explicit mapping.
    return true;
  },

  missingReason(ctx: ConnectorContext): string {
    return `${ctx.client.name} has no Meta ad account mapped. Connect Meta on /connections and assign an ad account to this client.`;
  },

  discover(): DiscoveryResult {
    return {
      platform: "meta_ads",
      status: "beta",
      metrics: [
        { name: "spend", description: "Amount spent on ads, in the ad account currency", type: "metric" },
        { name: "impressions", description: "Number of times ads were on screen", type: "metric" },
        { name: "clicks", description: "Total clicks on the ads (all click types)", type: "metric" },
        { name: "ctr", description: "Click-through rate as a percentage (clicks / impressions * 100)", type: "metric" },
        { name: "cpc", description: "Average cost per click, in the ad account currency", type: "metric" },
        { name: "reach", description: "Unique accounts that saw the ads at least once", type: "metric" },
        { name: "frequency", description: "Average times each person saw the ads (impressions / reach)", type: "metric" },
        {
          name: "conversions",
          description:
            "Conversion events attributed to the ads, derived from the actions breakdown (purchase, lead, and offsite pixel conversions; overlapping rollups deduplicated)",
          type: "metric",
        },
        {
          name: "conversion_value",
          description:
            "Monetary value of attributed conversions (from action_values), in the ad account currency",
          type: "metric",
        },
      ],
      dimensions: [
        { name: "campaign", description: "Break results down by Meta Ads campaign name", type: "dimension" },
        { name: "day", description: "Break results down by calendar day (YYYY-MM-DD)", type: "dimension" },
      ],
    };
  },

  async fetch(ctx: ConnectorContext, query: MetricQuery): Promise<MetricResult> {
    // Validate metrics up front.
    for (const m of query.metrics) {
      if (!METRIC_FIELDS[m]) {
        throw new ConnectorError(
          `Unknown Meta Ads metric "${m}". Supported: ${Object.keys(METRIC_FIELDS).join(", ")}`,
          "invalid_metric"
        );
      }
    }

    const conn = await ctx.getConnection("meta");
    if (!conn) {
      throw new ConnectorError(
        "Meta isn't connected for this workspace. Connect it on /connections.",
        "not_connected"
      );
    }

    // Resolve the ad account: explicit client mapping, else the single
    // available ad account on the connection.
    let accountId = ctx.client.metaAdAccountId;
    if (!accountId) {
      const adAccounts = (conn.availableAccounts ?? []).filter(
        (a) => a.kind === "meta_ad_account"
      );
      if (adAccounts.length === 1) {
        accountId = adAccounts[0].id;
      } else {
        throw new ConnectorError(
          adAccounts.length === 0
            ? "The connected Meta user has no ad accounts. Reconnect Meta with a user that can access the ad account."
            : `${ctx.client.name} has no Meta ad account mapped and the workspace has ${adAccounts.length} available (${adAccounts
                .map((a) => `${a.name} [${a.id}]`)
                .join(", ")}). Map one to this client in its settings.`,
          "not_connected"
        );
      }
    }
    const actId = accountId.startsWith("act_") ? accountId : `act_${accountId}`;

    const accessToken = await ctx.getAccessToken("meta");

    const dimension = query.dimensions?.[0];
    if (dimension && dimension !== "campaign" && dimension !== "day") {
      throw new ConnectorError(
        `Unknown Meta Ads dimension "${dimension}". Supported: campaign, day`,
        "invalid_metric"
      );
    }

    const fields = Array.from(new Set(query.metrics.map((m) => METRIC_FIELDS[m])));
    if (dimension === "campaign") fields.push("campaign_name");

    const params = new URLSearchParams({
      access_token: accessToken,
      time_range: JSON.stringify({
        since: query.dateRange.start,
        until: query.dateRange.end,
      }),
      level: dimension === "campaign" ? "campaign" : "account",
      fields: fields.join(","),
      limit: "500",
    });
    if (dimension === "day") params.set("time_increment", "1");

    const res = await fetch(`${GRAPH}/${actId}/insights?${params.toString()}`);
    if (!res.ok) {
      throw mapGraphError(res.status, await res.text());
    }
    const json = (await res.json()) as { data?: InsightsRow[] };
    const rows = json.data ?? [];

    if (rows.length === 0) {
      throw new ConnectorError(
        `No Meta Ads delivery data for ${ctx.client.name} (${actId}) in ${query.dateRange.label}.`,
        "no_data"
      );
    }

    let breakdown: MetricResultRow[] = rows.map((row) => ({
      dimensions: dimension
        ? {
            [dimension]:
              dimension === "campaign"
                ? row.campaign_name ?? row.campaign_id ?? ""
                : row.date_start ?? "",
          }
        : undefined,
      metrics: rowMetrics(row, query.metrics),
    }));

    if (query.sort) {
      const { metric, direction } = query.sort;
      breakdown = [...breakdown].sort((a, b) => {
        const diff = (a.metrics[metric] ?? 0) - (b.metrics[metric] ?? 0);
        return direction === "asc" ? diff : -diff;
      });
    }
    if (query.limit && query.limit > 0) {
      breakdown = breakdown.slice(0, query.limit);
    }

    // Totals: single account-level row IS the aggregate; otherwise sum the
    // additive metrics (pre-limit rows) and re-derive rates.
    const totals: Record<string, number> = {};
    if (!dimension && rows.length === 1) {
      Object.assign(totals, rowMetrics(rows[0], query.metrics));
    } else {
      const allRows = rows.map((r) => rowMetrics(r, query.metrics));
      // Sums for requested metrics + the inputs needed to derive rates.
      const sums = (name: string): number =>
        rows.reduce((s, r) => {
          if (name === "conversions") return s + sumConversionActions(r.actions);
          if (name === "conversion_value") return s + sumConversionActions(r.action_values);
          return s + (Number(r[name as keyof InsightsRow] ?? 0) || 0);
        }, 0);
      for (const m of query.metrics) {
        if (ADDITIVE.has(m)) {
          totals[m] = allRows.reduce((s, r) => s + (r[m] ?? 0), 0);
        } else if (m === "ctr") {
          const imp = sums("impressions");
          totals[m] = imp > 0 ? (sums("clicks") / imp) * 100 : 0;
        } else if (m === "cpc") {
          const clicks = sums("clicks");
          totals[m] = clicks > 0 ? sums("spend") / clicks : 0;
        } else if (m === "frequency") {
          const reach = sums("reach");
          totals[m] = reach > 0 ? sums("impressions") / reach : 0;
        }
      }
    }

    return {
      platform: "meta_ads",
      client: { id: ctx.client._id, name: ctx.client.name, slug: ctx.client.slug },
      dateRange: query.dateRange,
      totals,
      breakdown,
      meta: {
        adAccountId: actId,
        level: dimension === "campaign" ? "campaign" : "account",
        rowCount: rows.length,
        notes: [
          "reach summed across days/campaigns can overcount unique people",
          query.metrics.includes("conversions") || query.metrics.includes("conversion_value")
            ? "conversions derived from purchase + lead + offsite_conversion.* actions (overlapping rollups deduplicated)"
            : undefined,
        ].filter(Boolean),
      },
    };
  },
};
