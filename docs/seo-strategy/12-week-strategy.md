# ARLO — 12-Week SEO Strategy

**Domain:** https://askarlo.app · **Stage:** brand-new (DA 0) · **Market:** US + Canada
**Source of truth for execution:** `docs/seo-strategy/worklog.txt` (newest on top).
**Read first each session:** this file, `README.md` (action plan), `audits/*`, then the worklog.

> **Honest frame:** pure-organic on a new domain is a **6–12 month** ramp. This 12-week plan builds
> the foundation + the winnable wedge. Month-1 KPIs are leading indicators (indexation, first tracked
> rankings), not leads. Leads become the goal metric once pages rank.

---

## The thesis (from the audit — keyword + competitor + SXO all agree)

Don't fight the **DA 88–89 fortresses** (Supermetrics, Windsor, Funnel, AgencyAnalytics, Improvado,
Whatagraph) on head "marketing reporting / alternative" terms. **Win the emerging MCP-integration
cluster** — Arlo's exact category, low-KD, fast-growing, fragmented SERPs:

- `google analytics mcp` (KD 21, +39× YoY) · `google ads mcp` (590/mo, KD 18, +8×) · `mcp connector`
  (KD 11) · `claude mcp server` (810/mo, KD 21) · `meta ads mcp` · `google search console mcp` · `ga4 mcp`

**Two content engines drive the whole plan:**
1. **Connector matrix** — one landing page per data source × assistant ("Connect GA4 to Claude",
   "Google Ads MCP", "Search Console MCP", …), each: what/why → 3-step connect → example prompts →
   short Loom → FAQPage schema. GEO-optimized (these queries fire AI Overviews + get researched in LLMs).
2. **Comparison hub** — "X vs ARLO" / "X alternative" pages cloned from the strong
   `/compare/windsor-ai-vs-arlo` template. Lead with **Supermetrics** (done), then AgencyAnalytics
   (KD 7), Whatagraph (KD 7), Funnel.

**Differentiator to lead with everywhere:** *"No dashboards, no exports, no warehouse — just ask Claude,
priced per business."*

---

## Status at kickoff (already shipped — see worklog)

- **P0 done:** canonical bug fixed; fabricated testimonials removed; `llms.txt` corrected;
  `/services/meta-ads-specialist` launched; correct SaaS JSON-LD on homepage; **FuturLabs/Choquer copy
  purged** from `/about`, `/services`, `/work`, blog author (Arlo now a standalone entity).
- **P1 partial:** `/compare/supermetrics-vs-arlo` live; `FAQPage` schema on the FAQ component
  (homepage + all service pages); `/contact` metadata; app/auth/demo routes noindexed; GA4
  (`G-CP22NBPLFP`) firing.

---

## Weekly playbooks

### Week 1 — Finish the foundation
- **Static-render the marketing pages (P1 #9).** Move `ConvexAuthNextjsServerProvider` out of the root
  layout into an app-only route group (e.g. `(app)/layout.tsx`) so `/`, `/services/*`, `/compare/*`,
  `/work/*`, `/blog/*`, `/about`, `/contact` are static/CDN-cached instead of `Cache-Control: no-store`.
  Verify marketing components don't need the *server* auth provider (client `ConvexClientProvider`
  stays). **Test auth end-to-end after.** KPI: marketing pages return cacheable headers; TTFB drops.
- **Default OG image + `metadataBase`** (P1 #12): add a branded 1200×630 OG asset in `public/` and
  reference it in root metadata; per-page OG for the compare/connector templates. KPI: 0 → all pages
  have a resolvable OG image.
- **Per-page canonicals** on `/services/*`, `/work/*`, `/compare/*` (root canonical already removed).
- **Submit sitemap in GSC**, request indexing for homepage + top 5 pages. Fix `sitemap.ts` `lastModified`
  (currently `new Date()` for all URLs). KPI: pages "Discovered → Indexed".

### Week 2 — Connector matrix: build the template + first 2 pages
- Create the connector page type — either `/connect/[slug]` (recommended, mirrors `/compare/[slug]`
  data-driven pattern in `src/content/`) or dedicated MDX. Template: H1 "Connect {Source} to Claude",
  TL;DR, 3-step connect, 5 example prompts, embedded Loom, FAQPage + HowTo schema, internal links to
  the matching `/services/{persona}` + `/compare/*`.
- Ship **"Connect GA4 to Claude" / `google analytics mcp`** and **"Google Ads MCP" / `google ads mcp`**.
- KPI: 2 connector pages indexed; tracked in SE Ranking.

### Week 3 — Connector matrix ×2 + first comparison expansion
- **"Search Console MCP"** + **"Meta Ads MCP"**.
- **`/compare/agencyanalytics-vs-arlo`** (KD 7) from the compare template.
- KPI: 4 connector pages live; 2 comparison pages.

### Week 4 — Connector matrix ×2 + GEO pass
- **"YouTube MCP"** + **"Business Profile MCP"** (completes the 6 Google sources).
- GEO/AEO: expand `llms.txt` with the connector pages; ensure each connector/compare page answers the
  ~15 buyer-shortlisting prompts from `audits/geo-ai.md`; verify FAQPage renders on all.
- **Off-page Phase 1 starts:** list on Smithery.ai, Glama.ai, mcp.so, awesome-mcp-servers (GitHub),
  AlternativeTo, SaaSHub. KPI: 6 connector pages; first ~6 referring domains.

### Week 5 — Persona depth + internal linking
- Rewrite/expand the five `/services/{persona}` pages to target persona reporting terms
  (`client reporting` KD 6, `seo agency reporting software` KD 16 / zero competition, `marketing agency
  reporting` KD 14). Cross-link personas ↔ connectors ↔ comparisons.
- KPI: persona pages ranking top-50 for their terms.

### Week 6 — Blog engine on (education/BOFU)
- First 3 posts from the plan in `audits/content.md`: "What is an MCP server (for marketers)",
  "GA4 in Claude: the 3-minute setup", "Supermetrics is a pipeline, not an answer". BlogPosting schema
  (fix the missing `@context`). KPI: 3 posts indexed; internal links to connector/compare pages.

### Week 7 — Comparison hub completion + Product Hunt
- `/compare/whatagraph-vs-arlo`, `/compare/funnel-vs-arlo`. Build a `/compare` index page (the
  breadcrumb currently points to a non-existent index).
- **Sequenced Product Hunt launch.** KPI: comparison hub complete; PH backlinks + referral traffic.

### Week 8 — Automated reporting infra (Phase 3 prep)
- Stand up `scripts/send-seo-reports.mjs` (Resend) + `.github/workflows/seo-report.yml` +
  `keepalive.yml` + `reports/outbox|sent/`. Requires: Resend domain verified; `RESEND_API_KEY`,
  `REPORTS_FROM`, `REPORTS_TO` in **GitHub Actions secrets**; Claude GitHub-app access to the repo;
  Vercel auto-deploy on push. KPI: a test change-report email arrives.

### Weeks 9–12 — Compounding + digital PR
- **W9:** long-tail connector variants ("ChatGPT" assistant column; `claude mcp server` pillar page).
- **W10:** digital PR — founder-story + an original data asset (e.g. "state of MCP adoption"); guest
  bylines pitched to Search Engine Land / MarTech / agency-ops press.
- **W11:** conversion + SXO fixes on the worst-scoring pages (`/destinations/*` at 31/100 — align to
  "alternative to X" intent or consolidate).
- **W12:** review cycle — score months 1–3 KPIs, refresh the keyword map with SE Ranking, set the next
  quarter. Flip the goal metric toward leads (GA4 conversions) as pages begin ranking.

---

## KPIs by month (leading → lagging)
- **Month 1:** indexation (GSC), sitemap coverage, first tracked rankings in SE Ranking, GA4 collecting.
- **Month 2:** connector/compare pages entering top-50; first AI-Overview / LLM citations for MCP terms;
  ~10–15 referring domains from registries/PH.
- **Month 3:** top-20 for several low-KD connector/comparison terms; measurable organic sessions;
  begin attributing signups/leads (GA4 conversions).

## Hard rules (carry every session)
1. Quality over volume — ~2 substantial pieces/week; never mass-produce thin pages on a new domain.
2. **Never 301/redirect/migrate** choquer.agency, choquer.app, futurlabs.dev. Sister-link + shared
   founder entity only.
3. Build-gate every deploy (`npm run build`); never push broken code; stage only files you changed.
4. Keep Arlo a **standalone entity** — no FuturLabs/Choquer-agency positioning in Arlo's own copy/schema.
