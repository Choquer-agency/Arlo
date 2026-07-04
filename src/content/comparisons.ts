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

  "supermetrics-vs-arlo": {
    slug: "supermetrics-vs-arlo",
    title: "Supermetrics vs. ARLO: Ask Claude instead of building another report",
    metaTitle: "Supermetrics Alternative | ARLO — Live Claude Queries (2026)",
    metaDescription:
      "Supermetrics pipes marketing data into Sheets, Looker, and BigQuery you still have to build reports on. ARLO lets agencies ask Claude for live numbers — no exports, no dashboards, no warehouse.",
    tldr:
      "Supermetrics is a data pipeline: it moves GA4, Google Ads, Meta, and 100+ sources into Google Sheets, Looker Studio, Excel, or a warehouse — where you then build and maintain the actual reports. ARLO removes that whole layer. Claude queries each platform live through MCP and answers in plain English in seconds, with no destinations to configure, no scheduled refreshes, and no per-connector pricing that balloons as you add clients. If your team's real question is \"how did this client do last month?\", ARLO answers it directly instead of feeding another dashboard.",
    saasName: "Supermetrics",
    saasCategory: "Marketing data pipeline / ETL",
    serviceSlug: "account-manager",
    lastUpdated: "2026-07-04",
    sections: {
      problem: {
        heading: "You don't need another dashboard — you need the answer",
        body: "Supermetrics is the category leader for one job: getting marketing data out of dozens of platforms and into a destination — Google Sheets, Looker Studio, Excel, BigQuery. It does that well. But the destination is not the answer; it's a place where you still have to build the report, keep the template current, and wait for the next scheduled refresh before the numbers are trustworthy. Pricing also scales by connectors and data sources, so a growing agency's bill climbs fast. ARLO takes a different path: there's no destination and no report to build. Claude reads each connected account live through the Model Context Protocol, so anyone on the team just asks — \"compare this client's sessions and conversions to last month\" — and gets the number on the spot, scoped to exactly what they're allowed to see.",
      },
      table: {
        headers: ["Feature", "Supermetrics", "ARLO"],
        rows: [
          { feature: "Entry price", values: ["~$29/mo (single destination)", "$0 Free / $19 Solo / $99 Studio"] },
          { feature: "Pricing model", values: ["Per connector + data source, scales up fast", "Per business tracked — unlimited sources"] },
          { feature: "What you get", values: ["Data in Sheets / Looker / BigQuery", "Live answers in Claude"] },
          { feature: "Reports / dashboards", values: ["You build & maintain them", "None — you ask questions"] },
          { feature: "Claude / AI access", values: ["Not the product", "The whole point — every tier"] },
          { feature: "Data freshness", values: ["Scheduled refresh", "Live on every query"] },
          { feature: "Setup per client", values: ["Configure queries + destination", "Pick a property from a dropdown"] },
          { feature: "Data warehouse", values: ["Common (BigQuery/Snowflake)", "None — pass-through, nothing stored"] },
        ],
      },
      whenCustom: [
        "Your team's real workflow is asking questions, not building reports",
        "You want one price per client, not per-connector bills that climb",
        "You already work inside Claude and want live data there",
        "You want fast per-client setup, not a query + destination per client",
      ],
      whenSaas: [
        "You specifically need data warehoused in Sheets/Looker/BigQuery for scheduled, shareable dashboards",
        "You have templated client reports that must render the same way every week",
        "You rely on Supermetrics' long tail of 100+ niche connectors ARLO doesn't cover yet",
      ],
      tco: {
        heading: "What it actually costs at 10 clients",
        rows: [
          { label: "Software", saas: "Supermetrics team plan + per-source add-ons", custom: "ARLO Studio, $99/mo flat for 10 clients" },
          { label: "Report building", saas: "Ongoing — someone maintains the templates", custom: "None — questions replace reports" },
          { label: "Warehouse / storage", saas: "BigQuery or Sheets overhead", custom: "$0 — nothing stored" },
        ],
        savingsNote:
          "The bigger saving usually isn't the subscription — it's the recurring hours nobody has to spend building and babysitting reports.",
      },
      faqs: [
        {
          question: "Is ARLO a full Supermetrics replacement?",
          answer:
            "For the common case — agencies answering questions about client performance across GA4, Search Console, Google Ads, Meta, YouTube and more — yes. Where Supermetrics still wins is when you specifically need data warehoused for scheduled BI dashboards or one of its long-tail niche connectors. Some teams keep both: Supermetrics for templated reporting, ARLO for day-to-day questions.",
        },
        {
          question: "How is ARLO's pricing different?",
          answer:
            "Supermetrics prices by connectors and data sources, which grows with your stack. ARLO prices per business you track and includes unlimited sources per client, so the bill is predictable as you add platforms.",
        },
        {
          question: "Does ARLO store my clients' data?",
          answer:
            "No. ARLO is pass-through — OAuth tokens are encrypted at rest, but raw analytics and ads data is fetched live on each query and discarded after it's returned to Claude. There's no warehouse and no persistent client data.",
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
