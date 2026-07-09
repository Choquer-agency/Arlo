/* eslint-disable @typescript-eslint/no-explicit-any */
/** Per-page content for the Contact (v2) page. Edit text/links here → this page only.
 *  Structure/styling lives in the shared templates under /arlo/_components/*.html.
 *  The hero + three topic cards + popup forms live inline in ./_shell.html. */
const contact: Record<string, any> = {
  cta: {
    eyebrow: "Get started",
    heading: "Ask Claude about any client, live.",
    buttonText: "Start For Free",
    buttonHref: "/welcome",
  },

  faq: {
    eyebrow: "FAQ",
    heading: "Before you reach out",
    subtext: "The things people usually want to know before they send a message.",
    contactPre: "Still stuck? Reach the team directly at",
    contactHref: "mailto:hello@askarlo.app",
    contactLink: "hello@askarlo.app",
    items: [
      {
        q: "How fast will I hear back?",
        a: "Every message lands straight with the ARLO team, not a support queue. We reply inside one business day — usually much faster.",
      },
      {
        q: "I found a bug. What should I include?",
        a: "The more specific the better: what you asked, what platform or client it touched, and what happened versus what you expected. Screenshots help but aren't required.",
      },
      {
        q: "I have a feature idea — will you actually read it?",
        a: "Yes. Roadmap decisions are shaped by what agencies ask for. Every idea is read by the people building ARLO, and we'll tell you where it lands.",
      },
      {
        q: "What counts as an enterprise integration?",
        a: "SSO/SAML, data residency, self-host, custom connectors, dedicated support, or volume pricing. Pick the enterprise card and we'll come back with a scoped plan.",
      },
      {
        q: "Do you store my clients' data?",
        a: "No. ARLO is a pure pass-through connector — every metric is fetched live the moment you ask and streamed straight to Claude. Nothing is ever written to disk.",
      },
    ],
  },
};
export default contact;
