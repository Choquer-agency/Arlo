/**
 * Render a branded HTML digest. Shared by email_digest (mailed as-is) and
 * pdf_report (rendered via a Chromium step — not implemented here yet).
 *
 * Hand-written HTML — no React Email install needed. Safe for all major clients
 * because it uses inline styles and table layouts.
 */
import type { MetricResult } from "../../connectors/types";

const METRIC_LABELS: Record<string, string> = {
  sessions: "Sessions",
  users: "Users",
  active_users: "Active users",
  new_users: "New users",
  screen_page_views: "Page views",
  conversions: "Conversions",
  engagement_rate: "Engagement rate",
  clicks: "Clicks",
  impressions: "Impressions",
  ctr: "CTR",
  position: "Avg position",
  cost: "Spend",
  revenue: "Revenue",
  orders: "Orders",
  aov: "AOV",
  roas: "ROAS",
};

function label(metric: string): string {
  return METRIC_LABELS[metric] ?? metric.replace(/_/g, " ");
}

function fmt(metric: string, value: number): string {
  if (!isFinite(value)) return "—";
  if (/rate|ctr|roas|engagement/.test(metric)) return `${(value * 100).toFixed(2)}%`;
  if (/cost|spend|revenue|aov|cpc|cpm/.test(metric))
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (/position/.test(metric)) return value.toFixed(1);
  if (Math.abs(value) >= 1000) return value.toLocaleString();
  return String(Math.round(value * 100) / 100);
}

export interface DigestSection {
  platform: string;
  result: MetricResult;
}

export interface BuildEmailDigestInput {
  clientName: string;
  sections: DigestSection[];
  brandColor?: string;
  footerNote?: string;
}

export function buildEmailDigestHtml(input: BuildEmailDigestInput): {
  subject: string;
  html: string;
  text: string;
} {
  const brand = input.brandColor ?? "#3E8F4A";
  const firstRange = input.sections[0]?.result.dateRange;
  const rangeLabel = firstRange ? `${firstRange.label} · ${firstRange.start} → ${firstRange.end}` : "";
  const subject = `${input.clientName} — performance digest`;

  const sectionHtml = input.sections
    .map((s) => {
      const entries = Object.entries(s.result.totals);
      const kpis = entries
        .map(
          ([metric, value]) => `
          <td style="padding:12px 14px;border:1px solid #e6e6e6;border-radius:6px;background:#fafafa;width:33%;">
            <div style="font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#777;margin-bottom:4px;">${label(
              metric
            )}</div>
            <div style="font-family:'Inter',system-ui,sans-serif;font-size:20px;font-weight:600;color:#111;">${fmt(
              metric,
              value
            )}</div>
          </td>`
        )
        .join("");

      const topRows = (s.result.breakdown ?? [])
        .slice(0, 5)
        .map((row) => {
          const dims = row.dimensions ? Object.values(row.dimensions).join(" · ") : "—";
          const metric = Object.entries(row.metrics)[0];
          return `<tr><td style="padding:6px 8px;font-family:'Inter',sans-serif;font-size:13px;color:#333;">${dims}</td><td style="padding:6px 8px;font-family:ui-monospace,Menlo,monospace;font-size:13px;color:#111;text-align:right;">${
            metric ? fmt(metric[0], metric[1]) : ""
          }</td></tr>`;
        })
        .join("");

      return `
        <tr><td style="padding:20px 24px 8px 24px;">
          <div style="font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${brand};">${s.platform}</div>
        </td></tr>
        <tr><td style="padding:0 18px 8px 18px;">
          <table role="presentation" cellpadding="0" cellspacing="6" style="width:100%;border-collapse:separate;">
            <tr>${kpis}</tr>
          </table>
        </td></tr>
        ${
          topRows
            ? `<tr><td style="padding:0 24px 16px 24px;">
                 <div style="font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#999;margin-bottom:6px;">Top breakdown</div>
                 <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #eee;">${topRows}</table>
               </td></tr>`
            : ""
        }
      `;
    })
    .join("");

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f5f5;font-family:'Inter',system-ui,sans-serif;color:#111;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#fff;border:1px solid #e6e6e6;border-radius:12px;">
        <tr><td style="padding:28px 24px 8px 24px;border-bottom:1px solid #eee;">
          <div style="font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${brand};">Performance digest</div>
          <div style="font-size:22px;font-weight:600;color:#111;margin-top:6px;">${input.clientName}</div>
          ${rangeLabel ? `<div style="font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#888;margin-top:4px;">${rangeLabel}</div>` : ""}
        </td></tr>
        ${sectionHtml}
        <tr><td style="padding:16px 24px;border-top:1px solid #eee;font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#999;">
          ${input.footerNote ?? 'Sent by ARLO · <a href="https://askarlo.app" style="color:#999;">askarlo.app</a>'}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const textLines: string[] = [`${input.clientName} — performance digest`];
  if (rangeLabel) textLines.push(rangeLabel);
  for (const s of input.sections) {
    textLines.push("", s.platform);
    for (const [m, v] of Object.entries(s.result.totals)) {
      textLines.push(`  ${label(m)}: ${fmt(m, v)}`);
    }
  }
  textLines.push("", "— ARLO");

  return { subject, html, text: textLines.join("\n") };
}
