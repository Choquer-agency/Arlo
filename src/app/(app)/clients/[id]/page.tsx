"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useActiveWorkspace } from "@/components/providers/ActingWorkspaceProvider";
import { googleStartHref } from "@/lib/oauth";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { Plus, MessageSquare, Pause, Play, Trash2, PlayCircle, ChevronDown, ChevronUp } from "lucide-react";
import { findDestination, SYNC_MODE_LABELS } from "@/lib/destinations/catalog";
import { DestinationWizard } from "@/components/destinations/DestinationWizard";
import { AccountPicker } from "@/components/app/dashboard/AccountPicker";
import { DEFAULT_ENABLED_KEYS } from "@/lib/googleSources";

type TabKey = "overview" | "destinations";

export default function ClientDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const clientId = (Array.isArray(rawId) ? rawId[0] : rawId) as Id<"clients"> | undefined;

  const { ws } = useActiveWorkspace();
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

      {tab === "overview" && ws && <ClientOverview workspaceId={ws._id} client={client} />}
      {tab === "destinations" && ws && (
        <ClientDestinations workspaceId={ws._id} clientId={clientId} clientName={client?.name ?? ""} />
      )}
    </div>
  );
}

function Toggle({
  checked,
  disabled,
  onChange,
  title,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      title={title}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
        checked ? "bg-brand" : "bg-dark/20"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
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

type GoogleAssignmentField =
  | "ga4PropertyId"
  | "gscSiteUrl"
  | "googleAdsCustomerId"
  | "youtubeChannelId"
  | "gbpLocationName";

type GooglePlatform = {
  key: string;
  /** Stable key stored in client.enabledSources (matches @/lib/googleSources). */
  enableKey: string;
  label: string;
  value: string | undefined;
  accountKind: string;
  assignmentField: GoogleAssignmentField;
  pickerLabel: string;
};

function ClientOverview({
  workspaceId,
  client,
}: {
  workspaceId: Id<"workspaces">;
  client: Doc<"clients"> | undefined | null;
}) {
  const connection = useQuery(api.platformConnections.getByProvider, {
    workspaceId,
    provider: "google",
  });
  const setEnabledSources = useMutation(api.clients.setEnabledSources);
  const [openPicker, setOpenPicker] = useState<string | null>(null);

  if (!client) return <p className="text-dark opacity-60">Loading…</p>;

  const googleConnected = connection?.status === "active";
  const availableAccounts = connection?.availableAccounts ?? [];

  const googlePlatforms: GooglePlatform[] = [
    { key: "ga4", enableKey: "ga4", label: "GA4 property", value: client.ga4PropertyId, accountKind: "ga4_property", assignmentField: "ga4PropertyId", pickerLabel: "GA4 property" },
    { key: "gsc", enableKey: "gsc", label: "Search Console", value: client.gscSiteUrl, accountKind: "gsc_site", assignmentField: "gscSiteUrl", pickerLabel: "Search Console site" },
    { key: "ga", enableKey: "ads", label: "Google Ads", value: client.googleAdsCustomerId, accountKind: "ads_customer", assignmentField: "googleAdsCustomerId", pickerLabel: "Ads customer" },
    { key: "yt", enableKey: "yt", label: "YouTube channel", value: client.youtubeChannelId, accountKind: "yt_channel", assignmentField: "youtubeChannelId", pickerLabel: "YouTube channel" },
    { key: "gbp", enableKey: "gbp", label: "Business Profile", value: client.gbpLocationName, accountKind: "gbp_location", assignmentField: "gbpLocationName", pickerLabel: "Business Profile location" },
  ];
  const enabledBase = client.enabledSources ?? DEFAULT_ENABLED_KEYS;
  const comingSoon = [
    { key: "meta", label: "Meta ad account", value: client.metaAdAccountId },
    { key: "shopify", label: "Shopify store", value: client.shopifyStoreDomain },
  ];

  return (
    <section className="bg-white border border-dark-faded rounded-lg p-8">
      <h2 className="font-sans text-fluid-h4 text-dark mb-1">Platform assignments</h2>
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-6">
        Connected account IDs for this client
      </p>

      {/* Workspace-level Google connection status */}
      {connection === undefined ? null : googleConnected ? (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-mint/40 border border-brand/20 px-4 py-3 mb-6">
          <p className="font-mono text-xs text-brand flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block shrink-0" />
            <span className="truncate">Google connected as {connection?.accountEmail}</span>
          </p>
          <a
            href={googleStartHref(workspaceId)}
            className="font-mono text-[11px] uppercase tracking-wider text-dark opacity-50 hover:opacity-100 shrink-0"
          >
            Reconnect
          </a>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-grey border border-dark-faded px-4 py-3 mb-6">
          <p className="text-dark/70 text-sm">Connect Google to assign accounts to this client.</p>
          <a
            href={googleStartHref(workspaceId)}
            className="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 shrink-0"
          >
            <Plus size={13} /> Connect Google
          </a>
        </div>
      )}

      <p className="font-mono text-[11px] uppercase tracking-wider text-dark/50 mb-3">
        Turn on the sources this business uses — the rest stay hidden.
      </p>
      <div className="space-y-3">
        {googlePlatforms.map((p) => {
          const assigned = !!p.value;
          const enabled = assigned || enabledBase.includes(p.enableKey);
          const pickerOpen = openPicker === p.key;
          const availCount = availableAccounts.filter((a) => a.kind === p.accountKind).length;
          const toggle = () => {
            const set = new Set(enabledBase);
            if (enabled) set.delete(p.enableKey);
            else set.add(p.enableKey);
            setEnabledSources({ workspaceId, clientId: client._id, enabledSources: Array.from(set) });
          };
          return (
            <div
              key={p.key}
              className={`border-b border-dark-faded last:border-0 ${enabled ? "" : "opacity-55"}`}
            >
              <div className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="font-sans text-dark">{p.label}</p>
                  {enabled && googleConnected && !assigned && (
                    <p className="font-mono text-[11px] text-dark opacity-40 mt-0.5">
                      {availCount > 0
                        ? `${availCount} available on this account`
                        : "None on this account"}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {!enabled ? (
                    <span className="font-mono text-[11px] uppercase tracking-wider text-dark opacity-40">
                      Off
                    </span>
                  ) : assigned ? (
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-xs text-dark opacity-60 truncate max-w-[16rem]">{p.value}</p>
                      {googleConnected && availCount > 0 && (
                        <button
                          onClick={() => setOpenPicker(pickerOpen ? null : p.key)}
                          className="font-mono text-[11px] uppercase tracking-wider text-dark opacity-50 hover:opacity-100"
                        >
                          {pickerOpen ? "Cancel" : "Change"}
                        </button>
                      )}
                    </div>
                  ) : connection === undefined ? (
                    <span className="font-mono text-xs text-dark opacity-40">…</span>
                  ) : !googleConnected ? (
                    <span className="font-mono text-[11px] uppercase tracking-wider text-dark opacity-40">
                      Not connected
                    </span>
                  ) : availCount === 0 ? (
                    <span className="font-mono text-[11px] uppercase tracking-wider text-dark opacity-40">
                      None available
                    </span>
                  ) : (
                    <button
                      onClick={() => setOpenPicker(pickerOpen ? null : p.key)}
                      className="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
                    >
                      <Plus size={13} /> {pickerOpen ? "Cancel" : "Choose"}
                    </button>
                  )}
                  <Toggle
                    checked={enabled}
                    disabled={assigned}
                    onChange={toggle}
                    title={
                      assigned
                        ? "Mapped to an account — clear it to turn this off"
                        : enabled
                        ? "Turn off for this business"
                        : "Turn on for this business"
                    }
                  />
                </div>
              </div>
              {enabled && googleConnected && pickerOpen && (
                <div className="pb-4">
                  <AccountPicker
                    workspaceId={workspaceId}
                    clientId={client._id}
                    accounts={availableAccounts}
                    accountKind={p.accountKind}
                    assignmentField={p.assignmentField}
                    label={p.pickerLabel}
                    onSaved={() => setOpenPicker(null)}
                  />
                </div>
              )}
            </div>
          );
        })}
        {comingSoon.map((p) => (
          <div
            key={p.key}
            className="flex items-center justify-between gap-4 py-3 border-b border-dark-faded last:border-0"
          >
            <p className="font-sans text-dark">{p.label}</p>
            {p.value ? (
              <p className="font-mono text-xs text-dark opacity-60 truncate">{p.value}</p>
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-wider text-dark opacity-40 shrink-0">
                Coming soon
              </span>
            )}
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

