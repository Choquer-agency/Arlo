"use client";

import { Video } from "lucide-react";
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

export function YoutubeWidget({
  workspaceId,
  client,
  googleConnection,
}: {
  workspaceId: Id<"workspaces">;
  client: Doc<"clients">;
  googleConnection: Doc<"platformConnections"> | null;
}) {
  const isConnected = googleConnection?.status === "active";
  const isAssigned = !!client.youtubeChannelId;

  const overview = useWidgetData({
    workspaceId,
    clientId: client._id,
    kind: "youtube_overview",
    dateRange: RANGE,
    enabled: isConnected && isAssigned,
  });
  const topVideos = useWidgetData({
    workspaceId,
    clientId: client._id,
    kind: "youtube_top_videos",
    dateRange: RANGE,
    enabled: isConnected && isAssigned,
  });

  const detail = isAssigned ? client.youtubeChannelId! : "Last 28 days";
  let body: React.ReactNode;
  let status: React.ReactNode;

  if (!isConnected) {
    status = <NotConnectedPill />;
    body = (
      <ConnectGoogleCta valueProp="Watch time, subscriber growth, top videos, and traffic-source breakdowns. Useful if YouTube is part of how customers find you." />
    );
  } else if (!isAssigned) {
    status = <NeedsAssignmentPill />;
    body = (
      <AccountPicker
        workspaceId={workspaceId}
        clientId={client._id}
        accounts={googleConnection?.availableAccounts ?? []}
        accountKind="yt_channel"
        assignmentField="youtubeChannelId"
        label="YouTube channel"
      />
    );
  } else if (overview.error) {
    status = <ConnectedPill />;
    body = <WidgetError message={overview.error.message} onRetry={overview.refetch} />;
  } else {
    status = <ConnectedPill />;
    const totals = overview.data?.totals ?? {};
    const watch = totals.estimatedMinutesWatched ?? 0;
    const watchH = Math.round(watch / 60);
    const avgDur = totals.averageViewDuration ?? 0;
    body = (
      <>
        <MetricGrid
          loading={overview.loading || !overview.data}
          metrics={[
            { label: "Views", value: fmt(totals.views) },
            { label: "Watch time", value: watch ? `${watchH.toLocaleString()}h` : "—" },
            { label: "Subs gained", value: fmt(totals.subscribersGained) },
            { label: "Avg view dur", value: avgDur ? `${Math.round(avgDur)}s` : "—" },
          ]}
        />
        <TopItemsList
          loading={topVideos.loading || !topVideos.data}
          label="Top videos"
          items={
            (topVideos.data?.breakdown ?? []).slice(0, 5).map((row) => ({
              left: row.dimensions?.video ?? "—",
              right: `${fmt(row.metrics.views)} views`,
            }))
          }
        />
      </>
    );
  }

  return (
    <PlatformWidget
      icon={<Video size={16} />}
      color="#FF0000"
      platform="YouTube"
      detail={detail}
      status={status}
      prompts={[
        "Which of my videos got the most views in the last 30 days?",
        "Where are viewers dropping off in my top video?",
        "Compare YouTube viewers to my organic search traffic — do they convert differently?",
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
