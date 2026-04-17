import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  DiscoveryResult,
  ConnectorError,
} from "./types";

export const linkedinAdsConnector: MarketingConnector = {
  platform: "linkedin_ads",
  provider: "linkedin",
  status: "coming_soon",
  launchDate: "May 2026",

  isConfigured(ctx: ConnectorContext): boolean {
    return Boolean(ctx.client.linkedinAdAccountUrn);
  },

  missingReason(ctx: ConnectorContext): string {
    return `${ctx.client.name} has no LinkedIn ad account assigned. Connect LinkedIn on /connections and pick a sponsored ad account.`;
  },

  discover(): DiscoveryResult {
    return {
      platform: "linkedin_ads",
      status: "coming_soon",
      metrics: [
        { name: "impressions", description: "Number of times sponsored content was displayed", type: "metric" },
        { name: "clicks", description: "Total clicks on ads, text ads, and sponsored content", type: "metric" },
        { name: "ctr", description: "Click-through rate: clicks divided by impressions", type: "metric" },
        { name: "totalEngagements", description: "Sum of all social actions (reactions, comments, shares, follows, clicks)", type: "metric" },
        { name: "costInLocalCurrency", description: "Total spend in the advertiser's billing currency", type: "metric" },
        { name: "costPerClick", description: "Average cost per click (spend / clicks)", type: "metric" },
        { name: "oneClickLeads", description: "Leads generated through LinkedIn Lead Gen Forms (one-click submissions)", type: "metric" },
      ],
      dimensions: [
        { name: "campaign", description: "LinkedIn campaign name", type: "dimension" },
        { name: "creative", description: "Individual creative (ad) identifier or name", type: "dimension" },
        { name: "jobTitle", description: "Member job title targeting facet", type: "dimension" },
        { name: "industry", description: "Member company industry", type: "dimension" },
        { name: "seniority", description: "Member seniority level (entry, manager, director, VP, CXO)", type: "dimension" },
        { name: "country", description: "Two-letter ISO country code of the member", type: "dimension" },
      ],
    };
  },

  async fetch(_ctx: ConnectorContext, _query: MetricQuery): Promise<MetricResult> {
    throw new ConnectorError(
      "LinkedIn Ads connector is launching May 2026. OAuth is working — queries coming shortly.",
      "coming_soon"
    );
  },
};
