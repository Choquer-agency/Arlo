import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  DiscoveryResult,
  ConnectorError,
} from "./types";

/** Pipedrive — implementation in progress (see registry). */
export const pipedriveConnector: MarketingConnector = {
  platform: "pipedrive",
  provider: "pipedrive",
  status: "beta",

  isConfigured(): boolean {
    return true; // workspace-level connection; fetch() raises not_connected when absent
  },

  missingReason(): string {
    return "Pipedrive isn't connected for this workspace. Connect it on /connections.";
  },

  discover(): DiscoveryResult {
    return { platform: "pipedrive", status: "beta", metrics: [], dimensions: [] };
  },

  async fetch(_ctx: ConnectorContext, _query: MetricQuery): Promise<MetricResult> {
    throw new ConnectorError("Pipedrive connector is being finished — check back shortly.", "coming_soon");
  },
};
