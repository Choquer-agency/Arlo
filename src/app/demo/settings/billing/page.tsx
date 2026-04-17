"use client";

import { useSearchParams } from "next/navigation";
import { AlertTriangle, Check, Minus } from "lucide-react";
import { getUsageForPersona, getCurrentPlanSlug } from "@/lib/demoUsage";
import { usePersona } from "@/lib/usePersona";

const PLANS = [
  { slug: "solo", name: "Solo", price: "$19/mo" },
  { slug: "studio", name: "Studio", price: "$99/mo" },
  { slug: "agency", name: "Agency", price: "$249/mo" },
  { slug: "scale", name: "Scale", price: "$499/mo" },
  { slug: "enterprise", name: "Enterprise", price: "Custom" },
];

const FEATURES: { label: string; values: (string | boolean)[] }[] = [
  { label: "Clients", values: ["1", "10", "25", "75", "Unlimited"] },
  { label: "Source types", values: ["7", "12", "18", "Unlimited", "All 107+"] },
  { label: "MCP calls / month", values: ["2,500", "25,000", "100,000", "500,000", "Unlimited"] },
  { label: "AI insights / month", values: ["50", "500", "2,000", "10,000", "Unlimited"] },
  { label: "Team members", values: ["3", "Unlimited", "Unlimited", "Unlimited", "Unlimited"] },
  { label: "Client MCP URLs", values: [true, true, true, true, true] },
  { label: "Custom API connectors", values: ["3", "10", "Unlimited", "Unlimited", "Unlimited"] },
  { label: "Audit log retention", values: ["30 days", "1 year", "2 years", "3 years", "Custom"] },
  { label: "SSO / SAML", values: [false, false, false, false, true] },
  { label: "Priority support", values: ["Email", "Email", "Priority email", "Priority email", "Dedicated CSM"] },
];

export default function DemoBillingPage() {
  const searchParams = useSearchParams();
  const preselectedSlug = searchParams.get("upgrade");
  const persona = usePersona();
  const currentSlug = getCurrentPlanSlug(persona);
  const usage = getUsageForPersona(persona);
  const currentPlan = PLANS.find((p) => p.slug === currentSlug);

  return (
    <div className="max-w-container mx-auto">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
        Billing
      </p>
      <h1 className="font-sans text-fluid-h2 text-dark mb-10">
        Plan: <span className="text-brand">{currentPlan?.name ?? "—"}</span>{" "}
        <span className="font-mono text-fluid-main opacity-60">
          · {currentPlan?.price ?? ""}
        </span>
      </h1>

      <section className="bg-white border border-dark-faded rounded-lg p-8 mb-6">
        <h2 className="font-sans text-fluid-h4 text-dark mb-2">This month</h2>
        <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-6">
          Resets April 30, 2026
        </p>
        <UsageMeter label="MCP calls" used={usage.mcpCalls.used} limit={usage.mcpCalls.limit} />
        <UsageMeter label="AI insights" used={usage.aiInsights.used} limit={usage.aiInsights.limit} />
        <UsageMeter
          label="Clients"
          used={usage.clients.used}
          limit={usage.clients.limit}
          expectFull={persona === "solo"}
        />
        <UsageMeter label="Team members" used={usage.teamMembers.used} limit={usage.teamMembers.limit} />
      </section>

      <section className="bg-white border border-dark-faded rounded-lg p-8 mb-6 overflow-x-auto">
        <h2 className="font-sans text-fluid-h4 text-dark mb-2">Choose a plan</h2>
        <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-6">
          {preselectedSlug
            ? `Recommended: ${PLANS.find((p) => p.slug === preselectedSlug)?.name} — matches your usage.`
            : "Switch anytime. Prorated automatically."}
        </p>

        <div className="min-w-[900px]">
          {/* Plan cards row */}
          <div className="grid grid-cols-[minmax(11rem,1.2fr)_repeat(5,minmax(8rem,1fr))] gap-3 mb-6">
            <div />
            {PLANS.map((p) => {
              const recommended = preselectedSlug === p.slug;
              const current = p.slug === currentSlug;
              return (
                <div
                  key={p.slug}
                  className={`rounded-lg p-4 border flex flex-col ${
                    current
                      ? "border-brand-lime bg-brand-lime"
                      : recommended
                      ? "border-brand bg-mint"
                      : "border-dark-faded"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <p className="font-sans text-fluid-h5 text-dark">{p.name}</p>
                    {current && (
                      <span className="font-mono text-[10px] uppercase tracking-wider text-brand-lime bg-dark px-2 py-0.5 rounded">
                        Current
                      </span>
                    )}
                    {!current && recommended && (
                      <span className="font-mono text-[10px] uppercase tracking-wider text-brand-lime bg-dark px-2 py-0.5 rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-sm text-dark opacity-70 mb-4">{p.price}</p>
                  {current ? (
                    <span className="mt-auto font-mono text-xs uppercase tracking-wider text-dark/70">
                      Your plan
                    </span>
                  ) : (
                    <button
                      className={`mt-auto w-full ${
                        recommended ? "btn-secondary" : "btn"
                      } justify-center text-xs py-2`}
                    >
                      {p.slug === "enterprise" ? "Contact us" : recommended ? "Upgrade" : "Switch"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feature comparison rows */}
          <div className="border-t border-dark-faded">
            {FEATURES.map((row, idx) => (
              <div
                key={row.label}
                className={`grid grid-cols-[minmax(11rem,1.2fr)_repeat(5,minmax(8rem,1fr))] gap-3 items-center py-3 border-b border-dark-faded last:border-0 ${
                  idx % 2 === 1 ? "bg-grey/40" : ""
                }`}
              >
                <span className="font-mono text-xs uppercase tracking-wider text-dark px-1">
                  {row.label}
                </span>
                {row.values.map((v, i) => {
                  const planCurrent = PLANS[i]?.slug === currentSlug;
                  const planRecommended = preselectedSlug === PLANS[i]?.slug;
                  return (
                    <div
                      key={i}
                      className={`text-center text-sm px-2 ${
                        planCurrent ? "font-medium text-dark" : planRecommended ? "font-medium text-dark" : "text-dark opacity-90"
                      }`}
                    >
                      {typeof v === "boolean" ? (
                        v ? (
                          <Check size={16} className="inline text-brand" />
                        ) : (
                          <Minus size={16} className="inline text-dark/30" />
                        )
                      ) : (
                        v
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border border-dark-faded rounded-lg p-8">
        <h2 className="font-sans text-fluid-h4 text-dark mb-3">Manage</h2>
        <p className="text-dark opacity-60 mb-6 text-fluid-main">
          Update your payment method or download invoices via Stripe.
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary px-6 py-3">Manage subscription</button>
          <button className="btn px-6 py-3">Invoice history</button>
        </div>
      </section>
    </div>
  );
}

function UsageMeter({
  label,
  used,
  limit,
  expectFull,
}: {
  label: string;
  used: number;
  limit: number;
  /** When true, 100% usage is the intended state (e.g. solo = 1/1 client). Stay green, no warnings. */
  expectFull?: boolean;
}) {
  const pct = limit === Infinity ? 0 : Math.min(100, (used / limit) * 100);
  const maxed = !expectFull && pct >= 100;
  const warn = !expectFull && pct >= 90 && !maxed;
  const color = maxed ? "#ff6d6d" : warn ? "#ffec7e" : "#27EAA6";
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between mb-2">
        <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-dark">
          {label}
          {(warn || maxed) && (
            <AlertTriangle size={12} className={maxed ? "text-bg-red" : "text-dark"} />
          )}
        </span>
        <span className="font-mono text-xs text-dark opacity-60">
          {used.toLocaleString()} {limit === Infinity ? "/ unlimited" : `/ ${limit.toLocaleString()}`}
        </span>
      </div>
      <div className="h-2 bg-grey rounded-full overflow-hidden">
        <div
          className="h-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
