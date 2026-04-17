"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ShoppingBag,
  Calendar,
  MapPin,
  Video,
  Monitor,
  CheckCircle2,
  SkipForward,
} from "lucide-react";
import type { BusinessType, SoloConfig } from "@/lib/useSoloOnboarding";

const BUSINESS_TYPES: {
  id: BusinessType;
  label: string;
  sub: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "ecommerce", label: "E-commerce", sub: "I sell products online (Shopify, WooCommerce, Etsy)", icon: ShoppingBag },
  { id: "service", label: "Service-based", sub: "Consulting, bookings, agency work", icon: Calendar },
  { id: "local", label: "Local business", sub: "Physical location — cafe, salon, gym, clinic", icon: MapPin },
  { id: "creator", label: "Creator / Content", sub: "YouTube, newsletter, podcast, community", icon: Video },
  { id: "saas", label: "SaaS / Subscription", sub: "Software with recurring plans", icon: Monitor },
];

type AdKey = keyof SoloConfig["ads"];

const AD_PLATFORMS: { id: AdKey; label: string; sub: string; color: string; description: string }[] = [
  {
    id: "googleAds",
    label: "Google Ads",
    sub: "Search + Shopping + YouTube ads",
    color: "#4285F4",
    description: "Spend, conversions, ROAS, CPA, and search-term insights.",
  },
  {
    id: "metaAds",
    label: "Meta Ads",
    sub: "Facebook + Instagram",
    color: "#1877F2",
    description: "Ad-set spend, audience performance, creative-level CTR.",
  },
  {
    id: "linkedinAds",
    label: "LinkedIn Ads",
    sub: "B2B campaigns",
    color: "#0A66C2",
    description: "Job-title targeting performance, cost per lead, company size breakdowns.",
  },
  {
    id: "tiktokAds",
    label: "TikTok Ads",
    sub: "Short-form video ads",
    color: "#000000",
    description: "View-through conversions, CPV, top-performing creatives.",
  },
];

const AD_KEYS: AdKey[] = ["googleAds", "metaAds", "linkedinAds", "tiktokAds"];

// Website "looks like a URL": something + dot + 2+ letters
const URL_REGEX = /\.[a-z]{2,}/i;

type Props = {
  initial: SoloConfig;
  onComplete: (config: SoloConfig) => void;
};

type StepKind =
  | { kind: "welcome" }
  | { kind: "ga4" }
  | { kind: "businessType" }
  | { kind: "adsToggle" }
  | { kind: "adIntegration"; ad: AdKey }
  | { kind: "done" };

export function SoloSetupWizard({ initial, onComplete }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [config, setConfig] = useState<SoloConfig>(initial);
  // "wantsAds" = which ad platforms the user toggled in step 4. This is
  // intent only — actually connecting happens in the per-platform step and
  // sets config.ads[ad] = true. Decoupling these prevents the "you're
  // already connected" bug for users who just toggled the platform on.
  const [wantsAds, setWantsAds] = useState<Record<AdKey, boolean>>(() => ({
    ...initial.ads,
  }));

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Step list dynamically inserts one integration step per ad the user toggled.
  const steps: StepKind[] = useMemo(() => {
    const enabledAds = AD_KEYS.filter((k) => wantsAds[k]);
    return [
      { kind: "welcome" },
      { kind: "ga4" },
      { kind: "businessType" },
      { kind: "adsToggle" },
      ...enabledAds.map<StepKind>((ad) => ({ kind: "adIntegration", ad })),
      { kind: "done" },
    ];
  }, [wantsAds]);

  const totalSteps = steps.length;
  const safeIdx = Math.min(stepIdx, totalSteps - 1);
  const step = steps[safeIdx];

  const canContinue = (() => {
    if (step.kind === "welcome") {
      return (
        config.businessName.trim().length > 0 &&
        URL_REGEX.test(config.websiteUrl.trim())
      );
    }
    if (step.kind === "businessType") return !!config.businessType;
    return true;
  })();

  function next() {
    if (safeIdx < totalSteps - 1) setStepIdx(safeIdx + 1);
    else onComplete(config);
  }
  function back() {
    if (safeIdx > 0) setStepIdx(safeIdx - 1);
  }

  return (
    <div className="fixed inset-0 z-50 bg-dark/50 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Progress header */}
        <div className="px-8 pt-8 pb-4 border-b border-dark-faded">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-dark/60">
              Setup · step {safeIdx + 1} of {totalSteps}
            </p>
            {safeIdx > 0 && step.kind !== "done" && (
              <button
                onClick={() => onComplete(config)}
                className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-dark/50 hover:text-dark"
              >
                <SkipForward size={12} /> Skip the rest
              </button>
            )}
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= safeIdx ? "bg-brand-lime" : "bg-dark/10"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-8">
          {step.kind === "welcome" && <StepWelcome config={config} setConfig={setConfig} />}
          {step.kind === "ga4" && <StepGA4 config={config} setConfig={setConfig} />}
          {step.kind === "businessType" && <StepBusinessType config={config} setConfig={setConfig} />}
          {step.kind === "adsToggle" && (
            <StepAds wantsAds={wantsAds} setWantsAds={setWantsAds} />
          )}
          {step.kind === "adIntegration" && (
            <StepAdIntegration
              ad={step.ad}
              config={config}
              setConfig={setConfig}
              setWantsAds={setWantsAds}
            />
          )}
          {step.kind === "done" && <StepDone config={config} />}
        </div>

        <div className="px-8 py-5 border-t border-dark-faded flex justify-between gap-3">
          <button
            onClick={back}
            disabled={safeIdx === 0}
            className={`btn px-5 py-2 inline-flex items-center gap-2 ${
              safeIdx === 0 ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <button
            onClick={next}
            disabled={!canContinue}
            className={`btn-secondary px-5 py-2 inline-flex items-center gap-2 ${
              !canContinue ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            {step.kind === "done" ? "Take the tour" : "Continue"}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Step — Welcome
// ──────────────────────────────────────────────────────────
function StepWelcome({
  config,
  setConfig,
}: {
  config: SoloConfig;
  setConfig: (c: SoloConfig) => void;
}) {
  const url = config.websiteUrl.trim();
  const urlInvalid = url.length > 0 && !URL_REGEX.test(url);
  return (
    <div>
      <h2 className="font-sans text-fluid-h3 text-dark mb-2">Welcome to Arlo</h2>
      <p className="text-dark/70 text-fluid-main mb-6">
        Let&apos;s get your business connected in under five minutes. Skip any step
        you&apos;re not ready for.
      </p>
      <div className="space-y-4">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 block mb-1.5">
            Business name
          </label>
          <input
            type="text"
            value={config.businessName}
            onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
            placeholder="e.g. Anna's Bakery"
            className="w-full px-3 py-2.5 border border-dark-faded rounded bg-white focus:outline-none focus:border-brand font-sans"
          />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 block mb-1.5">
            Website
          </label>
          <input
            type="text"
            value={config.websiteUrl}
            onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })}
            placeholder="yourbusiness.com"
            className={`w-full px-3 py-2.5 border rounded bg-white focus:outline-none font-sans ${
              urlInvalid ? "border-bg-red focus:border-bg-red" : "border-dark-faded focus:border-brand"
            }`}
          />
          {urlInvalid && (
            <p className="font-mono text-[11px] text-bg-red mt-2">
              Add the full domain (e.g. yourbusiness.com or .co)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Step — Google Analytics
// ──────────────────────────────────────────────────────────
function StepGA4({
  config,
  setConfig,
}: {
  config: SoloConfig;
  setConfig: (c: SoloConfig) => void;
}) {
  const [mode, setMode] = useState<"oauth" | "manual">("oauth");
  const connected = !!config.ga4PropertyId;

  return (
    <div>
      <h2 className="font-sans text-fluid-h3 text-dark mb-2">Connect Google Analytics</h2>
      <p className="text-dark/70 text-fluid-main mb-6">
        Almost every business has a GA4 property. Connecting it unlocks traffic,
        sessions, conversion, and user behavior data — the baseline for almost every
        question you&apos;ll ask Claude.
      </p>

      {connected ? (
        <div className="bg-mint border border-brand-neon/40 rounded-lg p-5 flex items-start gap-3">
          <CheckCircle2 className="text-brand mt-0.5 shrink-0" size={18} />
          <div className="flex-1">
            <p className="text-dark font-medium mb-1">GA4 property connected</p>
            <p className="font-mono text-xs text-dark/70">{config.ga4PropertyId}</p>
            <button
              onClick={() => setConfig({ ...config, ga4PropertyId: null })}
              className="font-mono text-[11px] uppercase tracking-wider text-dark/60 hover:text-dark mt-2"
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4 bg-dark/5 p-1 rounded-lg">
            <button
              onClick={() => setMode("oauth")}
              className={`flex-1 px-3 py-2 rounded-md font-mono text-xs uppercase tracking-wider transition-colors ${
                mode === "oauth" ? "bg-dark text-brand-lime" : "text-dark/60"
              }`}
            >
              Sign in with Google
            </button>
            <button
              onClick={() => setMode("manual")}
              className={`flex-1 px-3 py-2 rounded-md font-mono text-xs uppercase tracking-wider transition-colors ${
                mode === "manual" ? "bg-dark text-brand-lime" : "text-dark/60"
              }`}
            >
              Paste property ID
            </button>
          </div>

          {mode === "oauth" ? (
            <button
              onClick={() =>
                setConfig({ ...config, ga4PropertyId: "properties/438873264" })
              }
              className="w-full bg-white border border-dark-faded hover:border-dark rounded-lg p-5 flex items-center gap-4 transition-colors"
            >
              <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              <div className="text-left">
                <p className="font-sans text-dark">Connect with Google</p>
                <p className="font-mono text-xs text-dark/60 mt-0.5">
                  We&apos;ll discover every GA4 property on your account
                </p>
              </div>
            </button>
          ) : (
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 block mb-1.5">
                GA4 Property ID
              </label>
              <input
                type="text"
                value={config.ga4PropertyId ?? ""}
                onChange={(e) =>
                  setConfig({ ...config, ga4PropertyId: e.target.value || null })
                }
                placeholder="e.g. 123456789"
                className="w-full px-3 py-2.5 border border-dark-faded rounded bg-white focus:outline-none focus:border-brand font-mono text-sm"
              />
              <p className="font-mono text-[11px] text-dark/60 mt-2">
                Just the numeric ID. Find it in GA4 → Admin → Property Settings → Property ID.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Step — Business type
// ──────────────────────────────────────────────────────────
function StepBusinessType({
  config,
  setConfig,
}: {
  config: SoloConfig;
  setConfig: (c: SoloConfig) => void;
}) {
  return (
    <div>
      <h2 className="font-sans text-fluid-h3 text-dark mb-2">What kind of business?</h2>
      <p className="text-dark/70 text-fluid-main mb-6">
        This tailors your dashboard. A service business doesn&apos;t need a revenue
        tile; a local business leans on Maps. You can change this later.
      </p>
      <div className="space-y-2">
        {BUSINESS_TYPES.map((t) => {
          const Icon = t.icon;
          const selected = config.businessType === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setConfig({ ...config, businessType: t.id })}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-colors ${
                selected
                  ? "border-brand bg-mint"
                  : "border-dark-faded hover:border-dark/30"
              }`}
            >
              <div
                className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${
                  selected ? "bg-brand text-brand-lime" : "bg-grey text-dark/60"
                }`}
              >
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-dark">{t.label}</p>
                <p className="font-mono text-xs text-dark/60 mt-0.5">{t.sub}</p>
              </div>
              {selected && <Check className="text-brand shrink-0" size={18} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Step — Ads toggle
// ──────────────────────────────────────────────────────────
function StepAds({
  wantsAds,
  setWantsAds,
}: {
  wantsAds: Record<AdKey, boolean>;
  setWantsAds: (a: Record<AdKey, boolean>) => void;
}) {
  const enabledCount = AD_KEYS.filter((k) => wantsAds[k]).length;
  return (
    <div>
      <h2 className="font-sans text-fluid-h3 text-dark mb-2">Running any ads?</h2>
      <p className="text-dark/70 text-fluid-main mb-6">
        Toggle the platforms you spend on. We&apos;ll add a quick connection step for
        each one — Claude can then track ROAS and CPA across them.
      </p>
      <div className="space-y-2 mb-4">
        {AD_PLATFORMS.map((p) => {
          const on = wantsAds[p.id];
          return (
            <button
              key={p.id}
              onClick={() => setWantsAds({ ...wantsAds, [p.id]: !on })}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-colors ${
                on ? "border-brand bg-mint" : "border-dark-faded hover:border-dark/30"
              }`}
            >
              <div
                className="w-10 h-10 rounded flex items-center justify-center font-display text-white shrink-0"
                style={{ backgroundColor: p.color }}
              >
                {p.label.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-dark">{p.label}</p>
                <p className="font-mono text-xs text-dark/60 mt-0.5">{p.sub}</p>
              </div>
              <span
                className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${
                  on ? "bg-brand" : "bg-dark/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                    on ? "left-[1.125rem]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>
      <p className="font-mono text-xs text-dark/50 text-center">
        {enabledCount === 0
          ? "No ads? No problem — Claude focuses on organic + local."
          : `Adding ${enabledCount} integration step${enabledCount === 1 ? "" : "s"} after this.`}
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Step — Per-platform ad integration
// ──────────────────────────────────────────────────────────
function StepAdIntegration({
  ad,
  config,
  setConfig,
  setWantsAds,
}: {
  ad: AdKey;
  config: SoloConfig;
  setConfig: (c: SoloConfig) => void;
  setWantsAds: (updater: (prev: Record<AdKey, boolean>) => Record<AdKey, boolean>) => void;
}) {
  const platform = AD_PLATFORMS.find((p) => p.id === ad)!;
  // Truth source for "connected" is config.ads[ad] — set ONLY by the Connect
  // button on this step (toggling in step 4 doesn't pre-mark them connected).
  const isConnected = config.ads[ad];

  function fakeConnect() {
    setConfig({ ...config, ads: { ...config.ads, [ad]: true } });
  }

  function skip() {
    setConfig({ ...config, ads: { ...config.ads, [ad]: false } });
    // Also drop the intent so this step disappears from the wizard list
    setWantsAds((prev) => ({ ...prev, [ad]: false }));
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded flex items-center justify-center font-display text-white text-lg shrink-0"
          style={{ backgroundColor: platform.color }}
        >
          {platform.label.charAt(0)}
        </div>
        <div>
          <h2 className="font-sans text-fluid-h3 text-dark">Connect {platform.label}</h2>
          <p className="font-mono text-xs uppercase tracking-wider text-dark/60 mt-1">
            {platform.sub}
          </p>
        </div>
      </div>

      <p className="text-dark/70 text-fluid-main mb-6">
        Once connected, Claude can pull {platform.description.toLowerCase()}
      </p>

      {isConnected ? (
        <div className="bg-mint border border-brand-neon/40 rounded-lg p-5 flex items-start gap-3">
          <CheckCircle2 className="text-brand mt-0.5 shrink-0" size={18} />
          <div className="flex-1">
            <p className="text-dark font-medium mb-1">{platform.label} connected</p>
            <p className="font-mono text-xs text-dark/70">
              You can change or disconnect this anytime from the Connections page.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={fakeConnect}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-lg text-white font-sans transition-opacity hover:opacity-90"
            style={{ backgroundColor: platform.color }}
          >
            Sign in with {platform.label}
          </button>
          <button
            onClick={skip}
            className="w-full font-mono text-[11px] uppercase tracking-wider text-dark/50 hover:text-dark py-2"
          >
            Skip — I don&apos;t use {platform.label} after all
          </button>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Step — Done
// ──────────────────────────────────────────────────────────
function StepDone({ config }: { config: SoloConfig }) {
  const firstName = config.businessName.trim().split(" ")[0] || "there";
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 rounded-full bg-brand-lime mx-auto mb-5 flex items-center justify-center">
        <Check size={28} className="text-brand" />
      </div>
      <h2 className="font-sans text-fluid-h3 text-dark mb-2">
        You&apos;re ready, {firstName}.
      </h2>
      <p className="text-dark/70 text-fluid-main max-w-md mx-auto">
        Next: a quick 5-step tour so you know where everything lives. Takes 30 seconds.
      </p>
    </div>
  );
}
