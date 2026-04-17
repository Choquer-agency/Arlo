/**
 * Render a Slack Block Kit message for a performance digest.
 * https://api.slack.com/block-kit
 *
 * One MetricResult per call; the digest adapter concatenates blocks for each
 * sync attached to the destination. Kept minimal: header, date range, KPI grid,
 * optional top-breakdown rows. No LLM-written narrative yet — that's a future
 * iteration once we have insight-generation infra.
 */
import type { MetricResult } from "../../connectors/types";

type Block =
  | { type: "header"; text: { type: "plain_text"; text: string } }
  | { type: "section"; text?: { type: "mrkdwn"; text: string }; fields?: { type: "mrkdwn"; text: string }[] }
  | { type: "context"; elements: { type: "mrkdwn"; text: string }[] }
  | { type: "divider" };

const METRIC_LABELS: Record<string, string> = {
  sessions: "Sessions",
  users: "Users",
  active_users: "Active users",
  total_users: "Total users",
  new_users: "New users",
  screen_page_views: "Page views",
  conversions: "Conversions",
  key_events: "Key events",
  engagement_rate: "Engagement rate",
  clicks: "Clicks",
  impressions: "Impressions",
  ctr: "CTR",
  position: "Avg position",
  cost: "Spend",
  cost_micros: "Spend",
  roas: "ROAS",
  cpc: "CPC",
  cpm: "CPM",
  revenue: "Revenue",
  orders: "Orders",
  aov: "AOV",
};

function label(metric: string): string {
  return METRIC_LABELS[metric] ?? metric.replace(/_/g, " ");
}

function fmt(metric: string, value: number): string {
  if (!isFinite(value)) return "—";
  if (/rate|ctr|roas|engagement/.test(metric)) return `${(value * 100).toFixed(2)}%`;
  if (/cost|spend|revenue|aov|cpc|cpm/.test(metric)) return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (/position/.test(metric)) return value.toFixed(1);
  if (Math.abs(value) >= 1000) return value.toLocaleString();
  return String(Math.round(value * 100) / 100);
}

export interface SlackDigestSection {
  platform: string;
  result: MetricResult;
}

export interface BuildDigestInput {
  clientName: string;
  sections: SlackDigestSection[];
  footerNote?: string;
}

export function buildSlackDigestBlocks(input: BuildDigestInput): { blocks: Block[]; text: string } {
  const blocks: Block[] = [];
  const firstRange = input.sections[0]?.result.dateRange;
  const rangeLabel = firstRange
    ? `${firstRange.label} · ${firstRange.start} → ${firstRange.end}`
    : "";

  blocks.push({
    type: "header",
    text: { type: "plain_text", text: `${input.clientName} — performance digest` },
  });

  if (rangeLabel) {
    blocks.push({
      type: "context",
      elements: [{ type: "mrkdwn", text: `*${rangeLabel}*` }],
    });
  }

  blocks.push({ type: "divider" });

  for (const section of input.sections) {
    const { platform, result } = section;
    const entries = Object.entries(result.totals);
    if (entries.length === 0) continue;

    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*${platform.toUpperCase()}*` },
    });

    // Slack sections accept up to 10 fields; chunk if needed.
    for (let i = 0; i < entries.length; i += 10) {
      const chunk = entries.slice(i, i + 10);
      blocks.push({
        type: "section",
        fields: chunk.map(([metric, value]) => ({
          type: "mrkdwn" as const,
          text: `*${label(metric)}*\n${fmt(metric, value)}`,
        })),
      });
    }

    // Top 3 breakdown rows as context, if present.
    if (result.breakdown && result.breakdown.length > 0) {
      const top = result.breakdown.slice(0, 3);
      const lines = top.map((row) => {
        const dims = row.dimensions ? Object.values(row.dimensions).join(" · ") : "—";
        const metricPair = Object.entries(row.metrics)[0];
        const metricStr = metricPair ? `${label(metricPair[0])}: ${fmt(metricPair[0], metricPair[1])}` : "";
        return `• ${dims}  —  ${metricStr}`;
      });
      blocks.push({
        type: "context",
        elements: [{ type: "mrkdwn", text: lines.join("\n") }],
      });
    }

    blocks.push({ type: "divider" });
  }

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: input.footerNote ?? "Sent by ARLO · <https://askarlo.app|askarlo.app>",
      },
    ],
  });

  const text =
    `${input.clientName} — performance digest` +
    (rangeLabel ? `\n${rangeLabel}` : "");

  return { blocks, text };
}
