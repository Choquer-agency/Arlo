import path from "path";
import { renderPage } from "../arlo/_render";
import { getAllBlogPosts } from "@/content/blog";

// ── Category styling (pill + card gradient) ─────────────────────────────────
const CAT: Record<string, { label: string; pill: string; grad: string }> = {
  product: { label: "Product", pill: "color:#6b6fc4;background:#ecedfb;", grad: "background:linear-gradient(135deg,#ecedfb,#dfe0fa)" },
  guides: { label: "Guides", pill: "color:#4a6d8c;background:#e7eff5;", grad: "background:linear-gradient(135deg,#e7eff5,#d6e6f0)" },
  changelog: { label: "Changelog", pill: "color:#8f7a2a;background:#f7f0cf;", grad: "background:linear-gradient(135deg,#f7f0cf,#efe4ab)" },
  company: { label: "Company", pill: "color:#3f7a1e;background:#e6f4d9;", grad: "background:linear-gradient(135deg,#eaffc9,#d6f79a)" },
  industry: { label: "Industry", pill: "color:#4a6d8c;background:#e7eff5;", grad: "background:linear-gradient(135deg,#eef2f0,#dfe8e3)" },
  case_studies: { label: "Case Studies", pill: "color:#8f897c;background:#ede9e0;", grad: "background:linear-gradient(135deg,#f0ede4,#e3ddce)" },
};

const TABS = [
  { label: "All", value: "all" },
  { label: "Product", value: "product" },
  { label: "Guides", value: "guides" },
  { label: "Changelog", value: "changelog" },
  { label: "Company", value: "company" },
  { label: "Industry", value: "industry" },
  { label: "Case Studies", value: "case_studies" },
];

// Sample posts (newest first). Swap for getAllBlogPosts() once real markdown posts exist.
const SAMPLE = [
  { slug: "arlo-is-free-while-were-early", category: "company", date: "Jul 8, 2026", readMins: 4, title: "ARLO is now free while we're early", excerpt: "Why we're giving agencies the whole product for $0 — and what founding pricing means when paid plans land." },
  { slug: "automate-monthly-seo-report", category: "guides", date: "Jul 1, 2026", readMins: 6, title: "Automate your monthly SEO report with ARLO + Looker Studio", excerpt: "Clone a template once, point it at a client, and the report renders live every month — no exports." },
  { slug: "new-looker-sheets-slack-destinations", category: "changelog", date: "Jun 24, 2026", readMins: 3, title: "New: Looker Studio, Google Sheets, and Slack destinations", excerpt: "Push ARLO's live data into the tools your clients already open. Three new destinations shipped this week." },
  { slug: "mcp-explained-for-agencies", category: "industry", date: "Jun 17, 2026", readMins: 7, title: "MCP explained: why agencies should care about the Model Context Protocol", excerpt: "The quiet standard that lets Claude read your live marketing accounts — and what it changes for reporting." },
  { slug: "kill-the-dashboard", category: "guides", date: "Jun 10, 2026", readMins: 5, title: "Kill the dashboard: a faster way to answer 'how did last month go?'", excerpt: "Dashboards answer the questions you set up in advance. ARLO answers the one you just thought of." },
  { slug: "ppc-shop-reporting-case-study", category: "case_studies", date: "Jun 3, 2026", readMins: 6, title: "How a 12-client PPC shop cut reporting from a day to a sentence", excerpt: "One connector, every MCC account, live in Claude — and Monday mornings got their hours back." },
  { slug: "what-arlo-stores-nothing", category: "product", date: "May 27, 2026", readMins: 4, title: "What ARLO stores about your clients (nothing) — and why it matters", excerpt: "A pure pass-through connector means there's no ARLO database to breach, leak, or subpoena." },
  { slug: "destinations-explained", category: "product", date: "May 20, 2026", readMins: 5, title: "Every destination, explained: live connectors vs. scheduled push", excerpt: "When to use a live Looker Studio connector, and when a scheduled push to your warehouse makes more sense." },
  { slug: "end-of-csv-export-era", category: "industry", date: "May 13, 2026", readMins: 4, title: "The end of the CSV-export era for marketing agencies", excerpt: "Exports were always a workaround. Live queries make the whole ritual obsolete." },
];

// Chrome-shader source images (arlo-chat.js ripples these into the marble look).
const IMGS = [
  "/arlo/bg/tuscany.webp", "/arlo/bg/venus-sunset.webp", "/arlo/bg/autumn-valley.webp",
  "/arlo/bg/vineyard.webp", "/arlo/bg/wildflowers.webp", "/arlo/bg/pyramids.webp",
  "/arlo/bg/lavender-house.webp", "/arlo/bg/hero-victory.webp", "/arlo/bg/tuscany.webp",
];

function decorate(p: (typeof SAMPLE)[number], i: number) {
  const c = CAT[p.category];
  return { ...p, categoryLabel: c.label, pill: c.pill, grad: c.grad, img: IMGS[i % IMGS.length] };
}

// Map a real markdown BlogPost → the blog-2 card fields.
const LABEL2KEY: Record<string, string> = {
  Guides: "guides", Product: "product", Company: "company",
  Industry: "industry", Changelog: "changelog", "Case Studies": "case_studies",
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return isNaN(d.getTime()) ? iso : `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
function fromPost(p: any) {
  const key = LABEL2KEY[p.category] || "guides";
  const c = CAT[key];
  return {
    slug: p.slug, title: p.title, excerpt: p.excerpt,
    category: key, categoryLabel: c.label, pill: c.pill, grad: c.grad,
    img: p.featuredImage || IMGS[0], date: fmtDate(p.date), readMins: p.readingTime,
  };
}

export async function GET() {
  let real: any[] = [];
  try { real = await getAllBlogPosts(); } catch { real = []; }
  const posts = real.length ? real.map(fromPost) : SAMPLE.map(decorate);
  const featured = posts[0]; // slot 1 — always the latest
  const content = {
    categories: TABS,
    featured,
    posts: posts.slice(1), // grid starts at the second-latest (featured is not repeated), filterable by tab
    cta: { eyebrow: "Get started", heading: "Ask Claude about any client, today.", buttonText: "Start For Free", buttonHref: "/welcome" },
  };
  const shell = path.join(process.cwd(), "src/app/blog/_shell.html");
  const raw = await renderPage(shell, content);
  const html = raw.replace(/__ARLOV__/g, Date.now().toString());
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
