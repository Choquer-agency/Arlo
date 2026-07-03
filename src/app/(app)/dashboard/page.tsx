"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { BusinessCard } from "@/components/app/dashboard/BusinessCard";
import { GOOGLE_SOURCES, liveCount, type Account } from "@/lib/googleSources";

export default function DashboardPage() {
  const router = useRouter();
  const workspaces = useQuery(api.workspaces.listMine);
  const ws = workspaces?.[0];

  const usage = useQuery(
    api.usageCounters.getCurrentPeriod,
    ws ? { workspaceId: ws._id } : "skip"
  );
  const clients = useQuery(
    api.clients.list,
    ws ? { workspaceId: ws._id } : "skip"
  );
  const connections = useQuery(
    api.platformConnections.listForWorkspace,
    ws ? { workspaceId: ws._id } : "skip"
  );

  useEffect(() => {
    if (workspaces === undefined) return;
    if (workspaces.length === 0) {
      router.replace("/onboarding");
      return;
    }
    // Solo workspaces have a dedicated single-business dashboard
    if (workspaces[0]?.workspaceType === "solo") {
      router.replace("/solo-dashboard");
    }
  }, [workspaces, router]);

  if (workspaces === undefined) return <Skeleton />;
  if (workspaces.length === 0) return null;
  if (!ws) return <Skeleton />;
  if (ws.workspaceType === "solo") return <Skeleton />;

  const googleConn = connections?.find((c) => c.provider === "google");
  const googleConnected = googleConn?.status === "active";
  const availableAccounts: Account[] = googleConn?.availableAccounts ?? [];

  // Portfolio aggregates
  const totalSourceSlots = (clients?.length ?? 0) * GOOGLE_SOURCES.length;
  const liveSources =
    clients?.reduce((sum, c) => sum + liveCount(c), 0) ?? 0;

  return (
    <div className="max-w-container mx-auto">
      <div className="flex items-baseline justify-between gap-4 flex-wrap mb-1">
        <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60">
          Your businesses
        </p>
        <Link
          href="/clients"
          className="font-mono text-[11px] uppercase tracking-wider text-dark/70 hover:text-dark inline-flex items-center gap-1.5"
        >
          <Plus size={13} /> Add business
        </Link>
      </div>
      <h1 className="font-sans text-fluid-h2 text-dark mb-8">Portfolio</h1>

      {/* Aggregate summary strip */}
      <div className="bg-dark text-white rounded-lg p-6 mb-8 flex items-center justify-between gap-6 flex-wrap">
        <div className="flex gap-8 flex-wrap">
          <Stat value={clients?.length ?? "—"} label="Businesses" accent />
          <Stat
            value={
              clients === undefined
                ? "—"
                : `${liveSources}/${totalSourceSlots}`
            }
            label="Sources live"
          />
          <Stat value={usage?.toolCalls ?? 0} label="MCP calls · this month" />
          <Stat value={usage?.insightsCalls ?? 0} label="AI insights · this month" />
        </div>
        <Link
          href="/settings/mcp"
          className="inline-flex items-center gap-2 bg-brand-lime text-dark px-5 py-3 rounded font-mono text-xs uppercase tracking-wider hover:opacity-90 shrink-0"
        >
          Copy MCP URL <ArrowUpRight size={14} />
        </Link>
      </div>

      {clients === undefined || connections === undefined ? (
        <div className="text-dark/40">Loading businesses…</div>
      ) : clients.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {clients.map((c) => (
            <BusinessCard
              key={c._id}
              workspaceId={ws._id}
              client={c}
              googleConnected={googleConnected}
              availableAccounts={availableAccounts}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className={`font-sans text-fluid-h3 leading-none tabular-nums ${accent ? "text-brand-lime" : "text-white"}`}>
        {value}
      </p>
      <p className="font-mono text-[11px] uppercase tracking-wider text-white/60 mt-2">
        {label}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-dark-faded rounded-lg p-16 text-center">
      <p className="font-sans text-fluid-h4 text-dark mb-3">No businesses yet</p>
      <p className="text-dark opacity-60 mb-6 max-w-md mx-auto">
        Add your first business, then connect Google and map its GA4 / Search Console /
        Ads accounts to see live numbers here.
      </p>
      <Link href="/clients" className="btn-secondary px-6 py-3 inline-block">
        Add your first business
      </Link>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="max-w-container mx-auto">
      <div className="h-4 w-24 bg-dark-faded rounded mb-2" />
      <div className="h-12 w-64 bg-dark-faded rounded mb-10" />
    </div>
  );
}
