/* eslint-disable @typescript-eslint/no-explicit-any */
/** Per-page content for the Meta / Paid Social page. Edit text/links here → this page only.
 *  FAQ items here MUST match the FAQPage JSON-LD in _shell.html. */
const metaAds: Record<string, any> = {
  cta: {
    eyebrow: "Get started",
    heading: "Answer any paid social question, live.",
    buttonText: "Start For Free",
    buttonHref: "/welcome",
  },

  faq: {
    eyebrow: "FAQ",
    heading: "The questions paid social buyers ask most",
    subtext: "What ARLO does for paid social today — and what's coming in Phase 2.",
    contactPre: "Can't find what you're looking for? Contact our",
    contactHref: "/contact",
    contactLink: "support team",
    items: [
      {
        q: "When does native Meta, LinkedIn, and TikTok Ads support land?",
        a: "Native ad-platform connections are Phase 2 on our roadmap. We won't promise a week, but early ARLO accounts get first access the second betas open. Today, paid social reporting runs on GA4 as the source of truth.",
      },
      {
        q: "What can this paid social reporting tool do today?",
        a: "Everything GA4 can tell you about paid social performance: sessions, conversions, revenue, and assisted conversions by channel and campaign. That covers most weekly client reporting questions before native connectors even ship.",
      },
      {
        q: "Will it use Conversions API (CAPI) data?",
        a: "Yes. When native Meta support launches, ARLO reads whichever attribution signal the ad account is configured to use, including CAPI-enriched data. You see what Ads Manager sees.",
      },
      {
        q: "Is pricing different for Phase 2 features?",
        a: "No. Phase 2 platform connectors are included in your ARLO subscription — no surprise upcharges when they ship. You get the new platforms on the plan you already have.",
      },
      {
        q: "Can my whole team use it?",
        a: "Yes. Every member gets their own MCP token so every query is attributed, while connections stay at the workspace level.",
      },
    ],
  },
};
export default metaAds;
