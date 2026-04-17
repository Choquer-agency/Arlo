const ALL_KINDS: ReadonlySet<string> = new Set([
  "slack_digest",
  "email_digest",
  "shareable_dashboard",
  "looker_studio",
  "google_sheets",
  "excel",
  "bigquery",
  "snowflake",
  "redshift",
  "databricks",
  "power_bi",
  "tableau",
  "notion_destination",
  "airtable_destination",
  "pdf_report",
]);

const REAL_KINDS: ReadonlySet<string> = new Set([
  "slack_digest",
  "email_digest",
  "shareable_dashboard",
  "looker_studio",
]);

export function hasAdapter(kind: string): boolean {
  return ALL_KINDS.has(kind);
}

export function isRealAdapter(kind: string): boolean {
  return REAL_KINDS.has(kind);
}
