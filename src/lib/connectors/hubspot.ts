import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  DiscoveryResult,
  ConnectorError,
} from "./types";

export const hubspotConnector: MarketingConnector = {
  platform: "hubspot",
  provider: "hubspot",
  status: "coming_soon",
  launchDate: "July 2026",

  isConfigured(ctx: ConnectorContext): boolean {
    return Boolean(ctx.client.hubspotPortalId);
  },

  missingReason(ctx: ConnectorContext): string {
    return `${ctx.client.name} has no HubSpot portal assigned. Connect HubSpot on /connections and authorize the portal / hub ID.`;
  },

  discover(): DiscoveryResult {
    return {
      platform: "hubspot",
      status: "coming_soon",
      metrics: [
        { name: "contacts_created", description: "Number of new contact records created in the period", type: "metric" },
        { name: "deals_created", description: "Number of new deal records created in the period", type: "metric" },
        { name: "deals_won", description: "Deals that moved into a Closed Won stage in the period", type: "metric" },
        { name: "deal_revenue", description: "Sum of amount on deals won (closed-won revenue)", type: "metric" },
        { name: "email_opens", description: "Total marketing email opens across sends", type: "metric" },
        { name: "email_clicks", description: "Total clicks on links inside marketing emails", type: "metric" },
        { name: "form_submissions", description: "Count of HubSpot form submissions in the period", type: "metric" },
        { name: "meetings_booked", description: "Meetings booked via HubSpot scheduling / Meetings tool", type: "metric" },
        { name: "sessions", description: "Website sessions recorded by HubSpot tracking code", type: "metric" },
      ],
      dimensions: [
        { name: "day", description: "Calendar day of the event (YYYY-MM-DD)", type: "dimension" },
        { name: "lifecycle_stage", description: "Contact lifecycle stage (lead, MQL, SQL, customer, etc.)", type: "dimension" },
        { name: "deal_stage", description: "Deal pipeline stage label", type: "dimension" },
        { name: "owner", description: "Record owner (HubSpot user) name", type: "dimension" },
        { name: "source", description: "Original traffic / lead source (organic search, paid, referral, etc.)", type: "dimension" },
      ],
    };
  },

  async fetch(_ctx: ConnectorContext, _query: MetricQuery): Promise<MetricResult> {
    throw new ConnectorError(
      "HubSpot connector is launching July 2026. OAuth is working — queries coming shortly.",
      "coming_soon"
    );
  },
};
