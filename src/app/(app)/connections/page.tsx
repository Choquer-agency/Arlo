"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { Check, Plus } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import {
  GOOGLE_SOURCES,
  sourceState,
  type Account,
  type GoogleSourceDef,
} from "@/lib/googleSources";

const COMING_SOON = [
  { name: "Meta", detail: "Ads + Instagram / Facebook organic" },
  { name: "LinkedIn", detail: "Ads + organic" },
  { name: "Shopify", detail: "Orders & storefront" },
  { name: "Stripe", detail: "Revenue & subscriptions" },
];

export default function ConnectionsPage() {
  const workspaces = useQuery(api.workspaces.listMine);
  const ws = workspaces?.[0];
  const connections = useQuery(
    api.platformConnections.listForWorkspace,
    ws ? { workspaceId: ws._id } : "skip"
  );
  const clients = useQuery(
    api.clients.list,
    ws ? { workspaceId: ws._id } : "skip"
  );

  const googleConn = connections?.find((c) => c.provider === "google");
  const googleConnected = googleConn?.status === "active";
  const availableAccounts: Account[] = googleConn?.availableAccounts ?? [];

  return (
    <div className="max-w-container mx-auto">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
        Connections
      </p>
      <h1 className="font-sans text-fluid-h2 text-dark mb-2">Sources &amp; who&apos;s using them</h1>
      <p className="text-dark/60 text-fluid-main max-w-2xl mb-8">
        One Google login unlocks every source. Below is what that login can reach — and
        exactly which source is mapped to which business.
      </p>

      {/* Google account card */}
      <div className="bg-white border border-dark-faded rounded-lg p-6 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-sans text-fluid-h5 text-dark mb-3">Google</h2>
          {googleConnected ? (
            <div className="flex gap-6 flex-wrap">
              {GOOGLE_SOURCES.map((s) => {
                const count = availableAccounts.filter((a) => a.kind === s.kind).length;
                return (
                  <div key={s.key}>
                    <span className="font-sans text-fluid-h5 text-dark tabular-nums">{count}</span>{" "}
                    <span className="font-mono text-[10px] uppercase tracking-wider text-dark/60">
                      {s.short}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-dark/60 text-fluid-small max-w-md">
              Unlocks GA4, Search Console, Google Ads, YouTube, and Business Profile for
              every business in one OAuth.
            </p>
          )}
        </div>
        {googleConnected ? (
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-xs uppercase tracking-wider text-brand bg-mint px-3 py-1.5 rounded">
              ● Connected as {googleConn?.accountEmail}
            </span>
            <a
              href="/api/oauth/google/start"
              className="font-mono text-[11px] uppercase tracking-wider text-dark/50 hover:text-dark"
            >
              Reconnect
            </a>
          </div>
        ) : (
          <a href="/api/oauth/google/start" className="btn-secondary px-6 py-3 shrink-0">
            Connect Google
          </a>
        )}
      </div>

      {/* Business × source matrix */}
      {googleConnected && (
        <>
          <div className="flex items-center justify-between mb-3 mt-8">
            <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60">
              Mapping · business × source
            </p>
            <Link
              href="/clients"
              className="font-mono text-[11px] uppercase tracking-wider text-dark/70 hover:text-dark inline-flex items-center gap-1.5"
            >
              <Plus size={13} /> Add business
            </Link>
          </div>

          {clients === undefined ? (
            <p className="text-dark/40">Loading…</p>
          ) : clients.length === 0 ? (
            <div className="bg-white border border-dark-faded rounded-lg p-10 text-center text-dark/60">
              Add a business first, then map its Google accounts here.
            </div>
          ) : (
            <div className="bg-white border border-dark-faded rounded-lg overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="bg-grey border-b border-dark-faded">
                    <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-dark/60">
                      Business
                    </th>
                    {GOOGLE_SOURCES.map((s) => (
                      <th key={s.key} className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-dark/60">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="w-4 h-4 rounded flex items-center justify-center text-white text-[9px]"
                            style={{ backgroundColor: s.color }}
                          >
                            {s.glyph}
                          </span>
                          {s.short}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c._id} className="border-b border-dark-faded last:border-0">
                      <td className="px-4 py-4 align-middle">
                        <Link href={`/clients/${c._id}`} className="font-sans text-dark hover:underline underline-offset-2">
                          {c.name}
                        </Link>
                        <p className="font-mono text-[11px] text-dark/50">{c.websiteUrl ?? "no website"}</p>
                      </td>
                      {GOOGLE_SOURCES.map((s) => (
                        <td key={s.key} className="px-4 py-4 align-middle">
                          {ws && (
                            <MatrixCell
                              workspaceId={ws._id}
                              client={c}
                              source={s}
                              availableAccounts={availableAccounts}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex gap-5 flex-wrap mt-3">
            <Legend swatch="#1f8f6b" label="Live — mapped & pulling data" />
            <Legend swatch="#ffcc3c" label="Available — pick which account" />
            <Legend swatch="rgba(25,49,51,0.18)" label="None on this Google login" />
          </div>
        </>
      )}

      {/* Coming soon */}
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-3 mt-10">
        More sources
      </p>
      <div className="bg-white border border-dark-faded rounded-lg overflow-hidden">
        {COMING_SOON.map((p, i) => (
          <div
            key={p.name}
            className={`flex items-center justify-between px-5 py-4 ${
              i < COMING_SOON.length - 1 ? "border-b border-dark-faded" : ""
            }`}
          >
            <div>
              <span className="font-sans text-dark">{p.name}</span>{" "}
              <span className="font-mono text-[11px] text-dark/50">{p.detail}</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-dark/40">
              Coming soon
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-dark/60">
      <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: swatch }} />
      {label}
    </span>
  );
}

/**
 * One cell of the matrix: live (value + change), available (compact picker),
 * or none. Writes directly to the client's assignment field.
 */
function MatrixCell({
  workspaceId,
  client,
  source,
  availableAccounts,
}: {
  workspaceId: Id<"workspaces">;
  client: Doc<"clients">;
  source: GoogleSourceDef;
  availableAccounts: Account[];
}) {
  const { state, value, availCount } = sourceState(client, source, availableAccounts);
  const [editing, setEditing] = useState(false);

  if (state === "none") {
    return <span className="font-mono text-[11px] text-dark/35">— none</span>;
  }

  if (state === "live" && !editing) {
    return (
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-mono text-[9px] uppercase tracking-wider text-brand">✓ Live</span>
        <span className="font-mono text-[11px] text-dark/70 truncate max-w-[13rem]" title={value}>
          {value}
        </span>
        {availCount > 1 && (
          <button
            onClick={() => setEditing(true)}
            className="font-mono text-[9px] uppercase tracking-wider text-dark/40 hover:text-dark text-left"
          >
            Change
          </button>
        )}
      </div>
    );
  }

  return (
    <CellPicker
      workspaceId={workspaceId}
      clientId={client._id}
      source={source}
      accounts={availableAccounts}
      onDone={() => setEditing(false)}
    />
  );
}

function CellPicker({
  workspaceId,
  clientId,
  source,
  accounts,
  onDone,
}: {
  workspaceId: Id<"workspaces">;
  clientId: Id<"clients">;
  source: GoogleSourceDef;
  accounts: Account[];
  onDone: () => void;
}) {
  const update = useMutation(api.clients.updateAssignments);
  const options = accounts.filter((a) => a.kind === source.kind);
  const [selected, setSelected] = useState(options[0]?.id ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      await update({ workspaceId, clientId, [source.field]: selected });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="font-mono text-[11px] px-2 py-1.5 rounded border border-[rgba(255,204,60,0.7)] bg-bg-yellow/20 max-w-[10rem] focus:outline-none"
      >
        {options.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <button
        onClick={save}
        disabled={saving || !selected}
        className="p-1.5 rounded border border-dark-faded hover:bg-grey disabled:opacity-40"
        title="Use this"
      >
        <Check size={13} />
      </button>
    </div>
  );
}
