/* eslint-disable @typescript-eslint/no-explicit-any */
/** Per-page content for the Account Manager page. Edit text/links here → this page only.
 *  Structure/styling lives in the shared templates under /arlo/_components/*.html.
 *  FAQ items here MUST match the FAQPage JSON-LD in _shell.html. */
const accountManager: Record<string, any> = {
  cta: {
    eyebrow: "Get started",
    heading: "Answer any client question, live.",
    buttonText: "Start For Free",
    buttonHref: "/welcome",
  },

  faq: {
    eyebrow: "FAQ",
    heading: "The questions account teams ask most",
    subtext: "Everything client-facing teams ask before their first connection.",
    contactPre: "Can't find what you're looking for? Contact our",
    contactHref: "/contact",
    contactLink: "support team",
    items: [
      {
        q: "I'm not technical. Will this client reporting tool fit how I work?",
        a: "If you can use Slack and Google Docs, you can use ARLO. There's no SQL, no dashboard building, and no query language — you type the question the same way you'd ask a teammate.",
      },
      {
        q: "Can I share answers with clients?",
        a: "Yes. Claude gives you plain-text responses you can paste into a recap email or Slack reply, or turn into talking points for a QBR. Most account managers draft the update in ARLO and then polish it for voice.",
      },
      {
        q: "What happens when specialists change account access?",
        a: "ARLO inherits whatever Google permissions you already have. When access changes, the data available to you updates automatically — nothing to re-sync.",
      },
      {
        q: "Does it work for multi-location clients?",
        a: "Yes. Ask ARLO about a client with 40 Google Business Profile locations and it aggregates the view while still letting you drill into any one location — great for franchise and multi-location brands.",
      },
      {
        q: "Can my whole team use it?",
        a: "Yes. Every member gets their own MCP token so every query is attributed, while connections stay at the workspace level.",
      },
    ],
  },
};
export default accountManager;
