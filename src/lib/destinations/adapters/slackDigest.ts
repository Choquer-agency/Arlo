/**
 * Slack digest adapter. MVP ships with "Incoming Webhook URL" auth — the simplest
 * Slack integration path: user creates an incoming webhook in their Slack admin,
 * pastes the URL into the ARLO wizard, done. Full OAuth / bot-token auth is a
 * future iteration (would enable posting to multiple channels from one install).
 */
import type { DestinationAdapter, DestinationContext, SyncResult, TestResult } from "../adapter";
import type { MetricResult } from "../../connectors/types";
import { fetchDataset } from "../../datasets/fetchDataset";
import { buildSlackDigestBlocks } from "../render/slackBlocks";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { PlatformRef } from "../../connectors/registry";
import type { DateRangeInput } from "../../connectors/types";

interface SlackCredentials {
  webhookUrl: string;
}

interface SlackConfig {
  channelHint?: string;       // cosmetic (users still pick when creating the webhook)
  clientDisplayName?: string; // overrides the client name in the digest header
}

/**
 * Dataset spec persisted per sync. This is the `params` field on destinationSyncs —
 * the sync runner hands it to the adapter which passes it to fetchDataset.
 */
export interface SlackDigestSyncParams {
  platform: PlatformRef;
  metrics: string[];
  dimensions?: string[];
  dateRange: DateRangeInput;
  limit?: number;
}

function parseCredentials(raw: unknown): SlackCredentials {
  if (!raw || typeof raw !== "object") throw new Error("Missing Slack credentials");
  const webhookUrl = (raw as { webhookUrl?: string }).webhookUrl;
  if (!webhookUrl || !/^https:\/\/hooks\.slack\.com\//.test(webhookUrl)) {
    throw new Error("Expected a Slack Incoming Webhook URL (https://hooks.slack.com/…)");
  }
  return { webhookUrl };
}

function parseConfig(raw: unknown): SlackConfig {
  return (raw && typeof raw === "object" ? (raw as SlackConfig) : {}) ?? {};
}

function parseParams(raw: unknown): SlackDigestSyncParams {
  if (!raw || typeof raw !== "object") throw new Error("Missing sync params");
  const p = raw as Partial<SlackDigestSyncParams>;
  if (!p.platform) throw new Error("sync.params.platform required");
  if (!Array.isArray(p.metrics) || p.metrics.length === 0) {
    throw new Error("sync.params.metrics required");
  }
  if (!p.dateRange) throw new Error("sync.params.dateRange required");
  return p as SlackDigestSyncParams;
}

async function postToSlack(webhookUrl: string, body: unknown): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Slack webhook failed (${res.status}): ${text.slice(0, 300)}`);
  }
}

export const slackDigestAdapter: DestinationAdapter = {
  kind: "slack_digest",
  mode: "digest",

  async testConnection(rawCreds, rawConfig) {
    try {
      const { webhookUrl } = parseCredentials(rawCreds);
      parseConfig(rawConfig);
      await postToSlack(webhookUrl, {
        text: "ARLO test — destination connected. You can ignore this message.",
      });
      return { ok: true, message: "Posted a test message to Slack." };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  },

  async runSync(ctx: DestinationContext): Promise<SyncResult> {
    const creds = parseCredentials(ctx.credentials);
    const config = parseConfig(ctx.config);
    const params = parseParams(ctx.params);

    if (!ctx.clientId) {
      throw new Error("Slack digest requires a client-scoped destination");
    }

    // SECURITY: clientId comes from the destination row (denormalized onto the
    // sync), NOT from params. fetchDataset takes it positionally. Even a tampered
    // params object cannot redirect the query at another client.
    const result: MetricResult = await fetchDataset({
      workspaceId: ctx.workspaceId,
      clientId: ctx.clientId as Id<"clients">,
      platform: params.platform,
      metrics: params.metrics,
      dimensions: params.dimensions,
      dateRange: params.dateRange,
      limit: params.limit,
    });

    const { blocks, text } = buildSlackDigestBlocks({
      clientName: config.clientDisplayName ?? result.client.name,
      sections: [{ platform: String(params.platform), result }],
    });

    await postToSlack(creds.webhookUrl, { text, blocks });

    return {
      rowsWritten: result.breakdown.length,
      info: {
        platform: params.platform,
        metrics: params.metrics,
        channelHint: config.channelHint,
      },
    };
  },
};
