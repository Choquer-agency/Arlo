"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { Plus, MessageSquare, Pause, Play, Trash2, PlayCircle, ChevronDown, ChevronUp } from "lucide-react";
import { findDestination, SYNC_MODE_LABELS } from "@/lib/destinations/catalog";
import { DestinationWizard } from "@/components/destinations/DestinationWizard";

type TabKey = "overview" | "destinations";

export default function ClientDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const clientId = (Array.isArray(rawId) ? rawId[0] : rawId) as Id<"clients"> | undefined;

  const workspaces = useQuery(api.workspaces.listMine);
  const ws = workspaces?.[0];
  const client = useQuery(
    api.clients.get,
    ws && clientId ? { workspaceId: ws._id, clientId } : "skip"
  );

  const [tab, setTab] = useState<TabKey>("overview");

  if (!clientId) return null;

  if (client === null) {
    return (
      <div className="max-w-container mx-auto">
        <p className="font-sans text-fluid-h4 text-dark">Client not found</p>
        <Link href="/clients" className="font-mono text-xs uppercase tracking-wider text-brand">
          ← Back to all clients
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-container mx-auto">
      <Link
        href="/clients"
        className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 hover:opacity-100 mb-4 inline-block"
      >
        ← All clients
      </Link>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div className="flex items-baseline gap-4 flex-wrap">
          <h1 className="font-sans text-fluid-h2 text-dark">
            {client?.name ?? "Loading…"}
          </h1>
          {client?.websiteUrl && (
            <p className="font-mono text-sm text-dark opacity-60">{client.websiteUrl}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-dark-faded mb-8">
        <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>
          Overview
        </TabButton>
        <TabButton active={tab === "destinations"} onClick={() => setTab("destinations")}>
          Destinations
        </TabButton>
      </div>

      {tab === "overview" && ws && <ClientOverview client={client} />}
      {tab === "destinations" && ws && (
        <ClientDestinations workspaceId={ws._id} clientId={clientId} clientName={client?.name ?? ""} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 font-mono text-xs uppercase tracking-wider border-b-2 -mb-px transition-colors ${
        active
          ? "border-brand text-dark"
          : "border-transparent text-dark opacity-60 hover:opacity-100"
      }`}
    >
      {children}
    </button>
  );
}

function ClientOverview({ client }: { client: Doc<"clients"> | undefined | null }) {
  if (!client) return <p className="text-dark opacity-60">Loading…</p>;
  const assignments = [
    { key: "ga4", label: "GA4 property", value: client.ga4PropertyId },
    { key: "gsc", label: "Search Console", value: client.gscSiteUrl },
    { key: "ga", label: "Google Ads", value: client.googleAdsCustomerId },
    { key: "yt", label: "YouTube channel", value: client.youtubeChannelId },
    { key: "gbp", label: "Business Profile", value: client.gbpLocationName },
    { key: "meta", label: "Meta ad account", value: client.metaAdAccountId },
    { key: "shopify", label: "Shopify store", value: client.shopifyStoreDomain },
  ];
  return (
    <section className="bg-white border border-dark-faded rounded-lg p-8">
      <h2 className="font-sans text-fluid-h4 text-dark mb-1">Platform assignments</h2>
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-6">
        Connected account IDs for this client
      </p>
      <div className="space-y-3">
        {assignments.map((a) => (
          <div
            key={a.key}
            className="flex items-center justify-between py-3 border-b border-dark-faded last:border-0"
          >
            <p className="font-sans text-dark">{a.label}</p>
            <p className="font-mono text-xs text-dark opacity-60">
              {a.value ?? "— not assigned"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ClientDestinations({
  workspaceId,
  clientId,
  clientName,
}: {
  workspaceId: Id<"workspaces">;
  clientId: Id<"clients">;
  clientName: string;
}) {
  const destinations = useQuery(api.destinations.listForClient, { workspaceId, clientId });
  const pause = useMutation(api.destinations.pause);
  const resume = useMutation(api.destinations.resume);
  const remove = useMutation(api.destinations.remove);
  const runNow = useMutation(api.destinationSyncs.runNow);

  const [wizardOpen, setWizardOpen] = useState(false);

  if (destinations === undefined) {
    return <p className="text-dark opacity-60">Loading destinations…</p>;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-5 gap-4">
        <div>
          <h2 className="font-sans text-fluid-h4 text-dark">Destinations</h2>
          <p className="text-dark opacity-60 text-fluid-small mt-1">
            Where {clientName || "this client"}&apos;s data gets delivered. Scoped to this client only.
          </p>
        </div>
        <button
          onClick={() => setWizardOpen(true)}
          className="btn-secondary px-5 py-2.5 inline-flex items-center gap-2 text-base"
        >
          <Plus size={16} /> Add destination
        </button>
      </div>

      {destinations.length === 0 ? (
        <div className="bg-white border border-dark-faded rounded-lg p-12 text-center">
          <MessageSquare className="mx-auto mb-4 text-dark opacity-40" size={28} />
          <p className="font-sans text-fluid-h5 text-dark mb-2">No destinations yet</p>
          <p className="text-dark opacity-60 text-fluid-main mb-5 max-w-md mx-auto">
            Push this client&apos;s numbers to Slack, Sheets, Looker, or a branded PDF.
            We&apos;ll start with Slack digests — paste a webhook, pick sources, pick cadence.
          </p>
          <button
            onClick={() => setWizardOpen(true)}
            className="btn-secondary px-6 py-3"
          >
            Add your first destination
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {destinations.map((d: Doc<"destinations">) => (
            <DestinationRow
              key={d._id}
              workspaceId={workspaceId}
              destination={d}
              onPause={() => pause({ workspaceId, destinationId: d._id })}
              onResume={() => resume({ workspaceId, destinationId: d._id })}
              onRunNow={() => runNow({ workspaceId, destinationId: d._id })}
              onRemove={() => {
                if (confirm(`Remove destination "${d.name}"? This also removes its syncs.`)) {
                  remove({ workspaceId, destinationId: d._id });
                }
              }}
            />
          ))}
        </div>
      )}

      {wizardOpen && (
        <DestinationWizard
          workspaceId={workspaceId}
          clientId={clientId}
          clientName={clientName}
          onClose={() => setWizardOpen(false)}
        />
      )}
    </section>
  );
}

function DestinationRow({
  workspaceId,
  destination,
  onPause,
  onResume,
  onRunNow,
  onRemove,
}: {
  workspaceId: Id<"workspaces">;
  destination: Doc<"destinations">;
  onPause: () => void;
  onResume: () => void;
  onRunNow: () => void;
  onRemove: () => void;
}) {
  const catalog = findDestination(destination.kind);
  const color = catalog?.color ?? "#4A154B";
  const paused = destination.status === "paused";
  const errored = destination.status === "error";
  const [historyOpen, setHistoryOpen] = useState(false);
  const runs = useQuery(
    api.destinationRuns.listForDestination,
    historyOpen ? { workspaceId, destinationId: destination._id, limit: 10 } : "skip"
  );

  return (
    <div
      className={`bg-white border rounded-lg ${
        errored ? "border-bg-red/40" : "border-dark-faded"
      }`}
    >
      <div className="flex items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="w-10 h-10 rounded flex items-center justify-center font-display text-white shrink-0"
            style={{ backgroundColor: color }}
          >
            {(catalog?.name ?? destination.kind).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-sans text-dark truncate">{destination.name}</p>
            <p className="font-mono text-[11px] text-dark opacity-60 mt-0.5 truncate">
              {catalog?.name ?? destination.kind} ·{" "}
              {SYNC_MODE_LABELS[destination.mode as "live" | "push" | "digest"] ?? destination.mode}
              {destination.lastRunAt ? ` · last run ${destination.lastRunAt}` : ""}
            </p>
            {errored && destination.lastError && (
              <p className="font-mono text-[11px] text-bg-red mt-1 truncate">
                {destination.lastError}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded ${
              destination.status === "active"
                ? "bg-mint text-brand"
                : errored
                ? "bg-bg-red/10 text-bg-red"
                : "bg-grey text-dark"
            }`}
          >
            {destination.status}
          </span>
          <button
            onClick={onRunNow}
            disabled={paused}
            className="p-2 border border-dark-faded rounded hover:bg-grey disabled:opacity-40 disabled:cursor-not-allowed"
            title="Run now"
          >
            <PlayCircle size={14} />
          </button>
          {paused ? (
            <button
              onClick={onResume}
              className="p-2 border border-dark-faded rounded hover:bg-grey"
              title="Resume"
            >
              <Play size={14} />
            </button>
          ) : (
            <button
              onClick={onPause}
              className="p-2 border border-dark-faded rounded hover:bg-grey"
              title="Pause"
            >
              <Pause size={14} />
            </button>
          )}
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="p-2 border border-dark-faded rounded hover:bg-grey"
            title="Run history"
          >
            {historyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={onRemove}
            className="p-2 border border-bg-red/30 text-bg-red rounded hover:bg-bg-red/10"
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {historyOpen && (
        <div className="border-t border-dark-faded px-5 py-4 bg-grey">
          <p className="font-mono text-[11px] uppercase tracking-wider text-dark opacity-60 mb-3">
            Recent runs
          </p>
          {runs === undefined ? (
            <p className="text-dark opacity-60 text-sm">Loading…</p>
          ) : runs.length === 0 ? (
            <p className="text-dark opacity-60 text-sm">No runs yet. Hit Run now to trigger one.</p>
          ) : (
            <div className="space-y-1">
              {runs.map((r: Doc<"destinationRuns">) => (
                <div
                  key={r._id}
                  className="flex items-center justify-between bg-white border border-dark-faded rounded px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                        r.status === "success"
                          ? "bg-mint text-brand"
                          : r.status === "error"
                          ? "bg-bg-red/10 text-bg-red"
                          : "bg-grey text-dark opacity-60"
                      }`}
                    >
                      {r.status}
                    </span>
                    <span className="font-mono text-[11px] text-dark opacity-60">
                      {new Date(r.startedAt).toLocaleString()}
                    </span>
                    {r.errorMessage && (
                      <span className="font-mono text-[11px] text-bg-red truncate">
                        {r.errorMessage}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-dark opacity-60 shrink-0">
                    {r.durationMs != null ? `${r.durationMs}ms` : "—"}
                    {r.rowsWritten != null ? ` · ${r.rowsWritten} rows` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

