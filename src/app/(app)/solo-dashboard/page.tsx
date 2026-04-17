"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Ga4Widget } from "@/components/app/dashboard/Ga4Widget";
import { GscWidget } from "@/components/app/dashboard/GscWidget";
import { GoogleAdsWidget } from "@/components/app/dashboard/GoogleAdsWidget";
import { YoutubeWidget } from "@/components/app/dashboard/YoutubeWidget";
import { GbpWidget } from "@/components/app/dashboard/GbpWidget";

export default function SoloDashboardPage() {
  const workspaces = useQuery(api.workspaces.listMine);
  const ws = workspaces?.[0];

  const clients = useQuery(
    api.clients.list,
    ws ? { workspaceId: ws._id } : "skip"
  );
  const connections = useQuery(
    api.platformConnections.listForWorkspace,
    ws ? { workspaceId: ws._id } : "skip"
  );

  // Loading state — wait for everything to hydrate
  if (workspaces === undefined || clients === undefined || connections === undefined) {
    return <div className="max-w-container mx-auto p-8 text-dark/40">Loading…</div>;
  }
  if (!ws) {
    return (
      <div className="max-w-container mx-auto p-8">
        <p className="text-dark mb-4">No workspace yet.</p>
        <Link href="/onboarding" className="btn-secondary px-5 py-2">
          Set one up
        </Link>
      </div>
    );
  }

  // Solo persona: clients[0] is "the business". If none yet, prompt them to add one.
  const client = clients[0];
  if (!client) {
    return (
      <div className="max-w-container mx-auto p-8">
        <h1 className="font-sans text-fluid-h2 text-dark mb-4">Add your business</h1>
        <p className="text-dark/70 mb-6 max-w-xl">
          Your dashboard is keyed to a single business on the Solo plan. Create one to
          start connecting sources.
        </p>
        <Link href="/clients" className="btn-secondary px-5 py-2">
          Add business
        </Link>
      </div>
    );
  }

  const googleConnection =
    connections.find((c: { provider: string }) => c.provider === "google") ?? null;

  return (
    <div className="max-w-container mx-auto">
      <div className="flex items-baseline justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
            {ws.name}
          </p>
          <h1 className="font-sans text-fluid-h2 text-dark">{client.name}</h1>
        </div>
        <Link
          href="/prompts"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-dark/70 hover:text-dark"
        >
          <Sparkles size={14} /> Prompt library →
        </Link>
      </div>

      <DashboardIntro />

      <Ga4Widget
        workspaceId={ws._id}
        client={client}
        googleConnection={googleConnection}
      />
      <GscWidget
        workspaceId={ws._id}
        client={client}
        googleConnection={googleConnection}
      />
      <GoogleAdsWidget
        workspaceId={ws._id}
        client={client}
        googleConnection={googleConnection}
      />
      <YoutubeWidget
        workspaceId={ws._id}
        client={client}
        googleConnection={googleConnection}
      />
      <GbpWidget
        workspaceId={ws._id}
        client={client}
        googleConnection={googleConnection}
      />
    </div>
  );
}

function DashboardIntro() {
  return (
    <div className="bg-dark text-white rounded-lg p-6 mb-6 flex items-start justify-between gap-6 flex-wrap">
      <div className="flex-1 min-w-0 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-wider text-brand-lime mb-2">
          Live data · last 28 days
        </p>
        <p className="font-sans text-fluid-h5 leading-snug mb-2">
          Your real numbers, pulled on demand.
        </p>
        <p className="text-white/70 text-sm">
          Each widget calls the source directly when this page loads — no warehouse,
          no sync delay. Connect a source once and Claude can answer questions about
          it in Claude Desktop too.
        </p>
      </div>
      <Link
        href="/settings/mcp"
        className="inline-flex items-center gap-2 bg-brand-lime text-dark px-5 py-3 rounded font-mono text-xs uppercase tracking-wider hover:opacity-90 shrink-0"
      >
        Copy MCP URL <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}
