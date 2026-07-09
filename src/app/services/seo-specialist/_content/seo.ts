/* eslint-disable @typescript-eslint/no-explicit-any */
/** Per-page content for the SEO Specialist page. Edit text/links here → this page only.
 *  Structure/styling lives in the shared templates under /arlo/_components/*.html. */
const seo: Record<string, any> = {
  cta: {
    eyebrow: "Get started",
    heading: "Answer any SEO question, live.",
    buttonText: "Start For Free",
    buttonHref: "/welcome",
  },

  faq: {
    eyebrow: "FAQ",
    heading: "The questions we get most",
    subtext: "Everything agencies ask before connecting their first client.",
    contactPre: "Can't find what you're looking for? Contact our",
    contactHref: "/contact",
    contactLink: "support team",
    items: [
      {
        q: "How do I connect a client's Google accounts?",
        a: "One Google OAuth grant per client covers GA4, Search Console, Google Ads, YouTube, and Business Profile. Assign each client their properties once, then query them all from Claude.",
      },
      {
        q: "Does ARLO store my clients' data?",
        a: "No. ARLO is a pure pass-through connector — every metric is fetched live the moment you ask and streamed straight to Claude. Nothing is ever written to disk.",
      },
      {
        q: "Which SEO surfaces does ARLO connect to?",
        a: "Search Console, GA4, PageSpeed Insights for Core Web Vitals, and Google Business Profile — so rankings, indexation, traffic, and local SEO are all one prompt away.",
      },
      {
        q: "How do I actually ask a question?",
        a: "Paste your MCP URL into Claude Desktop and ask in plain language. No exports, no dashboards, no tab-hopping.",
      },
      {
        q: "Can my whole team use it?",
        a: "Yes. Every member gets their own MCP token so every query is attributed, while connections stay at the workspace level.",
      },
    ],
  },
};
export default seo;
