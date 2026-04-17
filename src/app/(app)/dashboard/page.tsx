"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const workspaces = useQuery(api.workspaces.listMine);
  const ws = workspaces?.[0];

  // Hooks must always be called in the same order — pass "skip" until ws exists
  const usage = useQuery(
    api.usageCounters.getCurrentPeriod,
    ws ? { workspaceId: ws._id } : "skip"
  );
  const clients = useQuery(
    api.clients.list,
    ws ? { workspaceId: ws._id } : "skip"
  );

  useEffect(() => {
    if (workspaces === undefined) return;
    if (workspaces.length === 0) {
      router.replace("/onboarding");
      return;
    }
    // Solo workspaces have a dedicated rich dashboard
    if (workspaces[0]?.workspaceType === "solo") {
      router.replace("/solo-dashboard");
    }
  }, [workspaces, router]);

  if (workspaces === undefined) return <Skeleton />;
  if (workspaces.length === 0) return null;
  if (!ws) return <Skeleton />;
  // While the solo redirect is in flight, show skeleton rather than flashing the agency dashboard
  if (ws.workspaceType === "solo") return <Skeleton />;

  return (
    <div className="max-w-container mx-auto">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
        Welcome back
      </p>
      <h1 className="font-sans text-fluid-h2 text-dark mb-10">{ws.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          label="Clients"
          value={clients?.length ?? "—"}
          href="/clients"
        />
        <StatCard
          label="MCP calls this month"
          value={usage?.toolCalls ?? 0}
        />
        <StatCard
          label="AI insights this month"
          value={usage?.insightsCalls ?? 0}
        />
      </div>

      <div className="bg-white border border-dark-faded rounded-lg p-8">
        <h2 className="font-sans text-fluid-h4 text-dark mb-3">Get started</h2>
        <ol className="space-y-3 text-fluid-main text-dark opacity-80 mb-6">
          <li>1. <Link href="/connections" className="text-brand underline">Connect Google</Link> to unlock GA4, Search Console, Ads, YouTube, and GBP.</li>
          <li>2. <Link href="/clients" className="text-brand underline">Add a client</Link> and assign their accounts from the dropdowns.</li>
          <li>3. <Link href="/settings/mcp" className="text-brand underline">Copy your MCP URL</Link> into Claude Desktop.</li>
          <li>4. Ask Claude about any client, any platform.</li>
        </ol>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const content = (
    <div className="bg-white border border-dark-faded rounded-lg p-6 hover:border-brand transition-colors">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
        {label}
      </p>
      <p className="font-sans text-fluid-h3 text-dark">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function Skeleton() {
  return (
    <div className="max-w-container mx-auto">
      <div className="h-4 w-24 bg-dark-faded rounded mb-2" />
      <div className="h-12 w-64 bg-dark-faded rounded mb-10" />
    </div>
  );
}
