import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  DiscoveryResult,
  ConnectorError,
} from "./types";

/** Google Tag Manager — implementation in progress (see registry). */
export const gtmConnector: MarketingConnector = {
  platform: "gtm",
  provider: "google",
  status: "beta",

  isConfigured(): boolean {
    return true; // workspace-level connection; fetch() raises not_connected when absent
  },

  missingReason(): string {
    return "Google Tag Manager isn't connected for this workspace. Connect it on /connections.";
  },

  discover(): DiscoveryResult {
    return { platform: "gtm", status: "beta", metrics: [], dimensions: [] };
  },

  async fetch(_ctx: ConnectorContext, _query: MetricQuery): Promise<MetricResult> {
    throw new ConnectorError("Google Tag Manager connector is being finished — check back shortly.", "coming_soon");
  },
};
