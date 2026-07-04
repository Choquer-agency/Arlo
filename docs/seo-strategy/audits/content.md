# Content Quality & E-E-A-T Audit — askarlo.app (Arlo)

**Date:** 2026-07-04
**Scope:** `/`, `/about`, `/services` hub + 5 persona pages (`seo-specialist`, `google-ads-specialist`, `account-manager`, `agency-owner`, `solo-business-owner`), `/destinations` + subpages, `/work/choquer-agency`, `/blog`, `/compare/windsor-ai-vs-arlo`, `/contact`, plus site-wide structured data (`src/lib/schema.ts`), footer, privacy/terms.
**Method:** Source review of `/Users/brycechoquer/Desktop/Arlo/website/src/app` and `src/content` (Next.js App Router codebase — content is generated from TypeScript data files, not raw HTML, so this audit reads the actual source of truth rather than rendered pages).
**Context:** Arlo is a **brand-new** SaaS (MCP connector plugging Claude into GA4/GSC/Ads/Meta/YouTube/Shopify) competing with Windsor.ai and Supermetrics, priced per business tracked. Domain has zero historical authority — every trust signal has to be earned from content quality alone, which makes the findings below (especially fabricated testimonials and identity conflation) higher-stakes than they would be for an established brand.

---

## Executive Summary

The five persona service pages (`/services/{slug}`) are genuinely strong — specific, quotable, well-structured, correctly positioned for Arlo. Everything else has a serious, systemic problem: **large parts of this codebase are un-migrated leftovers from a previous business, "FuturLabs" / Choquer Agency (a custom AI software development shop), not Arlo.** The homepage, `/about`, the `/services` hub, `/blog`, `/work`, the footer, and — most damaging for AI/search entity clarity — the **site-wide JSON-LD schema** all describe a $15K–$400K custom-software agency serving $10M–$250M mid-market companies. That is not what Arlo is. On top of that, the homepage ships **fabricated testimonials** (explicitly labeled `placeholder` in source) with fake names, titles, and companies, and the blog — a core AI-citation and topical-authority lever for a brand-new domain — is completely empty.

For a brand with no domain authority, these are not cosmetic issues. They are the primary blockers to being trusted by both human buyers and AI answer engines.

**Content quality score: 46/100**

| Factor | Score | Notes |
|---|---|---|
| E-E-A-T composite | 38/100 | Dragged down by fabricated testimonials + identity conflation (see below) |
| Thin/duplicate content | 55/100 | Persona pages are strong; hub/about/blog are wrong-brand or empty |
| Readability | 78/100 | Genuinely good where content is real (persona pages, comparison page) |
| Keyword optimization | 70/100 | Natural, benefit-led; hurt by contradictory schema keywords |
| AI-citation readiness | 40/100 | Good FAQ data model, but schema is either wrong-brand or entirely unused on most pages |

---

## 1. E-E-A-T Breakdown

### 1.1 Experience — 30/100 (weight 20%)
- **Positive:** `/work/choquer-agency` (`src/content/case-studies.ts`) is a genuine first-hand origin story — "the agency that built ARLO for itself first," with concrete numbers (30+ clients, 15 MCP tools, <2s p95 latency, 5+ hrs/week saved). This is exactly the kind of first-hand experience signal Google's Sept 2025 QRG rewards.
- **Negative:** That same case study is the vehicle for the site's worst identity problem (see §2). And it is the *only* case study — for a "brand-new SaaS," one internal dogfooding story carrying all first-hand-experience weight is thin once a visitor looks past the headline.
- **Negative:** No product screenshots, no demo video, no sample query/response transcript embedded in marketing pages (the actual product experience — asking Claude a question and getting a live answer — is described in prose everywhere but never *shown*). This is the single highest-leverage "experience" fix available: a real screenshot or GIF of a Claude conversation pulling GA4 data would out-perform paragraphs of description.

### 1.2 Expertise — 45/100 (weight 25%)
- **Positive:** The five persona pages (`src/content/services.ts`) demonstrate real domain fluency — MCC switching pain, Quality Score drift, PMax opacity, GBP sprawl for multi-location clients, CAPI/attribution nuance for paid social. This reads like it was written by someone who has actually run an agency, not generic AI filler. This is the strongest asset on the site.
- **Negative:** The founder's expertise signal is undermined by inconsistency. `src/content/blog/index.ts` author bio explicitly conflates founder identity with a *different* company (see §2.2), which muddies who Bryce Choquer is and what he's an expert *in*.
- **Negative:** No visible technical documentation, API reference, or security/architecture page that a technical buyer (SEO/PPC specialists are technical evaluators) could use to verify claims like "never stores client data" — the claim appears in FAQ copy repeatedly but nowhere is it substantiated (no SOC2/security page, no data-flow diagram).

### 1.3 Authoritativeness — 20/100 (weight 25%)
- **Negative (critical):** `TrustBar.tsx` claims **"Trusted by 40+ companies to own their technology"** — a FuturLabs-era claim (about owning custom software) displayed directly under the Arlo hero on the homepage. It is not true of Arlo, a brand-new product with (per its own testimonial code comment) zero real customers yet.
- **Negative:** The logo bar mixes real-looking client logos (Oracle, Pinnacle Fertility, Penni, Motorsport) with the company's own logo ("Choquer Agency") in the same slider — visually implying Choquer Agency is a *client* of Arlo alongside outside brands, which is confusing at best.
- **Negative:** Zero third-party validation anywhere on the pages audited: no press mentions, no G2/Capterra badges, no "as seen in," no integration-partner badges (e.g., no visible "Works with Claude / MCP" official mark, no Google Partner badge despite deep GA4/Ads integration claims).
- **No backlink/citation signals reviewable from source, but nothing in the content is built to *earn* citations either** (no proprietary data/benchmark report, no original research) — a missed opportunity for a category-creating product.

### 1.4 Trustworthiness — 35/100 (weight 30%, highest-weighted factor)
- **Critical:** Fabricated testimonials on the homepage (`src/content/shared.ts`, lines 38–66) — the source comment literally reads `/* ─── Testimonials (placeholder — swap with real ones post-beta) ─── */`. Three named people ("Marcus Hale, Founder, Northpoint Digital"; "Priya Sundaram, Head of Analytics, Relay Performance"; "Jordan Flores, Managing Director, Staircase Studio") with fabricated quotes are shipped to what appears to be the production homepage component tree. This is a **deceptive-practices / fake-review risk**, not just a content-quality nit — Google's guidelines and general consumer-protection norms treat fabricated testimonials as a trust violation, and if discovered by a buyer or journalist it is a reputational landmine for a brand trying to build trust from zero.
- **Critical:** No legal entity name anywhere on the site. `/privacy` and `/terms` (223 and 206 lines respectively) never state a registered business name, jurisdiction of incorporation, or registered address — only "Canada" as a general location (`siteConfig.location`). For a product requesting OAuth access to GA4/Ads/Meta/Shopify — i.e., sensitive client business data on behalf of *other people's* clients — this is a meaningful gap. Agencies vetting a new vendor for data access will look for exactly this.
- **Medium:** Footer social icons (`Footer.tsx`) hardcode `link: "#"` for LinkedIn/Twitter even though `siteConfig.social` already has real URLs (`linkedin.com/company/askarlo`, `x.com/askarlo`) — dead links on a trust-building surface.
- **Positive:** Security/data-handling claims are present and repeated appropriately in FAQs ("never stores client data outside your workspace," "OAuth tokens encrypted at rest," pass-through architecture) — the *messaging* is right, it just isn't backed by a dedicated trust/security page or any third-party validation.
- **Positive:** Contact page is honest and low-friction (modal-based question form, "reply within one business day," clear "no card, 14-day trial" framing).

---

## 2. Critical Finding: Brand-Identity Conflation (Arlo vs. Choquer Agency / FuturLabs)

This is the single most damaging pattern in the audit and touches nearly every page type. Per your own project memory, **Arlo must present as a standalone product** — conflating it with Choquer Agency/choquer.agency actively dilutes entity clarity for both human buyers and AI/search systems trying to determine "what is askarlo.app, who is behind it, and what does it sell."

### 2.1 Site-wide JSON-LD schema is entirely wrong-brand (Critical)
**File:** `src/lib/schema.ts` — `generateSchema()`

This function is dead code (confirmed: no page imports or renders it anywhere in `src`), but it is clearly intended as the site's canonical structured-data source and is a landmine the moment someone wires it in without revision. Its content describes a completely different business:

- `priceRange: "$15,000 - $400,000+"` — FuturLabs custom-dev pricing, not Arlo's actual $19–$99+/mo SaaS pricing.
- `knowsAbout: ["Custom Software Development", "AI Agent Development", ..., "CRM Development", "ERP Development", "Legacy System Modernization"]` — none of this is what Arlo does.
- `WebPage.name: "${AGENCY_NAME} | AI-Powered Custom Software That Replaces SaaS"` — directly contradicts the real, correct root-layout metadata (`src/app/layout.tsx`: *"ARLO | Ask Claude about any client, any platform"*).
- `HowTo.name: "Our Custom Software Development Process"`, description *"replacing SaaS with custom software you own"* — wraps the persona pages' actual signup steps (OAuth → add clients → copy MCP URL → ask) in a completely wrong narrative.
- Per-service `Service.offers.description: "Custom {shortTitle} development — replaces {tool list}"` and `Service.audience: "Mid-market companies ($10M–$250M revenue)"` — applied to the SEO/PPC/AM/agency-owner/solo-owner persona pages, whose actual audience is agencies of 10–100 people and solo operators, not $10M–$250M enterprises.

**Impact:** if/when this schema goes live, every AI system and search engine parsing Arlo's structured data will conclude it's a bespoke software agency charging five-to-six figures for mid-market clients — the opposite of the actual $19–$99/mo self-serve MCP connector. This is the highest-leverage single fix in this audit.
**Fix:** Rewrite `generateSchema()` from scratch against Arlo's real model — `SoftwareApplication` or `Organization` + `Product`/`Offer` with real price tiers ($19/$99/etc.), `knowsAbout` limited to MCP/Claude/GA4/GSC/Ads/Meta/Shopify/analytics, audience = "digital marketing agencies" and "solo business owners," and reuse the *persona-page* FAQ/HowTo data (which is correct) rather than the FuturLabs process copy. Then actually import and render it in `layout.tsx` or per-page.

### 2.2 Blog author bio conflates founder identity (Critical)
**File:** `src/content/blog/index.ts`, `authors.bryce.bio`

> "Bryce Choquer is the founder of ARLO, a Claude Desktop connector that lets agencies query every client's analytics, ads, and marketing platforms in plain English. **Previously built Choquer Agency's internal MCP** that now handles live queries across GA4, Search Console, Google Ads, YouTube, and Google Business Profile for dozens of SMB clients."

This bio does two things that hurt Arlo's entity clarity:
1. It frames Arlo as something Bryce built *after* or *alongside* Choquer Agency's own tool, rather than Arlo being the standalone product. "Previously built" reads as two separate projects/timelines rather than "Arlo is the product; Choquer Agency was the design partner/first customer."
2. Combined with `/work/choquer-agency` (§2.3) and the TrustBar logo (§1.3), a reader (or an LLM synthesizing entity facts about "Arlo") assembling these three data points independently will likely conclude **Arlo and Choquer Agency are the same organization**, or that Arlo is an internal tool being resold — not a venture-backed-feeling, standalone SaaS company.

**Recommended bio rewrite** (keeps the true, valuable origin-story detail but reframes ownership):
> "Bryce Choquer is the founder of Arlo, an MCP connector that plugs Claude into every marketing platform an agency runs — GA4, Search Console, Google Ads, Meta, YouTube, and Shopify — for live, conversational reporting. He built the first version of Arlo to solve his own agency's reporting bottleneck, then spun it out into a standalone product once he saw every other agency had the same problem."

This keeps "built it for a real agency first" (genuine experience signal) while making unambiguous that **Arlo is the product** and the agency was the origin *use case*, not a sibling brand.

### 2.3 `/work/choquer-agency` case study — keep the substance, fix the framing (High)
**File:** `src/content/case-studies.ts`

The content itself is Arlo's best proof asset (specific tool count, specific latency, specific hours saved) and should **not** be deleted — it's rare, credible, first-hand detail. But:
- Headline "Origin story: the agency that built ARLO for itself first" and testimonial attribution "Bryce Choquer, Founder, Choquer Agency" both center Choquer Agency as the entity, with Arlo as its output. Re-attribute the testimonial as **"Bryce Choquer, Founder, Arlo"** (he is quoted about *why he built Arlo*, so the Arlo title is both more accurate and better for entity clarity) and move the "Founder, Choquer Agency" detail into a parenthetical/context sentence instead of the byline.
- Rename the route/section from a "case study"/"work" portfolio pattern (which reads as an agency portfolio, appropriate for Choquer Agency's *own* site, not Arlo's) to something like "How Arlo started" or fold it into `/about` as the founding story, and drop the generic `/work` portfolio URL pattern entirely for Arlo's site.
- The `bestFitCompanies`/portfolio framing elsewhere (`TrustBar`, `caseStudyImages` referencing `penni-cart`, `pinnacle-fertility`, `far-north-crane` — none of which are Arlo customers) confirms `/work` as a route is inherited from a portfolio site and doesn't belong on askarlo.app at all in its current form.

### 2.4 `/about`, `/services` hub, `/blog` metadata, and homepage TrustBar are 100% FuturLabs copy (Critical)
Not partially conflated — **entirely** wrong-brand:
- `src/app/about/page.tsx`: metadata title "About FuturLabs | AI Software Development Agency," full page copy about "$75K–$1.5M annual SaaS spend," "break even in 2–3 years," "40+ custom software projects." Zero mention of Arlo, MCP, Claude, GA4, or any Arlo product fact. A visitor clicking "About" from Arlo's nav lands on a different company's page.
- `src/app/services/page.tsx`: hero copy "Software you own. SaaS you don't need." / "AI-powered custom software across 10 service pillars" with a Tier-2 grid of services all marked **"Coming soon"** — this is FuturLabs' service catalog, unrelated to the five (real, good) Arlo persona pages that live one level deeper at `/services/{slug}`.
- `src/app/blog/page.tsx`: metadata description "Insights on custom software, SaaS replacement, AI automation, and code ownership for mid-market companies" and on-page copy "Strategies for replacing SaaS, building custom software, and owning your technology stack." Completely wrong for a blog that should be building topical authority around agency reporting, MCP, and Claude workflows.
- `TrustBar.tsx`: "Trusted by 40+ companies to own their technology" (see §1.3).

**Fix (all four):** These aren't tone tweaks — rewrite each page/metadata block to describe Arlo specifically. Suggested replacements:
- `/about` hero: replace with Arlo's actual mission (agencies drowning in dashboard-hopping; Claude + MCP as the fix) and the real founder bio (see §2.2 rewrite). Drop the "$75K-$1.5M SaaS spend" / "own your code" framing entirely — it's a different value prop for a different buyer.
- `/services` hub: either delete this intermediate hub and route `/services` directly to a persona-picker for the five real pages, or rewrite its hero/tier-2 grid to be Arlo-specific ("Pick your role" style hub linking to SEO/PPC/AM/Agency Owner/Business Owner) and remove the "Coming soon" Tier-2 grid, which currently signals an unfinished/abandoned product.
- `/blog` metadata + intro copy: rewrite to "Reporting workflows, MCP/Claude tips, and agency operations" framing consistent with the persona pages.
- `TrustBar`: replace with an honest, defensible claim appropriate to a pre-launch/early product — e.g. "Built by the team that runs Choquer Agency's own client reporting" (single honest attribution, not "40+ companies") or remove the trust bar until there are real logos to show, per §3 below.

---

## 3. Fabricated Testimonials (Critical — Trust/Compliance Risk)

**File:** `src/content/shared.ts`, lines 38–66

```
/* ─── Testimonials (placeholder — swap with real ones post-beta) ─── */
export const testimonials: Testimonial[] = [
  { quote: "We run 47 clients. Before ARLO...", name: "Marcus Hale", title: "Founder", company: "Northpoint Digital", featured: true },
  { quote: "The audit log is the reason I bought it...", name: "Priya Sundaram", title: "Head of Analytics", company: "Relay Performance" },
  { quote: "Windsor was costing us more per month than our office rent...", name: "Jordan Flores", title: "Managing Director", company: "Staircase Studio" },
];
```

These render on the homepage via `Testimonials.tsx` under the heading "They say it better than we do" — i.e., presented to visitors as real customer quotes, with no "illustrative" or "example" disclaimer anywhere in the rendered UI. The source comment confirms these are known placeholders, not yet swapped.

**Why this matters more than a typical content-quality nit:** for a brand-new domain with zero authority, testimonials are one of the only trust levers available. Shipping fabricated ones is not just "thin content" — if a prospective buyer or competitor (Windsor.ai, Supermetrics both have real audiences to lose to Arlo) discovers named people/companies that don't check out, it becomes a public credibility incident that is far worse than having no testimonials at all.

**Fix — do this before any further traffic/launch push:**
1. Remove the three placeholder testimonials immediately, or replace the section with something honest: internal usage stats (e.g., real numbers from the Choquer Agency dogfooding case study — "30+ clients queried daily," "<2s response time"), a founder quote clearly attributed to Bryce Choquer, or a "request early access" framing instead of social proof that doesn't exist yet.
2. As real beta users onboard, replace with genuine quotes, and get explicit permission to use name/title/company — do not paraphrase into a more flattering "de-identified" placeholder in the meantime; simply don't show a testimonials section until there's real data.
3. If speed matters, a defensible interim pattern: "In our own agency, we saw X" (first-party, verifiable) framed clearly as the founder's own usage rather than third-party endorsement.

---

## 4. Thin / Duplicate Content Assessment

| Page | Approx. word count* | Page-type minimum | Verdict |
|---|---|---|---|
| Homepage (`/`) | ~900–1,100 across all sections | 500 | Meets minimum; content is a mix of strong (persona teaser, FAQ) and weak (fabricated testimonials, wrong TrustBar claim) |
| `/about` | ~450 | 500 | Below minimum **and** entirely wrong-brand (FuturLabs) — needs a full rewrite, not padding |
| `/services` (hub) | ~250 (excludes ServicePillars component, which is homepage-shared) | 800 | Thin, and largely "Coming soon" placeholder cards |
| `/services/{persona}` (5 pages) | ~1,100–1,300 each (problem + benefits + process + FAQ) | 800 | **Meets minimum, best content on the site** |
| `/destinations` | ~500–600 (hub) | — (hub/directory page) | Reasonable for a directory page; see §5 for depth concerns on subpages |
| `/destinations/{slug}` | Templated — depends on per-destination copy in `catalog.ts`; sync-mode explainer blocks are shared/templated across many destinations | 500–600 (treat like location-page analog) | **Programmatic-page risk** — templated `MODE_EXPLAINERS` (live/push/digest) mean many destination subpages will render near-identical body copy differing only in destination name and status badge. Recommend running this specific pattern through the `seo-programmatic` sub-skill for a duplicate-content/templating review. |
| `/work/choquer-agency` | ~600 | N/A (single case study) | Good depth, wrong entity framing (§2.3) |
| `/blog` | 0 posts | 1,500/post | **Empty** — see §6 |
| `/compare/windsor-ai-vs-arlo` | ~700–800 | N/A (comparison — defer to `seo-competitor-pages`) | Solid single page; only 1 of 2 named competitors (Windsor.ai) has a page — **no Supermetrics comparison exists**, despite Supermetrics being named as a direct competitor and referenced in on-page FAQ copy ("How is this different from Windsor **or Supermetrics**?") without a dedicated landing page to send that traffic to |
| `/contact` | ~90 | N/A (utility page) | Fine for a modal-trigger utility page |

\* *Estimated from source `.ts`/`.tsx` string content, not rendered DOM — directionally accurate, not pixel-precise.*

**Duplicate-content risk to flag explicitly:** the `/services/[slug]/page.tsx` template hardcodes section headings ("The Problem," "What you get with a custom build," "How we build it," "Who this is for") identically across all six persona pages. Two of these headings — **"What you get with a custom build"** and **"How we build it"** — are leftover FuturLabs phrasing baked into the *template itself* (not the per-service data), meaning every Arlo persona page currently tells the visitor they're getting a "custom build" through a "build process," when the actual product is instant self-serve signup (OAuth → add clients → paste URL). This is a direct, site-wide messaging contradiction between the wrapper template and the correct step-by-step content inside it (compare: `processSteps` correctly say "Sign up in 60 seconds," "Copy your MCP URL" — the surrounding heading calls this "how we build it").
**Fix:** in `src/app/services/[slug]/page.tsx`, change the hardcoded headings to something like "What you get" / "How it works" — two small string edits that remove a contradiction currently live on all five (six, including meta-ads-specialist) persona pages.

---

## 5. Readability

Where content is actually about Arlo (persona pages, homepage FAQ, comparison page), readability is a genuine strength:
- Short, punchy sentences; heavy use of concrete, second-person scenarios ("A client drops from position 3 to 11 on a money keyword and you don't notice until they email on Thursday").
- Minimal jargon-without-explanation; where jargon appears (MCC, PMax, CAPI, QS) it's immediately contextualized.
- Consistent structure: Problem → Benefits → Process → Best Fit → FAQ, which is both scannable for humans and well-segmented for AI extraction.
- Estimated reading level: roughly Flesch-Kincaid grade 7–9 — appropriate for a B2B SaaS audience that includes non-technical account managers and solo operators, per the stated ICP.

Where content is FuturLabs-inherited (`/about`, `/services` hub, blog metadata), readability is fine on a sentence level but **irrelevant**, since the content answers the wrong question for the audience arriving at askarlo.app.

---

## 6. AI-Citation Readiness

**Score: 40/100**

### What's working
- Persona-page FAQs (`src/content/services.ts`) are genuinely excellent quotable units — direct question, direct answer, no hedging, category-tagged (`general`/`technical`/`pricing`/`ownership`). E.g. *"Different job. Optmyzr is built around recommendations and bulk actions. ARLO is built around asking live questions across all your accounts at once."* This is exactly the self-contained, extractable format LLM answer engines favor.
- `/compare/windsor-ai-vs-arlo` has a `tldr` field, a feature-comparison table, and its own page-level JSON-LD (`comparisonSchema`) — a strong pattern that should be the template for every future comparison page.
- Blog posts (when they exist) render their own `blogPostSchema` JSON-LD per `src/app/blog/[slug]/page.tsx`.

### What's broken
- **The site-wide schema is either wrong-brand (if ever wired up — see §2.1) or entirely absent** on the homepage, `/about`, `/services` hub, the five persona pages, and `/destinations` — none of these import any JSON-LD. The persona pages have excellent FAQ content sitting in `service.faqs` that is *never* emitted as `FAQPage` schema anywhere; only the homepage's shared `faqs` array is wired into the (currently unused) `generateSchema()`. This means the single best AI-citation asset on the site (persona-page FAQs) has zero structured-data backing.
- No `Organization`/`SoftwareApplication` schema live anywhere describing Arlo correctly, so an AI system looking for a canonical entity definition of "Arlo" via structured data currently finds nothing accurate.
- No pricing schema (`Offer`/`AggregateOffer`) reflecting the real $19/$99/Agency/Scale tiers, despite pricing being public and stable enough to mark up.
- No `HowTo` schema for the correct 5-step onboarding flow (sign up → connect Google → add clients → copy MCP URL → ask), which is repeated verbatim across every persona page and is a perfect `HowTo` candidate.

**Fix priority:**
1. Rewrite `src/lib/schema.ts` to describe Arlo correctly (see §2.1) and actually import it into `layout.tsx`.
2. Add `FAQPage` schema per persona page using each page's own `service.faqs` (not just the homepage's shared FAQ array).
3. Add `HowTo` schema per persona page using `service.processSteps`.
4. Add `Offer`/pricing schema reflecting Solo/Studio/Agency/Scale tiers.
5. Roll out the `/compare` page's JSON-LD pattern (tldr + table + FAQ schema) to every future comparison page.

---

## 7. Messaging Clarity for the ICP (Agencies + Multi-Business Owners)

- **Persona pages: clear and well-targeted.** Each of the five pages speaks to a distinct buyer (SEO specialist, PPC manager, account manager, agency owner, solo business owner) with role-specific pain points and a distinct CTA framing. This is the correct pattern for a two-sided ICP (agencies vs. solo operators) and should be the model the rest of the site is brought up to.
- **Pricing model inconsistency (High):** the canonical pricing message, per `Pricing.tsx`/homepage copy, is *"Priced for how many businesses you track"* (Solo $19/mo one business, Studio $99/mo at 2+ clients, etc.). But the **agency-owner** persona page FAQ (`src/content/services.ts`, "How does pricing work as the team grows?") states: *"ARLO is priced per seat with agency plans for 10+ users. We keep pricing simple on purpose: no per-client fees, no per-query fees..."* — this directly contradicts the "priced per business tracked" model stated everywhere else, including the solo-business-owner page's own FAQ about upgrading tiers "when you add a 2nd client." An agency-owner prospect reading both the homepage and their own persona page will see two different pricing models for the same product.
  **Fix:** Reconcile immediately — determine whether Agency-tier pricing is per-seat, per-client-tracked, or both (e.g., a seat allowance bundled per client-tracked tier), then correct the agency-owner FAQ to match the model stated in `Pricing.tsx` and the solo-business-owner FAQ.
- **"325+ platforms" vs. "14 launch connectors" (Medium):** `/destinations` hero claims *"ARLO already pipes 325+ platforms to Claude"* while `src/content/shared.ts` `stats.platformsSupported = 14` and the solo-business-owner FAQ says *"14+ connectors at launch."* These numbers describe different things (destinations you can *push to*, e.g. Looker Studio/Sheets/BigQuery, vs. data *sources* you connect, e.g. GA4/Ads/Meta) but the copy doesn't disambiguate, so a reader reasonably concludes the platform count is inconsistent. **Fix:** add a one-line disambiguation ("325+ destinations you can send Arlo's data to — separate from the 14 source connectors you pull data from") wherever both numbers could be seen close together.
- **"No exports/dashboards/warehouse" core positioning is consistently and clearly stated** across homepage, comparison page, and persona pages — this is the strongest, most repeatable messaging asset on the site and should be the anchor line for all future content (blog, comparisons, ads).

---

## 8. Content Gaps vs. What Buyers Actually Search

Given the ICP (agencies + multi-business owners) and named competitors (Windsor.ai, Supermetrics), the following searchable intents currently have no page to answer them:

### Comparison content (High priority — competes directly with Windsor/Supermetrics SEO)
- **Supermetrics vs. Arlo** — Supermetrics is named as a direct competitor in the brief and referenced inline in FAQ copy ("How is this different from Windsor or Supermetrics?"), but has **no dedicated comparison page**. This is the single highest-intent missing page — "Supermetrics alternative" and "Supermetrics vs [X]" are established high-volume, high-intent query patterns in this category.
- Improvado is mentioned in `/compare/windsor-ai-vs-arlo` copy but also has no dedicated page.
- No `/compare` index/hub page exists (only the dynamic `[slug]` route) — there is no discoverable listing of all comparisons for internal linking or for a visitor to browse "Arlo vs. X" options.
- "Looker Studio alternative," "Google Data Studio alternative" — relevant given `/destinations` explicitly positions Arlo against BI dashboard tools.
- *(Full comparison-page content standards are out of scope here — defer to the `seo-competitor-pages` sub-skill for structure/depth requirements once these are built.)*

### How-to / integration guides (High priority for AI citation + long-tail SEO)
- "How to connect GA4 to Claude" / "How to connect Google Search Console to Claude Desktop" — step-by-step, screenshot-backed guides per data source, expanding what's currently a 5-step summary embedded in every persona page into full standalone guides.
- "How to set up an MCP server for Claude Desktop" (educational, top-of-funnel — captures searchers who know they want MCP/Claude but haven't found Arlo yet).
- "MCP vs. API vs. dashboard: how agencies should report to clients" (category-education content that primes the "no exports/dashboards/warehouse" positioning).
- Per-connector integration pages (GA4, GSC, Google Ads, Meta, YouTube, Shopify) — currently these only exist implicitly inside persona-page copy; standalone `/integrations/{platform}` pages would let each platform's own branded search traffic ("GA4 + Claude," "Shopify + Claude") land somewhere specific.

### Use-case / vertical pages (Medium priority)
- Multi-location/franchise agency reporting (hinted at in account-manager and agency-owner FAQs — "40 Google Business Profile locations" — but no dedicated landing page)
- E-commerce/Shopify-specific reporting workflows (mentioned in solo-business-owner content only)
- Agency QBR prep / client reporting automation (a named pain point across account-manager and agency-owner pages, but no standalone "how to automate QBR prep" content piece)

### FAQ/definitional content (Low-medium priority, cheap to produce, strong AI-citation candidates)
- "What is MCP (Model Context Protocol)?" — foundational definitional content that AI answer engines frequently need to cite when explaining the category; owning this definition page is a low-competition opportunity given MCP's relative novelty.
- "What is an agency reporting stack?" / glossary-style content around GA4, GSC, MCC, Quality Score, PMax, CAPI — terms already used confidently in persona-page copy, indicating the expertise exists to write authoritative definitions.

---

## 9. Blog Assessment — Currently Empty

**Status confirmed from source:**
- `src/content/blog/manifest.json` → `[]`
- `src/content/blog/index.ts` → `getAllMarkdownFiles()` reads from `src/content/blog/posts/<region>/*.md`; **that directory does not exist**, so `getAllBlogPosts()` always returns an empty array.
- `/blog` renders "New articles coming soon. Check back shortly." — this has presumably been the state of the page since launch.
- Only one author profile is defined (`authors.bryce`), and its bio has the identity-conflation problem noted in §2.2.

**Why this matters more for Arlo than for an established brand:** a brand-new domain with no backlinks and no historical authority depends almost entirely on topical depth and freshness signals to build any organic/AI-citation presence at all. An empty blog on a brand-new domain is not neutral — it's a missed opportunity at the exact moment the site has the least other authority to lean on.

### Recommended initial content plan (skeleton)

Organize around the two ICP tracks (agency roles vs. solo business owners) and the category-education/comparison gaps from §8. Suggested first 12 posts, roughly one per persona + comparison + educational anchor, sequenced for fastest authority build:

**Foundational / definitional (publish first — low competition, citation bait):**
1. "What is MCP (Model Context Protocol)? A plain-English guide for marketers" — anchor definitional piece, designed to be the page AI systems cite when explaining MCP in a marketing context.
2. "Windsor.ai vs. Supermetrics vs. Arlo: which one fits your agency?" — a blog-format complement to the existing `/compare` page, framed as neutral guidance rather than a head-to-head landing page (feeds the missing Supermetrics gap from §8).

**Agency-role how-tos (map 1:1 to existing persona pages, reuse the domain expertise already proven in `services.ts`):**
3. "How to connect Google Search Console to Claude Desktop (step by step)"
4. "How to audit Quality Score drops across your whole MCC in one prompt"
5. "The account manager's guide to answering client Slack pings without opening five dashboards"
6. "How agency owners can spot churn risk 6 weeks before a client leaves" (mirrors agency-owner persona page's strongest claim — expand it into a full framework piece)
7. "Multi-location/franchise clients: reporting on 40 Google Business Profile locations without losing your mind"

**Solo/business-owner track:**
8. "The $19/month alternative to hiring a marketing analyst" (targets solo-business-owner ICP directly)
9. "How to see GA4, Meta Ads, and Shopify in one conversation" (concrete, product-demonstrating — pairs well with a real screenshot/GIF per §1.1)

**Category education / positioning reinforcement:**
10. "Why agencies are skipping the data warehouse: live queries vs. ETL pipelines" (blog-length version of the Windsor comparison's core argument — reusable across future comparison pages)
11. "QBR prep in 2026: from a week of spreadsheets to a five-minute Claude conversation"
12. "What actually happens to your clients' data when you connect an MCP tool" (directly addresses the trustworthiness gap from §1.4 — a dedicated, citable answer to the security question every FAQ currently references but never elaborates)

**Production notes:**
- Every post should carry a real byline with the corrected bio (§2.2 fix applied first, before any posts publish under it).
- Reuse the existing `blogPostSchema` JSON-LD pattern already built in `src/app/blog/[slug]/page.tsx` — the technical infrastructure for AI-citation-ready blog posts already exists; only the content is missing.
- Target 1,200–1,800 words per post per the blog-post minimum in the standard content-minimums table, but prioritize genuine topical coverage (the persona pages prove the team has real domain depth to draw on) over hitting a word count for its own sake.
- Update `/blog` page metadata and intro copy away from the FuturLabs framing (§2.4) before or alongside the first post going live, so the hub page itself doesn't contradict post #1.

---

## 10. Prioritized Fix List

### Critical (fix before any further traffic push)
1. Remove/replace fabricated testimonials in `src/content/shared.ts` (§3).
2. Rewrite `/about` (`src/app/about/page.tsx`) to describe Arlo, not FuturLabs (§2.4).
3. Rewrite `/services` hub (`src/app/services/page.tsx`) — remove "Coming soon" FuturLabs tier-2 grid, reframe as an Arlo persona picker (§2.4).
4. Fix `TrustBar.tsx` claim "Trusted by 40+ companies to own their technology" (§1.3/§2.4).
5. Rewrite `src/content/blog/index.ts` author bio to stop conflating Arlo with "Choquer Agency's internal MCP" as a separate prior project (§2.2).
6. Rewrite `/blog` page metadata/intro copy away from "custom software / SaaS replacement" framing (§2.4).
7. If/when `src/lib/schema.ts` is wired up, it must be rewritten first — wrong pricing, wrong audience, wrong `knowsAbout`, wrong `HowTo` framing (§2.1).

### High
8. Reconcile agency-owner FAQ pricing claim ("priced per seat") with the actual "priced per business tracked" model (§7).
9. Fix hardcoded template headings "What you get with a custom build" / "How we build it" in `src/app/services/[slug]/page.tsx` (§4).
10. Re-attribute `/work/choquer-agency` testimonial from "Founder, Choquer Agency" to "Founder, Arlo," and reframe the page/route away from a portfolio-case-study pattern (§2.3).
11. Build a Supermetrics comparison page; add a `/compare` index/hub for discoverability (§8).
12. Add `FAQPage`/`HowTo` schema per persona page (currently unused despite excellent underlying FAQ data) (§6).
13. Publish first 3–4 blog posts from the skeleton in §9, prioritizing the MCP-definition and Supermetrics-comparison posts.

### Medium
14. Disambiguate "325+ platforms" (destinations) vs. "14 connectors" (sources) wherever both appear (§7).
15. Add a legal entity name + registered address to `/privacy`/`/terms`/footer (§1.4).
16. Fix dead footer social links (`href="#"`) using the real URLs already in `siteConfig.social` (§1.4).
17. Add pricing/`Offer` schema reflecting real tiers once schema.ts is rewritten (§6).
18. Review `/destinations/[slug]` templated `MODE_EXPLAINERS` copy for duplicate-content risk across the ~17-entry catalog — recommend routing through the `seo-programmatic` sub-skill (§4).

### Low
19. Add a real product screenshot/GIF of a Claude query+response to the homepage/persona pages (§1.1).
20. Add third-party validation signals (G2/Capterra, "works with Claude Desktop" badge) once available (§1.3).
21. Add a dedicated security/data-flow page substantiating the "never stores client data" claim repeated across FAQs (§1.2/§1.4).

---

## Files Referenced in This Audit

- `/Users/brycechoquer/Desktop/Arlo/website/src/app/page.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/app/about/page.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/app/services/page.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/app/services/[slug]/page.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/content/services.ts`
- `/Users/brycechoquer/Desktop/Arlo/website/src/app/destinations/page.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/app/destinations/[slug]/page.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/lib/destinations/catalog.ts`
- `/Users/brycechoquer/Desktop/Arlo/website/src/app/work/[slug]/page.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/content/case-studies.ts`
- `/Users/brycechoquer/Desktop/Arlo/website/src/components/FeaturedCaseStudy.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/app/blog/page.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/app/blog/[slug]/page.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/content/blog/index.ts`
- `/Users/brycechoquer/Desktop/Arlo/website/src/content/blog/manifest.json`
- `/Users/brycechoquer/Desktop/Arlo/website/src/app/contact/page.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/app/compare/[slug]/page.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/content/comparisons.ts`
- `/Users/brycechoquer/Desktop/Arlo/website/src/content/shared.ts`
- `/Users/brycechoquer/Desktop/Arlo/website/src/lib/schema.ts`
- `/Users/brycechoquer/Desktop/Arlo/website/src/lib/siteConfig.ts`
- `/Users/brycechoquer/Desktop/Arlo/website/src/components/TrustBar.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/components/Testimonials.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/components/Footer.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/components/Hero.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/app/privacy/page.tsx`
- `/Users/brycechoquer/Desktop/Arlo/website/src/app/terms/page.tsx`
