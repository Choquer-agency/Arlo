export interface ConnectorPage {
  slug: string;
  /** e.g. "Google Analytics 4 (GA4)" */
  sourceName: string;
  /** Short brand name used in the H1, e.g. "GA4" */
  sourceShortName: string;
  color: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  tldr: string;
  lastUpdated: string;
  sections: {
    why: { heading: string; body: string };
    steps: { title: string; description: string }[];
    prompts: string[];
    metrics: { name: string; description: string }[];
    dimensions: { name: string; description: string }[];
    faqs: { question: string; answer: string }[];
  };
  relatedServiceSlugs: string[];
  relatedComparisonSlugs: string[];
  relatedConnectorSlugs: string[];
}

export const connectors: Record<string, ConnectorPage> = {
  "google-analytics-mcp": {
    slug: "google-analytics-mcp",
    sourceName: "Google Analytics 4 (GA4)",
    sourceShortName: "GA4",
    color: "#E37400",
    title: "Google Analytics MCP: Connect GA4 to Claude",
    metaTitle: "Google Analytics MCP | Connect GA4 to Claude — ARLO",
    metaDescription:
      "Connect GA4 to Claude Desktop through ARLO's MCP server in under 5 minutes. Ask Claude about sessions, conversions, and channel performance — no exports, no dashboards.",
    tldr:
      "ARLO is an MCP server that gives Claude live, read-only access to GA4 through the Google Analytics Data API. Connect once with Google OAuth, assign a property to a client, and Claude can answer questions about sessions, conversions, revenue, and channel performance on demand — nothing is exported, warehoused, or scheduled.",
    lastUpdated: "2026-07-04",
    sections: {
      why: {
        heading: "Why connect GA4 to Claude instead of opening another tab",
        body:
          "GA4's own interface is built for exploring reports, not answering a specific question fast. Most agencies end up re-running the same explorations every week — traffic by channel, conversions by landing page, this-month-vs-last-month — and copying the numbers into a doc or Slack message. An MCP connector removes that step: Claude calls the GA4 API directly, so \"how did organic traffic do last month\" becomes a sentence instead of a five-minute detour through Explore reports and date-range pickers.",
      },
      steps: [
        {
          title: "Connect Google",
          description:
            "Sign in to ARLO and grant Google OAuth once. The same grant also unlocks Search Console, Google Ads, YouTube, and Business Profile — no separate GA4-only integration to configure.",
        },
        {
          title: "Assign the GA4 property",
          description:
            "Pick the property from a searchable dropdown for each client or business you track. Multi-client agencies assign as many properties as they have GA4 accounts for.",
        },
        {
          title: "Paste your MCP URL into Claude Desktop",
          description:
            "ARLO generates a personal MCP URL. Add it under Claude Desktop → Settings → Connectors and GA4 shows up as a tool Claude can call.",
        },
      ],
      prompts: [
        "What were total sessions and conversions for [Client] over the last 28 days?",
        "Break down last month's traffic by channel — which source drove the most conversions?",
        "Compare this month's engagement rate to last month for [Client].",
        "Which landing pages had the highest bounce rate this week?",
        "How much revenue came from organic search versus paid last quarter?",
      ],
      metrics: [
        { name: "Sessions / Active users / New users", description: "Core traffic volume" },
        { name: "Engaged sessions / Engagement rate", description: "Quality of visits" },
        { name: "Bounce rate", description: "Single-interaction sessions" },
        { name: "Average session duration", description: "Time on site" },
        { name: "Pageviews / Event count", description: "Content and interaction volume" },
        { name: "Conversions / Total revenue", description: "Outcome metrics" },
      ],
      dimensions: [
        { name: "Session source / medium / default channel group", description: "Where traffic came from" },
        { name: "Campaign name", description: "UTM campaign attribution" },
        { name: "Landing page / page path", description: "Which pages drove or received traffic" },
        { name: "Country / device category", description: "Audience segmentation" },
        { name: "Date", description: "Trend and period comparisons" },
      ],
      faqs: [
        {
          question: "Is this Google's official Google Analytics MCP server?",
          answer:
            "No. ARLO is a third-party MCP connector built on the public Google Analytics Data API. It requires you to grant OAuth access to your own GA4 properties — it isn't an official Google product.",
        },
        {
          question: "Do I need to know the GA4 API or write GAQL-style queries?",
          answer:
            "No. You ask Claude in plain English; ARLO translates the request into the correct Analytics Data API call and returns the numbers Claude uses to answer you.",
        },
        {
          question: "Is my GA4 data stored anywhere?",
          answer:
            "No. ARLO is pass-through — each query fetches live data from GA4 and returns it to Claude for that one response. Nothing is warehoused or cached long-term.",
        },
        {
          question: "Can I connect GA4 for more than one client?",
          answer:
            "Yes. One Google OAuth grant per team member covers every GA4 property you assign. Add a client, pick their property from the dropdown, and Claude can query it immediately.",
        },
        {
          question: "Does this work with Claude Code or only Claude Desktop?",
          answer:
            "Any MCP-compatible client works, including Claude Code and Cursor. Claude Desktop is the primary supported client because it's free and has the simplest connector setup.",
        },
      ],
    },
    relatedServiceSlugs: ["seo-specialist", "account-manager"],
    relatedComparisonSlugs: ["supermetrics-vs-arlo"],
    relatedConnectorSlugs: ["google-ads-mcp", "search-console-mcp", "youtube-mcp"],
  },

  "google-ads-mcp": {
    slug: "google-ads-mcp",
    sourceName: "Google Ads",
    sourceShortName: "Google Ads",
    color: "#4285F4",
    title: "Google Ads MCP: Connect Google Ads to Claude",
    metaTitle: "Google Ads MCP | Connect Google Ads to Claude — ARLO",
    metaDescription:
      "Connect Google Ads to Claude Desktop through ARLO's MCP server. Ask Claude about spend, clicks, and conversions across every campaign and every client MCC account — no exports, no dashboards.",
    tldr:
      "ARLO is an MCP server that gives Claude live, read-only access to Google Ads through the Google Ads API. Connect your MCC once with OAuth, assign accounts to clients, and Claude can answer questions about spend, clicks, and conversions across any campaign or ad group on demand.",
    lastUpdated: "2026-07-04",
    sections: {
      why: {
        heading: "Why connect Google Ads to Claude instead of switching MCC accounts",
        body:
          "Managing Google Ads for multiple clients usually means switching MCC accounts, re-applying the same segment and date filters, and exporting to a spreadsheet before you can actually compare anything. An MCP connector skips the UI entirely: Claude calls the Google Ads API for the account you specify and returns the numbers directly, so \"which campaigns had the highest cost per conversion this month\" is a one-line question instead of a report you build by hand.",
      },
      steps: [
        {
          title: "Connect Google",
          description:
            "Sign in to ARLO and grant Google OAuth once. The same grant covers Google Ads alongside GA4, Search Console, YouTube, and Business Profile.",
        },
        {
          title: "Assign Google Ads accounts",
          description:
            "Pick each client's Google Ads account from a searchable dropdown, including sub-accounts under an MCC. Assign as many accounts as you manage.",
        },
        {
          title: "Paste your MCP URL into Claude Desktop",
          description:
            "ARLO generates a personal MCP URL. Add it under Claude Desktop → Settings → Connectors and Google Ads shows up as a tool Claude can call for any assigned account.",
        },
      ],
      prompts: [
        "What was total spend and conversions for [Client]'s Google Ads account last week?",
        "Which campaigns have the highest cost per conversion this month?",
        "Compare click-through rate across ad groups for [Client] this week.",
        "How does this month's Google Ads spend compare to last month across all my clients?",
        "Break down conversion value by campaign for [Client] over the last 30 days.",
      ],
      metrics: [
        { name: "Impressions / Clicks", description: "Reach and engagement volume" },
        { name: "Click-through rate (CTR)", description: "Ad relevance and creative performance" },
        { name: "Average CPC / Cost", description: "Spend efficiency" },
        { name: "Conversions / Conversion value", description: "Outcome and revenue tracking" },
        { name: "All conversions", description: "Full conversion volume including view-through" },
      ],
      dimensions: [
        { name: "Campaign name / status", description: "Campaign-level breakdowns" },
        { name: "Ad group name", description: "Ad group-level breakdowns" },
        { name: "Date", description: "Trend and period comparisons" },
        { name: "Device", description: "Desktop / mobile / tablet segmentation" },
      ],
      faqs: [
        {
          question: "Is this Google's official Google Ads MCP server?",
          answer:
            "No. ARLO is a third-party MCP connector built on the public Google Ads API. It requires OAuth access to your own Google Ads accounts — it isn't an official Google product.",
        },
        {
          question: "Do I need to write Google Ads Query Language (GAQL)?",
          answer:
            "No. You ask Claude in plain English; ARLO translates the request into the correct Google Ads API query and returns the results for Claude to summarize.",
        },
        {
          question: "Can I query accounts under a manager (MCC) account?",
          answer:
            "Yes. Assign each client's Google Ads account — including sub-accounts under an MCC — from the dropdown, and Claude can query any account you've assigned without switching contexts.",
        },
        {
          question: "Is my Google Ads data stored anywhere?",
          answer:
            "No. ARLO is pass-through — each query fetches live data from the Google Ads API and returns it for that one response. Nothing is warehoused.",
        },
        {
          question: "Does ARLO support Quality Score or search-term reports?",
          answer:
            "Not yet. Today's connector covers impressions, clicks, CTR, CPC, cost, and conversions at the campaign and ad-group level. Quality Score and search-term data are on the roadmap.",
        },
      ],
    },
    relatedServiceSlugs: ["google-ads-specialist"],
    relatedComparisonSlugs: ["supermetrics-vs-arlo"],
    relatedConnectorSlugs: ["google-analytics-mcp", "search-console-mcp"],
  },

  "search-console-mcp": {
    slug: "search-console-mcp",
    sourceName: "Google Search Console",
    sourceShortName: "Search Console",
    color: "#4285F4",
    title: "Search Console MCP: Connect GSC to Claude",
    metaTitle: "Search Console MCP | Connect Google Search Console to Claude — ARLO",
    metaDescription:
      "Connect Google Search Console to Claude Desktop through ARLO's MCP server. Ask Claude about clicks, impressions, and average position for any client — no exports, no dashboards.",
    tldr:
      "ARLO is an MCP server that gives Claude live, read-only access to Google Search Console through the Search Analytics API. Connect once with Google OAuth, assign a property to a client, and Claude can answer questions about clicks, impressions, CTR, and average position by query or page — nothing is exported, warehoused, or scheduled.",
    lastUpdated: "2026-07-06",
    sections: {
      why: {
        heading: "Why connect Search Console to Claude instead of digging through the GSC UI",
        body:
          "Search Console's Performance report is powerful but slow to work with: you pick a date range, filter by query or page, then export to compare periods by hand. Most agencies re-run the same checks every week — which queries gained or lost clicks, whether a page's average position moved, which URLs dropped out of the index. An MCP connector skips the UI: Claude calls the Search Analytics API directly, so \"which queries lost the most clicks this month\" becomes a sentence instead of a manual comparison across two exported CSVs.",
      },
      steps: [
        {
          title: "Connect Google",
          description:
            "Sign in to ARLO and grant Google OAuth once. The same grant also unlocks GA4, Google Ads, YouTube, and Business Profile — no separate Search Console-only integration to configure.",
        },
        {
          title: "Assign the Search Console property",
          description:
            "Pick the verified property from a searchable dropdown for each client or business you track. Multi-client agencies assign as many properties as they have Search Console access to.",
        },
        {
          title: "Paste your MCP URL into Claude Desktop",
          description:
            "ARLO generates a personal MCP URL. Add it under Claude Desktop → Settings → Connectors and Search Console shows up as a tool Claude can call.",
        },
      ],
      prompts: [
        "How did clicks and impressions trend for [Client] over the last 28 days?",
        "Which queries lost the most clicks compared to last month?",
        "What's the average position for [Client]'s top 10 landing pages?",
        "Break down this month's Search Console clicks by device.",
        "Which pages have high impressions but a low click-through rate?",
      ],
      metrics: [
        { name: "Clicks", description: "Times a user clicked through from search results" },
        { name: "Impressions", description: "Times a URL appeared in search results" },
        { name: "CTR", description: "Click-through rate — clicks divided by impressions" },
        { name: "Position", description: "Average ranking position for a query or page" },
      ],
      dimensions: [
        { name: "Query", description: "The search term that triggered the impression" },
        { name: "Page", description: "The specific URL that appeared in results" },
        { name: "Country", description: "Where the search took place" },
        { name: "Device", description: "Desktop, mobile, or tablet" },
        { name: "Date", description: "Trend and period comparisons" },
        { name: "Search appearance", description: "Rich result type (e.g. FAQ, video, AMP)" },
      ],
      faqs: [
        {
          question: "Is this Google's official Search Console MCP server?",
          answer:
            "No. ARLO is a third-party MCP connector built on the public Search Console Search Analytics API. It requires you to grant OAuth access to your own verified properties — it isn't an official Google product.",
        },
        {
          question: "Do I need to know the Search Console API to use this?",
          answer:
            "No. You ask Claude in plain English; ARLO translates the request into the correct Search Analytics API call and returns the numbers Claude uses to answer you.",
        },
        {
          question: "Is my Search Console data stored anywhere?",
          answer:
            "No. ARLO is pass-through — each query fetches live data from Search Console and returns it to Claude for that one response. Nothing is warehoused or cached long-term.",
        },
        {
          question: "Can I connect Search Console for more than one client?",
          answer:
            "Yes. One Google OAuth grant per team member covers every verified property you assign. Add a client, pick their property from the dropdown, and Claude can query it immediately.",
        },
        {
          question: "Does this cover URL Inspection or indexing status?",
          answer:
            "Not yet. Today's connector covers Search Analytics data — clicks, impressions, CTR, and position by query, page, country, device, and date. URL Inspection is not currently supported.",
        },
      ],
    },
    relatedServiceSlugs: ["seo-specialist"],
    relatedComparisonSlugs: ["supermetrics-vs-arlo"],
    relatedConnectorSlugs: ["google-analytics-mcp", "google-ads-mcp", "youtube-mcp"],
  },

  "youtube-mcp": {
    slug: "youtube-mcp",
    sourceName: "YouTube Analytics",
    sourceShortName: "YouTube",
    color: "#FF0000",
    title: "YouTube MCP: Connect YouTube Analytics to Claude",
    metaTitle: "YouTube MCP | Connect YouTube Analytics to Claude — ARLO",
    metaDescription:
      "Connect YouTube Analytics to Claude Desktop through ARLO's MCP server. Ask Claude about views, watch time, and subscriber growth for any client channel — no exports, no dashboards.",
    tldr:
      "ARLO is an MCP server that gives Claude live, read-only access to YouTube Analytics through the YouTube Analytics API. Connect once with Google OAuth, assign a channel ID to a client, and Claude can answer questions about views, watch time, subscriber growth, and engagement on demand — nothing is exported, warehoused, or scheduled.",
    lastUpdated: "2026-07-16",
    sections: {
      why: {
        heading: "Why connect YouTube Analytics to Claude instead of opening YouTube Studio",
        body:
          "YouTube Studio's analytics tab is built for browsing one chart at a time, not answering a specific client question fast. Most agencies managing a channel end up re-checking the same numbers every week — views and watch time for the month, which videos gained the most subscribers, how average view duration is trending — then typing them into a report by hand. An MCP connector removes that step: Claude calls the YouTube Analytics API directly, so \"how many subscribers did we gain last month and which video drove it\" becomes a sentence instead of a trip through Studio's tabs and date pickers.",
      },
      steps: [
        {
          title: "Connect Google",
          description:
            "Sign in to ARLO and grant Google OAuth once. The same grant also unlocks GA4, Search Console, and Google Ads — no separate YouTube-only integration to configure.",
        },
        {
          title: "Assign the channel ID",
          description:
            "Add the YouTube channel ID for each client or business you manage. Multi-client agencies assign as many channels as they run.",
        },
        {
          title: "Paste your MCP URL into Claude Desktop",
          description:
            "ARLO generates a personal MCP URL. Add it under Claude Desktop → Settings → Connectors and YouTube Analytics shows up as a tool Claude can call.",
        },
      ],
      prompts: [
        "How many views and watch minutes did [Client]'s channel get last month?",
        "Which video gained the most subscribers this quarter?",
        "How does this month's average view duration compare to last month?",
        "Break down last week's views by traffic source for [Client].",
        "What's the like-to-view ratio on our five most recent uploads?",
      ],
      metrics: [
        { name: "Views", description: "Total video views over the date range" },
        { name: "Estimated minutes watched", description: "Total watch time" },
        { name: "Average view duration / percentage", description: "How much of each video gets watched" },
        { name: "Subscribers gained / lost", description: "Net channel growth" },
        { name: "Likes / dislikes / comments / shares", description: "Engagement signals" },
        { name: "Annotation click-through rate", description: "On-video prompt performance" },
      ],
      dimensions: [
        { name: "Day", description: "Daily breakdown for trend lines" },
        { name: "Video", description: "Per-video performance" },
        { name: "Country", description: "Where views came from" },
        { name: "Device type", description: "Desktop, mobile, tablet, TV, or console" },
        { name: "Traffic source type", description: "Search, suggested, external, playlists, and more" },
      ],
      faqs: [
        {
          question: "Is this YouTube's official MCP server?",
          answer:
            "No. ARLO is a third-party MCP connector built on the public YouTube Analytics API. It requires you to grant OAuth access to your own channel — it isn't an official YouTube or Google product.",
        },
        {
          question: "Do I need to know the YouTube Analytics API to use this?",
          answer:
            "No. You ask Claude in plain English; ARLO translates the request into the correct YouTube Analytics API call and returns the numbers Claude uses to answer you.",
        },
        {
          question: "Is my YouTube data stored anywhere?",
          answer:
            "No. ARLO is pass-through — each query fetches live data from the YouTube Analytics API and returns it to Claude for that one response. Nothing is warehoused or cached long-term.",
        },
        {
          question: "Can I connect YouTube channels for more than one client?",
          answer:
            "Yes. One Google OAuth grant per team member covers every channel ID you assign. Add a client, enter their channel ID, and Claude can query it immediately.",
        },
        {
          question: "Does this cover YouTube ad spend or only organic analytics?",
          answer:
            "Only organic channel analytics today — views, watch time, subscribers, and engagement. Ad spend on YouTube runs through the separate Google Ads connector.",
        },
      ],
    },
    relatedServiceSlugs: ["agency-owner", "account-manager"],
    relatedComparisonSlugs: ["supermetrics-vs-arlo"],
    relatedConnectorSlugs: ["google-analytics-mcp", "search-console-mcp"],
  },
};

export function getConnectorBySlug(slug: string): ConnectorPage | null {
  return connectors[slug] ?? null;
}

export function getAllConnectorSlugs(): string[] {
  return Object.keys(connectors);
}
