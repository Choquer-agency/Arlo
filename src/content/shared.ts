import { ProcessStep, Testimonial, FAQItem, PricingTier, ComparisonRow } from "./config";

/* ─── Process Steps ─── */

export const processSteps: ProcessStep[] = [
  {
    step: 1,
    title: "Sign up",
    description:
      "Create your agency workspace in 30 seconds with Google. 14-day free trial, no card.",
  },
  {
    step: 2,
    title: "Connect Google",
    description:
      "One OAuth grant covers GA4, Search Console, Google Ads, YouTube, and Business Profile for every client.",
  },
  {
    step: 3,
    title: "Add your clients",
    description:
      "Assign each client their GA4 property, GSC site, and ad accounts from searchable dropdowns.",
  },
  {
    step: 4,
    title: "Copy your MCP URL",
    description:
      "Paste it into Claude Desktop → Settings → Connectors. That's the install.",
  },
  {
    step: 5,
    title: "Just ask",
    description:
      "\"Last 28 days for Client X on GSC.\" \"Compare November to October for all clients.\" Claude fetches live numbers.",
  },
];

/* ─── Testimonials (placeholder — swap with real ones post-beta) ─── */

export const testimonials: Testimonial[] = [
  {
    quote:
      "We run 47 clients. Before ARLO, answering \"how was last month?\" meant 20 minutes in five dashboards. Now I ask Claude and have the answer before my coffee's done.",
    name: "Marcus Hale",
    title: "Founder",
    company: "Northpoint Digital",
    color: "#EBFFF6",
    featured: true,
  },
  {
    quote:
      "The audit log is the reason I bought it. Every team member gets their own token, I can see exactly what they're querying, and our clients' data never touches a warehouse.",
    name: "Priya Sundaram",
    title: "Head of Analytics",
    company: "Relay Performance",
    color: "#D0FF71",
  },
  {
    quote:
      "Windsor was costing us more per month than our office rent and nobody on the team was using it. ARLO replaced it for a tenth of the price and we actually look at our data now.",
    name: "Jordan Flores",
    title: "Managing Director",
    company: "Staircase Studio",
    color: "#27EAA6",
  },
];

/* ─── Stats ─── */

export const stats = {
  platformsSupported: 14,
  avgTimeToFirstQuery: 5,
  clientsPerWorkspaceMax: 200,
  avgQueryLatency: 2,
};

/* ─── Pain Points (The manual reporting problem) ─── */

export const saasProblems = [
  {
    stat: "5 dashboards",
    label: "To answer one question",
    description:
      "GA4, Search Console, Google Ads, Meta, YouTube — you tab-hop for every client check-in.",
  },
  {
    stat: "$500+/mo",
    label: "Just for ETL tools",
    description:
      "Windsor, Supermetrics, Improvado pipe data into a warehouse you then have to build dashboards on top of.",
  },
  {
    stat: "Stale data",
    label: "In every PDF report",
    description:
      "By the time the CSV is exported and the slide deck is built, the numbers are a week old.",
  },
];

/* ─── ARLO vs. the status quo ─── */

export const comparisonRows: ComparisonRow[] = [
  {
    feature: "Setup time",
    custom: "5 minutes — one OAuth, one URL",
    saas: "Days of BigQuery / Snowflake / schema config",
  },
  {
    feature: "How you get answers",
    custom: "Ask Claude in plain English",
    saas: "Build a dashboard, then read it",
  },
  {
    feature: "Data freshness",
    custom: "Live — queried on demand",
    saas: "Whatever the sync cadence is (hourly at best)",
  },
  {
    feature: "Data warehouse required",
    custom: "None — we never store client data",
    saas: "Yes (BigQuery, Snowflake, Redshift)",
  },
  {
    feature: "Per-client overhead",
    custom: "Pick a property from a dropdown",
    saas: "Configure a new pipeline + dashboard",
  },
  {
    feature: "Platforms included",
    custom: "14 at launch, all on every plan",
    saas: "Tiered — premium sources cost extra",
  },
  {
    feature: "Claude / AI access",
    custom: "The whole point",
    saas: "Paid add-on",
  },
  {
    feature: "Team cost",
    custom: "Unlimited team members on Studio and up",
    saas: "Per-seat — growth is penalized",
  },
  {
    feature: "Audit trail",
    custom: "Every tool call logged per user",
    saas: "Not usually — you export and forget",
  },
  {
    feature: "Cancellation",
    custom: "Monthly, no lock-in",
    saas: "Annual contracts common",
  },
];

/* ─── FAQ ─── */

export const faqs: FAQItem[] = [
  {
    category: "general",
    question: "What is ARLO, in one sentence?",
    answer:
      "ARLO is a Claude Desktop connector that turns your agency's client accounts (GA4, Search Console, Google Ads, Meta, YouTube, Shopify, and more) into something Claude can query in plain English.",
  },
  {
    category: "general",
    question: "Do I need Claude Desktop?",
    answer:
      "Yes — Claude Desktop (free or Pro) on Mac or Windows is how you connect. ARLO also works with any MCP-compatible client (Cursor, Cline, etc.), but Claude Desktop is the supported default.",
  },
  {
    category: "technical",
    question: "Do you store our clients' data?",
    answer:
      "No. ARLO is a pass-through — we fetch from Google / Meta / Shopify on demand and return results to Claude. We cache short-lived OAuth tokens and audit metadata only. No warehouse, no ETL, no pipeline to break.",
  },
  {
    category: "technical",
    question: "Which platforms do you support?",
    answer:
      "At launch: GA4, Search Console, Google Ads, YouTube, Google Business Profile, PageSpeed Insights, Meta Ads, LinkedIn Ads, TikTok Ads, Shopify, Stripe, HubSpot, MailerLite, and Mailchimp. More on the roadmap — vote for the next one on our Discord.",
  },
  {
    category: "technical",
    question: "How does the OAuth flow work?",
    answer:
      "Your workspace connects each platform once (one Google OAuth unlocks GA4, GSC, Ads, YouTube, and GBP together). Then you assign each client's specific property, account, or customer ID from a dropdown. Tokens are encrypted at rest with AES-256-GCM.",
  },
  {
    category: "technical",
    question: "Can my team share a single connection?",
    answer:
      "Yes. Connections live at the workspace level. Every member gets their own MCP token (so audit logs are per-person), but they all query the same shared client assignments.",
  },
  {
    category: "ownership",
    question: "Who owns the data?",
    answer:
      "You do — same as before ARLO. We never take ownership of your clients' analytics, ads, or revenue data. Disconnect in one click and it's gone from our systems.",
  },
  {
    category: "ownership",
    question: "What happens to my clients if I cancel?",
    answer:
      "Your OAuth connections and MCP tokens are revoked. Your clients' data in Google / Meta / etc. is untouched — it was always theirs. You can export your ARLO client list as CSV before you go.",
  },
  {
    category: "pricing",
    question: "Is there a free trial?",
    answer:
      "Yes — 14 days on any paid plan, no credit card required. We also have a permanent Free tier (1 client, 2 data sources, 100 MCP calls/mo) so you can test ARLO against one client forever.",
  },
  {
    category: "pricing",
    question: "What counts as an \"MCP call\"?",
    answer:
      "Every time Claude invokes one of our tools (marketing_query, marketing_compare, list_clients, etc.) counts as one call. A single \"how did Client X do last month?\" question is usually 2–4 calls depending on how Claude breaks it up.",
  },
  {
    category: "pricing",
    question: "What happens if I hit my monthly limit?",
    answer:
      "Soft cap at 150% — we email you when you cross your plan limit and throttle politely. You can upgrade any time from the billing page, or buy additional insights at $0.10 each pay-as-you-go.",
  },
  {
    category: "process",
    question: "How long does setup take?",
    answer:
      "Under 5 minutes end-to-end: sign up, connect Google, add one client, assign a property from the dropdown, copy the MCP URL into Claude Desktop. Your first working query happens on step six.",
  },
  {
    category: "process",
    question: "Can non-technical teammates use this?",
    answer:
      "Absolutely — that's the whole point. They install Claude Desktop, paste their personal URL, and start asking questions. No SQL, no BigQuery, no dashboard building.",
  },
  {
    category: "general",
    question: "How is this different from Windsor or Supermetrics?",
    answer:
      "Those tools pipe data into a warehouse or spreadsheet — then you have to build dashboards on top. ARLO skips that entirely: live queries directly against each platform, surfaced through Claude. No warehouse, no ETL, no dashboards. You just ask.",
  },
  {
    category: "general",
    question: "Can I use ARLO for my own business, not as an agency?",
    answer:
      "Yes — the Solo plan ($19/mo) is built for single-business owners. You get 7 source types (plenty for a typical stack of GA4, Search Console, Google Ads, Meta, Shopify/Stripe, and a mail tool) with a simplified single-business dashboard instead of the agency-client UI. Same Claude Desktop connector; same live queries. Just for one business.",
  },
  {
    category: "pricing",
    question: "What's the difference between Solo and Studio?",
    answer:
      "Solo ($19/mo) is designed around one business — your business. One \"client\" slot, 7 source types, simpler dashboard, 3 teammates. Studio ($99/mo) is for boutique agencies managing up to 10 separate clients with full client-switching, unlimited team seats, and the agency dashboard. If you're a solo operator today but plan to start taking clients, you can upgrade in one click when it's time.",
  },
  {
    category: "pricing",
    question: "What if I'm a solo operator today but grow into an agency?",
    answer:
      "Upgrade paths from Solo → Studio → Agency → Scale are one click each — your Convex data and connections carry over untouched. We'll also prompt you to upgrade the moment you try to add a 2nd client from a Solo plan (rather than silently blocking you).",
  },
];

/* ─── Pricing Tiers ─── */

export const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    priceRange: "$0",
    description:
      "Try ARLO on one business with 100 free queries a month.",
    includes: [
      "1 client",
      "2 source types",
      "1 team member",
      "100 MCP calls / month",
      "10 AI insights / month",
    ],
    color: "#BCEFFF",
  },
  {
    name: "Solo",
    priceRange: "$19/mo",
    description:
      "For the single business owner who wants Claude over their own analytics, ads, and store.",
    includes: [
      "1 business",
      "7 source types",
      "3 team members",
      "2,500 MCP calls / month",
      "50 AI insights / month",
    ],
    color: "#FFCA94",
  },
  {
    name: "Studio",
    priceRange: "$99/mo",
    description:
      "For boutique agencies with up to 10 clients and unlimited team seats.",
    includes: [
      "10 clients",
      "12 source types",
      "Unlimited team members",
      "25,000 MCP calls / month",
      "500 AI insights / month",
    ],
    color: "#D0FF71",
    featured: true,
  },
  {
    name: "Agency",
    priceRange: "$249/mo",
    description:
      "The sweet spot for growing agencies handling more clients, sources, and queries.",
    includes: [
      "25 clients",
      "18 source types",
      "Unlimited team members",
      "100,000 MCP calls / month",
      "2,000 AI insights / month",
    ],
    color: "#27EAA6",
  },
  {
    name: "Scale",
    priceRange: "$499/mo",
    description:
      "For larger agencies running up to 75 clients across unlimited platforms.",
    includes: [
      "75 clients",
      "Unlimited source types",
      "Unlimited team members",
      "500,000 MCP calls / month",
      "10,000 AI insights / month",
    ],
    color: "#C4EF7A",
  },
  {
    name: "Enterprise",
    priceRange: "Custom",
    description:
      "For agency networks needing unlimited scale, SSO, and a dedicated CSM.",
    includes: [
      "Unlimited clients",
      "All 107+ source types",
      "Unlimited team & calls",
      "SSO / SAML",
      "Dedicated CSM",
      "24hr SLA support",
      "Self-host / on-prem option",
    ],
    color: "#71CFA3",
    retainer: true,
  },
];
