"use client";

import { MapPin } from "lucide-react";
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

export function GbpWidget({
  workspaceId,
  client,
  googleConnection,
}: {
  workspaceId: Id<"workspaces">;
  client: Doc<"clients">;
  googleConnection: Doc<"platformConnections"> | null;
}) {
  const isConnected = googleConnection?.status === "active";
  const isAssigned = !!client.gbpLocationName;

  const overview = useWidgetData({
    workspaceId,
    clientId: client._id,
    kind: "gbp_overview",
    dateRange: RANGE,
    enabled: isConnected && isAssigned,
  });
  const breakdown = useWidgetData({
    workspaceId,
    clientId: client._id,
    kind: "gbp_breakdown",
    dateRange: RANGE,
    enabled: isConnected && isAssigned,
  });

  const detail = isAssigned ? client.gbpLocationName! : "Last 28 days";
  let body: React.ReactNode;
  let status: React.ReactNode;

  if (!isConnected) {
    status = <NotConnectedPill />;
    body = (
      <ConnectGoogleCta valueProp="Track Maps views, direction requests, calls, and reviews. Critical for any business with a physical location — Claude can tell you what's driving foot traffic." />
    );
  } else if (!isAssigned) {
    status = <NeedsAssignmentPill />;
    body = (
      <AccountPicker
        workspaceId={workspaceId}
        clientId={client._id}
        accounts={googleConnection?.availableAccounts ?? []}
        accountKind="gbp_location"
        assignmentField="gbpLocationName"
        label="Business Profile location"
      />
    );
  } else if (overview.error) {
    status = <ConnectedPill />;
    body = <WidgetError message={overview.error.message} onRetry={overview.refetch} />;
  } else {
    status = <ConnectedPill />;
    const totals = overview.data?.totals ?? {};
    const mapsImpr =
      (totals.BUSINESS_IMPRESSIONS_DESKTOP_MAPS ?? 0) +
      (totals.BUSINESS_IMPRESSIONS_MOBILE_MAPS ?? 0);
    const breakdownTotals = breakdown.data?.totals ?? {};
    body = (
      <>
        <MetricGrid
          loading={overview.loading || !overview.data}
          metrics={[
            { label: "Maps impressions", value: fmt(mapsImpr) },
            { label: "Direction requests", value: fmt(totals.BUSINESS_DIRECTION_REQUESTS) },
            { label: "Calls", value: fmt(totals.CALL_CLICKS) },
            { label: "Website clicks", value: fmt(breakdownTotals.WEBSITE_CLICKS) },
          ]}
        />
        <TopItemsList
          loading={breakdown.loading || !breakdown.data}
          label="Action breakdown · last 28 days"
          items={[
            {
              left: "Direction requests",
              right: fmt(breakdownTotals.BUSINESS_DIRECTION_REQUESTS),
            },
            { left: "Website clicks from Maps", right: fmt(breakdownTotals.WEBSITE_CLICKS) },
            { left: "Calls", right: fmt(breakdownTotals.CALL_CLICKS) },
          ]}
        />
      </>
    );
  }

  return (
    <PlatformWidget
      icon={<MapPin size={16} />}
      color="#EA4335"
      platform="Google Business Profile"
      detail={detail}
      status={status}
      prompts={[
        "How many direction requests did I get this month vs last?",
        "Cross-reference my Business Profile website clicks with GA4 sessions — is Maps actually driving traffic?",
        "Which day of the week has the most direction requests? Am I staffed right for that traffic?",
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
