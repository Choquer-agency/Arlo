/**
 * ARLO destinations catalog — the outbound counterpart to `connectors/catalog.ts`.
 * Sources come IN (GA4, Ads, Shopify, custom REST). Destinations go OUT — Looker Studio
 * dashboards, Google Sheets, warehouses, Slack digests, PDF reports.
 *
 * Status matches the connectors catalog:
 *   `live`        → fully implemented.
 *   `beta`        → wired end-to-end but limited (e.g. one template, no schedule editor).
 *   `coming_soon` → on a confirmed roadmap date.
 *   `waitlist`    → possible future build, waitlist signups vote it up.
 *
 * Three sync modes — pick one per destination:
 *   `live`        → external tool PULLS from Arlo on refresh (Looker, Power BI, Tableau WDC).
 *                    Nothing is stored; no scheduler runs.
 *   `push`        → Arlo WRITES rows to the external system on a schedule.
 *                    Warehouses, spreadsheets, Notion, Airtable.
 *   `digest`      → Arlo RENDERS a narrative/report on a schedule and delivers it.
 *                    Slack, email, PDF, Shareable Dashboard.
 */

export type DestinationStatus = "live" | "beta" | "coming_soon" | "waitlist";

export type DestinationFamily = "bi" | "spreadsheet" | "warehouse" | "agency";

export type DestinationSyncMode = "live" | "push" | "digest";

export type DestinationAuthType =
  | "oauth2"
  | "service_account"
  | "api_key"
  | "connection_string"
  | "webhook"
  | "internal";

export interface DestinationEntry {
  id: string;
  name: string;
  family: DestinationFamily;
  syncMode: DestinationSyncMode;
  status: DestinationStatus;
  /** ETA for coming_soon items. ISO-ish readable like "May 2026". */
  eta?: string;
  /** OAuth provider if different from id. */
  provider?: string;
  authType: DestinationAuthType;
  /** True = destination is configured per client (one Looker report per client). */
  perClient?: boolean;
  /** Windsor.ai comparison flag. */
  windsor?: boolean;
  color: string;
  /** One-line pitch for the listing card. */
  tagline: string;
  /** Two- or three-sentence agency scenario for the detail page. */
  agencyUseCase: string;
  /** Optional starter templates that ship with the destination. */
  templates?: string[];
}

export const DESTINATION_CATALOG: DestinationEntry[] = [
  // ── BI & Dashboards ─────────────────────────────────────
  {
    id: "looker_studio",
    name: "Looker Studio",
    family: "bi",
    syncMode: "live",
    status: "beta",
    provider: "google",
    authType: "oauth2",
    perClient: true,
    windsor: true,
    color: "#669DF6",
    tagline: "Client-branded dashboards that pull live from Arlo.",
    agencyUseCase:
      "Every client wants their own Looker Studio dashboard. Clone the Arlo template once, point it at the client, and GA4 + Ads + Shopify render live — no scheduled sync, no stale data, no CSV exports.",
    templates: ["Marketing overview", "SEO performance", "E-commerce KPIs"],
  },
  {
    id: "power_bi",
    name: "Power BI",
    family: "bi",
    syncMode: "live",
    status: "coming_soon",
    eta: "July 2026",
    authType: "oauth2",
    perClient: true,
    windsor: true,
    color: "#F2C811",
    tagline: "Enterprise dashboards in the tool your clients already license.",
    agencyUseCase:
      "Mid-market and enterprise clients standardize on Power BI. Ship the custom connector and your team's analysis lands in their existing workspace — no new login, no IT review.",
  },
  {
    id: "tableau",
    name: "Tableau",
    family: "bi",
    syncMode: "live",
    status: "waitlist",
    authType: "oauth2",
    perClient: true,
    windsor: true,
    color: "#E8762D",
    tagline: "Web Data Connector for Tableau Cloud and Desktop.",
    agencyUseCase:
      "Tableau-native teams want a Web Data Connector, not another CSV upload. Ship a WDC that authenticates with an Arlo token and refreshes per workbook.",
  },

  // ── Spreadsheets ────────────────────────────────────────
  {
    id: "google_sheets",
    name: "Google Sheets",
    family: "spreadsheet",
    syncMode: "push",
    status: "beta",
    provider: "google",
    authType: "oauth2",
    perClient: true,
    windsor: true,
    color: "#0F9D58",
    tagline: "Scheduled tabs that refresh themselves.",
    agencyUseCase:
      "Clients live in Sheets. Pick the metrics, pick the cadence, pick the tab — Arlo writes the rows every morning so the weekly review email always has today's numbers.",
    templates: ["Weekly KPIs", "Pivot-ready campaign table", "Raw event dump"],
  },
  {
    id: "excel",
    name: "Excel (Microsoft 365)",
    family: "spreadsheet",
    syncMode: "push",
    status: "coming_soon",
    eta: "August 2026",
    provider: "microsoft",
    authType: "oauth2",
    perClient: true,
    windsor: true,
    color: "#217346",
    tagline: "Same cadence, for the spreadsheet your CFO insists on.",
    agencyUseCase:
      "Finance and enterprise clients still prefer Excel. Push to OneDrive on the same schedule as Sheets so your team builds one workflow that satisfies both.",
  },

  // ── Warehouses ──────────────────────────────────────────
  {
    id: "bigquery",
    name: "Google BigQuery",
    family: "warehouse",
    syncMode: "push",
    status: "beta",
    provider: "google",
    authType: "service_account",
    perClient: false,
    windsor: true,
    color: "#669DF6",
    tagline: "Stream source data into the client's warehouse on a schedule.",
    agencyUseCase:
      "The client's analytics team has their own stack. Write GA4, Ads, and Shopify into their BigQuery dataset every 15 minutes so their analysts query Arlo data in dbt like they do everything else.",
  },
  {
    id: "snowflake",
    name: "Snowflake",
    family: "warehouse",
    syncMode: "push",
    status: "coming_soon",
    eta: "September 2026",
    authType: "connection_string",
    perClient: false,
    windsor: true,
    color: "#29B5E8",
    tagline: "Warehouse loads for Snowflake accounts.",
    agencyUseCase:
      "Enterprise data teams run on Snowflake. Load source data into a schema they already govern so the client's BI and Arlo's dashboards share one source of truth.",
  },
  {
    id: "redshift",
    name: "Amazon Redshift",
    family: "warehouse",
    syncMode: "push",
    status: "waitlist",
    authType: "connection_string",
    perClient: false,
    windsor: true,
    color: "#8C4FFF",
    tagline: "Redshift-native loads for AWS-first clients.",
    agencyUseCase:
      "Clients standardized on AWS want data in Redshift, not BigQuery. Ship the load adapter so agencies don't have to introduce a second warehouse.",
  },
  {
    id: "databricks",
    name: "Databricks",
    family: "warehouse",
    syncMode: "push",
    status: "waitlist",
    authType: "connection_string",
    perClient: false,
    windsor: true,
    color: "#FF3621",
    tagline: "Lakehouse writes for Databricks clients.",
    agencyUseCase:
      "Data-science-heavy clients unify on Databricks. Deliver source tables into their bronze layer so their notebooks and models pick up Arlo data automatically.",
  },

  // ── Agency-native ───────────────────────────────────────
  {
    id: "slack_digest",
    name: "Slack Digest",
    family: "agency",
    syncMode: "digest",
    status: "live",
    authType: "oauth2",
    perClient: true,
    color: "#4A154B",
    tagline: "Scheduled performance digests posted to any channel.",
    agencyUseCase:
      "Every morning at 8:00, a narrated digest hits the client's Slack — top campaigns, anomalies, week-over-week. No one opens a dashboard at 8:00; they open Slack.",
    templates: ["Daily performance", "Weekly wrap", "Anomaly alerts"],
  },
  {
    id: "email_digest",
    name: "Email Digest",
    family: "agency",
    syncMode: "digest",
    status: "beta",
    authType: "internal",
    perClient: true,
    color: "#2563EB",
    tagline: "Branded performance emails for stakeholders without Slack.",
    agencyUseCase:
      "CMOs and non-technical stakeholders live in email. Ship a branded weekly digest rendered with live numbers so they never have to log in to see how things are going.",
    templates: ["Weekly stakeholder brief", "Monthly recap"],
  },
  {
    id: "pdf_report",
    name: "Branded PDF Report",
    family: "agency",
    syncMode: "digest",
    status: "beta",
    authType: "internal",
    perClient: true,
    color: "#DC2626",
    tagline: "Client-ready PDFs your team doesn't have to build.",
    agencyUseCase:
      "The monthly review deck takes three hours to assemble. Arlo renders a branded PDF with charts, narrative, and anomalies already written — your team reviews, not builds.",
    templates: ["Monthly client report", "Quarterly business review"],
  },
  {
    id: "notion_destination",
    name: "Notion",
    family: "agency",
    syncMode: "push",
    status: "waitlist",
    provider: "notion",
    authType: "oauth2",
    perClient: true,
    windsor: false,
    color: "#000000",
    tagline: "Push KPI rows into the client's Notion database.",
    agencyUseCase:
      "Client runs their ops in Notion. Write weekly KPIs into their shared database so their team sees Arlo numbers in the same doc they plan from.",
  },
  {
    id: "airtable_destination",
    name: "Airtable",
    family: "agency",
    syncMode: "push",
    status: "waitlist",
    authType: "oauth2",
    perClient: true,
    windsor: false,
    color: "#18BFFF",
    tagline: "Push data into Airtable bases for workflow triggers.",
    agencyUseCase:
      "Airtable-native agencies trigger automations when numbers change. Write Arlo data into their base so budget-shift automations fire off the same source of truth.",
  },
  {
    id: "shareable_dashboard",
    name: "Shareable Arlo Dashboard",
    family: "agency",
    syncMode: "digest",
    status: "coming_soon",
    eta: "October 2026",
    authType: "internal",
    perClient: true,
    color: "#10B981",
    tagline: "A tokenized, client-branded, read-only URL — zero login.",
    agencyUseCase:
      "Client doesn't want another login, and neither do you. Share a signed URL — client opens it, sees live performance branded to their look. Expires when the engagement ends.",
  },
];

export const FAMILY_LABELS: Record<DestinationFamily, string> = {
  bi: "BI & Dashboards",
  spreadsheet: "Spreadsheets",
  warehouse: "Warehouses",
  agency: "Agency-native",
};

export const SYNC_MODE_LABELS: Record<DestinationSyncMode, string> = {
  live: "Live connector",
  push: "Scheduled push",
  digest: "Scheduled digest",
};

export const STATUS_LABELS: Record<DestinationStatus, string> = {
  live: "Live",
  beta: "Beta",
  coming_soon: "Coming soon",
  waitlist: "Waitlist",
};

export function byFamily(
  entries: DestinationEntry[] = DESTINATION_CATALOG
): Record<DestinationFamily, DestinationEntry[]> {
  return entries.reduce<Record<DestinationFamily, DestinationEntry[]>>(
    (acc, d) => {
      (acc[d.family] ||= []).push(d);
      return acc;
    },
    { bi: [], spreadsheet: [], warehouse: [], agency: [] }
  );
}

export function byDestinationStatus(status: DestinationStatus): DestinationEntry[] {
  return DESTINATION_CATALOG.filter((d) => d.status === status);
}

export function findDestination(id: string): DestinationEntry | undefined {
  return DESTINATION_CATALOG.find((d) => d.id === id);
}

export const DESTINATION_COUNT = DESTINATION_CATALOG.length;
export const DESTINATION_LIVE_COUNT = DESTINATION_CATALOG.filter((d) => d.status === "live").length;
export const DESTINATION_BETA_COUNT = DESTINATION_CATALOG.filter((d) => d.status === "beta").length;
export const DESTINATION_COMING_SOON_COUNT = DESTINATION_CATALOG.filter(
  (d) => d.status === "coming_soon"
).length;
export const DESTINATION_WAITLIST_COUNT = DESTINATION_CATALOG.filter(
  (d) => d.status === "waitlist"
).length;
