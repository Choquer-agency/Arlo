/**
 * Shareable Arlo Dashboard — an ARLO-hosted, read-only, tokenized URL at
 * /share/[token]. Agency creates one per client and shares the link. The public
 * page renders live data via fetchDataset using the destination's locked clientId.
 *
 * Auth model: the destination stores a `liveTokenHash` and an `expiresAt` on the
 * config. The /share/[token] handler looks up `by_live_token_hash`, resolves
 * workspaceId + clientId from the destination row, and calls fetchDataset with
 * those LOCKED values. A leaked token can only ever show its one client's data.
 *
 * Rotate by calling destinations.remove + re-creating (or a future rotate mutation).
 */
import type { DestinationAdapter, DestinationContext, SyncResult, TestResult } from "../adapter";

interface ShareableConfig {
  clientDisplayName?: string;
  brandColor?: string;
  sources: Array<{
    platform: string;
    label: string;
    metrics: string[];
    dimensions?: string[];
    dateRange: unknown;
  }>;
  expiresAt?: number; // epoch ms; optional
}

function parseConfig(raw: unknown): ShareableConfig {
  if (!raw || typeof raw !== "object") throw new Error("Missing shareable config");
  const c = raw as Partial<ShareableConfig>;
  if (!Array.isArray(c.sources) || c.sources.length === 0) {
    throw new Error("config.sources required (at least one source)");
  }
  return {
    clientDisplayName: c.clientDisplayName,
    brandColor: c.brandColor,
    sources: c.sources,
    expiresAt: c.expiresAt,
  };
}

/**
 * The shareable dashboard is PULL-based, not push. runSync does nothing beyond
 * confirming the token is still valid — the /share/[token] route does the work
 * on each visit. We keep a "digest" scheduler entry so agencies can see that the
 * link is healthy and hasn't expired.
 */
export const shareableDashboardAdapter: DestinationAdapter = {
  kind: "shareable_dashboard",
  mode: "digest",

  async testConnection(_creds, rawConfig): Promise<TestResult> {
    try {
      parseConfig(rawConfig);
      return {
        ok: true,
        message: "Configuration valid. The share URL becomes live once you save.",
      };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : String(err) };
    }
  },

  async runSync(ctx: DestinationContext): Promise<SyncResult> {
    const config = parseConfig(ctx.config);
    if (config.expiresAt && Date.now() > config.expiresAt) {
      throw new Error("Share link expired — rotate the token or extend expiresAt");
    }
    // No external call — the share page queries fetchDataset at render time.
    return { info: { sources: config.sources.length } };
  },
};
