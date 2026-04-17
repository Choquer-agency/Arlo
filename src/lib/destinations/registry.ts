import type { DestinationAdapter } from "./adapter";
import { slackDigestAdapter } from "./adapters/slackDigest";
import { emailDigestAdapter } from "./adapters/emailDigest";
import { shareableDashboardAdapter } from "./adapters/shareableDashboard";
import { lookerStudioAdapter } from "./adapters/lookerStudio";
import {
  googleSheetsSkeleton,
  excelSkeleton,
  bigquerySkeleton,
  snowflakeSkeleton,
  redshiftSkeleton,
  databricksSkeleton,
  powerBiSkeleton,
  tableauSkeleton,
  notionSkeleton,
  airtableSkeleton,
  pdfSkeleton,
} from "./adapters/skeletons";

/**
 * Adapter registry. Adapters that return real TestResult/SyncResult values are
 * listed first; skeletons (coming-soon) come after. Skeletons are registered
 * so the wizard can enumerate them but testConnection will return ok=false
 * with a honest message explaining what's missing.
 */
const ADAPTERS: Record<string, DestinationAdapter> = {
  // Fully implemented (Phase 2–3).
  [slackDigestAdapter.kind]: slackDigestAdapter,
  [emailDigestAdapter.kind]: emailDigestAdapter,
  [shareableDashboardAdapter.kind]: shareableDashboardAdapter,
  [lookerStudioAdapter.kind]: lookerStudioAdapter,

  // Skeletons — framework accepts them, real runtime pending.
  [googleSheetsSkeleton.kind]: googleSheetsSkeleton,
  [excelSkeleton.kind]: excelSkeleton,
  [bigquerySkeleton.kind]: bigquerySkeleton,
  [snowflakeSkeleton.kind]: snowflakeSkeleton,
  [redshiftSkeleton.kind]: redshiftSkeleton,
  [databricksSkeleton.kind]: databricksSkeleton,
  [powerBiSkeleton.kind]: powerBiSkeleton,
  [tableauSkeleton.kind]: tableauSkeleton,
  [notionSkeleton.kind]: notionSkeleton,
  [airtableSkeleton.kind]: airtableSkeleton,
  [pdfSkeleton.kind]: pdfSkeleton,
};

/** Adapters that have a real (non-skeleton) runtime implementation. */
const REAL_KINDS: Set<string> = new Set([
  slackDigestAdapter.kind,
  emailDigestAdapter.kind,
  shareableDashboardAdapter.kind,
  lookerStudioAdapter.kind,
]);

export function getAdapter(kind: string): DestinationAdapter {
  const a = ADAPTERS[kind];
  if (!a) throw new Error(`No adapter registered for destination kind "${kind}"`);
  return a;
}

export function hasAdapter(kind: string): boolean {
  return kind in ADAPTERS;
}

export function isRealAdapter(kind: string): boolean {
  return REAL_KINDS.has(kind);
}

export function registeredKinds(): string[] {
  return Object.keys(ADAPTERS);
}
