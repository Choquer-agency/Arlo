import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  DiscoveryResult,
  ConnectorError,
} from "./types";

export const stripeConnector: MarketingConnector = {
  platform: "stripe",
  provider: "stripe",
  status: "coming_soon",
  launchDate: "June 2026",

  isConfigured(ctx: ConnectorContext): boolean {
    return Boolean(ctx.client.stripeAccountId);
  },

  missingReason(ctx: ConnectorContext): string {
    return `${ctx.client.name} has no Stripe account assigned. Connect Stripe on /connections and authorize the acct_ to read payments.`;
  },

  discover(): DiscoveryResult {
    return {
      platform: "stripe",
      status: "coming_soon",
      metrics: [
        { name: "gross_volume", description: "Gross payment volume processed before refunds and fees", type: "metric" },
        { name: "net_volume", description: "Gross volume minus refunds, disputes, and Stripe fees", type: "metric" },
        { name: "successful_charges", description: "Count of charges with status succeeded", type: "metric" },
        { name: "failed_charges", description: "Count of charges with status failed", type: "metric" },
        { name: "refund_volume", description: "Total amount refunded to customers in the period", type: "metric" },
        { name: "new_customers", description: "Number of Customer objects created in the period", type: "metric" },
        { name: "mrr", description: "Monthly recurring revenue at the end of the period", type: "metric" },
        { name: "active_subscriptions", description: "Subscriptions with status active or trialing", type: "metric" },
        { name: "churned_subscriptions", description: "Subscriptions that moved to canceled in the period", type: "metric" },
        { name: "failed_payment_count", description: "Number of subscription invoices that failed to pay", type: "metric" },
      ],
      dimensions: [
        { name: "day", description: "Calendar day of the charge or event (YYYY-MM-DD)", type: "dimension" },
        { name: "currency", description: "Three-letter ISO currency code of the charge", type: "dimension" },
        { name: "product", description: "Stripe Product name associated with the line item", type: "dimension" },
        { name: "payment_method", description: "Payment method type (card, us_bank_account, link, etc.)", type: "dimension" },
      ],
    };
  },

  async fetch(_ctx: ConnectorContext, _query: MetricQuery): Promise<MetricResult> {
    throw new ConnectorError(
      "Stripe connector is launching June 2026. OAuth is working — queries coming shortly.",
      "coming_soon"
    );
  },
};
