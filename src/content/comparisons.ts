export interface ComparisonPage {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  tldr: string;
  saasName: string;
  saasCategory: string;
  serviceSlug: string;
  lastUpdated: string;
  sections: {
    problem: { heading: string; body: string };
    table: {
      headers: string[];
      rows: { feature: string; values: string[] }[];
    };
    whenCustom: string[];
    whenSaas: string[];
    tco?: {
      heading: string;
      rows: { label: string; saas: string; custom: string }[];
      savingsNote: string;
    };
    caseStudy?: {
      client: string;
      slug: string;
      headline: string;
      metrics: string[];
    };
    faqs: { question: string; answer: string }[];
  };
}

export const comparisons: Record<string, ComparisonPage> = {
  "windsor-ai-vs-arlo": {
    slug: "windsor-ai-vs-arlo",
    title: "Windsor.ai vs. ARLO: Live Claude queries without a data warehouse",
    metaTitle: "Windsor.ai vs. ARLO | Claude MCP for Agencies (2026)",
    metaDescription:
      "Compare Windsor.ai (data warehouse pipelines) vs. ARLO (live Claude queries). No BigQuery, no dashboards — agencies ask Claude and get live numbers.",
    tldr:
      "Windsor.ai pipes data from GA4, Ads, and Meta into a warehouse you then have to build dashboards on top of. ARLO skips the warehouse entirely — Claude queries each platform live through MCP, returning answers in seconds without any ETL, pipeline maintenance, or stale data. Agencies save the $500+/mo warehouse bill and the recurring dashboard-building effort.",
    saasName: "Windsor.ai",
    saasCategory: "Marketing ETL",
    serviceSlug: "account-manager",
    lastUpdated: "2026-04-12",
    sections: {
      problem: {
        heading: "Why agencies are skipping the warehouse",
        body: "Windsor, Supermetrics, and Improvado all solve the same problem: getting marketing data out of 10+ platforms and into a place you can query. But \"a place you can query\" usually means BigQuery, Snowflake, or a Google Sheet — which means you still have to build dashboards, pay for warehouse storage, and wait for syncs to catch up. By the time a client asks \"how did we do last month?\", the data is already a week behind. ARLO flips the model: Claude queries each platform live on demand. No warehouse, no ETL, no dashboards. You just ask.",
      },
      table: {
        headers: ["Feature", "Windsor.ai", "ARLO"],
        rows: [
          { feature: "Entry price", values: ["$19/mo (3 sources)", "$0 Free / $19 Solo / $99 Studio"] },
          { feature: "Data warehouse required", values: ["Yes (BigQuery, Snowflake, Sheets)", "None — live queries"] },
          { feature: "Claude / AI access", values: ["Not included", "The whole point — every tier"] },
          { feature: "Setup time", values: ["Days (schema, sync config)", "Under 5 minutes"] },
          { feature: "Data freshness", values: ["Sync cadence (hourly at best)", "Live on every query"] },
          { feature: "Per-client overhead", values: ["Configure new pipeline", "Pick a property from a dropdown"] },
          { feature: "Team pricing", values: ["Per-seat add-ons", "Unlimited seats on Studio+"] },
        ],
      },
      whenCustom: [
        "You want to ask questions in plain English, not build dashboards",
        "You don't already have a BigQuery / warehouse team",
        "You need per-client fast setup (not pipelines per client)",
        "Your agency lives in Claude / Cursor already",
      ],
      whenSaas: [
        "You need historical data warehoused for advanced BI / Tableau",
        "Your team is already fluent in SQL and prefers writing queries",
        "You have a dedicated data engineer who owns pipelines",
      ],
      faqs: [
        {
          question: "Can I use ARLO alongside Windsor for heavy BI?",
          answer:
            "Yes. Many agencies keep Windsor feeding a warehouse for retrospective reporting and add ARLO for day-to-day ad-hoc questions. The two aren't mutually exclusive — ARLO is conversational, Windsor is ETL.",
        },
        {
          question: "Does ARLO store my clients' data?",
          answer:
            "No. ARLO is pass-through — OAuth tokens are encrypted at rest, but raw analytics / ads data is fetched on demand and discarded after it's returned to Claude.",
        },
      ],
    },
  },
};

export function getComparisonBySlug(slug: string): ComparisonPage | null {
  return comparisons[slug] ?? null;
}

export function getAllComparisonSlugs(): string[] {
  return Object.keys(comparisons);
}
