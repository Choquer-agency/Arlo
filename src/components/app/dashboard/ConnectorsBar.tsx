"use client";

import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import type { GoogleSourceDef } from "@/lib/googleSources";

/**
 * A single low-emphasis row at the bottom of the dashboard for sources that
 * aren't mapped yet. The dashboard is for live data; setup lives in Connections,
 * so this just points there instead of showing empty "pick account" widgets.
 */
export function ConnectorsBar({ sources }: { sources: GoogleSourceDef[] }) {
  if (sources.length === 0) return null;
  return (
    <Link
      href="/connections"
      className="group block rounded-lg border border-dashed border-dark/20 bg-white p-5 hover:border-dark/40 transition-colors"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded bg-grey text-dark/60 shrink-0">
            <Plus size={16} />
          </span>
          <div className="min-w-0">
            <p className="font-sans text-dark">Add more connectors</p>
            <p className="text-dark/60 text-sm truncate">
              Connect {sources.map((s) => s.label).join(", ")} to see them here.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            {sources.map((s) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.key}
                src={s.icon}
                alt={s.label}
                title={s.label}
                className="w-6 h-6 object-contain grayscale opacity-50 group-hover:opacity-80 transition-opacity"
              />
            ))}
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-dark/60 group-hover:text-dark inline-flex items-center gap-1">
            Connections <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
