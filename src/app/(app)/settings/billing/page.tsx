"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { getPlan, PLAN_LIMITS } from "@/lib/billing";

export default function BillingPage() {
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

  if (!ws || !usage) return null;
  const limits = getPlan(ws.plan);

  return (
    <div className="max-w-container-sm mx-auto">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
        Billing
      </p>
      <h1 className="font-sans text-fluid-h2 text-dark mb-2">
        Plan: <span className="text-brand">{limits.label}</span>
      </h1>
      <p className="font-mono text-fluid-main text-dark opacity-60 mb-10">{limits.price}</p>

      <section className="bg-white border border-dark-faded rounded-lg p-8 mb-6">
        <h2 className="font-sans text-fluid-h4 text-dark mb-6">This month</h2>
        <UsageMeter
          label="MCP calls"
          used={usage.toolCalls}
          limit={limits.mcpCallsPerMonth}
        />
        <UsageMeter
          label="AI insights"
          used={usage.insightsCalls}
          limit={limits.insightsPerMonth}
        />
        <UsageMeter
          label="Clients"
          used={clients?.length ?? 0}
          limit={limits.clients}
        />
      </section>

      <section className="bg-white border border-dark-faded rounded-lg p-8 mb-6">
        <h2 className="font-sans text-fluid-h4 text-dark mb-6">Plan limits</h2>
        <dl className="grid grid-cols-2 gap-y-3">
          <Limit label="Clients" value={fmt(limits.clients)} />
          <Limit label="Source types" value={fmt(limits.sourceTypes)} />
          <Limit label="Team members" value={fmt(limits.teamMembers)} />
          <Limit label="Overage (insights)" value={
            limits.insightOveragePrice !== null
              ? `$${limits.insightOveragePrice.toFixed(2)} each`
              : "N/A"
          } />
        </dl>
      </section>

      <section className="bg-white border border-dark-faded rounded-lg p-8">
        <h2 className="font-sans text-fluid-h4 text-dark mb-3">Manage plan</h2>
        <p className="text-dark opacity-60 mb-6 text-fluid-main">
          Upgrade, downgrade, or update payment method via the Stripe Customer Portal.
        </p>
        <a
          href="/pricing"
          className="btn-secondary inline-flex px-6 py-3"
        >
          Change plan
        </a>
      </section>

      {/* Reference: full tier ladder (visible on all plans) */}
      <details className="mt-6 text-dark/60">
        <summary className="font-mono text-xs uppercase tracking-wider cursor-pointer hover:text-dark">
          See all plan tiers
        </summary>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-fluid-small">
          {Object.values(PLAN_LIMITS).map((p) => (
            <div key={p.label} className="border border-dark-faded rounded p-3">
              <p className="font-mono text-xs text-dark">{p.label}</p>
              <p className="font-mono text-xs opacity-60 mb-2">{p.price}</p>
              <p>{fmt(p.clients)} clients · {fmt(p.sourceTypes)} sources</p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function fmt(v: number): string {
  if (v === Infinity) return "Unlimited";
  return v.toLocaleString();
}

function Limit({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="font-mono text-xs uppercase tracking-wider text-dark opacity-60">{label}</dt>
      <dd className="font-sans text-fluid-main text-dark">{value}</dd>
    </>
  );
}

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit === Infinity ? 0 : Math.min(100, (used / limit) * 100);
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between mb-2">
        <span className="font-mono text-xs uppercase tracking-wider text-dark">{label}</span>
        <span className="font-mono text-xs text-dark opacity-60">
          {used.toLocaleString()} {limit === Infinity ? "/ unlimited" : `/ ${limit.toLocaleString()}`}
        </span>
      </div>
      <div className="h-2 bg-grey rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-neon transition-all"
          style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? "#ff6d6d" : undefined }}
        />
      </div>
    </div>
  );
}
