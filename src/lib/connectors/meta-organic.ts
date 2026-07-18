import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  DiscoveryResult,
  ConnectorError,
} from "./types";

/** Meta organic (Facebook Pages + Instagram) — implementation in progress (see registry). */
export const metaOrganicConnector: MarketingConnector = {
  platform: "meta_organic",
  provider: "meta",
  status: "beta",

  isConfigured(): boolean {
    return true; // workspace-level connection; fetch() raises not_connected when absent
  },

  missingReason(): string {
    return "Meta organic (Facebook Pages + Instagram) isn't connected for this workspace. Connect it on /connections.";
  },

  discover(): DiscoveryResult {
    return { platform: "meta_organic", status: "beta", metrics: [], dimensions: [] };
  },

  async fetch(_ctx: ConnectorContext, _query: MetricQuery): Promise<MetricResult> {
    throw new ConnectorError("Meta organic (Facebook Pages + Instagram) connector is being finished — check back shortly.", "coming_soon");
  },
};
