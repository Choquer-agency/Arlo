import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  DiscoveryResult,
  ConnectorError,
} from "./types";

const GRAPH = "https://graph.facebook.com/v19.0";

/** Page insight metrics we sum day-by-day over the range. */
const PAGE_INSIGHT_METRICS: Record<string, string> = {
  page_impressions: "page_impressions",
  page_post_engagements: "page_post_engagements",
  page_views: "page_views_total",
};

/** Point-in-time page fields (current values, not period-bound). */
const PAGE_SNAPSHOT_METRICS: Record<string, "fan_count" | "followers_count"> = {
  page_fans: "fan_count",
  page_followers: "followers_count",
};

/** Instagram insight metrics fetched with metric_type=total_value over the range. */
const IG_INSIGHT_METRICS: Record<string, string> = {
  ig_reach: "reach",
  ig_profile_views: "profile_views",
  ig_accounts_engaged: "accounts_engaged",
};

const ALL_METRICS = [
  ...Object.keys(PAGE_SNAPSHOT_METRICS),
  ...Object.keys(PAGE_INSIGHT_METRICS),
  "ig_followers",
  ...Object.keys(IG_INSIGHT_METRICS),
];

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
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
  return new ConnectorError(`Meta Graph API error (${status}): ${message}`, "upstream_error");
}

async function graphGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw mapGraphError(res.status, await res.text());
  return (await res.json()) as T;
}

interface PageWithToken {
  id: string;
  name?: string;
  access_token?: string;
  instagram_business_account?: { id: string; username?: string };
}

export const metaOrganicConnector: MarketingConnector = {
  platform: "meta_organic",
  provider: "meta",
  status: "beta",

  isConfigured(): boolean {
    return true; // workspace-level connection; fetch() raises not_connected when absent
  },

  missingReason(): string {
    return "Meta organic (Facebook Pages + Instagram) isn't connected for this workspace. Connect it on /connections.";
  },

  discover(): DiscoveryResult {
    return {
      platform: "meta_organic",
      status: "beta",
      metrics: [
        { name: "page_fans", description: "Current total Facebook Page likes (point-in-time value, not bound to the date range)", type: "metric" },
        { name: "page_followers", description: "Current total Facebook Page followers (point-in-time value, not bound to the date range)", type: "metric" },
        { name: "page_impressions", description: "Times any content from the Page was on screen during the date range (daily values summed)", type: "metric" },
        { name: "page_post_engagements", description: "Times people engaged with the Page's posts (reactions, comments, shares, clicks) during the date range", type: "metric" },
        { name: "page_views", description: "Times the Page's profile was viewed during the date range", type: "metric" },
        { name: "ig_followers", description: "Current Instagram follower count for the Page's linked Instagram business account (point-in-time)", type: "metric" },
        { name: "ig_reach", description: "Unique Instagram accounts reached during the date range", type: "metric" },
        { name: "ig_profile_views", description: "Instagram profile views during the date range (may be unavailable on some accounts)", type: "metric" },
        { name: "ig_accounts_engaged", description: "Unique Instagram accounts that engaged during the date range (may be unavailable on some accounts)", type: "metric" },
      ],
      dimensions: [
        {
          name: "page",
          description:
            "Filter only (no breakdown rows): pass filters=[{dimension:'page', op:'eq', value:<Facebook Page id or name>}] to pick which Page when the workspace has several connected. Totals are returned for one Page (plus its linked Instagram account) per query.",
          type: "dimension",
        },
      ],
    };
  },

  async fetch(ctx: ConnectorContext, query: MetricQuery): Promise<MetricResult> {
    for (const m of query.metrics) {
      if (!ALL_METRICS.includes(m)) {
        throw new ConnectorError(
          `Unknown Meta organic metric "${m}". Supported: ${ALL_METRICS.join(", ")}`,
          "invalid_metric"
        );
      }
    }
    if (query.dimensions?.length) {
      throw new ConnectorError(
        'Meta organic returns totals only — no breakdown dimensions are supported. Use filters=[{dimension:"page", ...}] to choose a Page.',
        "invalid_metric"
      );
    }

    const conn = await ctx.getConnection("meta");
    if (!conn) {
      throw new ConnectorError(
        "Meta isn't connected for this workspace. Connect it on /connections.",
        "not_connected"
      );
    }

    // Pick the Facebook Page: client mapping → page filter → the single page.
    const pages = (conn.availableAccounts ?? []).filter((a) => a.kind === "fb_page");
    const pageFilter = (query.filters ?? []).find((f) => f.dimension === "page");
    let pageId: string | undefined = ctx.client.metaPageId;
    if (!pageId && pageFilter) {
      const needle = pageFilter.value.toLowerCase();
      const match = pages.find(
        (p) => p.id === pageFilter.value || p.name.toLowerCase() === needle
      );
      pageId = match?.id ?? pageFilter.value; // fall through to the raw id
    }
    if (!pageId) {
      if (pages.length === 1) {
        pageId = pages[0].id;
      } else {
        throw new ConnectorError(
          pages.length === 0
            ? "The connected Meta user has no Facebook Pages. Reconnect Meta with a user that manages the Page."
            : `Multiple Facebook Pages are connected (${pages
                .map((p) => `${p.name} [${p.id}]`)
                .join(", ")}). Pass filters=[{dimension:"page", op:"eq", value:<id or name>}] or map a page to ${ctx.client.name}.`,
          "not_connected"
        );
      }
    }

    // Page access tokens must be minted from the user token at call time.
    const userToken = await ctx.getAccessToken("meta");
    const meAccounts = await graphGet<{ data?: PageWithToken[] }>(
      `${GRAPH}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&limit=200&access_token=${encodeURIComponent(userToken)}`
    );
    const page = (meAccounts.data ?? []).find((p) => p.id === pageId);
    if (!page || !page.access_token) {
      throw new ConnectorError(
        `The connected Meta user can no longer access Page ${pageId}. Reconnect Meta on /connections.`,
        "not_connected"
      );
    }
    const pageToken = page.access_token;
    const igAccount = page.instagram_business_account;

    const totals: Record<string, number> = {};
    const unavailable: string[] = [];
    // Graph insights treat `until` as exclusive for daily periods.
    const since = query.dateRange.start;
    const untilExclusive = addDays(query.dateRange.end, 1);

    // 1. Point-in-time page fields.
    const snapshotMetrics = query.metrics.filter((m) => m in PAGE_SNAPSHOT_METRICS);
    if (snapshotMetrics.length) {
      const info = await graphGet<{ fan_count?: number; followers_count?: number }>(
        `${GRAPH}/${pageId}?fields=fan_count,followers_count&access_token=${encodeURIComponent(pageToken)}`
      );
      for (const m of snapshotMetrics) {
        totals[m] = Number(info[PAGE_SNAPSHOT_METRICS[m]] ?? 0);
      }
    }

    // 2. Daily page insights, summed over the range.
    const pageInsightMetrics = query.metrics.filter((m) => m in PAGE_INSIGHT_METRICS);
    if (pageInsightMetrics.length) {
      const apiMetrics = pageInsightMetrics.map((m) => PAGE_INSIGHT_METRICS[m]).join(",");
      const insights = await graphGet<{
        data?: { name: string; values?: { value?: number }[] }[];
      }>(
        `${GRAPH}/${pageId}/insights?metric=${apiMetrics}&period=day&since=${since}&until=${untilExclusive}&access_token=${encodeURIComponent(pageToken)}`
      );
      for (const m of pageInsightMetrics) {
        const series = (insights.data ?? []).find((d) => d.name === PAGE_INSIGHT_METRICS[m]);
        totals[m] = (series?.values ?? []).reduce((s, v) => s + (Number(v.value) || 0), 0);
      }
    }

    // 3. Instagram metrics (only if the Page has a linked IG business account).
    const igMetrics = query.metrics.filter(
      (m) => m === "ig_followers" || m in IG_INSIGHT_METRICS
    );
    if (igMetrics.length) {
      if (!igAccount) {
        throw new ConnectorError(
          `Page "${page.name ?? pageId}" has no linked Instagram business account, so Instagram metrics (${igMetrics.join(", ")}) aren't available.`,
          "missing_id"
        );
      }
      if (igMetrics.includes("ig_followers")) {
        const igInfo = await graphGet<{ followers_count?: number }>(
          `${GRAPH}/${igAccount.id}?fields=followers_count&access_token=${encodeURIComponent(pageToken)}`
        );
        totals.ig_followers = Number(igInfo.followers_count ?? 0);
      }
      // Fetch each IG insight metric individually — availability varies by
      // account, and one unsupported metric must not sink the rest.
      for (const m of igMetrics.filter((x) => x in IG_INSIGHT_METRICS)) {
        try {
          const insights = await graphGet<{
            data?: { name: string; total_value?: { value?: number } }[];
          }>(
            `${GRAPH}/${igAccount.id}/insights?metric=${IG_INSIGHT_METRICS[m]}&metric_type=total_value&period=day&since=${since}&until=${untilExclusive}&access_token=${encodeURIComponent(pageToken)}`
          );
          totals[m] = Number(insights.data?.[0]?.total_value?.value ?? 0);
        } catch (e) {
          if (e instanceof ConnectorError && (e.code === "auth_expired" || e.code === "rate_limited")) {
            throw e;
          }
          unavailable.push(m);
        }
      }
    }

    return {
      platform: "meta_organic",
      client: { id: ctx.client._id, name: ctx.client.name, slug: ctx.client.slug },
      dateRange: query.dateRange,
      totals,
      breakdown: [],
      meta: {
        page: { id: pageId, name: page.name ?? pageId },
        igAccount: igAccount
          ? { id: igAccount.id, username: igAccount.username }
          : undefined,
        pointInTimeMetrics: query.metrics.filter(
          (m) => m in PAGE_SNAPSHOT_METRICS || m === "ig_followers"
        ),
        unavailableMetrics: unavailable.length ? unavailable : undefined,
        note: "Totals only — Meta organic has no breakdown dimensions. Point-in-time metrics reflect current counts, not the date range.",
      },
    };
  },
};
