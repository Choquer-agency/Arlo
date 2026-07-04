"use client";

import Link from "next/link";
import { useActiveWorkspace } from "@/components/providers/ActingWorkspaceProvider";
import { getPlan } from "@/lib/billing";
import { Clock, ArrowRight } from "lucide-react";

/**
 * Complimentary-trial countdown + upgrade CTA. Shows the plan the client is
 * trialling and its price, so the "keep it" moment is a real, priced decision —
 * not a vague link. Turns urgent in the final stretch; hidden once expired.
 */
export function TrialBanner() {
  const { ws } = useActiveWorkspace();
  if (!ws?.trialEndsAt) return null;

  const daysLeft = Math.ceil((new Date(ws.trialEndsAt).getTime() - Date.now()) / 86400000);
  if (daysLeft < 0) return null;

  const urgent = daysLeft <= 5;
  const { label, price } = getPlan(ws.plan);

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 rounded-lg mb-6 flex-wrap ${
        urgent ? "bg-bg-yellow/40 border border-bg-yellow" : "bg-mint border border-brand/15"
      }`}
    >
      <p className="flex items-center gap-2.5 text-sm text-dark/85 min-w-0">
        <Clock size={16} className={urgent ? "text-dark shrink-0" : "text-brand shrink-0"} />
        <span>
          {daysLeft === 0 ? (
            <><b>Last day</b> of your free trial.</>
          ) : (
            <><b>{daysLeft} day{daysLeft === 1 ? "" : "s"} left</b> in your free trial.</>
          )}{" "}
          <span className="text-dark/60 hidden sm:inline">
            Keep your dashboards, live data &amp; Claude access.
          </span>
        </span>
      </p>

      <Link
        href="/settings/billing"
        className="shrink-0 inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
      >
        <span className="text-sm">Continue on {label}</span>
        <span className="font-sans font-semibold text-sm tabular-nums">{price}</span>
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}
