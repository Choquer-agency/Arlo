"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-register";
import { useContactForm } from "@/context/ContactFormContext";
import { pricingTiers } from "@/content/shared";
import { Check } from "lucide-react";
import { trackCtaClick, trackPricingClick } from "@/lib/analytics";

// Lime matches the CTA button fill so price + button read as one brand moment.
const LIME = "#D0FF71";

/**
 * Plan slug mapping — keyed by tier.name (human display) → Stripe price lookup
 * key. Free + Enterprise don't hit Stripe; they route elsewhere.
 */
const PLAN_SLUG: Record<string, string> = {
  Solo: "solo",
  Studio: "studio",
  Agency: "agency",
  Scale: "scale",
};

export function Pricing() {
  const ref = useRef<HTMLElement>(null);
  const { openModal } = useContactForm();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(tierName: string, priceRange: string) {
    const slug = PLAN_SLUG[tierName];
    if (!slug) {
      // Free tier — route to sign-in / onboarding
      window.location.href = "/sign-in";
      return;
    }
    setLoadingTier(tierName);
    setError(null);
    try {
      trackPricingClick(tierName, priceRange, false);
      trackCtaClick("pricing", "Get Started", `${tierName} (${priceRange})`);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: slug }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoadingTier(null);
    }
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".pricing-heading", {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
        });
        gsap.from(".pricing-card", {
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 65%", once: true },
        });
      });
    },
    { scope: ref }
  );

  const mainTiers = pricingTiers.filter((t) => !t.retainer);
  const enterpriseTier = pricingTiers.find((t) => t.retainer);

  return (
    <section ref={ref} id="pricing" className="section-space-main theme-dark">
      <div className="u-container">
        <div className="text-center mb-12">
          <p className="pricing-heading eyebrow text-brand">Pricing</p>
          <h2 className="pricing-heading font-sans font-medium text-fluid-h2 leading-[1.1] max-w-[26ch] mx-auto">
            One Claude connector. Priced for how many businesses you track.
          </h2>
          <p className="pricing-heading font-sans text-fluid-main opacity-60 max-w-[48ch] mx-auto mt-4">
            From a single business owner to a 75-client agency. Enterprise for everyone else.
          </p>
        </div>

        {/* 5 tiers in a single row on wide desktops */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {mainTiers.map((tier) => (
            <div
              key={tier.name}
              className="pricing-card rounded-lg p-5 flex flex-col"
              style={{
                backgroundColor: tier.featured ? tier.color : "rgba(255,255,255,0.08)",
                color: tier.featured ? "#193133" : "inherit",
                border: tier.featured ? "none" : "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <p
                  className="font-mono text-xs uppercase tracking-wider"
                  style={{ opacity: tier.featured ? 0.7 : 0.5 }}
                >
                  {tier.name}
                </p>
                {tier.featured && (
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-dark text-brand-neon">
                    Most popular
                  </span>
                )}
              </div>
              <p
                className="font-sans font-medium text-fluid-h4 mb-3"
                style={{ color: tier.featured ? "#193133" : LIME }}
              >
                {tier.priceRange}
              </p>
              {/* min-h reserves room for the tallest description so the checkmark
                  list starts at the same baseline across all tiers. */}
              <p
                className="font-sans text-fluid-main leading-relaxed mb-6 sm:min-h-[6.75em]"
                style={{ opacity: tier.featured ? 0.8 : 0.6 }}
              >
                {tier.description}
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {tier.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check
                      size={16}
                      className="flex-shrink-0 mt-0.5"
                      style={{
                        color: tier.featured ? "#004D43" : LIME,
                        opacity: tier.featured ? 0.8 : 0.7,
                      }}
                    />
                    <span
                      className="font-sans text-fluid-main"
                      style={{ opacity: tier.featured ? 0.9 : 0.7 }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => startCheckout(tier.name, tier.priceRange)}
                disabled={loadingTier !== null}
                className="w-full py-3 rounded-sm font-sans font-medium text-fluid-main text-center transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-wait"
                style={
                  tier.featured
                    ? { background: "#193133", color: "#ffffff" }
                    : { background: LIME, color: "#193133" }
                }
              >
                {loadingTier === tier.name ? "Redirecting…" : "Get Started"}
              </button>
            </div>
          ))}
        </div>

        {/* Enterprise — full-width card below the 5-tier row */}
        {enterpriseTier && (
          <div
            className="pricing-card rounded-lg p-6 mt-4 flex flex-col md:flex-row md:items-center gap-6"
            style={{
              background: "transparent",
              border: `2px dashed ${enterpriseTier.color}`,
            }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-mono text-xs uppercase tracking-wider opacity-50">
                  {enterpriseTier.name}
                </p>
                <span
                  className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: enterpriseTier.color, color: "#193133" }}
                >
                  Ongoing
                </span>
              </div>
              <p
                className="font-sans font-medium text-fluid-h4 mb-2"
                style={{ color: enterpriseTier.color }}
              >
                {enterpriseTier.priceRange}
              </p>
              <p className="font-sans text-fluid-main leading-relaxed opacity-70 max-w-xl">
                {enterpriseTier.description}
              </p>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 flex-1">
              {enterpriseTier.includes.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check
                    size={16}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: enterpriseTier.color, opacity: 0.8 }}
                  />
                  <span className="font-sans text-fluid-main opacity-80">{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                trackPricingClick(
                  enterpriseTier.name,
                  enterpriseTier.priceRange,
                  true
                );
                trackCtaClick(
                  "pricing",
                  "Contact us",
                  `${enterpriseTier.name} (${enterpriseTier.priceRange})`
                );
                openModal(
                  {
                    packageName: `${enterpriseTier.name} (${enterpriseTier.priceRange})`,
                    pageCount: 0,
                    estimatedTotal: enterpriseTier.priceRange,
                  },
                  "pricing",
                  "enterprise"
                );
              }}
              className="py-3 px-8 rounded-sm font-sans font-medium text-fluid-main text-center transition-all hover:brightness-110 whitespace-nowrap"
              style={{ background: enterpriseTier.color, color: "#193133" }}
            >
              Contact us
            </button>
          </div>
        )}

        {error && (
          <p className="pricing-heading font-mono text-xs text-center mt-6 text-bg-red max-w-[70ch] mx-auto">
            Checkout failed: {error}
          </p>
        )}

        <p className="pricing-heading font-sans text-fluid-main text-center mt-10 opacity-50 max-w-[70ch] mx-auto">
          Windsor caps at 14 source types at $499. ARLO gives you unlimited source
          types at Scale — because we don&apos;t warehouse your data, we query live.
        </p>
      </div>
    </section>
  );
}
