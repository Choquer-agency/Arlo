"use client";

import { Megaphone } from "lucide-react";
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

export function GoogleAdsWidget({
  workspaceId,
  client,
  googleConnection,
}: {
  workspaceId: Id<"workspaces">;
  client: Doc<"clients">;
  googleConnection: Doc<"platformConnections"> | null;
}) {
  const isConnected = googleConnection?.status === "active";
  const isAssigned = !!client.googleAdsCustomerId;

  const overview = useWidgetData({
    workspaceId,
    clientId: client._id,
    kind: "google_ads_overview",
    dateRange: RANGE,
    enabled: isConnected && isAssigned,
  });
  const topCampaigns = useWidgetData({
    workspaceId,
    clientId: client._id,
    kind: "google_ads_top_campaigns",
    dateRange: RANGE,
    enabled: isConnected && isAssigned,
  });

  const detail = isAssigned ? `Customer ${client.googleAdsCustomerId}` : "Last 28 days";
  let body: React.ReactNode;
  let status: React.ReactNode;

  if (!isConnected) {
    status = <NotConnectedPill />;
    body = (
      <ConnectGoogleCta valueProp="Spend, conversions, ROAS, CPA, and search-term insights — see what's working and what's wasting budget." />
    );
  } else if (!isAssigned) {
    status = <NeedsAssignmentPill />;
    body = (
      <AccountPicker
        workspaceId={workspaceId}
        clientId={client._id}
        accounts={googleConnection?.availableAccounts ?? []}
        accountKind="ads_customer"
        assignmentField="googleAdsCustomerId"
        label="Ads customer"
      />
    );
  } else if (overview.error) {
    status = <ConnectedPill />;
    body = <WidgetError message={overview.error.message} onRetry={overview.refetch} />;
  } else {
    status = <ConnectedPill />;
    const totals = overview.data?.totals ?? {};
    const cost = (totals["metrics.cost_micros"] ?? 0) / 1_000_000;
    const conv = totals["metrics.conversions"] ?? 0;
    const value = (totals["metrics.conversions_value"] ?? 0);
    const cpa = conv > 0 ? cost / conv : 0;
    const roas = cost > 0 ? value / cost : 0;
    body = (
      <>
        <MetricGrid
          loading={overview.loading || !overview.data}
          metrics={[
            { label: "Spend", value: cost ? `$${cost.toFixed(2)}` : "—" },
            { label: "Conversions", value: fmt(conv) },
            { label: "CPA", value: cpa ? `$${cpa.toFixed(2)}` : "—" },
            { label: "ROAS", value: roas ? `${roas.toFixed(1)}×` : "—" },
          ]}
        />
        <TopItemsList
          loading={topCampaigns.loading || !topCampaigns.data}
          label="Top campaigns · spend vs conversions"
          items={
            (topCampaigns.data?.breakdown ?? []).slice(0, 5).map((row) => {
              const c = (row.metrics["metrics.cost_micros"] ?? 0) / 1_000_000;
              const v = row.metrics["metrics.conversions"] ?? 0;
              return {
                left: row.dimensions?.["campaign.name"] ?? "—",
                right: `$${c.toFixed(0)} · ${fmt(v)} conv`,
              };
            })
          }
        />
      </>
    );
  }

  return (
    <PlatformWidget
      icon={<Megaphone size={16} />}
      color="#34A853"
      platform="Google Ads"
      detail={detail}
      status={status}
      prompts={[
        "What's my cost per conversion this month vs last month?",
        "Which Google Ads keyword has the worst cost-per-conversion? I probably need to pause it.",
        "For every keyword I pay for, am I also ranking organically? I might be double-paying.",
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
