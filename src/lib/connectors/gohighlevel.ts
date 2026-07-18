import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  DiscoveryResult,
  ConnectorError,
} from "./types";

/** GoHighLevel — implementation in progress (see registry). */
export const gohighlevelConnector: MarketingConnector = {
  platform: "gohighlevel",
  provider: "gohighlevel",
  status: "beta",

  isConfigured(): boolean {
    return true; // workspace-level connection; fetch() raises not_connected when absent
  },

  missingReason(): string {
    return "GoHighLevel isn't connected for this workspace. Connect it on /connections.";
  },

  discover(): DiscoveryResult {
    return { platform: "gohighlevel", status: "beta", metrics: [], dimensions: [] };
  },

  async fetch(_ctx: ConnectorContext, _query: MetricQuery): Promise<MetricResult> {
    throw new ConnectorError("GoHighLevel connector is being finished — check back shortly.", "coming_soon");
  },
};
