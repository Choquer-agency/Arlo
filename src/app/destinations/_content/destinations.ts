/* eslint-disable @typescript-eslint/no-explicit-any */
/** Per-page content for the Destinations page. Edit text/links here → this page only.
 *  FAQ items MUST match the FAQPage JSON-LD in _shell.html. */
const destinations: Record<string, any> = {
  cta: {
    eyebrow: "Get started",
    heading: "Connect once. Send your data anywhere.",
    buttonText: "Start For Free",
    buttonHref: "/welcome",
  },

  faq: {
    eyebrow: "FAQ",
    heading: "Destinations, answered",
    subtext: "How ARLO gets your live data into the tools your clients already open.",
    contactPre: "Can't find what you're looking for? Contact our",
    contactHref: "/contact",
    contactLink: "support team",
    items: [
      {
        q: "What's the difference between a live connector and a scheduled push?",
        a: "A live connector like Looker Studio queries ARLO on demand, so the dashboard is always current. A scheduled push or digest — warehouses, Slack, email — sends data on a cadence you choose: hourly, daily, or weekly.",
      },
      {
        q: "How fresh is the data in each destination?",
        a: "Live connectors pull the moment someone opens the report, so there are no stale CSVs. Scheduled destinations are as fresh as the cadence you set, and every run carries that day's numbers.",
      },
      {
        q: "Can I client-brand the dashboards and reports?",
        a: "Yes. Clone the ARLO template, point it at a client, and it renders with their branding. The Shareable Arlo Dashboard gives each client a tokenized, client-branded, read-only URL — no login required.",
      },
      {
        q: "Do I need a data warehouse to use ARLO?",
        a: "No. Destinations are optional. ARLO's core is live Claude queries with nothing stored — warehouses like BigQuery and Snowflake are there only for teams whose analysts want the raw data in their own stack.",
      },
      {
        q: "Which destinations are available now?",
        a: "Looker Studio, Google Sheets, Google BigQuery, and the Slack Digest are live or in beta today. Power BI, Excel, Snowflake, Redshift, Databricks, Notion, Airtable and more are coming — the roadmap is driven by what agencies request.",
      },
      {
        q: "How do I request a destination you haven't built?",
        a: "Hit “Request a destination” and tell us where your clients want their data. Every ask bumps that destination up the queue — the roadmap is demand-driven.",
      },
    ],
  },
};
export default destinations;
