/* eslint-disable @typescript-eslint/no-explicit-any */
/** Per-page content for the Agency Owner page. Edit text/links here → this page only.
 *  FAQ items here MUST match the FAQPage JSON-LD in _shell.html. */
const agencyOwner: Record<string, any> = {
  cta: {
    eyebrow: "Get started",
    heading: "See your whole portfolio, live.",
    buttonText: "Start For Free",
    buttonHref: "/welcome",
  },

  faq: {
    eyebrow: "FAQ",
    heading: "The questions agency owners ask most",
    subtext: "Everything owners ask before rolling ARLO out to the team.",
    contactPre: "Can't find what you're looking for? Contact our",
    contactHref: "/contact",
    contactLink: "support team",
    items: [
      {
        q: "How does this agency reporting software handle team access?",
        a: "Every team member signs in with their own account under your agency workspace. You control who can see which clients, and the audit log shows every query by user, client, and timestamp.",
      },
      {
        q: "Can I use it to justify a new hire?",
        a: "Yes. Pair ARLO's performance data with the audit log to see which accounts a new hire is working on and whether those accounts are improving. It won't replace a billability tool, but it gives you the outcomes side of the equation.",
      },
      {
        q: "What about data governance and client trust?",
        a: "ARLO only reads the Google accounts you connect, never stores client data outside your workspace, and keeps a full audit log for you to review. Client data never leaves your permission scope.",
      },
      {
        q: "How does pricing work as the team grows?",
        a: "ARLO is priced per seat with agency plans for 10+ users. No per-client fees, no per-query fees, and no surprise bills when usage spikes during QBR season.",
      },
      {
        q: "Can my whole team use it?",
        a: "Yes. Every member gets their own MCP token so every query is attributed, while connections stay at the workspace level.",
      },
    ],
  },
};
export default agencyOwner;
