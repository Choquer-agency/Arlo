/**
 * Email digest adapter. Uses Resend's REST API (https://resend.com/docs) when
 * RESEND_API_KEY is set. The agency configures a sender domain in Resend once;
 * per-destination config picks the recipient list and branding.
 *
 * No Resend SDK install — one `fetch` call, so this stays dependency-free.
 */
import type { DestinationAdapter, DestinationContext, SyncResult, TestResult } from "../adapter";
import type { MetricResult } from "../../connectors/types";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { PlatformRef } from "../../connectors/registry";
import type { DateRangeInput } from "../../connectors/types";
import { fetchDataset } from "../../datasets/fetchDataset";
import { buildEmailDigestHtml } from "../render/emailHtml";

interface EmailCredentials {
  /** Optional override — otherwise uses RESEND_API_KEY env var. */
  apiKey?: string;
}

interface EmailConfig {
  recipients: string[];                // ["alice@client.com", "cmo@client.com"]
  fromAddress?: string;                // "reports@agency.co"
  fromName?: string;
  clientDisplayName?: string;
  brandColor?: string;
  replyTo?: string;
}

export interface EmailDigestSyncParams {
  platform: PlatformRef;
  metrics: string[];
  dimensions?: string[];
  dateRange: DateRangeInput;
  limit?: number;
}

function parseConfig(raw: unknown): EmailConfig {
  if (!raw || typeof raw !== "object") throw new Error("Missing email config");
  const c = raw as Partial<EmailConfig>;
  if (!Array.isArray(c.recipients) || c.recipients.length === 0) {
    throw new Error("config.recipients required (at least one email address)");
  }
  return {
    recipients: c.recipients,
    fromAddress: c.fromAddress,
    fromName: c.fromName,
    clientDisplayName: c.clientDisplayName,
    brandColor: c.brandColor,
    replyTo: c.replyTo,
  };
}

function parseParams(raw: unknown): EmailDigestSyncParams {
  if (!raw || typeof raw !== "object") throw new Error("Missing sync params");
  const p = raw as Partial<EmailDigestSyncParams>;
  if (!p.platform) throw new Error("sync.params.platform required");
  if (!Array.isArray(p.metrics) || p.metrics.length === 0) throw new Error("sync.params.metrics required");
  if (!p.dateRange) throw new Error("sync.params.dateRange required");
  return p as EmailDigestSyncParams;
}

function resolveApiKey(creds: unknown): string {
  const fromCreds = (creds as EmailCredentials | undefined)?.apiKey;
  const key = fromCreds ?? process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "RESEND_API_KEY env var or credentials.apiKey required for email_digest adapter"
    );
  }
  return key;
}

async function sendViaResend(opts: {
  apiKey: string;
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      from: opts.from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      reply_to: opts.replyTo,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend send failed (${res.status}): ${body.slice(0, 300)}`);
  }
}

function fromHeader(config: EmailConfig): string {
  const address = config.fromAddress ?? process.env.RESEND_FROM_ADDRESS;
  if (!address) {
    throw new Error("fromAddress or RESEND_FROM_ADDRESS required");
  }
  return config.fromName ? `${config.fromName} <${address}>` : address;
}

export const emailDigestAdapter: DestinationAdapter = {
  kind: "email_digest",
  mode: "digest",

  async testConnection(rawCreds, rawConfig): Promise<TestResult> {
    try {
      const config = parseConfig(rawConfig);
      const apiKey = resolveApiKey(rawCreds);
      const from = fromHeader(config);

      await sendViaResend({
        apiKey,
        from,
        to: config.recipients.slice(0, 1),
        subject: "ARLO — email destination test",
        html: `<p>This is a test from ARLO. Your email digest destination is configured correctly.</p>`,
        text: "This is a test from ARLO. Your email digest destination is configured correctly.",
        replyTo: config.replyTo,
      });
      return { ok: true, message: `Sent a test to ${config.recipients[0]}.` };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : String(err) };
    }
  },

  async runSync(ctx: DestinationContext): Promise<SyncResult> {
    const config = parseConfig(ctx.config);
    const params = parseParams(ctx.params);
    const apiKey = resolveApiKey(ctx.credentials);

    if (!ctx.clientId) throw new Error("Email digest requires a client-scoped destination");

    const result: MetricResult = await fetchDataset({
      workspaceId: ctx.workspaceId,
      clientId: ctx.clientId as Id<"clients">,
      platform: params.platform,
      metrics: params.metrics,
      dimensions: params.dimensions,
      dateRange: params.dateRange,
      limit: params.limit,
    });

    const { subject, html, text } = buildEmailDigestHtml({
      clientName: config.clientDisplayName ?? result.client.name,
      sections: [{ platform: String(params.platform), result }],
      brandColor: config.brandColor,
    });

    await sendViaResend({
      apiKey,
      from: fromHeader(config),
      to: config.recipients,
      subject,
      html,
      text,
      replyTo: config.replyTo,
    });

    return {
      rowsWritten: result.breakdown.length,
      info: {
        platform: params.platform,
        recipients: config.recipients.length,
      },
    };
  },
};
