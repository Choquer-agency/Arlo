"use client";

import { Activity } from "lucide-react";
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

export function Ga4Widget({
  workspaceId,
  client,
  googleConnection,
}: {
  workspaceId: Id<"workspaces">;
  client: Doc<"clients">;
  googleConnection: Doc<"platformConnections"> | null;
}) {
  const isConnected = googleConnection?.status === "active";
  const isAssigned = !!client.ga4PropertyId;

  const headline = useWidgetData({
    workspaceId,
    clientId: client._id,
    kind: "ga4_headline",
    dateRange: RANGE,
    enabled: isConnected && isAssigned,
  });
  const topPages = useWidgetData({
    workspaceId,
    clientId: client._id,
    kind: "ga4_top_pages",
    dateRange: RANGE,
    enabled: isConnected && isAssigned,
  });

  const detail = isAssigned ? client.ga4PropertyId! : "Last 28 days";
  let body: React.ReactNode;
  let status: React.ReactNode;

  if (!isConnected) {
    status = <NotConnectedPill />;
    body = (
      <ConnectGoogleCta valueProp="Track sessions, new users, conversion rate, and where your traffic comes from. The baseline for almost every question Claude can answer." />
    );
  } else if (!isAssigned) {
    status = <NeedsAssignmentPill />;
    body = (
      <AccountPicker
        workspaceId={workspaceId}
        clientId={client._id}
        accounts={googleConnection?.availableAccounts ?? []}
        accountKind="ga4_property"
        assignmentField="ga4PropertyId"
        label="GA4 property"
      />
    );
  } else if (headline.error) {
    status = <ConnectedPill />;
    body = <WidgetError message={headline.error.message} onRetry={headline.refetch} />;
  } else {
    status = <ConnectedPill />;
    const totals = headline.data?.totals ?? {};
    const dur = totals.averageSessionDuration ?? 0;
    const minutes = Math.floor(dur / 60);
    const seconds = Math.round(dur % 60);
    body = (
      <>
        <MetricGrid
          loading={headline.loading || !headline.data}
          metrics={[
            { label: "Sessions", value: fmt(totals.sessions) },
            { label: "New users", value: fmt(totals.newUsers) },
            { label: "Conversions", value: fmt(totals.conversions) },
            {
              label: "Avg session",
              value: dur ? `${minutes}m ${seconds}s` : "—",
            },
          ]}
        />
        <TopItemsList
          loading={topPages.loading || !topPages.data}
          label="Top landing pages"
          items={
            (topPages.data?.breakdown ?? []).slice(0, 5).map((row) => ({
              left: row.dimensions?.landingPage ?? "—",
              right: `${fmt(row.metrics.sessions)} sessions · ${fmt(row.metrics.conversions)} conv`,
            }))
          }
        />
      </>
    );
  }

  return (
    <PlatformWidget
      icon={<Activity size={16} />}
      color="#E37400"
      platform="Google Analytics 4"
      detail={detail}
      status={status}
      prompts={[
        "How many sessions did I get this week vs last week?",
        "Which landing pages have the highest conversion rate?",
        "Compare my sessions this month to the same month last year — what's different?",
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
