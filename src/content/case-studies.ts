import { CaseStudy } from "./config";

export const caseStudyMap: Record<string, CaseStudy> = {
  "choquer-agency": {
    slug: "choquer-agency",
    client: "Choquer Agency",
    industry: "Digital Marketing / SEO",
    color: "#27EAA6",
    saasReplaced: "Windsor + manual reporting",
    headline: "Origin story: the agency that built ARLO for itself first.",
    summary:
      "Choquer Agency — a boutique SEO and web development shop — built the first version of ARLO as an internal Claude connector. After months of answering client questions by tab-hopping across GA4, Search Console, and Google Ads, the team wired up an MCP so Claude could just ask the right platform directly. That internal tool is the seed product ARLO is built on.",
    challenge:
      "A portfolio of 30+ clients across SEO, Google Ads, and website work meant any \"how's it going?\" question required logging into five different dashboards, exporting CSVs, and pasting totals into a weekly report. Account managers were spending 4-6 hours per week on manual reporting — and the data was a week stale by the time clients saw it.",
    solution:
      "The team built a private MCP server exposing 15 tools to Claude Desktop: list_clients, marketing_query, marketing_compare, marketing_report, and more. Each tool maps to a Google API (GA4, GSC, Ads, YouTube, GBP, PageSpeed) and resolves a client name to the right property/account via a single database lookup. Within a week, every account manager at Choquer was asking questions in Claude instead of logging into dashboards.",
    techStack: ["Next.js", "Convex", "MCP SDK", "Google APIs", "Claude Desktop"],
    metrics: [
      { label: "Clients served via MCP", value: "30+", description: "Full Choquer portfolio queryable from Claude Desktop" },
      { label: "Tools exposed", value: "15", description: "Across GA4, GSC, Google Ads, YouTube, GBP, and PageSpeed" },
      { label: "p95 latency", value: "<2s", description: "Typical query response time end-to-end" },
      { label: "Reporting hours saved", value: "5+/wk", description: "Per account manager, within first month" },
    ],
    testimonial: {
      quote: "We built this because we needed it. The fact that every other agency has the same problem was the business model reveal.",
      name: "Bryce Choquer",
      title: "Founder, Choquer Agency",
    },
    metaTitle: "Choquer Agency Case Study | ARLO Origin Story",
    metaDescription:
      "How Choquer Agency built the first version of ARLO as an internal Claude Desktop MCP to replace manual client reporting.",
  },
};

export const caseStudies: CaseStudy[] = Object.values(caseStudyMap);

export function getAllCaseStudies(): CaseStudy[] {
  return caseStudies;
}

export function getAllCaseStudySlugs(): string[] {
  return Object.keys(caseStudyMap);
}

export function getCaseStudy(slug: string): CaseStudy | null {
  return caseStudyMap[slug] ?? null;
}

export function getCaseStudyBySlug(slug: string): CaseStudy | null {
  return caseStudyMap[slug] ?? null;
}
