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
 * MailerLite — workspace-level API-key connection (new "connect.mailerlite.com"
 * API, Bearer auth). The key is stored as the connection's accessToken with a
 * far-future expiry, so no refresh is ever attempted.
 */

const API_BASE = "https://connect.mailerlite.com/api";

const CAMPAIGN_METRICS = new Set([
  "campaigns_sent",
  "emails_sent",
  "opens",
  "clicks",
  "open_rate",
  "click_rate",
]);
const KNOWN_METRICS = new Set(Array.from(CAMPAIGN_METRICS).concat("total_subscribers"));

interface MlCampaignStats {
  sent?: number;
  opens_count?: number;
  unique_opens_count?: number;
  open_rate?: { float?: number; string?: string } | number;
  clicks_count?: number;
  unique_clicks_count?: number;
  click_rate?: { float?: number; string?: string } | number;
}

interface MlCampaign {
  id?: string;
  name?: string;
  status?: string;
  finished_at?: string | null;
  stats?: MlCampaignStats;
}

function rate(value: MlCampaignStats["open_rate"]): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object") return Number(value.float ?? 0);
  return 0;
}

async function mlGet(path: string, apiKey: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = (await res.text()).slice(0, 300);
    if (res.status === 401)
      throw new ConnectorError(
        "MailerLite rejected the API key (401). Re-enter a valid key on /connections.",
        "auth_expired"
      );
    if (res.status === 429)
      throw new ConnectorError("MailerLite rate limit hit (429). Try again shortly.", "rate_limited");
    throw new ConnectorError(`MailerLite API error ${res.status}: ${text}`, "upstream_error");
  }
  return res.json();
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

export const mailerliteConnector: MarketingConnector = {
  platform: "mailerlite",
  provider: "mailerlite",
  status: "beta",

  isConfigured(): boolean {
    return true; // workspace-level connection; fetch() raises not_connected when absent
  },

  missingReason(): string {
    return "MailerLite isn't connected for this workspace. Add the API key on /connections.";
  },

  discover(): DiscoveryResult {
    return {
      platform: "mailerlite",
      status: "beta",
      metrics: [
        { name: "total_subscribers", description: "Current active subscriber count — a live snapshot, not affected by the date range", type: "metric" },
        { name: "campaigns_sent", description: "Campaigns that finished sending inside the date range", type: "metric" },
        { name: "emails_sent", description: "Total emails delivered across campaigns finished in the range", type: "metric" },
        { name: "opens", description: "Total opens across campaigns finished in the range", type: "metric" },
        { name: "clicks", description: "Total clicks across campaigns finished in the range", type: "metric" },
        { name: "open_rate", description: "Open rate as a 0-1 fraction, weighted by emails sent per campaign", type: "metric" },
        { name: "click_rate", description: "Click rate as a 0-1 fraction, weighted by emails sent per campaign", type: "metric" },
      ],
      dimensions: [
        { name: "campaign", description: "One row per campaign finished in the date range, with that campaign's metrics", type: "dimension" },
      ],
    };
  },

  async fetch(ctx: ConnectorContext, query: MetricQuery): Promise<MetricResult> {
    const conn = await ctx.getConnection("mailerlite");
    if (!conn) {
      throw new ConnectorError(
        "MailerLite isn't connected for this workspace. Add the API key on /connections.",
        "not_connected"
      );
    }

    for (const m of query.metrics) {
      if (!KNOWN_METRICS.has(m)) {
        throw new ConnectorError(
          `Unknown MailerLite metric "${m}". Supported: ${Array.from(KNOWN_METRICS).join(", ")}.`,
          "invalid_metric"
        );
      }
    }
    const dimension = query.dimensions?.[0];
    if (dimension && dimension !== "campaign") {
      throw new ConnectorError(
        `Unknown MailerLite dimension "${dimension}". Supported: campaign.`,
        "invalid_metric"
      );
    }

    const apiKey = await ctx.getAccessToken("mailerlite");
    const totals: Record<string, number> = {};
    let breakdown: MetricResultRow[] = [];
    const meta: Record<string, unknown> = {};

    if (query.metrics.includes("total_subscribers")) {
      // limit=0 returns only the total count.
      const data = (await mlGet("/subscribers?limit=0", apiKey)) as {
        total?: number;
        meta?: { total?: number };
      };
      totals.total_subscribers = Number(data.total ?? data.meta?.total ?? 0);
    }

    const campaignMetricsWanted = query.metrics.filter((m) => CAMPAIGN_METRICS.has(m));
    if (campaignMetricsWanted.length > 0 || dimension === "campaign") {
      // Pull sent campaigns (newest first) and filter client-side on finished_at.
      const inRange: { name: string; finished: string; metrics: Record<string, number> }[] = [];
      const start = query.dateRange.start;
      const end = query.dateRange.end;
      let capped = false;

      for (let page = 1; page <= 5; page++) {
        const data = (await mlGet(
          `/campaigns?filter[status]=sent&limit=100&page=${page}`,
          apiKey
        )) as { data?: MlCampaign[]; meta?: { last_page?: number } };
        const campaigns = data.data ?? [];
        for (const c of campaigns) {
          const finished = (c.finished_at ?? "").slice(0, 10);
          if (!finished || finished < start || finished > end) continue;
          const stats = c.stats ?? {};
          inRange.push({
            name: c.name || c.id || "Untitled campaign",
            finished,
            metrics: {
              campaigns_sent: 1,
              emails_sent: Number(stats.sent ?? 0),
              opens: Number(stats.opens_count ?? 0),
              clicks: Number(stats.clicks_count ?? 0),
              open_rate: rate(stats.open_rate),
              click_rate: rate(stats.click_rate),
            },
          });
        }
        const lastPage = data.meta?.last_page ?? page;
        if (page >= lastPage || campaigns.length === 0) break;
        if (page === 5 && lastPage > 5) capped = true;
      }
      if (capped) meta.note = "Campaign scan capped at the 500 most recent sent campaigns.";

      const totalSent = inRange.reduce((s, c) => s + c.metrics.emails_sent, 0);
      const weighted = (key: "open_rate" | "click_rate") =>
        totalSent > 0
          ? inRange.reduce((s, c) => s + c.metrics[key] * c.metrics.emails_sent, 0) / totalSent
          : inRange.length > 0
          ? inRange.reduce((s, c) => s + c.metrics[key], 0) / inRange.length
          : 0;

      const campaignTotals: Record<string, number> = {
        campaigns_sent: inRange.length,
        emails_sent: totalSent,
        opens: inRange.reduce((s, c) => s + c.metrics.opens, 0),
        clicks: inRange.reduce((s, c) => s + c.metrics.clicks, 0),
        open_rate: weighted("open_rate"),
        click_rate: weighted("click_rate"),
      };
      for (const m of campaignMetricsWanted) totals[m] = campaignTotals[m];

      if (dimension === "campaign") {
        const rowMetrics =
          campaignMetricsWanted.length > 0 ? campaignMetricsWanted : Array.from(CAMPAIGN_METRICS);
        breakdown = inRange.map((c) => ({
          dimensions: { campaign: c.name, send_date: c.finished },
          metrics: Object.fromEntries(rowMetrics.map((m) => [m, c.metrics[m] ?? 0])),
        }));
      }
    }

    breakdown = applySortLimit(breakdown, query);

    return {
      platform: "mailerlite",
      client: { id: ctx.client._id, name: ctx.client.name, slug: ctx.client.slug },
      dateRange: query.dateRange,
      totals,
      breakdown,
      meta,
    };
  },
};
