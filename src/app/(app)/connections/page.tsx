"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ChevronDown, Plus, Check, X } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { AccountPicker } from "@/components/app/dashboard/AccountPicker";
import {
  GOOGLE_SOURCES,
  COMING_SOON_SOURCES,
  sourceState,
  type Account,
  type GoogleSourceDef,
} from "@/lib/googleSources";
import { useActiveWorkspace } from "@/components/providers/ActingWorkspaceProvider";
import { googleStartHref } from "@/lib/oauth";
import { isQuickbooksAllowed } from "@/lib/featureGates";

export default function ConnectionsPage() {
  const { ws } = useActiveWorkspace();
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

  // QuickBooks — private beta, allowlisted users only.
  const me = useQuery(api.users.me);
  const qbAllowed = isQuickbooksAllowed(me?.email);
  const qbConn = connections?.find((c) => c.provider === "quickbooks");
  const qbConnected = qbConn?.status === "active";
  const qbCompany = qbConn?.availableAccounts?.[0]?.name ?? qbConn?.accountEmail;

  // Single-open accordion; default to the first source.
  const [openSource, setOpenSource] = useState<string>(GOOGLE_SOURCES[0].key);

  return (
    <div className="max-w-container mx-auto">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
        Connections
      </p>
      <h1 className="font-sans text-fluid-h2 text-dark mb-2">Sources &amp; who&apos;s using them</h1>
      <p className="text-dark/60 text-fluid-main max-w-2xl mb-8">
        One Google login unlocks every source. Open a source to see which business is
        mapped to which account.
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
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-emerald-700 bg-emerald-50 pl-1.5 pr-3 py-1.5 rounded-full">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                <Check size={11} strokeWidth={3} className="text-white" />
              </span>
              Connected as {googleConn?.accountEmail}
            </span>
            <a
              href={googleStartHref(ws?._id)}
              className="font-mono text-[11px] uppercase tracking-wider text-dark/50 hover:text-dark"
            >
              Reconnect
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-red-600 bg-red-50 pl-1.5 pr-3 py-1.5 rounded-full">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                <X size={11} strokeWidth={3} className="text-white" />
              </span>
              Not connected
            </span>
            <a href={googleStartHref(ws?._id)} className="btn-secondary px-6 py-3">
              Connect Google
            </a>
          </div>
        )}
      </div>

      {/* QuickBooks card — private beta, allowlisted users only */}
      {qbAllowed && (
        <div className="bg-white border border-dark-faded rounded-lg p-6 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-sans text-fluid-h5 text-dark mb-3 flex items-center gap-2.5">
              QuickBooks
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#6b6fc4] bg-[#ecedfb] px-2 py-0.5 rounded-full">
                Private beta
              </span>
            </h2>
            {qbConnected ? (
              <p className="text-dark/60 text-fluid-small max-w-md">
                Ask Claude about income, expenses, net income, and invoices —
                live from QuickBooks Online.
              </p>
            ) : (
              <p className="text-dark/60 text-fluid-small max-w-md">
                Connect your QuickBooks Online company to ask Claude about
                income, expenses, net income, and invoices.
              </p>
            )}
          </div>
          {qbConnected ? (
            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-emerald-700 bg-emerald-50 pl-1.5 pr-3 py-1.5 rounded-full">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                  <Check size={11} strokeWidth={3} className="text-white" />
                </span>
                Connected · {qbCompany}
              </span>
              <a
                href={`/api/oauth/quickbooks/start${ws?._id ? `?workspaceId=${ws._id}` : ""}`}
                className="font-mono text-[11px] uppercase tracking-wider text-dark/50 hover:text-dark"
              >
                Reconnect
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-red-600 bg-red-50 pl-1.5 pr-3 py-1.5 rounded-full">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                  <X size={11} strokeWidth={3} className="text-white" />
                </span>
                Not connected
              </span>
              <a
                href={`/api/oauth/quickbooks/start${ws?._id ? `?workspaceId=${ws._id}` : ""}`}
                className="btn-secondary px-6 py-3"
              >
                Connect QuickBooks
              </a>
            </div>
          )}
        </div>
      )}

      {/* Source-grouped accordion */}
      <div className="flex items-center justify-between mb-3 mt-8">
        <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60">
          Sources
        </p>
        <Link
          href="/clients"
          className="font-mono text-[11px] uppercase tracking-wider text-dark/70 hover:text-dark inline-flex items-center gap-1.5"
        >
          <Plus size={13} /> Add business
        </Link>
      </div>

      <div className="space-y-3">
        {GOOGLE_SOURCES.map((source) => (
          <SourceGroup
            key={source.key}
            source={source}
            clients={clients}
            availableAccounts={availableAccounts}
            googleConnected={googleConnected}
            workspaceId={ws?._id}
            open={openSource === source.key}
            onToggle={() => setOpenSource(openSource === source.key ? "" : source.key)}
          />
        ))}
        {COMING_SOON_SOURCES.map((p) => (
          <div
            key={p.name}
            className="bg-white border border-dark-faded rounded-lg flex items-center justify-between px-5 py-4 opacity-70"
          >
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.icon} alt="" className="w-6 h-6 object-contain grayscale opacity-70" />
              <div>
                <span className="font-sans text-dark">{p.name}</span>{" "}
                <span className="font-mono text-[11px] text-dark/50">{p.detail}</span>
              </div>
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

type BadgeState = "live" | "off" | "neutral";

/** Green-check (live) / red-X (issue) / neutral status pill. */
function StatusBadge({ state, label }: { state: BadgeState; label: string }) {
  const styles: Record<BadgeState, { wrap: string; dot: string; text: string; icon: React.ReactNode }> = {
    live: {
      wrap: "bg-emerald-50",
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      icon: <Check size={11} strokeWidth={3} className="text-white" />,
    },
    off: {
      wrap: "bg-red-50",
      dot: "bg-red-500",
      text: "text-red-600",
      icon: <X size={11} strokeWidth={3} className="text-white" />,
    },
    neutral: {
      wrap: "bg-grey",
      dot: "bg-dark/25",
      text: "text-dark/50",
      icon: null,
    },
  };
  const s = styles[state];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-1 ${s.wrap}`}>
      <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${s.dot}`}>
        {s.icon}
      </span>
      <span className={`font-mono text-[11px] uppercase tracking-wider ${s.text}`}>{label}</span>
    </span>
  );
}

function SourceGroup({
  source,
  clients,
  availableAccounts,
  googleConnected,
  workspaceId,
  open,
  onToggle,
}: {
  source: GoogleSourceDef;
  clients: Doc<"clients">[] | undefined;
  availableAccounts: Account[];
  googleConnected: boolean;
  workspaceId: Id<"workspaces"> | undefined;
  open: boolean;
  onToggle: () => void;
}) {
  const list = clients ?? [];
  const total = list.length;
  const liveN = list.filter(
    (c) => sourceState(c, source, availableAccounts).state === "live"
  ).length;
  const notLive = total - liveN;

  // High-level, no "0 of 1" counting: either it's all set up (green) or
  // something needs attention (red). Detail lives one level down, per business.
  const badge: { state: BadgeState; label: string } = !googleConnected
    ? { state: "off", label: "Not connected" }
    : total === 0
      ? { state: "neutral", label: "No businesses yet" }
      : notLive === 0
        ? { state: "live", label: total === 1 ? "Connected" : `${liveN} connected` }
        : { state: "off", label: notLive === 1 ? "Connection issue" : `${notLive} need attention` };

  return (
    <div className="bg-white border border-dark-faded rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-grey/60 transition-colors"
      >
        <span className="flex items-center gap-3 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={source.icon} alt="" className="w-6 h-6 object-contain shrink-0" />
          <span className="font-sans text-dark">{source.label}</span>
        </span>
        <span className="flex items-center gap-3 shrink-0">
          <StatusBadge state={badge.state} label={badge.label} />
          <ChevronDown
            size={16}
            className={`text-dark/50 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div className="border-t border-dark-faded bg-grey/40">
          {!googleConnected ? (
            <div className="px-5 py-6 flex items-center justify-between gap-4">
              <p className="text-dark/70 text-sm">Connect Google to map {source.label} accounts.</p>
              <a href={googleStartHref(workspaceId)} className="btn-secondary px-4 py-2 text-sm shrink-0">
                Connect Google
              </a>
            </div>
          ) : list.length === 0 ? (
            <p className="px-5 py-6 text-dark/60 text-sm">
              Add a business first, then map its {source.label} account here.
            </p>
          ) : (
            list.map((client) => (
              <BusinessRow
                key={client._id}
                source={source}
                client={client}
                availableAccounts={availableAccounts}
                workspaceId={workspaceId}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function BusinessRow({
  source,
  client,
  availableAccounts,
  workspaceId,
}: {
  source: GoogleSourceDef;
  client: Doc<"clients">;
  availableAccounts: Account[];
  workspaceId: Id<"workspaces"> | undefined;
}) {
  const { state, value, availCount } = sourceState(client, source, availableAccounts);
  const [editing, setEditing] = useState(false);

  return (
    <div className="px-5 py-3.5 border-t border-dark-faded first:border-t-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={`/clients/${client._id}`}
            className="font-sans text-dark hover:underline underline-offset-2"
          >
            {client.name}
          </Link>
          <p className="font-mono text-[11px] text-dark/50">{client.websiteUrl ?? "no website"}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {state === "live" ? (
            <>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shrink-0">
                <Check size={12} strokeWidth={3} className="text-white" />
              </span>
              <span className="font-mono text-[11px] text-dark/70 truncate max-w-[18rem]" title={value}>
                {value}
              </span>
              {availCount > 1 && (
                <button
                  onClick={() => setEditing((v) => !v)}
                  className="font-mono text-[10px] uppercase tracking-wider text-dark/50 hover:text-dark"
                >
                  {editing ? "Cancel" : "Change"}
                </button>
              )}
            </>
          ) : state === "available" ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 shrink-0">
                  <X size={12} strokeWidth={3} className="text-white" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-red-600">
                  Not mapped
                </span>
              </span>
              <button
                onClick={() => setEditing((v) => !v)}
                className="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
              >
                <Plus size={13} /> {editing ? "Cancel" : "Choose"}
              </button>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-red-600">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 shrink-0">
                <X size={12} strokeWidth={3} className="text-white" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider">None on account</span>
            </span>
          )}
        </div>
      </div>

      {editing && workspaceId && (
        <div className="pt-3">
          <AccountPicker
            workspaceId={workspaceId}
            clientId={client._id}
            accounts={availableAccounts}
            accountKind={source.kind}
            assignmentField={source.field}
            label={source.pickerLabel}
            onSaved={() => setEditing(false)}
          />
        </div>
      )}
    </div>
  );
}
