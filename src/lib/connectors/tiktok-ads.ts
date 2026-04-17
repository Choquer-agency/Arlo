import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  DiscoveryResult,
  ConnectorError,
} from "./types";

export const tiktokAdsConnector: MarketingConnector = {
  platform: "tiktok_ads",
  provider: "tiktok",
  status: "coming_soon",
  launchDate: "June 2026",

  isConfigured(ctx: ConnectorContext): boolean {
    return Boolean(ctx.client.tiktokAdvertiserId);
  },

  missingReason(ctx: ConnectorContext): string {
    return `${ctx.client.name} has no TikTok advertiser assigned. Connect TikTok on /connections and pick an advertiser account.`;
  },

  discover(): DiscoveryResult {
    return {
      platform: "tiktok_ads",
      status: "coming_soon",
      metrics: [
        { name: "spend", description: "Total ad spend in the advertiser's currency", type: "metric" },
        { name: "impressions", description: "Number of times ads were shown", type: "metric" },
        { name: "clicks", description: "Total clicks on ads (destination clicks)", type: "metric" },
        { name: "ctr", description: "Click-through rate: clicks divided by impressions", type: "metric" },
        { name: "cpc", description: "Average cost per click", type: "metric" },
        { name: "cpm", description: "Cost per 1,000 impressions", type: "metric" },
        { name: "conversion", description: "Count of conversion events attributed to ads", type: "metric" },
        { name: "conversion_rate", description: "Conversions divided by clicks", type: "metric" },
        { name: "video_play_actions", description: "Number of times the ad video started playing", type: "metric" },
        { name: "video_views_p100", description: "Number of video views that reached 100% completion", type: "metric" },
      ],
      dimensions: [
        { name: "campaign", description: "TikTok campaign name", type: "dimension" },
        { name: "ad_group", description: "TikTok ad group name", type: "dimension" },
        { name: "ad", description: "Individual creative / ad name", type: "dimension" },
        { name: "placement", description: "Ad placement surface (TikTok, Pangle, News Feed App Series)", type: "dimension" },
        { name: "age", description: "Viewer age bucket", type: "dimension" },
        { name: "gender", description: "Viewer gender", type: "dimension" },
        { name: "country_code", description: "Two-letter ISO country code of the viewer", type: "dimension" },
      ],
    };
  },

  async fetch(_ctx: ConnectorContext, _query: MetricQuery): Promise<MetricResult> {
    throw new ConnectorError(
      "TikTok Ads connector is launching June 2026. OAuth is working — queries coming shortly.",
      "coming_soon"
    );
  },
};
