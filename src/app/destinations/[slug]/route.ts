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
