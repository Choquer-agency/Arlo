"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import {
  enabledSourcesFor,
  sourceState,
  type Account,
} from "@/lib/googleSources";
import { useWidgetData } from "./useWidgetData";

const RANGE = { preset: "last_28_days" as const };

/**
 * One business in the portfolio dashboard. Shows setup progress + per-source
 * status chips, and — where GA4 / Search Console are mapped — the live headline
 * numbers pulled on page load. Where nothing is mapped, a single honest CTA.
 */
export function BusinessCard({
  workspaceId,
  client,
  googleConnected,
  availableAccounts,
}: {
  workspaceId: Id<"workspaces">;
  client: Doc<"clients">;
  googleConnected: boolean;
  availableAccounts: Account[];
}) {
  const enabled = enabledSourcesFor(client);
  const enabledDenom = Math.max(enabled.length, 1);
  const connectedSources = enabled.filter(
    (s) => sourceState(client, s, availableAccounts).state === "live"
  );
  const live = connectedSources.length;
  const hasGa4 = !!client.ga4PropertyId;
  const hasGsc = !!client.gscSiteUrl;

  const ga4 = useWidgetData({
    workspaceId,
    clientId: client._id,
    kind: "ga4_headline",
    dateRange: RANGE,
    enabled: googleConnected && hasGa4,
  });
  const gsc = useWidgetData({
    workspaceId,
    clientId: client._id,
    kind: "gsc_overview",
    dateRange: RANGE,
    enabled: googleConnected && hasGsc,
  });

  const href = `/clients/${client._id}`;

  return (
    <div className="bg-white border border-dark-faded rounded-lg p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <Link href={href} className="font-sans text-fluid-h5 text-dark hover:underline underline-offset-2">
            {client.name}
          </Link>
          <p className="font-mono text-xs text-dark/50 mt-1">
            {client.websiteUrl ?? "No website set"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusPill live={live} total={enabled.length} googleConnected={googleConnected} />
          <Link
            href={href}
            className="font-mono text-[11px] uppercase tracking-wider text-dark/70 hover:text-dark border border-dark-faded rounded px-3 py-1.5"
          >
            Open →
          </Link>
        </div>
      </div>

      {/* Sources this business opts into */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-dark/60">
            {live} connected
          </span>
          <Link
            href={href}
            className="font-mono text-[11px] uppercase tracking-wider text-dark/60 hover:text-dark inline-flex items-center gap-1"
          >
            + Connect more
          </Link>
        </div>
        <div className="h-1.5 bg-grey border border-dark-faded rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-brand-lime transition-[width]"
            style={{ width: `${Math.max(4, (live / enabledDenom) * 100)}%` }}
          />
        </div>
      </div>

      {/* Chips — only sources actually connected (mapped & pulling data) */}
      {connectedSources.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {connectedSources.map((s) => (
            <span
              key={s.key}
              className="inline-flex items-center gap-2 bg-grey border border-dark-faded rounded-lg px-2.5 py-1.5 text-sm"
            >
              <span
                className="w-4 h-4 rounded flex items-center justify-center text-white text-[9px]"
                style={{ backgroundColor: s.color }}
              >
                {s.glyph}
              </span>
              <span className="text-dark">{s.short}</span>
              <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-mint text-brand">
                Live
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Metrics where live, else a single CTA */}
      {hasGa4 || hasGsc ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4">
          {hasGa4 && (
            <>
              <Metric label="Sessions · 28d" value={fmt(ga4.data?.totals.sessions)} loading={ga4.loading} error={!!ga4.error} />
              <Metric label="New users" value={fmt(ga4.data?.totals.newUsers)} loading={ga4.loading} error={!!ga4.error} />
            </>
          )}
          {hasGsc && (
            <>
              <Metric label="GSC clicks" value={fmt(gsc.data?.totals.clicks)} loading={gsc.loading} error={!!gsc.error} />
              <Metric label="Avg. position" value={fmt1(gsc.data?.totals.position)} loading={gsc.loading} error={!!gsc.error} />
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 mt-4 px-3.5 py-3 rounded-lg bg-bg-yellow/25 border border-bg-yellow/60">
          <TriangleAlert size={15} className="text-dark/70 shrink-0" />
          <p className="text-sm text-dark/80 flex-1 min-w-0">
            {googleConnected
              ? `Google's connected, but no sources are mapped to ${client.name} yet — so there's nothing for Claude to read.`
              : `Connect Google to start pulling ${client.name}'s numbers.`}
          </p>
          <Link
            href={googleConnected ? href : "/connections"}
            className="font-mono text-[11px] uppercase tracking-wider text-dark/80 hover:text-dark border border-dark/20 rounded px-3 py-1.5 shrink-0"
          >
            {googleConnected ? "Finish setup →" : "Connect →"}
          </Link>
        </div>
      )}
    </div>
  );
}

function StatusPill({ live, total, googleConnected }: { live: number; total: number; googleConnected: boolean }) {
  if (!googleConnected) {
    return <Pill className="bg-grey text-dark/60">Not connected</Pill>;
  }
  if (live === 0) {
    return <Pill className="bg-bg-yellow/40 text-dark">Needs setup</Pill>;
  }
  return <Pill className="bg-mint text-brand">{live} of {total} live</Pill>;
}

function Pill({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded ${className}`}>
      {children}
    </span>
  );
}

function Metric({
  label,
  value,
  loading,
  error,
}: {
  label: string;
  value: string;
  loading: boolean;
  error: boolean;
}) {
  return (
    <div className="bg-grey border border-dark-faded rounded-lg p-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-dark/60">{label}</p>
      {loading ? (
        <div className="h-6 w-16 bg-dark/10 rounded animate-pulse mt-1.5" />
      ) : (
        <p className="font-sans text-fluid-h5 text-dark mt-1 tabular-nums">{error ? "—" : value}</p>
      )}
    </div>
  );
}

function fmt(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
function fmt1(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  return n.toFixed(1);
}
