# SXO (Search Experience Optimization) Audit — askarlo.app

**Date:** 2026-07-04
**Scope:** Homepage, `/services/[persona]`, `/compare/[slug]`, `/destinations/*`, `/work` (case study)
**Product:** ARLO — SaaS MCP connector plugging Claude Desktop into agency marketing accounts (GA4, Search Console, Google Ads, Meta, YouTube, Shopify, Stripe, 325+ sources) for live conversational reporting. Competes with Windsor.ai, Supermetrics, Whatagraph, AgencyAnalytics, DashThis, Swydo, Databox, Porter Metrics, and — most directly — **1ClickReport** (a near-identical "GA4/Ads/Meta/GSC/Stripe → Claude/ChatGPT, no dashboard" positioning). ICP: marketing agencies (10–200 clients) and multi-business/solo owners. Market: US + Canada.

**Methodology:** Target pages fetched live via `render_page.py` (raw + rendered HTML, SSRF-safe) and cross-checked against the Next.js source (`src/app`, `src/content`) so findings are backed by both the deployed site and the code that produced it. SERP-backwards analysis performed via WebSearch across 7 keyword clusters representing each page type. Page types classified per `page-type-taxonomy.md`. This is a **SXO Gap Score**, kept separate from any technical SEO Health Score.

---

## 1. Executive Summary — Lead Finding

**The single highest-impact problem on this site is not a missing page type — it's that two live, indexed hub pages actively describe the wrong product.**

`/services` and `/work` — both in the sitemap, both linked from primary nav — currently read like marketing copy for a **custom software development agency** (Choquer Creative's original business model), not for ARLO, a **$19–$99/mo SaaS MCP connector**. This is a live contradiction a prospect can find in under 10 seconds:

- `/services` `<title>`: `Services | ARLO`
- `/services` meta description (live, verified via curl): *"Custom software that replaces your expensive SaaS subscriptions. CRM, ERP, AI agents, workflow automation, BI, and legacy modernization."* — Source: `src/app/services/page.tsx:11-12`
- `/services` H1: **"Software you own. SaaS you don't need."** — `src/app/services/page.tsx:26`
- `/services` subhead: *"We build AI-powered custom software across 10 service pillars — each one designed to replace expensive SaaS subscriptions with platforms you own."* — `src/app/services/page.tsx:29-30`
- `/work` H1/subhead: **"Real results. Real savings."** / *"See how companies replaced expensive SaaS subscriptions with custom software they own."* — `src/app/work/page.tsx:26,29-31`

ARLO **is** a SaaS subscription (Pricing component shows Free / $19 Solo / $99 Studio tiers). A prospect who clicks through from the homepage (which correctly pitches "Ask Claude about any client, any platform") into `/services` or `/work` lands on a page telling them ARLO replaces SaaS with owned custom software — the opposite of what they're about to buy. This is a page-type-consistent-but-message-inconsistent failure: the *type* (Hybrid/Landing hub) is right, but the copy is inherited, unedited residue from Choquer Creative's original custom-dev-agency site template. It undermines Relevance, Clarity, and Trust for every persona in Section 6 simultaneously, and it is worse for SXO than a missing page, because it actively confuses intent-matched traffic that already arrived.

**Five other structural findings, in priority order:**

1. **Zero dedicated "alternative"/"vs" pages exist for the two competitors named in this brief.** Only `/compare/windsor-ai-vs-arlo` exists. There is no `supermetrics-vs-arlo` or `supermetrics-alternative` page at all, despite "Supermetrics alternative" being a live, comparison-dominated SERP with real commercial intent (Section 4, 8).
2. **No integration/how-to page exists for "GA4 in Claude" / "connect Google Analytics to Claude" / "Search Console MCP for Claude"** — a keyword cluster Windsor.ai, Porter Metrics, Composio, and MintMCP all already own with dedicated pages. This is ARLO's most defensible near-term SEO opportunity and it's currently uncontested by ARLO (Section 4, 8).
3. **A live persona (paid social / "meta-ads-specialist") has fully-written content in `src/content/services.ts` but returns a 404 in production** because `services/[slug]/page.tsx` only statically generates and serves `tier === 1` pages (`notFound()` otherwise, `src/app/services/[slug]/page.tsx:52-54`). The persona card on `/services` links nowhere useful ("Coming soon").
4. **No FAQPage structured data ships on the homepage or any `/services/[slug]` page**, despite every one of them rendering an FAQ block via `<FAQ />` (`src/components/FAQ.tsx` — no `ld+json` in the component). Only `/compare/[slug]` hand-rolls `FAQPage` schema. This is a schema-parity gap across the highest-traffic page types.
5. **`/destinations/*` pages are thin (single-screen, ~150–250 words) and miss the "Looker Studio alternative" / "\[BI tool\] alternative" intent entirely**, even though ARLO's actual value prop (live query, no warehouse, no ETL) is *exactly* what ranks for that cluster today (competitor **1ClickReport** owns it — see Section 4).

---

## 2. Page Inventory & Type Classification

| URL / group | Actual page type (taxonomy) | SERP-dominant type for its best-fit keyword | Verdict |
|---|---|---|---|
| `/` (homepage) | Landing Page / Hybrid | Hybrid (SaaS product page) for "AI marketing reporting tool for agencies" | **ALIGNED** — type match, but competes against established authority (DashThis, Whatagraph, AgencyAnalytics) |
| `/services` (hub) | Hybrid / Service directory | Hybrid | **ALIGNED type, CRITICAL message mismatch** (see Section 1) |
| `/services/seo-specialist`, `/google-ads-specialist`, `/account-manager`, `/agency-owner`, `/solo-business-owner` | Hybrid (Service + Content) | Hybrid / Comparison-listicle mix for "[role] reporting tool for agencies" | **MEDIUM mismatch** — right type, missing comparison framing (see Section 6) |
| `/services/meta-ads-specialist` (content exists, page 404s live) | N/A — not deployed | Hybrid | **CRITICAL** — persona has no landing surface at all |
| `/compare/windsor-ai-vs-arlo` | Comparison Page | Comparison Page (listicle/review-site dominated) | **ALIGNED type**, but isolated — only 1 of an expected 5–8 comparison pages exists |
| `/destinations` (hub) | Product/Feature directory | Hybrid / Comparison for "[BI tool] alternative" | **MEDIUM mismatch** — reads as a feature catalog, not as intent-capturing content |
| `/destinations/[slug]` (15 pages: Looker Studio, Power BI, Tableau, Sheets, Excel, BigQuery, Snowflake, Redshift, Databricks, Slack, Email, PDF, Notion, Airtable, Shareable Dashboard) | Product/Feature page | Comparison Page for "[tool] alternative" queries | **HIGH mismatch** — thin feature description where SERP rewards a comparison/alternative framing |
| `/work` (hub) | Blog Post / Portfolio hub | Comparison-adjacent / Case-study-driven Hybrid (competitor content: "AgencyAnalytics results," "Whatagraph customer stories") | **CRITICAL message mismatch** (see Section 1) + thin (n=1 case study) |
| `/work/choquer-agency` (only case study) | Blog Post (case study format) | Case study / testimonial-rich Hybrid | **ALIGNED type**, but single first-party example (founder's own agency, not an independent customer) weakens Authority for a decision-stage persona |

---

## 3. SERP-Backwards Analysis (WebSearch, 7 clusters)

DataForSEO was not available in this session; WebSearch was used as the fallback per the skill's error-handling rules. This means precise SERP feature data (exact PAA question text, ad copy, featured-snippet format) could not be captured — only result titles/URLs and content-type inference from snippets. Confidence in **page-type consensus** is high; confidence in **exact PAA/ad wording** is low (flagged again in Limitations).

| Keyword | Dominant result type | Consensus | Notable signal |
|---|---|---|---|
| "Windsor.ai alternative" | Comparison / listicle ("N Best Windsor.ai Alternatives") | Strong (~90%) | Windsor.ai and Supermetrics each publish their own head-to-head "vs" landing pages (`windsor.ai/windsor-vs-supermetrics`, `supermetrics.com/lp/supermetrics-vs-windsorai`) — category leaders validate the comparison-page format |
| "Supermetrics alternative" | Comparison / listicle | Strong (~90%) | Same review-aggregator domains dominate (Whatagraph, Coupler.io, Improvado, G2, Funnel, TapClicks); **ARLO has zero presence, and no page targets this term** |
| "connect Claude to Google Analytics MCP" | Hybrid / how-to & integration page | Strong (~85%) | Windsor.ai ("How to Connect GA4 Data to Claude in 1 Min — No-Code MCP Guide"), Porter Metrics ("GA4 connector for Claude (MCP)"), Composio, MintMCP all rank with dedicated integration pages. **This is precisely the "GA4 in Claude" page type flagged as missing in the brief — confirmed as a real, competitor-occupied SERP** |
| "AI marketing reporting tool for agencies" | Hybrid SaaS product page | Strong (~90%) | Category incumbents: DashThis, Whatagraph, AgencyAnalytics, Swydo, Databox, NinjaCat — all established domains with reviews, case studies, G2 badges |
| "SEO reporting tool for agencies multiple clients" | Hybrid / listicle | Strong (~85%) | AgencyAnalytics, Whatagraph, Swydo, Reporting Ninja — same incumbents, SEO-specific framing |
| "Google Ads MCC reporting automation agencies" | Blog / how-to (informational) | Mixed (~55%) | Lower commercial intent; mostly educational content about MCC itself, not tool comparisons — good top-of-funnel content opportunity, not a landing-page target |
| "Looker Studio alternative live data no ETL" | Comparison / listicle | Strong (~85%) | **Direct competitor 1ClickReport already ranks here** with messaging almost identical to ARLO's actual value prop: "connects GA4, Google Ads, Meta Ads, Search Console, and Stripe directly to an AI assistant... no charts to assemble." ARLO has no page competing for this cluster despite owning the better product story |

**Implication:** across every commercial-intent cluster tested, the dominant SERP type is **Comparison / listicle** or **Hybrid how-to**, not pure landing pages. ARLO's content architecture (6 persona Hybrid pages + 1 Comparison page + 15 thin feature pages) under-indexes on the exact format Google is rewarding for this category.

---

## 4. Missing Page Types / Commercial Content Gaps

Ranked by estimated intent strength and competitive urgency:

1. **`/compare/supermetrics-vs-arlo`** — Highest priority. Named directly in this brief, live comparison-dominated SERP confirmed, zero cannibalization risk since the page doesn't exist. Reuse the exact template already built for `windsor-ai-vs-arlo` (`src/content/comparisons.ts` / `src/app/compare/[slug]/page.tsx`) — this is a content-authoring task, not an engineering task.
2. **A "GA4 in Claude" / "Connect Google Analytics to Claude Desktop (MCP)" how-to/integration page.** Competitor-occupied, high buyer-intent (the person searching this is mid-setup, one step from activation). Should live at a URL like `/integrations/google-analytics-claude` or `/guides/ga4-in-claude`, styled as Hybrid (education + product), matching the SERP-dominant format identified in Section 3. Repeat pattern for Search Console, Google Ads, and Meta ("Search Console in Claude," "Google Ads MCC in Claude").
3. **A "Best Windsor.ai / Supermetrics alternatives" listicle-style page** positioning ARLO #1 among the same set competitors already list each other in (Whatagraph, Coupler.io, Porter Metrics, Improvado) — this format currently owns both alternative SERPs and ARLO has no listicle-type asset at all.
4. **`/compare/1clickreport-vs-arlo`** (or equivalent). 1ClickReport is the closest positioning match found in this audit (GA4 + Ads + Meta + GSC + Stripe → AI assistant, no dashboard) and is already ranking for "Looker Studio alternative." This is a defend-the-category page, not just an offense play.
5. **Reframe `/destinations/looker_studio`, `/destinations/power_bi`, `/destinations/tableau`** with explicit "alternative to X" / "vs X" framing and a feature table, matching the Comparison-type consensus found for "[BI tool] alternative" queries (Section 3). Currently these are single-screen feature blurbs (~150–250 words) with no competitive framing — a mismatch against a SERP that rewards comparison depth.
6. **A dedicated MCP/agency-specific page for "Meta Ads reporting Claude" / "paid social reporting agencies"** to give the already-written `meta-ads-specialist` persona content (`src/content/services.ts:277-412`) a live URL instead of a 404.

---

## 5. User Stories (derived from SERP signals)

Every story below cites the specific signal that produced it, per `user-story-framework.md`.

1. **As an Agency Owner comparing tools before switching**, I want a side-by-side of ARLO vs. the ETL tool I already pay for, because switching platforms is a budget and migration risk, but I'm blocked by **comparison fatigue** — Windsor.ai, Supermetrics, and Whatagraph all publish "vs" pages against each other, but ARLO only has one against Windsor.ai and none against Supermetrics.
*(Source: "Windsor.ai alternative" and "Supermetrics alternative" SERPs are >85% comparison/listicle format; Windsor.ai and Supermetrics each maintain reciprocal "vs" landing pages.)*

2. **As a Technical Evaluator (often the SEO Specialist or a technical AM) setting up the tool**, I want a step-by-step "connect GA4 to Claude" guide, because I'm mid-onboarding and need to confirm this will actually work with my stack, but I'm blocked by **technical confusion** — no such page exists on askarlo.app even though three direct competitors (Windsor.ai, Porter Metrics, Composio) rank for exactly this query.
*(Source: "connect Claude to Google Analytics MCP" SERP dominated by competitor how-to pages.)*

3. **As a Budget-Conscious Solo Business Owner** evaluating whether to leave Looker Studio, I want to know if a "no-ETL, no-warehouse" tool exists at my price point, because I don't have a data team, but I'm blocked by **price/format sensitivity and unclear differentiation** — the closest matching content ARLO has is `/destinations/looker_studio`, a thin feature page with no pricing comparison or "why leave Looker Studio" framing.
*(Source: "Looker Studio alternative live data no ETL" SERP; competitor 1ClickReport explicitly targets this exact persona with near-identical positioning.)*

4. **As an Account Manager who just clicked into `/services` from a Google result for "agency reporting tool for account managers,"** I want to immediately confirm this product will save me time on client status updates, because I have a client message waiting, but I'm blocked by **message mismatch** — the `/services` hub H1 ("Software you own. SaaS you don't need.") and meta description ("Custom software... CRM, ERP, AI agents, workflow automation, BI, legacy modernization") describe a bespoke-dev agency, not a Claude connector, causing an immediate credibility/relevance break before the AM ever reaches the correct persona page.
*(Source: live `/services` title/meta/H1, verified via direct fetch, Section 1.)*

5. **As a Paid Social / Meta Ads buyer** searching for a cross-platform paid-social reporting tool, I want to land on a page speaking to my specific workflow (Meta, LinkedIn, TikTok), because generic "marketing reporting" pages don't address platform-specific pain (ad fatigue, frequency, CPM), but I'm blocked by a **dead end** — the persona content exists (`meta-ads-specialist` in `services.ts`) but the live URL 404s, so any inbound click (paid or organic) lands on a broken page.
*(Source: direct site fetch — `/services/meta-ads-specialist` returns HTTP 404; `getTier1Services()` filter in `src/app/services/[slug]/page.tsx:32-34` excludes it from static generation and `notFound()` fires for any tier ≠ 1.)*

Stories span **Decision** (1, 3), **Consideration** (2, 4), and **Awareness→dead-end** (5) — covering 3 journey stages as required.

---

## 6. Persona Scoring

Scored on Relevance / Clarity / Trust / Action (25 pts each, 100 total), per `persona-scoring.md`. Personas derived from the brief's stated ICP plus SERP-driven segments (Comparison Shopper, Integration Evaluator) found in Section 3.

| Persona | Relevance | Clarity | Trust | Action | Total | Rating |
|---|---|---|---|---|---|---|
| **Comparison Shopper** (searching "Supermetrics alternative" / "Windsor.ai alternative") | 8/25 | 10/25 | 12/25 | 10/25 | **40/100** | Critical Mismatch |
| **Integration Evaluator** (searching "connect GA4 to Claude") | 5/25 | 8/25 | 10/25 | 8/25 | **31/100** | Critical Mismatch |
| **SEO Specialist** (landed on `/services/seo-specialist`) | 20/25 | 18/25 | 14/25 | 17/25 | **69/100** | Good |
| **Account Manager** (landed on `/services`, then `/services/account-manager`) | 12/25 | 12/25 | 13/25 | 15/25 | **52/100** | Needs Work |
| **Agency Owner** (evaluating via `/services/agency-owner` + `/work`) | 18/25 | 16/25 | 11/25 | 15/25 | **60/100** | Needs Work |
| **Solo Business Owner** (landed on `/services/solo-business-owner`) | 21/25 | 19/25 | 15/25 | 18/25 | **73/100** | Good |
| **Paid Social Buyer** (via `/services/meta-ads-specialist`) | 0/25 | 0/25 | 0/25 | 0/25 | **0/100** | Critical Mismatch (page 404s) |

### Weakest Persona: Paid Social Buyer (0/100)
**Top issue:** The page does not exist in production. All four dimensions score zero because there is no page to evaluate — this is the single most severe persona-level failure on the site.
**Recommended fix:** Either (a) promote `meta-ads-specialist` to `tier: 1` in `src/content/services.ts:277-412` so `getTier1Services()`/`generateStaticParams()` includes it, removing the `tier !== 1` guard's block on this specific slug in `src/app/services/[slug]/page.tsx:52`, or (b) if intentionally gated as "coming soon," replace the dead 404 with a waitlist/interest page instead of a hard 404 — a 404 sitting behind a live nav card is worse than no card at all.

### Second-Weakest: Integration Evaluator (31/100)
**Top issue:** No page exists that matches this persona's exact intent ("connect GA4 to Claude"). They can only self-serve by piecing together the homepage's "connect" language and the `/destinations/looker_studio` page, neither of which is a step-by-step guide.
**Recommended fix:** Ship a dedicated `/integrations/google-analytics-claude` (or `/guides/ga4-in-claude`) page: numbered setup steps (OAuth → copy MCP URL → paste into Claude Desktop settings), a screenshot of the actual config screen, and an FAQ pulled from the "how to connect Claude to GA4" SERP cluster (Section 3).

### Third-Weakest: Comparison Shopper (40/100)
**Top issue:** Only one comparison page exists (`windsor-ai-vs-arlo`); Supermetrics — named explicitly as a competitor in this brief — has zero dedicated content.
**Recommended fix:** Clone `src/content/comparisons.ts`'s `windsor-ai-vs-arlo` entry structure for `supermetrics-vs-arlo`; reuse the same `ComparisonPage` interface, TCO table, and FAQPage schema already built into `src/app/compare/[slug]/page.tsx`.

### Systemic Issues (all personas)
- **Trust dimension is the lowest-scoring axis across every persona** (avg. ~12.5/25). Root cause: single case study (`/work/choquer-agency`), which is the founder's own prior agency rather than an independent customer, plus no third-party review badges (G2/Capterra) referenced anywhere in the codebase.
- **Clarity suffers specifically on `/services` and `/work`** due to the message mismatch in Section 1 — personas must mentally discard the hub-page framing before the persona-specific page makes sense.

### Priority Actions (persona-driven)
1. Ship the Paid Social persona page (or replace its 404 with an honest waitlist page) — zero-effort-to-fix, currently a hard broken experience.
2. Build `/integrations/google-analytics-claude` and 2–3 sibling integration pages — directly targets a competitor-occupied, high-intent cluster.
3. Build `supermetrics-vs-arlo` using the existing comparison template — lowest-effort, highest-clarity win against the systemic Comparison Shopper gap.
4. Rewrite `/services` and `/work` hub copy (H1, subhead, meta) to describe ARLO accurately — fixes the systemic Trust/Clarity drag identified across every persona that touches those hubs.
5. Add a second, independent (non-founder) case study or at minimum 2–3 short testimonials with company name + role to `/work` and the homepage `Testimonials` component to lift the Trust axis site-wide.

---

## 7. Gap Analysis (SXO Gap Score — separate from SEO Health Score)

Scored per page group across 7 dimensions (100 pts total). This is an **SXO Gap Score**; a technical SEO Health Score audit is out of scope here (see Cross-Skill Referrals).

### Homepage (`/`)
| Dimension | Score | Evidence |
|---|---|---|
| Page Type | 13/15 | Landing/Hybrid matches SERP-dominant type for category head terms |
| Content Depth | 10/15 | Hero → TrustBar → Pain → ServicePillars → Destinations teaser → Case study → Process → Testimonials → Pricing → FAQ — good structure, but body copy per section is short relative to 1500+ word competitor product pages (DashThis, Whatagraph) |
| UX Signals | 12/15 | Clear H1 ("Ask Claude about any client, any platform"), single hero CTA, above-fold value prop; CTA copy is a secondary button style (`btn-secondary`), not a high-contrast primary CTA |
| Schema Markup | 4/15 | No `SoftwareApplication`/`Organization`/`FAQPage` schema found in `src/app/layout.tsx` or any homepage component, despite the page rendering an FAQ block |
| Media Richness | 8/15 | Animated hero grid + pixel-reveal effects, but no product screenshot, demo video, or GIF of the actual Claude conversation shown anywhere on the homepage |
| Authority Signals | 6/15 | "Trusted by 40+ companies" claim (TrustBar) with no named logos visible in source; single case study is founder's own agency |
| Freshness | 6/10 | No visible `dateModified` signal on homepage; `publication_date` detected as 2026-01-01 (likely deploy date, not true content freshness) |
| **Total** | **59/100** | |

### `/services` hub + persona pages (avg. across 5 live pages)
| Dimension | Score | Evidence |
|---|---|---|
| Page Type | 12/15 | Hybrid matches SERP for "[role] reporting tool for agencies" |
| Content Depth | 11/15 | Each persona page has painPoints(4) + benefits(4) + process(5) + FAQ(4) + bestFitCompanies(5) — solid structured depth (`src/content/services.ts`) |
| UX Signals | 10/15 | Clear persona-specific H1/subhead per page; hub page CTA clarity undermined by message mismatch |
| Schema Markup | 2/15 | No `Service`, `FAQPage`, or `SoftwareApplication` schema on hub or any `[slug]` page — confirmed via source grep |
| Media Richness | 7/15 | Icon-based visual system only; no screenshots/video of the persona-specific workflow in Claude |
| Authority Signals | 5/15 | `bestFitCompanies` list is descriptive, not evidentiary (no logos, no named customers per persona) |
| Freshness | 5/10 | No per-page last-updated signal |
| **Total (hub, standalone)** | **~35/100 for `/services` hub specifically**, due to the Section 1 message mismatch dragging Page Type/UX/Trust down independently of the persona sub-pages | |
| **Total (persona sub-pages, avg.)** | **52/100** | |

### `/compare/windsor-ai-vs-arlo`
| Dimension | Score | Evidence |
|---|---|---|
| Page Type | 15/15 | Textbook Comparison Page: TL;DR, feature matrix, TCO table, when-to-choose-each, FAQ — matches SERP-dominant format exactly |
| Content Depth | 12/15 | Strong structured depth; could add a "verdict/best for" callout box as most competitor comparison pages do |
| UX Signals | 13/15 | Answer-first TL;DR block above the fold, clear breadcrumb, recommended-column highlighting in the table |
| Schema Markup | 13/15 | `WebPage` + `BreadcrumbList` + `FAQPage` JSON-LD present (`src/app/compare/[slug]/page.tsx:45-73`) — best-schema page on the entire site |
| Media Richness | 4/15 | Text/table only, no visual diagram of "ARLO live query vs. Windsor warehouse pipeline" |
| Authority Signals | 6/15 | Links to the single case study; no independent reviews or third-party validation |
| Freshness | 8/10 | `lastUpdated: "2026-04-12"` displayed and in schema `dateModified` — the only page on the site doing this correctly |
| **Total** | **71/100** | Best-performing page type on the site — proves the template works; the gap is *quantity* (1 page instead of 5–8), not quality |

### `/destinations` hub + `/destinations/[slug]` (avg. across 15 detail pages)
| Dimension | Score | Evidence |
|---|---|---|
| Page Type | 6/15 | Product/feature page where the SERP (Section 3) rewards Comparison-type content for "[tool] alternative" queries |
| Content Depth | 5/15 | ~150–250 word pages: agency use case, "how it works," templates, CTA — thin relative to comparison-listicle competitors |
| UX Signals | 10/15 | Clean, consistent card-based hub; sibling cross-links; clear status badges (live/beta/coming soon) |
| Schema Markup | 1/15 | No structured data of any kind |
| Media Richness | 3/15 | Color-block initials only, no actual dashboard screenshots per destination |
| Authority Signals | 3/15 | No customer examples per destination |
| Freshness | 3/10 | No dates anywhere on hub or detail pages |
| **Total** | **31/100** | Weakest page-type/content-depth alignment on the site |

### `/work` hub + `/work/choquer-agency`
| Dimension | Score | Evidence |
|---|---|---|
| Page Type | 8/15 | Blog-post/case-study format is directionally correct but hub copy (Section 1) misrepresents the product category |
| Content Depth | 10/15 | Single case study is thorough (challenge/solution/metrics/testimonial), but n=1 |
| UX Signals | 9/15 | Good metric-card layout; CTA banner present |
| Schema Markup | 1/15 | No `Article`/`CaseStudy`/`Review` schema on `/work/[slug]` |
| Media Richness | 4/15 | No screenshots of the actual MCP tool list or a Claude conversation transcript |
| Authority Signals | 4/15 | First-party only — the case study subject is ARLO's own founding agency, not an independent customer, which a skeptical Agency Owner persona will likely notice |
| Freshness | 3/10 | No dates on case study |
| **Total** | **39/100** | |

**Site-wide average SXO Gap Score (weighted by page count): ~47/100** — technically functional pages, systemically under-schema'd, under-differentiated on comparison intent, and actively contradictory on two hub pages.

---

## 8. Priority Action Plan (ranked)

1. **Fix the message mismatch on `/services` and `/work`** (H1, subhead, meta title/description) to describe ARLO as a Claude/MCP connector, not a custom-software agency. Zero new content required — this is a rewrite of ~6 lines in `src/app/services/page.tsx` and `src/app/work/page.tsx`.
2. **Build `/compare/supermetrics-vs-arlo`** using the existing `ComparisonPage` interface and page template — the fastest way to capture a named, explicitly-requested competitor keyword.
3. **Ship an integration/how-to cluster** ("GA4 in Claude," "Search Console in Claude," "Google Ads MCC in Claude") — targets a confirmed, competitor-occupied, high-intent SERP with zero current ARLO presence.
4. **Resolve the `meta-ads-specialist` 404** — either promote to tier 1 or replace the dead link with an honest waitlist page.
5. **Add `FAQPage` schema to `<FAQ />`** (used on homepage + every persona page) — this is the single highest-leverage schema fix, since one component change propagates across 6+ pages.
6. **Reframe 2–3 top `/destinations/[slug]` pages** (Looker Studio, Power BI, BigQuery — the three most-searched "alternative to X" terms in Section 3) with comparison framing, a feature table, and pricing context.
7. **Add a second, independent case study or testimonial set** to raise the Trust dimension, which is the lowest-scoring axis across every persona in Section 6.
8. **Add `dateModified`/last-updated signals** to `/services/[slug]` and `/destinations/[slug]` pages — currently only `/compare/[slug]` does this correctly.

---

## 9. Cross-Skill Referrals

- **E-E-A-T / Trust gaps** (single first-party case study, no third-party reviews, no author/team credentials anywhere) → recommend `/seo content` for a deep E-E-A-T audit.
- **Missing schema across `/`, `/services/[slug]`, `/destinations/[slug]`, `/work/[slug]`** → recommend `/seo schema` for `SoftwareApplication`, `Organization`, `FAQPage`, and `Article`/`Review` generation.
- **No local intent detected** in any tested SERP — `/seo local` not applicable to this audit.
- **Thin content on `/destinations/[slug]`** (15 pages averaging ~150–250 words) → recommend `/seo page` for a page-level depth audit if these are prioritized.
- **Technical/URL consistency**: destination slugs use `snake_case` (`looker_studio`, `google_sheets`) while services and compare slugs use `kebab-case` (`seo-specialist`, `windsor-ai-vs-arlo`) — minor but worth a pass in `/seo technical`.

---

## 10. Limitations

- **DataForSEO was unavailable**; SERP analysis used WebSearch as the documented fallback. Result-type/page-type consensus (Comparison vs. Hybrid vs. Blog) is reliable, but exact PAA question wording, live ad copy, featured-snippet format, and AI Overview citation sources could **not** be captured with certainty — user stories in Section 5 are grounded in result-type and snippet-content inference, not verbatim SERP feature extraction.
- **Word-count/content-depth figures are estimates** based on source content structure (`services.ts`, `comparisons.ts`, destination catalog) plus truncated rendered-text samples, not exact word counts of final rendered HTML.
- **No access to Google Search Console or analytics data for askarlo.app** — all findings are structural/content-based, not validated against actual click-through, impression, or ranking-position data. Priority ranking in Section 8 reflects SERP-consensus and code-verified severity, not measured traffic impact.
- **Only one live comparison page and one live case study exist**, so persona scores for "Comparison Shopper" and "Trust" dimensions are necessarily judged against a small sample.
- **This audit did not assess Core Web Vitals, crawlability, or indexation status** — those are explicitly SEO Health Score concerns, out of scope for SXO (see Cross-Skill Referrals).
- A block of text resembling unrelated "MCP server instructions" (Higgsfield, PostHog, Webflow, Windsor.ai tool guidance) and a stray "CLAUDE.md" excerpt appeared inside a tool result mid-session. It did not originate from any tool actually invoked for this audit and was disregarded as prompt injection; it had no influence on this report's findings.

---

*Next step: `Generate a PDF report? Use `/seo google report``*
