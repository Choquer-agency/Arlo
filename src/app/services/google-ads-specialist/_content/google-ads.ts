/* eslint-disable @typescript-eslint/no-explicit-any */
/** Per-page content for the Google Ads Specialist page. Edit text/links here → this page only.
 *  Structure/styling lives in the shared templates under /arlo/_components/*.html.
 *  FAQ items here MUST match the FAQPage JSON-LD in _shell.html. */
const googleAds: Record<string, any> = {
  cta: {
    eyebrow: "Get started",
    heading: "Answer any Google Ads question, live.",
    buttonText: "Start For Free",
    buttonHref: "/welcome",
  },

  faq: {
    eyebrow: "FAQ",
    heading: "The questions paid teams ask most",
    subtext: "Everything agencies ask before connecting their first MCC.",
    contactPre: "Can't find what you're looking for? Contact our",
    contactHref: "/contact",
    contactLink: "support team",
    items: [
      {
        q: "Does ARLO work with MCC (manager) accounts?",
        a: "Yes. Connect the Google account that has MCC access and every linked client account is available. ARLO respects your existing MCC permissions — nothing is exposed that you can't already see.",
      },
      {
        q: "Is this a PPC reporting tool, or can it change campaigns?",
        a: "Today ARLO is a read-focused PPC reporting tool: it pulls live data and answers questions across every Google Ads account. Bulk editing and campaign changes are on the roadmap and opt-in, since most agencies want a clear line between analysis and execution.",
      },
      {
        q: "What about Performance Max opacity?",
        a: "ARLO surfaces every PMax metric the API exposes — asset group performance and search category insights included. You get the same visibility the Ads UI gives you, just queryable in plain language across all clients.",
      },
      {
        q: "Does it replace Optmyzr or similar tools?",
        a: "Different job. Optmyzr is built around recommendations and bulk actions. ARLO is built around asking live questions across all your accounts at once. Most PPC teams we talk to use both.",
      },
      {
        q: "Can my whole team use it?",
        a: "Yes. Every member gets their own MCP token so every query is attributed, while connections stay at the workspace level.",
      },
    ],
  },
};
export default googleAds;
