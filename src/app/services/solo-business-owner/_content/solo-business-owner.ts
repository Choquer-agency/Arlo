/* eslint-disable @typescript-eslint/no-explicit-any */
/** Per-page content for the Solo Business Owner page. Edit text/links here → this page only.
 *  FAQ items here MUST match the FAQPage JSON-LD in _shell.html. */
const solo: Record<string, any> = {
  cta: {
    eyebrow: "Get started",
    heading: "Ask Claude about your business, live.",
    buttonText: "Start For Free",
    buttonHref: "/welcome",
  },

  faq: {
    eyebrow: "FAQ",
    heading: "The questions business owners ask most",
    subtext: "Everything a one-business owner asks before connecting their stack.",
    contactPre: "Can't find what you're looking for? Contact our",
    contactHref: "/contact",
    contactLink: "support team",
    items: [
      {
        q: "Is the Solo plan really just for one business?",
        a: "One business. You can add up to 3 teammates under Solo — perfect for a founder + ops person + part-time marketer. Everyone gets their own personal MCP URL to paste into Claude Desktop.",
      },
      {
        q: "What if I start managing other brands?",
        a: "Upgrade to Studio ($99/mo) when you add a 2nd client — we'll prompt you automatically, and your connections and data carry over. If you already run a portfolio, see ARLO for agency owners.",
      },
      {
        q: "Which platforms can I connect on Solo?",
        a: "Activate 7 source types — most owners need GA4, Search Console, Google Ads, Meta, Shopify, Stripe, and one email tool, which is exactly 7. Need more? Studio and Agency unlock higher source limits.",
      },
      {
        q: "Can I use ARLO without Claude Desktop?",
        a: "Any MCP-compatible client works — Cursor, Cline, and others. Claude Desktop is the supported default because it's free, stable, and the best UX for day-to-day queries. ARLO is a connector, not a chat app.",
      },
      {
        q: "How much does it cost?",
        a: "$19/mo for the Solo plan: 7 source types and 2,500 queries — enough for a busy e-commerce or service business without agency-tier pricing. 14-day trial, no card.",
      },
    ],
  },
};
export default solo;
