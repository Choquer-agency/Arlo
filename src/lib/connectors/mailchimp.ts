import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  DiscoveryResult,
  ConnectorError,
} from "./types";

export const mailchimpConnector: MarketingConnector = {
  platform: "mailchimp",
  provider: "mailchimp",
  status: "coming_soon",
  launchDate: "August 2026",

  isConfigured(ctx: ConnectorContext): boolean {
    return Boolean(ctx.client.mailchimpAccountId);
  },

  missingReason(ctx: ConnectorContext): string {
    return `${ctx.client.name} has no Mailchimp account assigned. Connect Mailchimp on /connections and authorize the account / data center (dc).`;
  },

  discover(): DiscoveryResult {
    return {
      platform: "mailchimp",
      status: "coming_soon",
      metrics: [
        { name: "emails_sent", description: "Total emails dispatched across campaigns", type: "metric" },
        { name: "opens", description: "Total email opens (including repeats)", type: "metric" },
        { name: "unique_opens", description: "Count of distinct recipients who opened at least once", type: "metric" },
        { name: "clicks", description: "Total clicks on tracked links inside emails", type: "metric" },
        { name: "unique_clicks", description: "Count of distinct recipients who clicked at least once", type: "metric" },
        { name: "unsubscribes", description: "Recipients who unsubscribed from the list via a send", type: "metric" },
        { name: "bounces", description: "Sum of hard and soft bounces", type: "metric" },
        { name: "open_rate", description: "Unique opens divided by emails successfully delivered", type: "metric" },
        { name: "click_rate", description: "Unique clicks divided by emails successfully delivered", type: "metric" },
        { name: "list_growth", description: "Net change in audience (list) size over the period", type: "metric" },
      ],
      dimensions: [
        { name: "day", description: "Calendar day the send/event occurred (YYYY-MM-DD)", type: "dimension" },
        { name: "campaign", description: "Mailchimp campaign title", type: "dimension" },
        { name: "audience", description: "Mailchimp audience (list) name", type: "dimension" },
        { name: "segment", description: "Saved or ad-hoc segment used to target the send", type: "dimension" },
        { name: "automation", description: "Customer Journey / classic automation workflow name", type: "dimension" },
      ],
    };
  },

  async fetch(_ctx: ConnectorContext, _query: MetricQuery): Promise<MetricResult> {
    throw new ConnectorError(
      "Mailchimp connector is launching August 2026. OAuth is working — queries coming shortly.",
      "coming_soon"
    );
  },
};
