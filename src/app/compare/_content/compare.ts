/* eslint-disable @typescript-eslint/no-explicit-any */
/** Per-page content for the /compare hub. Card data is derived from
 *  src/content/comparisons.ts (single source of truth) in route.ts —
 *  this file only holds the static copy (hero, cta, faq).
 *  FAQ items MUST match the FAQPage JSON-LD in _shell.html. */
const compare: Record<string, any> = {
  cta: {
    eyebrow: "Get started",
    heading: "Skip the dashboard. Just ask Claude.",
    buttonText: "Start For Free",
    buttonHref: "/welcome",
  },

  faq: {
    eyebrow: "FAQ",
    heading: "Comparisons, answered",
    subtext: "How ARLO stacks up against the reporting and pipeline tools agencies already pay for.",
    contactPre: "Comparing something not listed here? Talk to our",
    contactHref: "/contact",
    contactLink: "team",
    items: [
      {
        q: "Which comparison should I read first?",
        a: "If you're already paying for a data pipeline or warehouse (BigQuery, Snowflake), start with Windsor.ai or Supermetrics. If you're paying for a white-label dashboard or scheduled client reports, start with AgencyAnalytics or Whatagraph — closer to what most of these tools actually replace for agencies.",
      },
      {
        q: "Does ARLO replace all of these tools completely?",
        a: "Not always. ARLO replaces the reason most agencies open these tools — \"how did last month go?\" — with a live Claude query instead of a dashboard or export. Some agencies still keep a pipeline tool for warehouse-bound analysts, or a report builder for clients who contractually expect a recurring PDF. Each comparison page is honest about that tradeoff.",
      },
      {
        q: "Is ARLO actually free, or is this a bait-and-switch?",
        a: "ARLO is free during early access — unlimited clients, sources, and team seats, no credit card. Paid tiers will exist once we're out of early access, but nothing you connect today gets cut off or held hostage.",
      },
      {
        q: "What if the tool I want to compare isn't listed here?",
        a: "This page only lists comparisons we've actually written and fact-checked against the competitor's real feature set — we don't publish comparison pages for tools we haven't researched. Tell us which tool you're evaluating against and we'll prioritize it.",
      },
    ],
  },
};
export default compare;
