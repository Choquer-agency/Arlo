import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export type UsageStatus = {
  resource: string;
  used: number;
  limit: number;
  nextPlan: string;
  /** slug to preselect on billing page */
  planSlug: string;
};

export function UpgradeBanner({ status }: { status: UsageStatus | null }) {
  if (!status) return null;
  const maxed = status.used >= status.limit;
  if (!maxed) return null;
  return (
    <Link
      href={`/demo/settings/billing?upgrade=${status.planSlug}`}
      className="no-underline flex items-center justify-between gap-4 rounded-2xl bg-bg-red text-white px-5 py-3"
    >
      <span className="flex items-center gap-3 font-sans text-sm">
        <AlertTriangle size={16} />
        You&apos;ve maxed out {status.resource} ({status.used}/{status.limit}). Upgrade to {status.nextPlan} to keep going.
      </span>
      <span className="font-mono text-xs uppercase tracking-wider bg-white text-bg-red px-3 py-1.5 rounded">
        Upgrade now →
      </span>
    </Link>
  );
}
