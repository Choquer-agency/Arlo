import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  DiscoveryResult,
  ConnectorError,
} from "./types";

export const shopifyConnector: MarketingConnector = {
  platform: "shopify",
  provider: "shopify",
  status: "coming_soon",
  launchDate: "April 2026",

  isConfigured(ctx: ConnectorContext): boolean {
    return Boolean(ctx.client.shopifyStoreDomain);
  },

  missingReason(ctx: ConnectorContext): string {
    return `${ctx.client.name} has no Shopify store assigned. Connect Shopify on /connections and select the myshopify.com store domain.`;
  },

  discover(): DiscoveryResult {
    return {
      platform: "shopify",
      status: "coming_soon",
      metrics: [
        { name: "orders", description: "Number of orders placed in the period", type: "metric" },
        { name: "gross_sales", description: "Product prices times quantity ordered, before discounts/returns/taxes/shipping", type: "metric" },
        { name: "net_sales", description: "Gross sales minus discounts and returns", type: "metric" },
        { name: "refunds", description: "Total amount refunded to customers", type: "metric" },
        { name: "discounts", description: "Total value of discounts applied to orders", type: "metric" },
        { name: "total_sales", description: "Net sales plus taxes and shipping (final billed amount)", type: "metric" },
        { name: "average_order_value", description: "Total sales divided by number of orders", type: "metric" },
        { name: "sessions", description: "Online store sessions (visits) in the period", type: "metric" },
        { name: "conversion_rate", description: "Orders divided by sessions", type: "metric" },
        { name: "units_sold", description: "Total quantity of items sold across all orders", type: "metric" },
      ],
      dimensions: [
        { name: "day", description: "Calendar day of the order (YYYY-MM-DD)", type: "dimension" },
        { name: "product_title", description: "Title of the product line item", type: "dimension" },
        { name: "product_type", description: "Merchant-assigned product type / category", type: "dimension" },
        { name: "traffic_source", description: "Source of the session (direct, search, social, email, referral)", type: "dimension" },
        { name: "referrer", description: "Referring host or URL that drove the session", type: "dimension" },
        { name: "country", description: "Two-letter ISO country code of the shipping address", type: "dimension" },
      ],
    };
  },

  async fetch(_ctx: ConnectorContext, _query: MetricQuery): Promise<MetricResult> {
    throw new ConnectorError(
      "Shopify connector is launching April 2026. OAuth is working — queries coming shortly.",
      "coming_soon"
    );
  },
};
