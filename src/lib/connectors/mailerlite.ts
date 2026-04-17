import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  DiscoveryResult,
  ConnectorError,
} from "./types";

export const mailerliteConnector: MarketingConnector = {
  platform: "mailerlite",
  provider: "mailerlite",
  status: "coming_soon",
  launchDate: "July 2026",

  isConfigured(ctx: ConnectorContext): boolean {
    return Boolean(ctx.client.mailerliteAccountId);
  },

  missingReason(ctx: ConnectorContext): string {
    return `${ctx.client.name} has no MailerLite account assigned. Connect MailerLite on /connections and authorize the workspace API token.`;
  },

  discover(): DiscoveryResult {
    return {
      platform: "mailerlite",
      status: "coming_soon",
      metrics: [
        { name: "subscribers_gained", description: "Net new active subscribers added in the period", type: "metric" },
        { name: "subscribers_lost", description: "Subscribers that became inactive (unsubscribed, bounced, or spam)", type: "metric" },
        { name: "unsubscribes", description: "Count of subscribers who clicked unsubscribe", type: "metric" },
        { name: "opens", description: "Total email opens across all sends", type: "metric" },
        { name: "unique_opens", description: "Count of distinct subscribers who opened at least once", type: "metric" },
        { name: "clicks", description: "Total clicks on links inside emails", type: "metric" },
        { name: "unique_clicks", description: "Count of distinct subscribers who clicked at least once", type: "metric" },
        { name: "open_rate", description: "Unique opens divided by delivered", type: "metric" },
        { name: "click_rate", description: "Unique clicks divided by delivered (click-through rate)", type: "metric" },
        { name: "bounce_rate", description: "Bounced emails divided by emails sent", type: "metric" },
      ],
      dimensions: [
        { name: "day", description: "Calendar day the send/event occurred (YYYY-MM-DD)", type: "dimension" },
        { name: "campaign", description: "MailerLite campaign name", type: "dimension" },
        { name: "list", description: "Subscriber group / list name", type: "dimension" },
        { name: "segment", description: "Dynamic segment used to target the send", type: "dimension" },
      ],
    };
  },

  async fetch(_ctx: ConnectorContext, _query: MetricQuery): Promise<MetricResult> {
    throw new ConnectorError(
      "MailerLite connector is launching July 2026. OAuth is working — queries coming shortly.",
      "coming_soon"
    );
  },
};
