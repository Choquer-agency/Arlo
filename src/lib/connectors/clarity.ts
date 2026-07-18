import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  DiscoveryResult,
  ConnectorError,
} from "./types";

/** Microsoft Clarity — implementation in progress (see registry). */
export const clarityConnector: MarketingConnector = {
  platform: "clarity",
  provider: "clarity",
  status: "beta",

  isConfigured(): boolean {
    return true; // workspace-level connection; fetch() raises not_connected when absent
  },

  missingReason(): string {
    return "Microsoft Clarity isn't connected for this workspace. Connect it on /connections.";
  },

  discover(): DiscoveryResult {
    return { platform: "clarity", status: "beta", metrics: [], dimensions: [] };
  },

  async fetch(_ctx: ConnectorContext, _query: MetricQuery): Promise<MetricResult> {
    throw new ConnectorError("Microsoft Clarity connector is being finished — check back shortly.", "coming_soon");
  },
};
