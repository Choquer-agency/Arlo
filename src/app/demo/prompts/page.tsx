"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Info, Link2, Search, Sparkles } from "lucide-react";

const PROMPT_PREFIX = "Using Arlo — ";

type ConnectorId = "ga4" | "gsc" | "ads" | "gbp" | "youtube" | "psi";

const CONNECTORS: { id: ConnectorId; name: string; color: string; tagline: string }[] = [
  { id: "ga4", name: "Google Analytics 4", color: "#E37400", tagline: "Traffic, sessions, conversions" },
  { id: "gsc", name: "Search Console", color: "#4285F4", tagline: "Organic clicks, impressions, queries" },
  { id: "ads", name: "Google Ads", color: "#4285F4", tagline: "Paid search spend, ROAS" },
  { id: "gbp", name: "Business Profile", color: "#34A853", tagline: "Local views, calls, directions" },
  { id: "youtube", name: "YouTube Analytics", color: "#FF0000", tagline: "Views, watch time, subs" },
  { id: "psi", name: "PageSpeed Insights", color: "#0F9D58", tagline: "Core Web Vitals, LCP, CLS" },
];

type Prompt = {
  text: string;
  primary: ConnectorId;
  /** If present, this prompt joins data across multiple connectors. */
  links?: ConnectorId[];
};

const PROMPTS: Prompt[] = [
  // ── Google Analytics 4 ────────────────────────────
  { primary: "ga4", text: "How many people visited my site this week vs last week, and what drove the difference?" },
  { primary: "ga4", text: "Which pages are people landing on most, and where are they dropping off before converting?" },
  { primary: "ga4", text: "What percentage of my traffic is mobile vs desktop, and does conversion rate differ between them?" },
  { primary: "ga4", text: "Which city is sending me the most new customers this month — should I be targeting it more?" },
  { primary: "ga4", text: "Are my returning visitors growing or shrinking over time? If shrinking, what changed?" },
  { primary: "ga4", text: "What's my average session duration by traffic source, and is it trending up or down quarter over quarter?" },
  { primary: "ga4", text: "Which traffic source converts the highest — organic, direct, paid, email, or social? And where should I invest more?" },
  { primary: "ga4", text: "Show me my top 10 exit pages. Which ones are leaking the most revenue?" },
  { primary: "ga4", text: "Compare my GA4 sessions to my Search Console impressions — does more impressions actually mean more visits, or am I losing them somewhere?", links: ["gsc"] },
  { primary: "ga4", text: "Which of my highest-converting landing pages have the worst PageSpeed scores? That's where fixing speed pays back fastest.", links: ["psi"] },

  // ── Search Console ────────────────────────────────
  { primary: "gsc", text: "What are the top 10 search terms driving clicks to my site this month?" },
  { primary: "gsc", text: "Which of my pages are ranking on page 2 of Google? Which are closest to breaking into page 1?" },
  { primary: "gsc", text: "What queries am I getting impressions for but almost no clicks? That's missed opportunity — what should I change?" },
  { primary: "gsc", text: "Has my average position improved or dropped over the last 30 days, and on which queries?" },
  { primary: "gsc", text: "Show me search queries where I rank but my CTR is below 3% — those probably need better title tags." },
  { primary: "gsc", text: "Which mobile queries do I get but my desktop CTR is much stronger? Are my mobile pages the problem?" },
  { primary: "gsc", text: "What's my brand-name search volume trending — is awareness growing or flat?" },
  { primary: "gsc", text: "Which pages are indexed that I don't actually want ranking (low-value, duplicate, or outdated)?" },
  { primary: "gsc", text: "Cross-reference my Search Console queries with GA4 conversions — which keywords actually make me money vs just traffic?", links: ["ga4"] },
  { primary: "gsc", text: "Compare my organic impressions to my Google Ads impressions. Am I paying for terms I already rank for organically?", links: ["ads"] },

  // ── Google Ads ────────────────────────────────────
  { primary: "ads", text: "What's my cost per conversion this month vs last month, and which campaigns moved?" },
  { primary: "ads", text: "Which keyword is costing me the most with the fewest conversions? I probably need to pause it." },
  { primary: "ads", text: "What's my ROAS by campaign — which are actually profitable after accounting for spend?" },
  { primary: "ads", text: "Show me search terms my ads appeared for that I didn't target — are any of them worth adding as exact match?" },
  { primary: "ads", text: "Which ad copy variation has the highest CTR? Should I shift budget toward that creative?" },
  { primary: "ads", text: "What's my impression share, and am I losing it to budget or to rank?" },
  { primary: "ads", text: "Which device drives the best cost-per-conversion — mobile, desktop, or tablet? Should I adjust bid modifiers?" },
  { primary: "ads", text: "What day of the week and hour of the day has my best conversion rate? Should I be dayparting?" },
  { primary: "ads", text: "For every keyword I pay for in Google Ads, am I also ranking organically? If yes, I might be double-paying for clicks.", links: ["gsc"] },
  { primary: "ads", text: "Which Google Ads landing pages have the worst PageSpeed scores? I'm paying for clicks that might be bouncing.", links: ["psi"] },

  // ── Business Profile ──────────────────────────────
  { primary: "gbp", text: "How many times did people view my Business Profile this month vs last, on Search vs Maps?" },
  { primary: "gbp", text: "How many people clicked to call, get directions, or visit my website from my Business Profile? Which action is growing fastest?" },
  { primary: "gbp", text: "What search terms are people using to discover my Business Profile? Are they branded or category searches?" },
  { primary: "gbp", text: "Which of my photos are getting the most views? Should I add more of that type?" },
  { primary: "gbp", text: "How many new reviews did I get this month, and what's my star-rating trend over the past 6 months?" },
  { primary: "gbp", text: "Which day of the week has the most direction requests? Am I staffed right for that traffic?" },
  { primary: "gbp", text: "What percentage of my Business Profile views come from Maps vs Search? Is my Maps presence working?" },
  { primary: "gbp", text: "Are there questions or Q&A on my profile that I haven't answered yet? Those hurt trust." },
  { primary: "gbp", text: "Cross-reference Business Profile 'website clicks' with GA4 sessions from Google / organic local. Is Maps actually driving traffic to my site?", links: ["ga4"] },
  { primary: "gbp", text: "Compare my Business Profile direction requests with my Google Ads local-search performance. Am I paying for clicks I already get for free?", links: ["ads"] },

  // ── YouTube Analytics ─────────────────────────────
  { primary: "youtube", text: "Which of my videos got the most views in the last 30 days, and what's different about them?" },
  { primary: "youtube", text: "What's my average watch time by video length — are people finishing shorts, mids, or longs?" },
  { primary: "youtube", text: "Which videos are bringing in the most new subscribers per view?" },
  { primary: "youtube", text: "Where exactly are viewers dropping off in my top video? What timestamp?" },
  { primary: "youtube", text: "What's my click-through rate on thumbnails this month — which thumbnails are underperforming the channel average?" },
  { primary: "youtube", text: "Which videos drive the most traffic to my website via end screens or cards?" },
  { primary: "youtube", text: "How many subscribers did I gain vs lose this month, and which videos caused each?" },
  { primary: "youtube", text: "What YouTube search terms are people using to find my channel?" },
  { primary: "youtube", text: "Compare YouTube viewers by region with my Business Profile searches in the same region — is my video presence building local demand?", links: ["gbp"] },
  { primary: "youtube", text: "Of the visitors coming from YouTube, how do they convert on my site compared to organic search traffic?", links: ["ga4"] },

  // ── PageSpeed Insights ────────────────────────────
  { primary: "psi", text: "What's my homepage's Core Web Vitals score right now — passing or failing on mobile and desktop?" },
  { primary: "psi", text: "Which pages on my site have the worst PageSpeed scores? Rank them by traffic so I know which ones matter." },
  { primary: "psi", text: "How has my Largest Contentful Paint (LCP) trended over the last 3 months?" },
  { primary: "psi", text: "What's hurting my PageSpeed the most — images, JavaScript, third-party scripts, or server response time?" },
  { primary: "psi", text: "Compare my mobile vs desktop PageSpeed. Is mobile dragging down my overall Google ranking signal?" },
  { primary: "psi", text: "What's my Cumulative Layout Shift (CLS), and which elements are causing it?" },
  { primary: "psi", text: "Which of my pages fail Core Web Vitals entirely? That's a ranking liability." },
  { primary: "psi", text: "How does my PageSpeed today compare to 28 days ago — am I getting faster or slower since my last deploy?" },
  { primary: "psi", text: "For my GA4 pages with the highest bounce rate, what are their PageSpeed scores? Is speed the culprit?", links: ["ga4"] },
  { primary: "psi", text: "For my top Google Ads landing pages, what's the PageSpeed score? Slow pages could be killing my ROAS.", links: ["ads"] },
];

export default function DemoPromptsPage() {
  const [active, setActive] = useState<ConnectorId | "all" | "cross">("all");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROMPTS.filter((p) => {
      if (active === "cross") {
        if (!p.links || p.links.length === 0) return false;
      } else if (active !== "all") {
        if (p.primary !== active && !(p.links ?? []).includes(active)) return false;
      }
      if (!q) return true;
      return p.text.toLowerCase().includes(q);
    });
  }, [active, query]);

  const byConnector = useMemo(() => {
    const grouped: Record<ConnectorId, Prompt[]> = {
      ga4: [], gsc: [], ads: [], gbp: [], youtube: [], psi: [],
    };
    for (const p of filtered) grouped[p.primary].push(p);
    return grouped;
  }, [filtered]);

  async function copy(text: string, idx: number) {
    await navigator.clipboard.writeText(PROMPT_PREFIX + text);
    setCopied(idx);
    setTimeout(() => setCopied((c) => (c === idx ? null : c)), 1500);
  }

  const crossCount = PROMPTS.filter((p) => p.links && p.links.length).length;

  return (
    <div className="max-w-container mx-auto">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
            Prompt library
          </p>
          <h1 className="font-sans text-fluid-h2 text-dark">What to ask Claude</h1>
          <p className="text-dark opacity-70 text-fluid-main mt-2 max-w-2xl">
            Copy any prompt below and paste it into Claude Desktop. These are the questions an agency owner would ask —
            the kind of angles you might not think to ask on your own.
          </p>
        </div>
        <Sparkles className="text-dark/30" size={40} />
      </div>

      <div className="flex items-start gap-3 rounded-lg bg-brand-lime/30 border border-brand-lime p-4 mb-6">
        <Info size={16} className="text-dark mt-0.5 shrink-0" />
        <div className="text-sm text-dark">
          <p className="font-medium mb-1">
            Start every prompt with <span className="font-mono bg-dark text-brand-lime px-1.5 py-0.5 rounded">Using Arlo —</span>
          </p>
          <p className="text-dark/70">
            This tells Claude to route your question through Arlo&apos;s MCP server (so it hits your live data instead of guessing). Every Copy button below includes the prefix automatically.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dark opacity-40"
          />
          <input
            type="text"
            placeholder="Search prompts by keyword…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-dark-faded rounded bg-white focus:outline-none focus:border-brand font-sans text-fluid-main"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-10 font-mono text-xs uppercase tracking-wider">
        <FilterChip active={active === "all"} onClick={() => setActive("all")}>
          All ({PROMPTS.length})
        </FilterChip>
        <FilterChip active={active === "cross"} onClick={() => setActive("cross")}>
          <Link2 size={12} className="inline mr-1" />
          Cross-platform ({crossCount})
        </FilterChip>
        {CONNECTORS.map((c) => {
          const count = PROMPTS.filter(
            (p) => p.primary === c.id || (p.links ?? []).includes(c.id)
          ).length;
          return (
            <FilterChip key={c.id} active={active === c.id} onClick={() => setActive(c.id)}>
              {c.name} ({count})
            </FilterChip>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-dark-faded rounded-lg p-16 text-center">
          <p className="font-sans text-fluid-h4 text-dark mb-2">No prompts match &quot;{query}&quot;</p>
          <p className="text-dark opacity-60">Try a different keyword or clear the search.</p>
        </div>
      ) : active !== "all" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((p, i) => (
            <PromptCard
              key={`${p.primary}-${i}`}
              prompt={p}
              copied={copied === i}
              onCopy={() => copy(p.text, i)}
            />
          ))}
        </div>
      ) : (
        CONNECTORS.map((c) => {
          const list = byConnector[c.id];
          if (list.length === 0) return null;
          return (
            <section key={c.id} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center font-display text-white text-sm shrink-0"
                  style={{ backgroundColor: c.color }}
                >
                  {c.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-sans text-fluid-h5 text-dark">{c.name}</h2>
                  <p className="font-mono text-[11px] text-dark opacity-60">{c.tagline}</p>
                </div>
                <span className="ml-auto font-mono text-xs text-dark opacity-40">
                  {list.length} prompts
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {list.map((p, i) => {
                  const globalIdx = PROMPTS.indexOf(p);
                  return (
                    <PromptCard
                      key={`${c.id}-${i}`}
                      prompt={p}
                      copied={copied === globalIdx}
                      onCopy={() => copy(p.text, globalIdx)}
                    />
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded border transition-colors ${
        active
          ? "bg-dark text-brand-lime border-dark"
          : "bg-white text-dark/70 border-dark-faded hover:text-dark hover:border-dark"
      }`}
    >
      {children}
    </button>
  );
}

function PromptCard({
  prompt,
  copied,
  onCopy,
}: {
  prompt: Prompt;
  copied: boolean;
  onCopy: () => void;
}) {
  const primaryName = CONNECTORS.find((c) => c.id === prompt.primary)?.name ?? prompt.primary;
  const linkedNames = (prompt.links ?? []).map(
    (id) => CONNECTORS.find((c) => c.id === id)?.name ?? id
  );
  return (
    <div className="bg-white border border-dark-faded rounded-lg p-5 flex flex-col hover:border-dark/40 transition-colors">
      <p className="text-dark text-fluid-main mb-4 flex-1">
        <span className="text-brand font-medium">Using Arlo —</span> {prompt.text}
      </p>
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-dark-faded">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-grey text-dark/70 truncate">
            {primaryName}
          </span>
          {linkedNames.map((n) => (
            <span
              key={n}
              className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-brand-lime text-dark truncate inline-flex items-center gap-1"
            >
              <Link2 size={10} />
              {n}
            </span>
          ))}
        </div>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-dark/70 hover:text-dark shrink-0"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
