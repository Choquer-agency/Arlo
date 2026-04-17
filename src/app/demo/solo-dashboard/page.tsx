"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  Activity,
  Search,
  Megaphone,
  ShoppingBag,
  MapPin,
  Copy,
  Check,
  Plus,
  Sparkles,
  RotateCw,
} from "lucide-react";
import { useSoloOnboarding } from "@/lib/useSoloOnboarding";
import { SoloSetupWizard } from "@/components/app/SoloSetupWizard";
import { SoloTour } from "@/components/app/SoloTour";

export default function SoloDashboardPage() {
  const { hydrated, onboarded, tourComplete, config, finishSetup, finishTour, reset } =
    useSoloOnboarding();

  // Wait for hydration so we don't flash the wizard to returning users
  if (!hydrated) {
    return <div className="max-w-container mx-auto" data-tour="dashboard" />;
  }

  const showWizard = !onboarded;
  const showTour = onboarded && !tourComplete;

  const businessName = config.businessName || "your business";
  const firstName = businessName.split(" ")[0];
  const websiteUrl = config.websiteUrl || "yourbusiness.com";

  // Connection state — what's actually wired up
  const ga4Connected = !!config.ga4PropertyId;
  const gscConnected = config.connections.gsc;
  const shopifyConnected = config.connections.shopify;
  const gbpConnected = config.connections.gbp;

  // Visibility — which sections are relevant for this business type
  const showShopify = config.businessType === "ecommerce";
  const showLocal = config.businessType === "local" || config.businessType === "service";
  const showAds = config.ads.googleAds;
  const showMetaDisconnect = !config.ads.metaAds;

  return (
    <div className="max-w-container mx-auto" data-tour="dashboard">
      <div className="flex items-baseline justify-between mb-10 gap-4 flex-wrap">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
            Welcome back, {firstName}
          </p>
          <h1 className="font-sans text-fluid-h2 text-dark">{businessName}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-dark/60 hover:text-dark"
            title="Replay setup + tour"
          >
            <RotateCw size={12} /> Replay setup
          </button>
          <Link
            href="/demo/prompts"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-dark/70 hover:text-dark"
          >
            <Sparkles size={14} /> Browse prompt library →
          </Link>
        </div>
      </div>

      <DashboardIntro />

      <TrafficSection connected={ga4Connected} websiteUrl={websiteUrl} />
      <SearchSection connected={gscConnected} websiteUrl={websiteUrl} />
      {showAds && <AdsSection />}
      {showShopify && <ShopifySection connected={shopifyConnected} businessName={businessName} />}
      {showLocal && <LocalSection connected={gbpConnected} businessName={businessName} />}
      {showMetaDisconnect && <MetaAdsDisconnected />}

      <section className="bg-dark text-white rounded-lg p-8 mt-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-wider text-brand-lime mb-2">
              Ask Claude directly
            </p>
            <p className="text-fluid-h4 font-sans leading-tight mb-3">
              &quot;How did {businessName} do this week vs last week?&quot;
            </p>
            <p className="text-white/70 text-sm">
              Claude fans out to every connected source and replies in a paragraph.
              Copy your MCP URL and paste into Claude Desktop to try it.
            </p>
          </div>
          <Link
            href="/demo/settings/mcp"
            className="inline-flex items-center gap-2 bg-brand-lime text-dark px-5 py-3 rounded font-mono text-xs uppercase tracking-wider hover:opacity-90"
          >
            Copy MCP URL <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>

      {showWizard && <SoloSetupWizard initial={config} onComplete={finishSetup} />}
      {showTour && <SoloTour onComplete={finishTour} />}
    </div>
  );
}

function DashboardIntro() {
  return (
    <div className="bg-dark text-white rounded-lg p-6 mb-6 flex items-start justify-between gap-6 flex-wrap">
      <div className="flex-1 min-w-0 max-w-xl">
        <p className="font-mono text-xs uppercase tracking-wider text-brand-lime mb-2">
          How this dashboard works
        </p>
        <p className="font-sans text-fluid-h5 leading-snug mb-2">
          Your data lives in Claude — not here.
        </p>
        <p className="text-white/70 text-sm">
          Each tile below shows what Claude can answer for you using a connected source.
          Copy any prompt into Claude Desktop and your real numbers come back in seconds.
        </p>
      </div>
      <Link
        href="/demo/settings/mcp"
        className="inline-flex items-center gap-2 bg-brand-lime text-dark px-5 py-3 rounded font-mono text-xs uppercase tracking-wider hover:opacity-90 shrink-0"
      >
        Copy MCP URL <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Per-platform sections
// ──────────────────────────────────────────────────────────
function TrafficSection({ connected, websiteUrl }: { connected: boolean; websiteUrl: string }) {
  if (!connected) {
    return (
      <DisconnectedPlatformCard
        color="#E37400"
        platform="Google Analytics 4"
        valueProp="Track sessions, new users, conversion rate, and where your traffic comes from. The baseline for almost every question Claude can answer."
      />
    );
  }
  return (
    <PlatformSection
      icon={<Activity size={16} />}
      color="#E37400"
      platform="Google Analytics 4"
      detail={websiteUrl}
      prompts={[
        "How many sessions did I get this week vs last week?",
        "Which landing pages have the highest conversion rate?",
        "Compare my sessions this month to the same month last year — what's different?",
      ]}
    />
  );
}

function SearchSection({ connected, websiteUrl }: { connected: boolean; websiteUrl: string }) {
  if (!connected) {
    return (
      <DisconnectedPlatformCard
        color="#4285F4"
        platform="Search Console"
        valueProp="See the queries people search to find you, your CTR by position, and which pages are ranking on page 2 and close to breaking into page 1."
      />
    );
  }
  return (
    <PlatformSection
      icon={<Search size={16} />}
      color="#4285F4"
      platform="Search Console"
      detail={`https://${websiteUrl.replace(/^https?:\/\//, "")}/`}
      prompts={[
        "What are the top 10 search terms driving clicks to my site this month?",
        "Which queries have high impressions but low CTR — those titles probably need work.",
        "Which of my pages are ranking on page 2 and closest to breaking into page 1?",
      ]}
    />
  );
}

function AdsSection() {
  return (
    <PlatformSection
      icon={<Megaphone size={16} />}
      color="#34A853"
      platform="Google Ads"
      detail="Brand + Search · 1 customer"
      prompts={[
        "What's my cost per conversion this month vs last month?",
        "Which Google Ads keyword has the worst cost-per-conversion? I probably need to pause it.",
        "For every keyword I pay for, am I also ranking organically? I might be double-paying.",
      ]}
    />
  );
}


function ShopifySection({ connected, businessName }: { connected: boolean; businessName: string }) {
  if (!connected) {
    return (
      <DisconnectedPlatformCard
        color="#96BF48"
        platform="Shopify"
        valueProp="See live revenue, orders, AOV, repeat-purchase rate, and your top products. Required for Claude to answer revenue questions for an e-commerce business."
      />
    );
  }
  const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return (
    <PlatformSection
      icon={<ShoppingBag size={16} />}
      color="#96BF48"
      platform="Shopify"
      detail={`${slug || "yourstore"}.myshopify.com`}
      prompts={[
        "What's my revenue this month vs last month, and what drove the difference?",
        "Which Shopify product had the biggest revenue drop this week? Why?",
        "Compare my subscription revenue trend to my one-time purchases — which is growing faster?",
      ]}
    />
  );
}

function LocalSection({ connected, businessName }: { connected: boolean; businessName: string }) {
  if (!connected) {
    return (
      <DisconnectedPlatformCard
        color="#EA4335"
        platform="Google Business Profile"
        valueProp="Track Maps views, direction requests, calls, and reviews. Critical for any business with a physical location — Claude can tell you what's driving foot traffic."
      />
    );
  }
  return (
    <PlatformSection
      icon={<MapPin size={16} />}
      color="#EA4335"
      platform="Google Business Profile"
      detail={`${businessName} · 2 locations`}
      prompts={[
        "How many direction requests did I get this month vs last?",
        "Cross-reference my Business Profile website clicks with GA4 sessions — is Maps actually driving traffic?",
        "Which day of the week has the most direction requests? Am I staffed right for that traffic?",
      ]}
    />
  );
}

// ──────────────────────────────────────────────────────────
// Disconnected state — shared CTA card for any platform
// ──────────────────────────────────────────────────────────
function DisconnectedPlatformCard({
  color,
  platform,
  valueProp,
}: {
  color: string;
  platform: string;
  valueProp: string;
}) {
  return (
    <section className="bg-white border border-dashed border-dark/20 rounded-lg p-8 mb-6">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded flex items-center justify-center font-display text-white text-base shrink-0"
            style={{ backgroundColor: color }}
          >
            {platform.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-sans text-fluid-h5 text-dark">{platform}</h3>
              <span className="font-mono text-[10px] uppercase tracking-wider text-dark/60 bg-grey px-2 py-0.5 rounded">
                Not connected
              </span>
            </div>
            <p className="text-dark opacity-70 text-sm mt-2 max-w-xl">{valueProp}</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 btn-secondary px-5 py-2.5 text-sm shrink-0">
          <Plus size={14} /> Connect {platform}
        </button>
      </div>
    </section>
  );
}

// Meta Ads disconnected — keep as a "discover" CTA when user didn't toggle Meta
function MetaAdsDisconnected() {
  return (
    <DisconnectedPlatformCard
      color="#1877F2"
      platform="Meta Ads"
      valueProp="Pull Facebook + Instagram ad spend, CPA, and ROAS into one view. Claude can then answer questions like 'which channel drove the most revenue this week — Meta or Google?'"
    />
  );
}

// ──────────────────────────────────────────────────────────
// Shared platform section — connected source + try-asking-Claude prompts.
// No metrics or fake list rows; real numbers live in Claude.
// ──────────────────────────────────────────────────────────
function PlatformSection({
  icon,
  color,
  platform,
  detail,
  prompts,
}: {
  icon: React.ReactNode;
  color: string;
  platform: string;
  detail: string;
  prompts: string[];
}) {
  return (
    <section className="bg-white border border-dark-faded rounded-lg p-8 mb-6">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <div>
            <h2 className="font-sans text-fluid-h5 text-dark">{platform}</h2>
            <p className="font-mono text-[11px] text-dark opacity-60 mt-0.5">{detail}</p>
          </div>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-brand bg-mint px-2 py-1 rounded shrink-0">
          Connected
        </span>
      </div>

      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-3">
        Try asking Claude
      </p>
      <div className="space-y-2">
        {prompts.map((p, i) => (
          <PromptRow key={i} text={p} />
        ))}
      </div>
    </section>
  );
}

const PROMPT_PREFIX = "Using Arlo — ";

function PromptRow({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(PROMPT_PREFIX + text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 bg-grey rounded text-sm">
      <span className="text-dark/80 truncate">
        <span className="text-brand font-medium">Using Arlo —</span> {text}
      </span>
      <button
        onClick={copy}
        className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-dark/70 hover:text-dark shrink-0"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
