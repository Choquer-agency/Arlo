import { Check } from "lucide-react";

// In the demo, everyone is on Studio with full, unlimited access — there is no
// billing, no plan chooser, and no usage caps to manage.
const INCLUDED = [
  "Unlimited client accounts",
  "Unlimited connections",
  "All 107+ source types",
  "Unlimited MCP calls",
  "Unlimited AI insights",
  "Unlimited team members",
  "Unlimited custom API connectors",
  "Per-client MCP URLs",
  "SSO / SAML",
  "Priority support",
];

export default function DemoBillingPage() {
  return (
    <div className="max-w-container mx-auto">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
        Account
      </p>
      <h1 className="font-serif font-normal text-fluid-h2 text-dark mb-3">
        You&apos;re on Studio — unlimited.
      </h1>
      <p className="text-dark opacity-60 text-fluid-main max-w-xl mb-10">
        Everything&apos;s unlocked. No plans, no limits, no billing to manage — just full access
        to every feature ARLO ships.
      </p>

      <section className="bg-white border border-dark-faded rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#3f7a1e] bg-[#e6f4d9] px-2.5 py-1 rounded-full">
            Studio · Full access
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {INCLUDED.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-lime">
                <Check size={13} className="text-dark" strokeWidth={2.5} />
              </span>
              <span className="text-fluid-main text-dark">{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
