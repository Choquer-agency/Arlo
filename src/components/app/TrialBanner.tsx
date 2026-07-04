"use client";

import Link from "next/link";
import { useActiveWorkspace } from "@/components/providers/ActingWorkspaceProvider";
import { Clock } from "lucide-react";

/**
 * Complimentary-trial countdown. Shows for workspaces on a trial with a set end
 * date; turns urgent in the final stretch. Hidden once expired or on paid plans.
 */
export function TrialBanner() {
  const { ws } = useActiveWorkspace();
  if (!ws?.trialEndsAt) return null;

  const daysLeft = Math.ceil((new Date(ws.trialEndsAt).getTime() - Date.now()) / 86400000);
  if (daysLeft < 0) return null;

  const urgent = daysLeft <= 5;

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-2.5 rounded-lg mb-6 flex-wrap ${
        urgent ? "bg-bg-yellow/40 border border-bg-yellow" : "bg-mint border border-brand/15"
      }`}
    >
      <p className="flex items-center gap-2 text-sm text-dark/80">
        <Clock size={15} className={urgent ? "text-dark" : "text-brand"} />
        <span>
          {daysLeft === 0 ? (
            <>Your complimentary trial ends <b>today</b>.</>
          ) : (
            <>
              <b>{daysLeft} day{daysLeft === 1 ? "" : "s"}</b> left in your complimentary trial.
            </>
          )}
        </span>
      </p>
      <Link
        href="/settings/billing"
        className="font-mono text-[11px] uppercase tracking-wider text-dark/70 hover:text-dark shrink-0"
      >
        Keep Arlo →
      </Link>
    </div>
  );
}
