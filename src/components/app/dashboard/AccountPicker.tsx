"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Check } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

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
}) {
  const updateAssignments = useMutation(api.clients.updateAssignments);
  const filtered = accounts.filter((a) => a.kind === accountKind);
  const [selected, setSelected] = useState<string>(filtered[0]?.id ?? "");
  const [saving, setSaving] = useState(false);

  if (filtered.length === 0) {
    return (
      <div className="rounded-lg bg-grey p-5 text-sm text-dark/70">
        Your Google account doesn&apos;t have any {label.toLowerCase()} we can read.
        Make sure the right account has access in Google.
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
    </div>
  );
}
