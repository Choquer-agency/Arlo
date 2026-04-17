import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  DiscoveryResult,
  ConnectorError,
} from "./types";

export const metaAdsConnector: MarketingConnector = {
  platform: "meta_ads",
  provider: "meta",
  status: "coming_soon",
  launchDate: "May 2026",

  isConfigured(ctx: ConnectorContext): boolean {
    return Boolean(ctx.client.metaAdAccountId);
  },

  missingReason(ctx: ConnectorContext): string {
    return `${ctx.client.name} has no Meta Ads account assigned. Connect Meta on /connections and pick an ad account.`;
  },

  discover(): DiscoveryResult {
    return {
      platform: "meta_ads",
      status: "coming_soon",
      metrics: [
        { name: "spend", description: "Total amount spent on ads in the account currency", type: "metric" },
        { name: "impressions", description: "Number of times the ads were served", type: "metric" },
        { name: "clicks", description: "Total number of clicks on the ads (all click types)", type: "metric" },
        { name: "ctr", description: "Click-through rate: clicks divided by impressions", type: "metric" },
        { name: "cpc", description: "Average cost per link click", type: "metric" },
        { name: "cpm", description: "Average cost per 1,000 impressions", type: "metric" },
        { name: "reach", description: "Number of unique accounts that saw the ads", type: "metric" },
        { name: "purchases", description: "Count of purchase conversion events attributed to the ads", type: "metric" },
        { name: "purchase_roas", description: "Return on ad spend for purchase conversions (revenue / spend)", type: "metric" },
        { name: "video_thruplay_watched_actions", description: "Number of ThruPlays (video watched to completion or 15s)", type: "metric" },
      ],
      dimensions: [
        { name: "campaign", description: "Meta Ads campaign name", type: "dimension" },
        { name: "adset", description: "Meta Ads ad set name", type: "dimension" },
        { name: "ad", description: "Individual ad creative name", type: "dimension" },
        { name: "placement", description: "Ad placement surface (Feed, Stories, Reels, Audience Network, etc.)", type: "dimension" },
        { name: "age", description: "Viewer age bucket (e.g. 25-34)", type: "dimension" },
        { name: "gender", description: "Viewer gender", type: "dimension" },
        { name: "device", description: "Device platform (mobile, desktop, connected TV)", type: "dimension" },
        { name: "country", description: "Two-letter ISO country code of the viewer", type: "dimension" },
      ],
    };
  },

  async fetch(_ctx: ConnectorContext, _query: MetricQuery): Promise<MetricResult> {
    throw new ConnectorError(
      "Meta Ads connector is launching May 2026. OAuth is working — queries coming shortly.",
      "coming_soon"
    );
  },
};
