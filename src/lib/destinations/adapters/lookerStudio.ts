/**
 * Looker Studio live-connector adapter. Looker pulls from /api/destinations/live/looker-studio
 * on every dashboard refresh — no scheduled sync. The adapter's role is config
 * parsing + testConnection; the actual data-serving work lives in the route
 * handler because Looker has a specific request/response contract.
 *
 * Config captures the dataset spec so the Looker dashboard always sees the same
 * metrics/dimensions the agency intended (Looker does pick its own dateRange
 * per-view, but the schema is fixed at destination-create time).
 */
import type { DestinationAdapter, SyncResult, TestResult } from "../adapter";
import type { PlatformRef } from "../../connectors/registry";

export interface LookerStudioConfig {
  platform: PlatformRef;
  metrics: string[];
  dimensions?: string[];
}

function parseConfig(raw: unknown): LookerStudioConfig {
  if (!raw || typeof raw !== "object") throw new Error("Missing Looker config");
  const c = raw as Partial<LookerStudioConfig>;
  if (!c.platform) throw new Error("config.platform required");
  if (!Array.isArray(c.metrics) || c.metrics.length === 0) {
    throw new Error("config.metrics required");
  }
  return c as LookerStudioConfig;
}

export const lookerStudioAdapter: DestinationAdapter = {
  kind: "looker_studio",
  mode: "live",

  async testConnection(_creds, rawConfig): Promise<TestResult> {
    try {
      parseConfig(rawConfig);
      return {
        ok: true,
        message:
          "Configuration valid. Install the ARLO Looker Studio connector from public/connectors/lookerstudio and paste the token.",
      };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : String(err) };
    }
  },

  async runSync(): Promise<SyncResult> {
    // No-op. Looker Studio pulls on demand via handleLiveRequest — the cron
    // scheduler should never hit this. Keep here for registry parity.
    return { info: { mode: "live" } };
  },

  // handleLiveRequest is defined at the route level (not here) because it
  // needs Next.js Response and Convex internal access.
};
