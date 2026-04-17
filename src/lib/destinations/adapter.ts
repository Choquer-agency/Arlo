/**
 * Destination adapter contract. Every destination (Slack, Sheets, BQ, Looker, etc.)
 * implements this. Three modes:
 *   - digest → render a narrative and deliver (Slack/email/PDF)
 *   - push   → write rows to an external system on a schedule (Sheets/BQ)
 *   - live   → serve live pulls from an external BI tool (Looker/PowerBI)
 *
 * `runSync` is called by the cron runner for push/digest modes. `handleLiveRequest`
 * is called by /api/destinations/live/[kind] for live mode.
 */
import type { Id } from "../../../convex/_generated/dataModel";
import type { MetricResult } from "../connectors/types";

export interface DestinationContext {
  workspaceId: Id<"workspaces">;
  clientId?: Id<"clients">;
  destinationId: Id<"destinations">;
  syncId?: Id<"destinationSyncs">;
  /** Decrypted credentials (whatever shape the adapter stored at create-time). */
  credentials: unknown;
  /** Stored destination config (shape is adapter-specific). */
  config: unknown;
  /** Denormalized sync params (dataset spec). */
  params?: unknown;
  /** The dataset the scheduler pre-fetched for this sync, if any. */
  dataset?: MetricResult;
  /** Target ref (sheet tab, BQ table, Slack channel override). */
  targetRef?: string;
}

export interface SyncResult {
  rowsWritten?: number;
  bytesWritten?: number;
  /** Free-form structured data recorded on the destinationRuns row for debugging. */
  info?: Record<string, unknown>;
}

export interface TestResult {
  ok: boolean;
  message: string;
}

export type DestinationMode = "push" | "digest" | "live";

export interface DestinationAdapter {
  kind: string;           // matches destinations.kind — "slack_digest", "google_sheets", …
  mode: DestinationMode;

  /** Adapter-specific credential shape validation + live ping. */
  testConnection(credentials: unknown, config: unknown): Promise<TestResult>;

  /** Called by the scheduler for push/digest. */
  runSync?(ctx: DestinationContext): Promise<SyncResult>;

  /** Called by /api/destinations/live for live-connector destinations. */
  handleLiveRequest?(ctx: DestinationContext, req: Request): Promise<Response>;
}
