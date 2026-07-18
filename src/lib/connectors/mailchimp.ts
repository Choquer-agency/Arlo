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
 * Mailchimp — workspace-level connection. The OAuth callback stores the
 * account's data center (dc) as connection.accountId; the API base is
 * https://<dc>.api.mailchimp.com/3.0.
 */

const CAMPAIGN_METRICS = new Set([
  "campaigns_sent",
  "emails_sent",
  "opens",
  "open_rate",
  "clicks",
  "click_rate",
]);
const KNOWN_METRICS = new Set(Array.from(CAMPAIGN_METRICS).concat("audience_subscribers"));

interface McCampaign {
  id?: string;
  emails_sent?: number;
  send_time?: string;
  settings?: { title?: string; subject_line?: string };
  report_summary?: {
    opens?: number;
    unique_opens?: number;
    open_rate?: number;
    clicks?: number;
    subscriber_clicks?: number;
    click_rate?: number;
  };
}

async function mcGet(base: string, path: string, token: string): Promise<unknown> {
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = (await res.text()).slice(0, 300);
    if (res.status === 401)
      throw new ConnectorError(
        "Mailchimp rejected the access token (401). Reconnect Mailchimp on /connections.",
        "auth_expired"
      );
    if (res.status === 429)
      throw new ConnectorError("Mailchimp rate limit hit (429). Try again shortly.", "rate_limited");
    throw new ConnectorError(`Mailchimp API error ${res.status}: ${text}`, "upstream_error");
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

export const mailchimpConnector: MarketingConnector = {
  platform: "mailchimp",
  provider: "mailchimp",
  status: "beta",

  isConfigured(): boolean {
    return true; // workspace-level connection; fetch() raises not_connected when absent
  },

  missingReason(): string {
    return "Mailchimp isn't connected for this workspace. Connect it on /connections.";
  },

  discover(): DiscoveryResult {
    return {
      platform: "mailchimp",
      status: "beta",
      metrics: [
        { name: "campaigns_sent", description: "Number of campaigns with a send time inside the date range", type: "metric" },
        { name: "emails_sent", description: "Total individual emails dispatched across campaigns sent in the range", type: "metric" },
        { name: "opens", description: "Total opens (including repeat opens) across campaigns sent in the range", type: "metric" },
        { name: "open_rate", description: "Open rate as a 0-1 fraction, weighted by emails sent per campaign", type: "metric" },
        { name: "clicks", description: "Total clicks on tracked links across campaigns sent in the range", type: "metric" },
        { name: "click_rate", description: "Click rate as a 0-1 fraction, weighted by emails sent per campaign", type: "metric" },
        { name: "audience_subscribers", description: "Current subscriber count summed across all audiences (lists) — a live snapshot, not affected by the date range", type: "metric" },
      ],
      dimensions: [
        { name: "campaign", description: "One row per campaign sent in the date range, with that campaign's metrics", type: "dimension" },
      ],
    };
  },

  async fetch(ctx: ConnectorContext, query: MetricQuery): Promise<MetricResult> {
    const conn = await ctx.getConnection("mailchimp");
    if (!conn) {
      throw new ConnectorError(
        "Mailchimp isn't connected for this workspace. Connect it on /connections.",
        "not_connected"
      );
    }
    const dc = conn.accountId;
    if (!dc) {
      throw new ConnectorError(
        "Mailchimp connection is missing its data center (dc). Reconnect Mailchimp on /connections.",
        "not_connected"
      );
    }

    for (const m of query.metrics) {
      if (!KNOWN_METRICS.has(m)) {
        throw new ConnectorError(
          `Unknown Mailchimp metric "${m}". Supported: ${Array.from(KNOWN_METRICS).join(", ")}.`,
          "invalid_metric"
        );
      }
    }
    const dimension = query.dimensions?.[0];
    if (dimension && dimension !== "campaign") {
      throw new ConnectorError(
        `Unknown Mailchimp dimension "${dimension}". Supported: campaign.`,
        "invalid_metric"
      );
    }

    const base = `https://${dc}.api.mailchimp.com/3.0`;
    const token = await ctx.getAccessToken("mailchimp");

    const totals: Record<string, number> = {};
    let breakdown: MetricResultRow[] = [];
    const meta: Record<string, unknown> = { dc };

    const campaignMetricsWanted = query.metrics.filter((m) => CAMPAIGN_METRICS.has(m));
    if (campaignMetricsWanted.length > 0 || dimension === "campaign") {
      const since = `${query.dateRange.start}T00:00:00+00:00`;
      const beforeDate = new Date(`${query.dateRange.end}T00:00:00Z`);
      beforeDate.setUTCDate(beforeDate.getUTCDate() + 1);
      const before = beforeDate.toISOString();

      const data = (await mcGet(
        base,
        `/campaigns?status=sent&count=100&since_send_time=${encodeURIComponent(
          since
        )}&before_send_time=${encodeURIComponent(before)}&sort_field=send_time&sort_dir=DESC`,
        token
      )) as { campaigns?: McCampaign[]; total_items?: number };
      const campaigns = data.campaigns ?? [];

      const perCampaign = campaigns.map((c) => {
        const sent = Number(c.emails_sent ?? 0);
        const rs = c.report_summary ?? {};
        return {
          name: c.settings?.title || c.settings?.subject_line || c.id || "Untitled campaign",
          sendTime: (c.send_time ?? "").slice(0, 10),
          metrics: {
            campaigns_sent: 1,
            emails_sent: sent,
            opens: Number(rs.opens ?? 0),
            open_rate: Number(rs.open_rate ?? 0),
            clicks: Number(rs.clicks ?? 0),
            click_rate: Number(rs.click_rate ?? 0),
          } as Record<string, number>,
        };
      });

      const totalSent = perCampaign.reduce((s, c) => s + c.metrics.emails_sent, 0);
      const weighted = (key: "open_rate" | "click_rate") =>
        totalSent > 0
          ? perCampaign.reduce((s, c) => s + c.metrics[key] * c.metrics.emails_sent, 0) / totalSent
          : perCampaign.length > 0
          ? perCampaign.reduce((s, c) => s + c.metrics[key], 0) / perCampaign.length
          : 0;

      const campaignTotals: Record<string, number> = {
        campaigns_sent: perCampaign.length,
        emails_sent: totalSent,
        opens: perCampaign.reduce((s, c) => s + c.metrics.opens, 0),
        open_rate: weighted("open_rate"),
        clicks: perCampaign.reduce((s, c) => s + c.metrics.clicks, 0),
        click_rate: weighted("click_rate"),
      };
      for (const m of campaignMetricsWanted) totals[m] = campaignTotals[m];

      if (dimension === "campaign") {
        const rowMetrics =
          campaignMetricsWanted.length > 0 ? campaignMetricsWanted : Array.from(CAMPAIGN_METRICS);
        breakdown = perCampaign.map((c) => ({
          dimensions: { campaign: c.name, send_date: c.sendTime },
          metrics: Object.fromEntries(rowMetrics.map((m) => [m, c.metrics[m] ?? 0])),
        }));
      }
      if ((data.total_items ?? campaigns.length) > campaigns.length) {
        meta.note = `Campaign list capped at 100 most recent sends in range (${data.total_items} total).`;
      }
    }

    if (query.metrics.includes("audience_subscribers")) {
      const data = (await mcGet(base, "/lists?count=100", token)) as {
        lists?: { name?: string; stats?: { member_count?: number } }[];
      };
      const lists = data.lists ?? [];
      totals.audience_subscribers = lists.reduce(
        (s, l) => s + Number(l.stats?.member_count ?? 0),
        0
      );
      meta.audiences = lists.map((l) => l.name ?? "");
    }

    breakdown = applySortLimit(breakdown, query);

    return {
      platform: "mailchimp",
      client: { id: ctx.client._id, name: ctx.client.name, slug: ctx.client.slug },
      dateRange: query.dateRange,
      totals,
      breakdown,
      meta,
    };
  },
};
