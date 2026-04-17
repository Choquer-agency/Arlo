/**
 * Skeleton adapters for destinations where the real runtime implementation
 * depends on external SDK installs and credentials plumbing we haven't done
 * yet (BigQuery, Snowflake, Power BI, etc.) OR where the full implementation
 * is scheduled for Phase 4+.
 *
 * Each skeleton:
 *   - registers the `kind` so the wizard can enumerate it
 *   - testConnection returns an HONEST message ("not yet implemented; join the
 *     waitlist") — never fake success
 *   - runSync throws — the cron runner records the error clearly
 *
 * As each real adapter lands, move it out of this file into its own module and
 * update registry.ts. Keep the contract identical so UI doesn't change.
 */
import type { DestinationAdapter, DestinationMode, SyncResult, TestResult } from "../adapter";

function notReadyTest(kind: string, hint: string): Promise<TestResult> {
  return Promise.resolve({
    ok: false,
    message: `${kind} is on the roadmap. ${hint}`,
  });
}

function notReadySync(kind: string): Promise<SyncResult> {
  return Promise.reject(
    new Error(
      `Adapter "${kind}" is not implemented yet. The destination framework accepts configs for it but runs will no-op.`
    )
  );
}

function skeleton(kind: string, mode: DestinationMode, hint: string): DestinationAdapter {
  return {
    kind,
    mode,
    testConnection: () => notReadyTest(kind, hint),
    runSync: () => notReadySync(kind),
  };
}

export const googleSheetsSkeleton = skeleton(
  "google_sheets",
  "push",
  "Needs Sheets API scope additions + per-client sheet picker. Coming Phase 3."
);

export const excelSkeleton = skeleton(
  "excel",
  "push",
  "Needs Microsoft Graph OAuth. Coming Phase 4."
);

export const bigquerySkeleton = skeleton(
  "bigquery",
  "push",
  "Needs @google-cloud/bigquery install + service-account wizard step. Coming Phase 4."
);

export const snowflakeSkeleton = skeleton(
  "snowflake",
  "push",
  "Needs snowflake-sdk install + connection-string wizard. Coming Phase 4."
);

export const redshiftSkeleton = skeleton(
  "redshift",
  "push",
  "Needs pg install + JDBC-style connection string wizard. Coming Phase 5."
);

export const databricksSkeleton = skeleton(
  "databricks",
  "push",
  "Needs Databricks SQL endpoint token wizard. Coming Phase 5."
);

export const powerBiSkeleton = skeleton(
  "power_bi",
  "live",
  "Power BI Custom Connector ships with a separate MEZ artifact. Coming Phase 4."
);

export const tableauSkeleton = skeleton(
  "tableau",
  "live",
  "Tableau Web Data Connector HTML needs hosting. Coming Phase 5."
);

export const notionSkeleton = skeleton(
  "notion_destination",
  "push",
  "Needs Notion OAuth + database picker. Coming Phase 5."
);

export const airtableSkeleton = skeleton(
  "airtable_destination",
  "push",
  "Needs Airtable OAuth + base picker. Coming Phase 5."
);

export const pdfSkeleton = skeleton(
  "pdf_report",
  "digest",
  "PDF rendering requires a chromium-puppeteer worker. Coming Phase 4."
);
