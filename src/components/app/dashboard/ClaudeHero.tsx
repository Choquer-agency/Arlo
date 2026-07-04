"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy, Sparkles } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";
import { track } from "@/lib/posthog";

function relativeTime(iso?: string | null): string | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

/**
 * The dashboard's primary call to action: get this business's data into Claude.
 * Solo owners don't come here to stare at charts — they come to grab their link
 * and go ask Claude. So this is the loudest thing on the page.
 */
export function ClaudeHero({
  workspaceId,
  businessName,
  connectedToClaude,
}: {
  workspaceId: Id<"workspaces">;
  businessName: string;
  connectedToClaude: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  async function copyMcpUrl() {
    setBusy(true);
    try {
      const res = await fetch(`/api/mcp/token?workspaceId=${workspaceId}`);
      const data = await res.json();
      if (data.token) {
        const url = `${window.location.origin}/api/mcp?token=${data.token}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        track("mcp_url_copied", { from: "dashboard_hero" });
        setTimeout(() => setCopied(false), 1800);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg bg-brand-lime text-dark p-6 lg:p-8 flex flex-col justify-between lg:col-span-2 min-h-[15rem]">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={15} />
          <p className="font-mono text-xs uppercase tracking-wider">Ask Arlo in Claude</p>
        </div>
        <h2 className="font-sans text-fluid-h4 leading-tight mb-3 max-w-xl">
          Ask Claude anything about {businessName}.
        </h2>
        <p className="text-dark/70 text-sm max-w-lg">
          {connectedToClaude
            ? "Your live Google data is flowing into Claude — just ask, in plain English. Sessions, rankings, conversions, all of it."
            : "Arlo pipes your Google data straight into Claude. Copy your link, paste it into Claude once, and start asking."}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-6">
        <a
          href="https://claude.ai/new"
          target="_blank"
          rel="noreferrer"
          onClick={() => track("open_claude", { from: "dashboard_hero" })}
          className="inline-flex items-center gap-2 bg-dark text-white px-5 py-2.5 rounded font-mono text-xs uppercase tracking-wider hover:opacity-90"
        >
          Open Claude <ArrowUpRight size={14} />
        </a>
        <button
          onClick={copyMcpUrl}
          disabled={busy}
          className="inline-flex items-center gap-2 border border-dark/25 px-5 py-2.5 rounded font-mono text-xs uppercase tracking-wider hover:bg-dark/5 disabled:opacity-50"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : busy ? "…" : "Copy MCP URL"}
        </button>
      </div>
    </div>
  );
}

/** Compact status panel that sits beside the hero. */
export function StatusPanel({
  liveLabels,
  connectedToClaude,
  lastUsedAt,
}: {
  liveLabels: string[];
  connectedToClaude: boolean;
  lastUsedAt?: string | null;
}) {
  const last = relativeTime(lastUsedAt);
  return (
    <div className="rounded-lg border border-dark-faded bg-white p-6 flex flex-col">
      <p className="font-mono text-xs uppercase tracking-wider text-dark/60 mb-4">Status</p>
      <ul className="space-y-2.5 flex-1">
        {liveLabels.map((label) => (
          <li key={label} className="flex items-center gap-2 text-sm text-dark">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 shrink-0">
              <Check size={10} strokeWidth={3} className="text-white" />
            </span>
            <span className="truncate">{label}</span>
          </li>
        ))}
        {liveLabels.length === 0 && (
          <li className="text-sm text-dark/50">No sources mapped yet.</li>
        )}
      </ul>
      <div className="border-t border-dark-faded pt-3 mt-3">
        {connectedToClaude ? (
          <p className="flex items-center gap-2 text-sm text-emerald-700">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 shrink-0">
              <Check size={10} strokeWidth={3} className="text-white" />
            </span>
            In Claude{last ? ` · active ${last}` : ""}
          </p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-dark/50">
            <span className="h-4 w-4 rounded-full border border-dark/25 shrink-0" />
            Not connected to Claude yet
          </p>
        )}
      </div>
    </div>
  );
}
