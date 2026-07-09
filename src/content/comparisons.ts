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
          { feature: "Entry price", values: ["$19/mo (3 sources)", "Free"] },
          { feature: "Data warehouse required", values: ["Yes (BigQuery, Snowflake, Sheets)", "None — live queries"] },
          { feature: "Claude / AI access", values: ["Not included", "The whole point — and it's free"] },
          { feature: "Setup time", values: ["Days (schema, sync config)", "Under 5 minutes"] },
          { feature: "Data freshness", values: ["Sync cadence (hourly at best)", "Live on every query"] },
          { feature: "Per-client overhead", values: ["Configure new pipeline", "Pick a property from a dropdown"] },
          { feature: "Team access", values: ["Per-seat add-ons", "Unlimited seats, free"] },
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
          { feature: "Entry price", values: ["~$29/mo (single destination)", "Free"] },
          { feature: "Pricing model", values: ["Per connector + data source, scales up fast", "Free — unlimited sources per client"] },
          { feature: "What you get", values: ["Data in Sheets / Looker / BigQuery", "Live answers in Claude"] },
          { feature: "Reports / dashboards", values: ["You build & maintain them", "None — you ask questions"] },
          { feature: "Claude / AI access", values: ["Not the product", "The whole point — and it's free"] },
          { feature: "Data freshness", values: ["Scheduled refresh", "Live on every query"] },
          { feature: "Setup per client", values: ["Configure queries + destination", "Pick a property from a dropdown"] },
          { feature: "Data warehouse", values: ["Common (BigQuery/Snowflake)", "None — pass-through, nothing stored"] },
        ],
      },
      whenCustom: [
        "Your team's real workflow is asking questions, not building reports",
        "You'd rather not pay per-connector bills that climb as you add clients",
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
          { label: "Software", saas: "Supermetrics team plan + per-source add-ons", custom: "Free while in early access" },
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
          question: "How much does ARLO cost?",
          answer:
            "ARLO is free right now while we're in early access — every feature, every client, unlimited sources, no credit card. Supermetrics, by contrast, prices by connectors and data sources, so its bill climbs as your stack grows. When we do introduce paid plans, you'll choose a plan that fits or walk away — nothing is auto-charged.",
        },
        {
          question: "Does ARLO store my clients' data?",
          answer:
            "No. ARLO is pass-through — OAuth tokens are encrypted at rest, but raw analytics and ads data is fetched live on each query and discarded after it's returned to Claude. There's no warehouse and no persistent client data.",
        },
      ],
    },
  },

  "agencyanalytics-vs-arlo": {
    slug: "agencyanalytics-vs-arlo",
    title: "AgencyAnalytics vs. ARLO: Skip the white-label dashboard, ask Claude",
    metaTitle: "AgencyAnalytics Alternative | ARLO — Ask Claude, No Dashboard (2026)",
    metaDescription:
      "AgencyAnalytics builds white-label client dashboards you have to configure and maintain. ARLO lets your team ask Claude for live numbers instead — no dashboard, no widget-picking, no branding upkeep.",
    tldr:
      "AgencyAnalytics is a white-label dashboard builder: you connect each client's platforms, pick widgets, brand the report, and share a login or PDF. It's the best tool on the market for that job. ARLO replaces the job itself — instead of a dashboard someone has to build, maintain, and re-brand per client, your team just asks Claude a question and gets a live answer, scoped to whichever client they're looking at. If what your team actually wants is the answer (not a dashboard to interpret), ARLO gets there in one prompt instead of a login-and-scroll.",
    saasName: "AgencyAnalytics",
    saasCategory: "White-label agency dashboards",
    serviceSlug: "agency-owner",
    lastUpdated: "2026-07-09",
    sections: {
      problem: {
        heading: "A dashboard is a place to look. ARLO is an answer.",
        body: "AgencyAnalytics solves a real problem well: agencies need a single, branded place to show clients performance across GA4, Search Console, Google Ads, Meta, and dozens of other platforms, without building that infrastructure themselves. The tradeoff is that a dashboard is still a destination — someone configures the widgets, applies the branding per client, and the client (or your account manager) still has to open it and interpret what they're looking at. It's also built for showing numbers, not answering the follow-up question a client actually asks in a meeting (\"why did that dip happen?\"). ARLO skips the destination. Claude reads each connected platform live through MCP, so instead of building a dashboard for a question you don't know yet, your team just asks — in the meeting, on the spot — and gets a plain-English answer scoped to that client.",
      },
      table: {
        headers: ["Feature", "AgencyAnalytics", "ARLO"],
        rows: [
          { feature: "Entry price", values: ["Per-client/seat pricing, scales with client count", "$0 Free / $19 Solo / $99 Studio"] },
          { feature: "What you get", values: ["White-label dashboards + scheduled PDF reports", "Live answers in Claude, no dashboard to build"] },
          { feature: "Setup per client", values: ["Connect platforms, pick widgets, apply branding", "Pick a property from a dropdown"] },
          { feature: "Claude / AI access", values: ["Not the product", "The whole point — every tier"] },
          { feature: "Follow-up questions", values: ["Client re-opens the dashboard, or emails you", "Ask Claude the follow-up in the same reply"] },
          { feature: "Data freshness", values: ["Scheduled sync per platform", "Live on every query"] },
          { feature: "Report building/maintenance", values: ["Ongoing — templates, widgets, branding upkeep", "None — questions replace reports"] },
          { feature: "Data warehouse", values: ["Not required, but data lives in their platform", "None — pass-through, nothing stored"] },
        ],
      },
      whenCustom: [
        "Your team's real workflow is asking questions, not building dashboards",
        "Clients ask follow-up questions dashboards can't answer without another tool",
        "You want live data in the same place your team already works — Claude",
        "You don't want to re-brand and maintain a dashboard template per client",
      ],
      whenSaas: [
        "Clients specifically expect a branded, self-serve login they can check anytime",
        "You need scheduled, shareable PDF reports as a deliverable, not just an answer",
        "You want a visual dashboard for a QBR deck, not a conversational tool",
      ],
      faqs: [
        {
          question: "Is ARLO a full AgencyAnalytics replacement?",
          answer:
            "If your team's real workflow is answering client questions about performance, yes. If clients specifically expect a branded, self-serve dashboard login or a recurring PDF as the deliverable, AgencyAnalytics still wins that job. Some agencies keep AgencyAnalytics for the client-facing artifact and add ARLO for their own team's day-to-day questions.",
        },
        {
          question: "Does ARLO do white-label client dashboards?",
          answer:
            "No — that's not the product. ARLO has no dashboard at all; Claude is the interface. If a branded, shareable dashboard is a hard requirement for your clients, pair ARLO with your existing dashboard tool rather than replacing it outright.",
        },
        {
          question: "How is ARLO's pricing different from AgencyAnalytics?",
          answer:
            "AgencyAnalytics prices per client/seat and scales as your book grows. ARLO's tiers are flat per plan (e.g. Studio at $99/mo covers 10 clients with unlimited team seats) with unlimited source types included, so the bill doesn't climb every time you add a platform.",
        },
        {
          question: "Does ARLO store my clients' data the way a dashboard tool does?",
          answer:
            "No. ARLO is pass-through — every query is fetched live from the connected platform's API and returned to Claude; nothing is warehoused or cached. OAuth tokens are encrypted at rest, but there's no persistent copy of client analytics or ads data.",
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
