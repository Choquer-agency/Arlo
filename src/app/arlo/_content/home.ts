/* eslint-disable @typescript-eslint/no-explicit-any */
/** Per-page content for the ARLO home page.
 *  Edit text/links HERE → affects ONLY this page.
 *  Structure/styling lives in the shared templates under _components/*.html
 *  → edit there → affects EVERY page that uses that component. */
const home: Record<string, any> = {
  cta: {
    eyebrow: "Get started",
    heading: "Ask Claude about any client, today.",
    buttonText: "Start For Free",
    buttonHref: "/welcome",
  },

  blog: {
    eyebrow: "ARLO Blog",
    heading: "Notes on running Claude across every client",
    cards: [
      {
        href: "/blog",
        image: "/arlo/bg/lavender-house.webp",
        tag: "Guide",
        title: "Connect GA4, Search Console &amp; Google Ads to Claude in five minutes",
        meta: "Coming soon",
      },
      {
        href: "/blog",
        image: "/arlo/bg/pyramids.webp",
        tag: "Playbook",
        title: "One MCP URL, every client: how agencies scale reporting with ARLO",
        meta: "Coming soon",
      },
      {
        href: "/blog",
        image: "/arlo/bg/autumn-valley.webp",
        tag: "Product",
        title: "Live data without the warehouse — why ARLO never stores your numbers",
        meta: "Coming soon",
      },
    ],
  },

  "big-statement": {
    eyebrow: "Security",
    headingHidden: "Nothing to store. Nothing to breach.",
    subtextHidden:
      "Arlo is a pure pass-through connector. Because it never keeps a copy of your clients' data, your security surface is just two things you already trust.",
    lead: `Our security model is simple: <span class="arlo-hl">we store nothing.</span> Every metric is fetched live the moment you ask and streamed straight to Claude. Your data never leaves the platforms it already lives in — so there's <span class="arlo-hl">no Arlo database to breach</span>, leak, or subpoena.`,
    points: [
      {
        title: "Zero data retention",
        body: "Nothing is written to disk. Ever. Arlo holds a live connection, never a copy.",
      },
      {
        title: "OAuth pass-through",
        body: "We only see what each scope allows — and you can revoke access in one click.",
      },
      {
        title: "Governed by Anthropic",
        body: "Once a number reaches Claude, it's covered by Anthropic's enterprise, zero-retention security.",
      },
    ],
  },

  "three-cards": {
    cards: [
      {
        image: "/arlo/bg/tuscany.webp",
        icon: "/arlo/ui/arlo-icon-connect.svg",
        lead: "Connect.",
        body: "One Google OAuth grant covers GA4, Search Console, Google Ads, YouTube, and Business Profile for every client.",
      },
      {
        image: "/arlo/bg/autumn-valley.webp",
        icon: "/arlo/ui/arlo-icon-assign.svg",
        lead: "Assign.",
        body: "Give each client their GA4 property, GSC site, and ad accounts from searchable dropdowns.",
      },
      {
        icon: "/arlo/ui/arlo-icon-ask.svg",
        lead: "Ask.",
        body: "Paste your MCP URL into Claude Desktop and ask live questions — no exports, no dashboards, no warehouse.",
      },
    ],
  },

  "feature-tabs": {
    eyebrow: "One connector",
    heading: "One connector for every role at your agency",
    tabs: [
      { label: "SEO specialists", body: "Answer rankings, indexation, and Core Web Vitals across every client in one window" },
      { label: "Account managers", body: "Track spend, Quality Score drops, and campaign health across every ad account" },
      { label: "Agency owners", body: "Assign each client their properties once, then query them all from Claude" },
      { label: "Business owners", body: "See which clients are trending down before they churn" },
    ],
    trio: [
      { title: "Live query engine", body: "Claude calls marketing tools like marketing_query and marketing_compare — live data straight from the source, every time." },
      { title: "Per-person audit logs", body: "Every member gets their own MCP token, so every query is attributed — connections still live at the workspace level." },
      { title: "Workspace connections", body: "Connect each platform once at the workspace level — one Google OAuth unlocks GA4, GSC, Ads, YouTube, and GBP together. ARLO." },
    ],
  },

  timer: {
    eyebrow: "Destinations",
    heading: "Sync to every destination",
    dest: [
      { name: "Looker Studio", body: "Push live client data into branded Looker Studio dashboards that never go stale." },
      { name: "Slack", body: "Send scheduled performance digests straight to the client's Slack channel." },
      { name: "Google Sheets", body: "Push live client metrics into Google Sheets for custom models, pivots, and the reports your team already lives in." },
    ],
  },
};

export default home;
