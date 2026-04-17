"use client";

import { Search } from "lucide-react";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import {
  ConnectGoogleCta,
  ConnectedPill,
  MetricGrid,
  NeedsAssignmentPill,
  NotConnectedPill,
  PlatformWidget,
  TopItemsList,
  WidgetError,
} from "./PlatformWidget";
import { AccountPicker } from "./AccountPicker";
import { useWidgetData } from "./useWidgetData";

const RANGE = { preset: "last_28_days" as const };

export function GscWidget({
  workspaceId,
  client,
  googleConnection,
}: {
  workspaceId: Id<"workspaces">;
  client: Doc<"clients">;
  googleConnection: Doc<"platformConnections"> | null;
}) {
  const isConnected = googleConnection?.status === "active";
  const isAssigned = !!client.gscSiteUrl;

  const overview = useWidgetData({
    workspaceId,
    clientId: client._id,
    kind: "gsc_overview",
    dateRange: RANGE,
    enabled: isConnected && isAssigned,
  });
  const topQueries = useWidgetData({
    workspaceId,
    clientId: client._id,
    kind: "gsc_top_queries",
    dateRange: RANGE,
    enabled: isConnected && isAssigned,
  });

  const detail = isAssigned ? client.gscSiteUrl! : "Last 28 days";
  let body: React.ReactNode;
  let status: React.ReactNode;

  if (!isConnected) {
    status = <NotConnectedPill />;
    body = (
      <ConnectGoogleCta valueProp="See the queries people search to find you, your CTR by position, and which pages are ranking on page 2 and close to breaking into page 1." />
    );
  } else if (!isAssigned) {
    status = <NeedsAssignmentPill />;
    body = (
      <AccountPicker
        workspaceId={workspaceId}
        clientId={client._id}
        accounts={googleConnection?.availableAccounts ?? []}
        accountKind="gsc_site"
        assignmentField="gscSiteUrl"
        label="Search Console site"
      />
    );
  } else if (overview.error) {
    status = <ConnectedPill />;
    body = <WidgetError message={overview.error.message} onRetry={overview.refetch} />;
  } else {
    status = <ConnectedPill />;
    const totals = overview.data?.totals ?? {};
    body = (
      <>
        <MetricGrid
          loading={overview.loading || !overview.data}
          metrics={[
            { label: "Clicks", value: fmt(totals.clicks) },
            { label: "Impressions", value: fmt(totals.impressions) },
            { label: "Avg CTR", value: pct(totals.ctr) },
            { label: "Avg position", value: totals.position ? totals.position.toFixed(1) : "—" },
          ]}
        />
        <TopItemsList
          loading={topQueries.loading || !topQueries.data}
          label="Top queries"
          items={
            (topQueries.data?.breakdown ?? []).slice(0, 5).map((row) => ({
              left: row.dimensions?.query ?? "—",
              right: `${fmt(row.metrics.clicks)} clicks · pos ${(row.metrics.position ?? 0).toFixed(1)}`,
            }))
          }
        />
      </>
    );
  }

  return (
    <PlatformWidget
      icon={<Search size={16} />}
      color="#4285F4"
      platform="Search Console"
      detail={detail}
      status={status}
      prompts={[
        "What are the top 10 search terms driving clicks to my site this month?",
        "Which queries have high impressions but low CTR — those titles probably need work.",
        "Which of my pages are ranking on page 2 and closest to breaking into page 1?",
      ]}
    >
      {body}
    </PlatformWidget>
  );
}

function fmt(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

function pct(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  return `${(n * 100).toFixed(1)}%`;
}
