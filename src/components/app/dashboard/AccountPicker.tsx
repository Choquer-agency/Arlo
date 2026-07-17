"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { Check, RefreshCw, Search, ChevronDown } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { track } from "@/lib/posthog";

interface Account {
  id: string;
  name: string;
  kind: string;
}

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
  const options = accounts.filter((a) => a.kind === accountKind);

  const [selected, setSelected] = useState<string>(options[0]?.id ?? "");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  const rowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOpt = options.find((o) => o.id === selected);
  const isSaved = savedId !== null && savedId === selected;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
    );
  }, [options, query]);

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      await updateAssignments({ workspaceId, clientId, [assignmentField]: selected });
      track("source_mapped", { field: assignmentField, kind: accountKind });
      setSavedId(selected);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  if (options.length === 0) {
    return (
      <div className="rounded-lg bg-grey p-5 text-sm text-dark/70">
        <p>
          Your Google account doesn&apos;t have any {label.toLowerCase()} we can read. Make sure the
          right account has access in Google.
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

  const fieldH = "h-10"; // shared height so the select + button line up exactly

  return (
    <div>
      {/* Select + action, one row, matching heights. */}
      <div ref={rowRef} className="relative flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`${fieldH} flex-1 min-w-0 flex items-center justify-between gap-2 px-3 border border-dark-faded rounded-lg bg-white text-sm text-left focus:outline-none focus:border-[#8F93FF]`}
        >
          <span className={`truncate ${selectedOpt ? "text-dark" : "text-dark/40"}`}>
            {selectedOpt
              ? `${selectedOpt.name}${selectedOpt.id !== selectedOpt.name ? ` · ${selectedOpt.id}` : ""}`
              : `Select a ${label.toLowerCase()}…`}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-dark/40 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        <button
          onClick={save}
          disabled={!selected || saving}
          className={`${fieldH} shrink-0 inline-flex items-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-all disabled:opacity-50 ${
            isSaved
              ? "bg-[#14181c] text-white"
              : "bg-[#D0FF71] text-[#14181c] hover:brightness-95"
          }`}
        >
          {saving ? (
            "Saving…"
          ) : isSaved ? (
            <>
              <Check size={15} strokeWidth={2.5} /> Mapped
            </>
          ) : (
            "Use this"
          )}
        </button>

        {/* Full-width dropdown, overlaid so it doesn't push the row taller. */}
        {open && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1.5 rounded-xl border border-dark-faded bg-white shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-dark-faded">
              <Search size={15} className="shrink-0 text-dark/40" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full bg-transparent text-sm focus:outline-none placeholder:text-dark/40"
              />
              {query && (
                <span className="shrink-0 font-mono text-[10px] text-dark/40 tabular-nums">
                  {matches.length}
                </span>
              )}
            </div>
            <ul className="max-h-64 overflow-auto py-1">
              {matches.length === 0 ? (
                <li className="px-3 py-2 text-sm text-dark/50">No matches</li>
              ) : (
                matches.map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(o.id);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-grey ${
                        o.id === selected ? "bg-mint" : ""
                      }`}
                    >
                      <Check
                        size={14}
                        className={`shrink-0 ${o.id === selected ? "text-[#3f7a1e]" : "text-transparent"}`}
                      />
                      <span className="truncate">
                        {o.name}
                        {o.id !== o.name && <span className="text-dark/40"> · {o.id}</span>}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
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
