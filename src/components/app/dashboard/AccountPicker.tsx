"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Check, RefreshCw } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { track } from "@/lib/posthog";

interface Account {
  id: string;
  name: string;
  kind: string;
}

/**
 * Inline picker shown when a Google connection exists but the user hasn't yet
 * mapped one of the discovered accounts (GA4 property, GSC site, Ads customer,
 * etc) to their client. Writes to client.platformAssignments.
 */
export function AccountPicker({
  workspaceId,
  clientId,
  accounts,
  accountKind,
  assignmentField,
  label,
  onSaved,
}: {
  workspaceId: Id<"workspaces">;
  clientId: Id<"clients">;
  accounts: Account[];
  /** Which kind of account to filter for ("ga4_property", "gsc_site", etc.) */
  accountKind: string;
  /** Which field on client.platformAssignments to write */
  assignmentField:
    | "ga4PropertyId"
    | "gscSiteUrl"
    | "googleAdsCustomerId"
    | "youtubeChannelId"
    | "gbpLocationName";
  label: string;
  /** Called after a successful assignment so the parent can collapse the picker. */
  onSaved?: () => void;
}) {
  const updateAssignments = useMutation(api.clients.updateAssignments);
  const filtered = accounts.filter((a) => a.kind === accountKind);
  const [selected, setSelected] = useState<string>(filtered[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  // Re-probe Google for newly-created properties/sites/etc. The connection's
  // availableAccounts is a reactive Convex query, so a successful refresh flows
  // back into `accounts` and re-renders this list automatically.
  async function refresh() {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const res = await fetch("/api/oauth/google/refresh-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRefreshMsg(data.error ?? "Couldn't refresh — try again in a moment.");
      } else {
        setRefreshMsg(
          "List refreshed. Just created it? New properties can take a minute to appear in Google — try again shortly."
        );
      }
    } catch {
      setRefreshMsg("Couldn't refresh — check your connection and try again.");
    } finally {
      setRefreshing(false);
    }
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-lg bg-grey p-5 text-sm text-dark/70">
        <p>
          Your Google account doesn&apos;t have any {label.toLowerCase()} we can read.
          Make sure the right account has access in Google.
        </p>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-dark/60 hover:text-dark disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh list"}
        </button>
        {refreshMsg && <p className="mt-2 text-xs text-dark/60">{refreshMsg}</p>}
      </div>
    );
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      await updateAssignments({
        workspaceId,
        clientId,
        [assignmentField]: selected,
      });
      track("source_mapped", { field: assignmentField, kind: accountKind });
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-dark/20 p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-dark/60 mb-2">
        Pick a {label.toLowerCase()}
      </p>
      <p className="text-dark/70 text-sm mb-4">
        Google connected — pick which {label.toLowerCase()} maps to your business.
      </p>
      <div className="flex gap-2 flex-wrap">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="flex-1 min-w-[14rem] px-3 py-2 border border-dark-faded rounded bg-white font-sans text-sm focus:outline-none focus:border-brand"
        >
          {filtered.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} {a.id !== a.name ? `· ${a.id}` : ""}
            </option>
          ))}
        </select>
        <button
          onClick={save}
          disabled={!selected || saving}
          className="btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? "Saving…" : (
            <>
              <Check size={14} /> Use this
            </>
          )}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        <button
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-dark/60 hover:text-dark disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh list"}
        </button>
        <span className="text-xs text-dark/50">
          Don&apos;t see it? Just-created {label.toLowerCase()} can take a minute to appear.
        </span>
      </div>
      {refreshMsg && <p className="mt-2 text-xs text-dark/60">{refreshMsg}</p>}
    </div>
  );
}
