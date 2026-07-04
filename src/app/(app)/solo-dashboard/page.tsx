"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Sparkles } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Ga4Widget } from "@/components/app/dashboard/Ga4Widget";
import { GscWidget } from "@/components/app/dashboard/GscWidget";
import { GoogleAdsWidget } from "@/components/app/dashboard/GoogleAdsWidget";
import { YoutubeWidget } from "@/components/app/dashboard/YoutubeWidget";
import { GbpWidget } from "@/components/app/dashboard/GbpWidget";
import { ClaudeHero, StatusPanel } from "@/components/app/dashboard/ClaudeHero";
import { ConnectorsBar } from "@/components/app/dashboard/ConnectorsBar";
import { GOOGLE_SOURCES } from "@/lib/googleSources";
import { useActiveWorkspace } from "@/components/providers/ActingWorkspaceProvider";

// Solo dashboard only renders these five; keyed by GOOGLE_SOURCES[].key.
const WIDGET_BY_KEY = {
  ga4: Ga4Widget,
  gsc: GscWidget,
  ads: GoogleAdsWidget,
  yt: YoutubeWidget,
  gbp: GbpWidget,
} as const;

export default function SoloDashboardPage() {
  const { ws } = useActiveWorkspace();

  const clients = useQuery(
    api.clients.list,
    ws ? { workspaceId: ws._id } : "skip"
  );
  const connections = useQuery(
    api.platformConnections.listForWorkspace,
    ws ? { workspaceId: ws._id } : "skip"
  );
  const mcpTokens = useQuery(
    api.mcpTokens.listMine,
    ws ? { workspaceId: ws._id } : "skip"
  );

  if (ws === undefined || clients === undefined || connections === undefined) {
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

  // A source is "live" once it's mapped to an account; only those get a data
  // widget. Unmapped sources are pointed to Connections via the bottom bar.
  const liveSources = GOOGLE_SOURCES.filter((s) => !!client[s.field]);
  const moreSources = GOOGLE_SOURCES.filter((s) => !client[s.field]);

  // Whether this user has actually used their MCP inside Claude — lastUsedAt is
  // stamped on every MCP call, so its presence means Claude has connected.
  const usedTokens = (mcpTokens ?? []).filter((t) => t.lastUsedAt);
  const connectedToClaude = usedTokens.length > 0;
  const lastUsedAt =
    usedTokens.map((t) => t.lastUsedAt!).sort().at(-1) ?? null;

  const gridCols = liveSources.length > 1 ? "lg:grid-cols-2" : "grid-cols-1";

  return (
    <div className="max-w-container mx-auto">
      <div className="flex items-baseline justify-between mb-6 gap-4 flex-wrap">
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

      {/* Bento hero: push to Claude (loud) + quick status */}
      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <ClaudeHero
          workspaceId={ws._id}
          businessName={client.name}
          connectedToClaude={connectedToClaude}
        />
        <StatusPanel
          liveLabels={liveSources.map((s) => s.label)}
          connectedToClaude={connectedToClaude}
          lastUsedAt={lastUsedAt}
        />
      </div>

      {/* Live data — only mapped sources */}
      {liveSources.length > 0 ? (
        <div className={`grid gap-4 mb-6 ${gridCols}`}>
          {liveSources.map((s) => {
            const Widget = WIDGET_BY_KEY[s.key as keyof typeof WIDGET_BY_KEY];
            if (!Widget) return null;
            return (
              <Widget
                key={s.key}
                workspaceId={ws._id}
                client={client}
                googleConnection={googleConnection}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dark-faded bg-white p-8 text-center mb-6">
          <p className="font-sans text-fluid-h5 text-dark mb-2">No live sources yet</p>
          <p className="text-dark/60 text-sm mb-5 max-w-md mx-auto">
            Map a Google Analytics property or Search Console site to start seeing
            live numbers here.
          </p>
          <Link href="/connections" className="btn-secondary px-5 py-2.5 text-sm inline-block">
            Set up connections
          </Link>
        </div>
      )}

      {/* Everything not mapped → Connections */}
      <ConnectorsBar sources={moreSources} />
    </div>
  );
}
