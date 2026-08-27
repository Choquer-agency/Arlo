import path from "path";
import { renderPage } from "../../arlo/_render";
import {
  DESTINATION_CATALOG,
  FAMILY_LABELS,
  SYNC_MODE_LABELS,
  STATUS_LABELS,
  type DestinationEntry,
} from "@/lib/destinations/catalog";

// id → self-hosted favicon file under /arlo/dest/ (see public/arlo/dest/).
const FAVICON: Record<string, string> = {
  looker_studio: "looker-studio", power_bi: "power-bi", tableau: "tableau",
  google_sheets: "google-sheets", excel: "excel",
  bigquery: "bigquery", snowflake: "snowflake", redshift: "redshift", databricks: "databricks",
  slack_digest: "slack", notion_destination: "notion", airtable_destination: "airtable",
};
// destinations with no product favicon → periwinkle letter (or the ARLO mark).
const LETTER: Record<string, string> = { email_digest: "E", pdf_report: "B" };
const ARLO_MARK = new Set(["shareable_dashboard"]);

const STATUS_COLORS: Record<string, { c: string; bg: string }> = {
  beta: { c: "#8f7a2a", bg: "#f7f0cf" },
  coming_soon: { c: "#7b74a8", bg: "#ece9f6" },
  waitlist: { c: "#8f897c", bg: "#ede9e0" },
  live: { c: "#3f7a1e", bg: "#e6f4d9" },
};

function faviconHtml(e: DestinationEntry, size: number): string {
  const style = `width:${size}px;height:${size}px;object-fit:contain;flex:none;`;
  if (FAVICON[e.id]) return `<img src="/arlo/dest/${FAVICON[e.id]}.png" alt="${e.name}" style="${style}"/>`;
  if (ARLO_MARK.has(e.id)) return `<img src="/arlo/arlo-logo-purple.svg" alt="${e.name}" style="${style}"/>`;
  return `<span style="font-family:'PP Neue Montreal',sans-serif;font-weight:500;font-size:${Math.round(size * 0.44)}px;color:#8F93FF;">${LETTER[e.id] || e.name.charAt(0)}</span>`;
}

function bubbles(e: DestinationEntry) {
  const st = STATUS_COLORS[e.status];
  const sync = e.syncMode === "live"
    ? { c: "#3f7a1e", bg: "#e6f4d9" }   // live connector = green
    : { c: "#4a6d8c", bg: "#e7eff5" };  // scheduled push/digest = blue
  const out = [
    { label: STATUS_LABELS[e.status], color: st.c, bg: st.bg },
    { label: SYNC_MODE_LABELS[e.syncMode], color: sync.c, bg: sync.bg },
    { label: FAMILY_LABELS[e.family], color: "#6b6fc4", bg: "#ecedfb" },
  ];
  if (e.perClient) out.push({ label: "Per-client", color: "#8f897c", bg: "#ede9e0" });
  return out;
}

// Prompts + FAQ are destination-agnostic (you're asking ARLO; the destination is
// just where the answer lands), so they're shared across all detail pages.
const PROMPTS = [
  { q: "Show sessions and conversions by channel, this month vs. last.", a: "The whole acquisition picture in one prompt — no switching reports, no CSV exports." },
  { q: "Which landing pages drove the most revenue last week?", a: "Revenue attributed to the exact pages that earned it, ranked and ready for the dashboard." },
  { q: "Top 20 Search Console queries by clicks, with CTR and position.", a: "Your organic winners and the quick-win queries, without opening Search Console." },
  { q: "What's ROAS by campaign for the last 30 days vs. the prior 30?", a: "Paid efficiency across every campaign, trended — the number clients ask for first." },
  { q: "Any metric down more than 20% week over week?", a: "Problems raise their own hand before a client notices — one prompt, every source." },
  { q: "Give me month-over-month movement across every channel for this client.", a: "The monthly rollup that used to eat an afternoon, in a single sentence." },
  { q: "Run a one-line health check across all my connected sources.", a: "Start every week — and every client call — already knowing where things stand." },
];

const FAQ = {
  eyebrow: "FAQ",
  heading: "Destinations, answered",
  subtext: "How ARLO gets your live data into the tools your clients already open.",
  contactPre: "Can't find what you're looking for? Contact our",
  contactHref: "/contact",
  contactLink: "support team",
  items: [
    { q: "What's the difference between a live connector and a scheduled push?", a: "A live connector like Looker Studio queries ARLO on demand, so the dashboard is always current. A scheduled push or digest sends data on a cadence you choose: hourly, daily, or weekly." },
    { q: "How fresh is the data in each destination?", a: "Live connectors pull the moment someone opens the report, so there are no stale CSVs. Scheduled destinations are as fresh as the cadence you set." },
    { q: "Can I client-brand the dashboards and reports?", a: "Yes. Clone the ARLO template, point it at a client, and it renders with their branding. The Shareable Arlo Dashboard gives each client a tokenized, client-branded, read-only URL." },
    { q: "Do I need a data warehouse to use ARLO?", a: "No. Destinations are optional. ARLO's core is live Claude queries with nothing stored — warehouses are there only for teams whose analysts want the raw data in their own stack." },
    { q: "How do I request a destination you haven't built?", a: "Tell us on the contact form where your clients want their data. Every ask bumps that destination up the queue — the roadmap is demand-driven." },
  ],
};

// FAQPage JSON-LD built from the same FAQ.items rendered on the page, so the
// two can never drift out of sync (unlike the hub page's hand-maintained pair).
function faqSchemaHtml(items: { q: string; a: string }[]): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`;
}

// ── Optional "alternative to X" comparison section (sxo.md quick-win #6) ──
// Only the 3 highest-searched "alternative to X" destinations get this
// treatment (Looker Studio, Power BI, BigQuery — audits/sxo.md Section 3,
// Section 8 item 6). Every other destination page renders none of this;
// _shell.html has no {{#if}} support, so an empty string is how a section
// stays optional (same pattern used for faqSchemaHtml above).
const esc = (s: string) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const CMP_SECTION_OPEN =
  '<section style="padding:8px 0 56px;"><div class="arlo-padding-global"><div class="arlo-container-large" style="max-width:920px;margin-left:auto;margin-right:auto;">';
const CMP_SECTION_CLOSE = "</div></div></section>";
const CMP_H2 =
  "font-family:'Libre Caslon Text',Georgia,serif;font-weight:400;font-size:clamp(25px,3vw,36px);line-height:1.1;letter-spacing:-.015em;color:#14181c;margin:0 0 18px;";
const CMP_BODY = "font-family:'PP Neue Montreal',sans-serif;font-size:1.05rem;line-height:1.6;color:#5a544a;margin:0;";
const CMP_EYEBROW =
  "font-family:'Geist Pixel','Press Start 2P',monospace;font-size:14px;letter-spacing:.03em;color:#8F93FF;margin-bottom:14px;";

function comparisonTable(toolName: string, rows: { feature: string; values: string[] }[]) {
  const headers = [toolName, "ARLO"];
  const th = headers
    .map((h, i) => {
      const hi = i === 1;
      const rec = hi
        ? `<span style="display:block;font-family:'Geist Pixel',monospace;font-size:11px;color:#3f7a1e;letter-spacing:.03em;margin-top:3px;">No dashboard to build</span>`
        : "";
      return `<th style="text-align:left;padding:14px 18px;font-weight:500;color:#14181c;${hi ? "background:#eaffc9;" : ""}">${esc(h)}${rec}</th>`;
    })
    .join("");
  const trs = rows
    .map(
      (r) =>
        `<tr style="border-top:1px solid #E7E3D7;"><td style="padding:14px 18px;font-weight:500;color:#14181c;">${esc(r.feature)}</td>${r.values
          .map(
            (v, i) =>
              `<td style="padding:14px 18px;color:${i === 1 ? "#14181c" : "#5a544a"};${i === 1 ? "background:#f4ffe1;font-weight:500;" : ""}">${esc(v)}</td>`
          )
          .join("")}</tr>`
    )
    .join("");
  return `<div style="overflow-x:auto;border:1px solid #E7E3D7;border-radius:16px;"><table style="width:100%;border-collapse:collapse;font-family:'PP Neue Montreal',sans-serif;font-size:0.95rem;min-width:520px;"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`;
}

function comparisonWhenGrid(toolName: string, whenArlo: string[], whenTool: string[]) {
  const li = (items: string[], mark: string, markColor: string) =>
    items
      .map(
        (it) =>
          `<li style="display:flex;gap:11px;align-items:flex-start;margin-bottom:12px;"><span style="color:${markColor};flex:none;line-height:1.5;">${mark}</span><span style="font-family:'PP Neue Montreal',sans-serif;font-size:0.95rem;color:#5a544a;line-height:1.5;">${esc(it)}</span></li>`
      )
      .join("");
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;"><div style="background:#F4F3EE;border:1px solid #E7E3D7;border-radius:18px;padding:28px;"><h3 style="font-family:'PP Neue Montreal',sans-serif;font-weight:500;font-size:1.15rem;color:#14181c;margin:0 0 16px;">Skip ${esc(toolName)} when</h3><ul style="list-style:none;margin:0;padding:0;">${li(whenArlo, "✓", "#3f7a1e")}</ul></div><div style="background:#fff;border:1px solid #E7E3D7;border-radius:18px;padding:28px;"><h3 style="font-family:'PP Neue Montreal',sans-serif;font-weight:500;font-size:1.15rem;color:#14181c;margin:0 0 16px;">Keep ${esc(toolName)} when</h3><ul style="list-style:none;margin:0;padding:0;">${li(whenTool, "—", "#b1ada1")}</ul></div></div>`;
}

interface ComparisonEntry {
  toolName: string;
  heading: string;
  intro: string;
  table: { feature: string; values: string[] }[];
  whenArlo: string[];
  whenTool: string[];
}

const COMPARISON_CONTENT: Record<string, ComparisonEntry> = {
  looker_studio: {
    toolName: "Looker Studio",
    heading: "Looker Studio alternative — or a live Looker Studio connector? ARLO is both",
    intro:
      "Some agencies want ARLO's live GA4/Ads/Search Console data flowing into a Looker Studio dashboard they already built (that's what the rest of this page covers). Others are evaluating Looker Studio itself and wondering whether they need a dashboard at all. If you're in the second group: Looker Studio is free, but it still means building charts, wiring a connector per source, and maintaining a report per client. ARLO skips that step — Claude answers the question directly, live, without a dashboard in between.",
    table: [
      { feature: "Setup", values: ["Build charts + filters per report", "Ask Claude — nothing to build"] },
      { feature: "Cost", values: ["Free, but often needs a paid connector behind it", "Free to start, live queries included"] },
      { feature: "Data freshness", values: ["As fresh as the connector's last sync", "Live on every question"] },
      { feature: "Multi-client scale", values: ["Clone and maintain a report per client", "Assign a property per client in one connection"] },
      { feature: "Ad-hoc questions", values: ["Limited to charts already on the dashboard", "Any question, in plain English"] },
      { feature: "Claude / AI access", values: ["Not included", "The whole product"] },
    ],
    whenArlo: [
      "You want an answer to one question, not a dashboard to interpret",
      "You don't want to maintain a report template per client",
      "You'd rather ask \"how did we do last month\" and get a sentence back",
    ],
    whenTool: [
      "Clients expect a persistent, always-on visual dashboard they check themselves",
      "You already have a library of Looker Studio templates worth keeping",
      "Your team prefers reading charts over asking questions",
    ],
  },
  power_bi: {
    toolName: "Power BI",
    heading: "Power BI alternative — or a live Power BI data source? ARLO is both",
    intro:
      "If your clients already open a Power BI workspace, the rest of this page shows how ARLO feeds it live data. But if you're evaluating whether you need Power BI at all: it's built for enterprise BI — data models, DAX measures, governed workspaces — which is real overhead for an agency whose actual job is answering \"how did the campaign do?\" ARLO skips the report-building step entirely; you ask Claude and get the number.",
    table: [
      { feature: "Setup", values: ["Model data, build a report, publish to the service", "Ask Claude — no report to build"] },
      { feature: "Licensing", values: ["Pro or Premium per-user license to share outside your org", "Free to start, live queries included"] },
      { feature: "Data connections", values: ["A connector or gateway configured per source", "One OAuth grant covers GA4, Ads, Search Console, and more"] },
      { feature: "Refresh", values: ["Scheduled refresh, typically daily on shared capacity", "Live on every question"] },
      { feature: "Multi-client agencies", values: ["A workspace and report to maintain per client", "Assign accounts per client inside one connection"] },
      { feature: "Skill required", values: ["Report-building and DAX knowledge", "Plain English"] },
    ],
    whenArlo: [
      "You want the answer, not a report to design and maintain",
      "You don't have (or want) a dedicated BI or analyst function",
      "You'd rather onboard a new client in minutes than build a new workspace",
    ],
    whenTool: [
      "You need enterprise-grade BI: complex data models, DAX, row-level security",
      "Clients want a governed, branded workspace they log into themselves",
      "You're already standardized on Microsoft's stack (Azure, Fabric, Teams)",
    ],
  },
  bigquery: {
    toolName: "BigQuery",
    heading: "Do you need a data warehouse, or just an answer? ARLO skips BigQuery entirely",
    intro:
      "If you already run a BigQuery warehouse, the rest of this page shows how ARLO can push live data into it. But most agencies reach for a warehouse only because that's how you're \"supposed\" to centralize marketing data — not because they need years of joinable history. If the real job is \"what happened this month,\" a warehouse is a project, not an answer. ARLO queries GA4, Ads, and Search Console live, with no schema, no pipeline, and no SQL.",
    table: [
      { feature: "Setup", values: ["Design a schema, build ETL per source", "Ask Claude — no schema, no pipeline"] },
      { feature: "Cost model", values: ["Usage-based storage + query pricing, plus ETL tooling", "Free to start, live queries included"] },
      { feature: "Query skill required", values: ["SQL", "Plain English"] },
      { feature: "Data freshness", values: ["As fresh as the last load job", "Live on every question"] },
      { feature: "Best for", values: ["Large historical datasets, cross-source joins, data science", "Fast, current answers on marketing performance"] },
    ],
    whenArlo: [
      "You want a this-week or this-month answer, not a data warehouse project",
      "You don't have a data engineering function to build and maintain pipelines",
      "Marketing reporting is the job, not a broader data-warehouse strategy",
    ],
    whenTool: [
      "You need years of historical, queryable data for analysis beyond marketing reporting",
      "You already have an analyst who writes SQL against a warehouse",
      "You're joining marketing data with other business systems (product, finance) in one place",
    ],
  },
};

function comparisonSectionHtml(id: string): string {
  const c = COMPARISON_CONTENT[id];
  if (!c) return "";
  return `${CMP_SECTION_OPEN}<div style="${CMP_EYEBROW}">${esc(c.toolName)} vs. ARLO</div><h2 style="${CMP_H2}">${esc(c.heading)}</h2><p style="${CMP_BODY}margin-bottom:28px;">${esc(c.intro)}</p>${comparisonTable(c.toolName, c.table)}<div style="height:24px;"></div>${comparisonWhenGrid(c.toolName, c.whenArlo, c.whenTool)}${CMP_SECTION_CLOSE}`;
}

// sxo.md Section 8 item 8: /destinations/[slug] pages had no dateModified
// signal (unlike /compare/[slug]). All 15 share this shell, so one shared
// date covers the whole page type until a page's own content next changes.
const CONTENT_LAST_UPDATED = "2026-08-27";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const entry = DESTINATION_CATALOG.find((d) => d.id === slug);
  if (!entry) return new Response("Not found", { status: 404 });

  const familyLabel = FAMILY_LABELS[entry.family];
  const others = DESTINATION_CATALOG
    .filter((d) => d.family === entry.family && d.id !== entry.id)
    .map((d) => ({
      href: `/destinations/${d.id}`,
      name: d.name,
      faviconHtml: faviconHtml(d, 24),
      statusLabel: STATUS_LABELS[d.status] + (d.eta ? ` · ${d.eta}` : ""),
      statusColor: STATUS_COLORS[d.status].c,
    }));

  const content = {
    title: `${entry.name} — ${familyLabel} Destination | ARLO`,
    metaDescription: `${entry.tagline} Push ARLO's live marketing data into ${entry.name} — no exports, no stale CSVs.`,
    canonicalUrl: `https://askarlo.app/destinations/${entry.id}`,
    breadcrumbHtml: `<a href="/destinations" style="color:#14181c;text-decoration:none;border-bottom:1px solid rgba(20,24,28,0.25);">Destinations</a> / ${familyLabel}`,
    faviconHtml: faviconHtml(entry, 54),
    name: entry.name,
    heroBody: `${entry.tagline} ${entry.agencyUseCase}`,
    familyLabel,
    bubbles: bubbles(entry),
    prompts: PROMPTS,
    others,
    faq: FAQ,
    faqSchemaHtml: faqSchemaHtml(FAQ.items),
    comparisonHtml: comparisonSectionHtml(entry.id),
    dateModified: CONTENT_LAST_UPDATED,
    cta: { eyebrow: "Get started", heading: "Connect once. Send your data anywhere.", buttonText: "Start For Free", buttonHref: "/welcome" },
    // per-destination branded PDF (public/arlo/downloads/<id>-50-prompts.pdf)
    pdfFile: `${entry.id}-50-prompts.pdf`,
    pdfDownloadName: `ARLO-50-Prompts-${entry.name.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "")}.pdf`,
  };

  const shell = path.join(process.cwd(), "src/app/destinations/_template/_shell.html");
  const raw = await renderPage(shell, content);
  const html = raw.replace(/__ARLOV__/g, Date.now().toString());
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
