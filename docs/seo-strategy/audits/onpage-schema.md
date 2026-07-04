# Structured Data & On-Page SEO Audit — askarlo.app

**Scope:** `/`, `/about`, `/services`, `/services/[slug]`, `/compare/[slug]`, `/destinations`, `/destinations/[slug]`, `/work`, `/work/choquer-agency`, `/blog`, `/blog/[slug]`, `/contact`
**Method:** Static source review — `src/lib/schema.ts`, `src/app/**/page.tsx`, `src/content/**`, `src/lib/siteConfig.ts` — cross-checked against Google's supported rich-result types and Schema.org validity rules. No live render/Playwright fetch was needed; this is a Next.js App Router site where all metadata and JSON-LD are authored server-side and are visible directly in source (confirmed no client-only injection of schema anywhere in `src/components`).
**Site identity confirmed in source:** `AGENCY_NAME = "ARLO"`, `SITE_URL = "https://askarlo.app"` (`src/lib/siteConfig.ts`). This is correctly wired. The problem is **content**, not config — several pages still carry copy from what appears to be a prior "Choquer Creative / FuturLabs" custom-software-agency template. Flagged below because it directly corrupts entity data (Organization `description`, page titles, About page bio) that structured data and AI Overviews will read as ground truth for the ARLO brand.

---

## 0. Critical / Executive Summary

| # | Finding | Severity |
|---|---|---|
| 1 | **`generateSchema()` in `src/lib/schema.ts` is dead code.** It is never imported or rendered anywhere in `src/app`. The homepage ships **zero JSON-LD** despite a fully-built Organization/Person/WebSite/FAQPage/HowTo/Service/BreadcrumbList graph sitting unused in the repo. | Critical |
| 2 | **Dangling `@id` references.** `/blog/[slug]` and `/compare/[slug]` both emit JSON-LD that references `${SITE_URL}/#business` (publisher) and, on blog posts, `${SITE_URL}/#founder` (author) by `@id` only — but neither node is ever defined on any rendered page (see #1). Google/AI parsers see broken references to entities that don't exist in the graph. | Critical |
| 3 | **No `SoftwareApplication`/`Product`+`Offer` schema anywhere**, despite ARLO having six concrete, real, published price points (Free/$0, Solo/$19, Studio/$99, Agency/$249, Scale/$499, Enterprise/Custom in `src/content/config.ts`). This is the single highest-value gap for a SaaS site — it's the schema type that makes price/rating/availability eligible for rich results and is the strongest AI-Overview signal for "how much does X cost" queries. | Critical |
| 4 | **The schema.ts file that does exist is written for the wrong business.** `@type: ["Organization","ProfessionalService"]`, `priceRange: "$15,000 - $400,000+"`, `knowsAbout: ["Custom Software Development", "SaaS Replacement", "CRM Development", "ERP Development"...]` — this describes a bespoke-software consultancy, not a $19–$499/mo SaaS connector. Even though it's currently unused, if someone wires it into `layout.tsx` as-is, it will publish incorrect Organization data. | Critical |
| 5 | **Deprecated `HowTo` type present in source.** `schema.ts` line 96–106 defines a `HowTo` block for the "5-step process." Per Google's Sept 2023 change, HowTo rich results are retired — do not ship this even when wiring the file up. Delete it, don't just leave it dormant. | High (do-not-ship) |
| 6 | **`/about`, `/services` (hub), and `/work` (hub) contain leftover agency-template copy**, not ARLO copy: `/about`'s `<title>` is `About ARLO | AI Software Development Agency` and its meta description literally starts with **"FuturLabs is a custom AI software development agency founded by Bryce Choquer... mid-market companies ($10M–$250M revenue)... 40+ projects delivered, 25+ SaaS tools replaced"** — a different, hardcoded company name, wrong Ideal Customer Profile, wrong claims. This directly undermines whatever Organization entity Google/LLMs build for ARLO (About pages are a primary E-E-A-T source). Not a schema bug per se, but it will poison any Organization/About-page structured data you add on top of it. | Critical (content, adjacent to schema) |
| 7 | **No `metadataBase`, no `openGraph.images`/`twitter.images`, no dedicated OG image asset anywhere in `public/`.** Every shared link across the entire site (Slack, Twitter/X, LinkedIn, iMessage) will render with no preview image. | High |
| 8 | **`/contact` has no `metadata` export at all** — it's a `"use client"` page with zero `<title>`/description override, so it silently inherits the homepage's title/description verbatim. Duplicate title tag across two indexed URLs. | High |
| 9 | Testimonials shown on the homepage (`src/content/shared.ts`) are explicitly commented **"placeholder — swap with real ones post-beta."** Do not attach `Review`/`AggregateRating` schema to these under any circumstances — that is exactly the kind of fabricated-review markup Google's structured-data spam policy and review-schema guidelines prohibit, and it risks a manual action. The one real, attributed testimonial (Bryce Choquer / Founder, Choquer Agency on `/work/choquer-agency`) is safe to mark up if ever formalized as a customer review. | Critical (compliance) |
| 10 | Numeric inconsistency across pages that will eventually need to back schema properties: FAQ says **"14 platforms at launch,"** Enterprise pricing tier says **"All 107+ source types,"** `/destinations` hero says **"ARLO already pipes 325+ platforms to Claude."** Pick one accurate number before it ends up in `featureList`/`numberOfItems` on any new schema. | Medium |

---

## 1. Existing Schema Inventory & Validation

### 1.1 Homepage `/` (`src/app/page.tsx` + `src/app/layout.tsx`)
- **JSON-LD present: none.** `page.tsx` renders `Hero`, `TrustBar`, `SaaSPain`, `ServicePillars`, `DestinationsTeaser`, `FeaturedCaseStudy`, `Process`, `Testimonials`, `Pricing`, `FAQ`, `Footer` — none of these components (checked all of `src/components`) emit `<script type="application/ld+json">`. `generateSchema()` from `src/lib/schema.ts` is not imported by `layout.tsx` or `page.tsx`.
- **Validation:** N/A — nothing to validate. **Fail: 0/1 pages with schema present.**
- Visual FAQ accordion exists on the page (`FAQ` component, using real `faqs` from `src/content/shared.ts`) but has **no corresponding FAQPage JSON-LD**. This is a genuine missed opportunity even accounting for Google's Aug-2023 FAQ rich-result restriction (see §3.5), because the content is real and well-suited for AI Overview / ChatGPT-style citation.
- Metadata (`layout.tsx`): title, description, keywords, `openGraph` (title/description/url/siteName/type — **no `images`**), `twitter` (card + title/description — **no `images`**), `alternates.canonical` — all present and ARLO-accurate. This is the best-optimized metadata block on the site.

### 1.2 `/about` (`src/app/about/page.tsx`)
- **JSON-LD present: none.**
- **Metadata:** title `About ARLO | AI Software Development Agency`; description opens with **"FuturLabs is a custom AI software development agency founded by Bryce Choquer... 40+ projects delivered, 25+ SaaS tools replaced, $180K average annual client savings."** This is hardcoded string content, not templated from `AGENCY_NAME`/`siteConfig`, and describes a different company. Founder bio on-page repeats the same consulting narrative ("Bryce has led 40+ custom software projects across healthcare, construction, e-commerce...").
- **No `alternates.canonical`.**
- **Validation:** Fail — no schema; underlying content also fails an accuracy/E-E-A-T check if used as an Organization/Person source later.

### 1.3 `/services` hub (`src/app/services/page.tsx`)
- **JSON-LD present: none.**
- **Metadata:** title `Services | ARLO`; description `"Custom software that replaces your expensive SaaS subscriptions. CRM, ERP, AI agents, workflow automation, BI, and legacy modernization."` — this is agency-consulting copy, unrelated to ARLO's actual "services" (which, per `/services/[slug]`, are really **persona landing pages**: SEO Specialists, PPC Managers, etc., built around MCP data sources). H1 ("Software you own. SaaS you don't need.") reinforces the mismatch — ARLO *is* the SaaS.
- Renders a "Specialized Services" grid whose cards are all labeled **"Coming soon"** (tier-2 services) — fine content-wise, but note none of this is markup-eligible yet.
- **No canonical.**
- **Validation:** Fail — no schema; hub copy needs a rewrite pass independent of schema.

### 1.4 `/services/[slug]` (`src/app/services/[slug]/page.tsx`, e.g. `/services/seo-specialist`)
- **JSON-LD present: none.**
- Content here (`src/content/services.ts`) is actually **on-brand and accurate** — real ARLO positioning per persona (SEO specialists, GSC/GA4/PageSpeed pain points, correct 5-step onboarding). Minor residual template phrasing ("How we build it" / "What you get with a custom build") reads like a dev-shop deliverable rather than SaaS onboarding — cheap copy fix, not urgent.
- `generateMetadata` sets title/description per service — good, unique per page — but **no canonical, no OG override** (falls back to nothing since root layout OG has no per-page override mechanism used here — check: root `openGraph` will show homepage title/description on service pages when shared via social unless Next merges — since these pages don't set `openGraph` in their own `Metadata`, Next.js does **not** inherit `openGraph.title` from the parent automatically for `openGraph.description`/url; effectively service pages share generic OG or none — verify before launch).
- Each service page renders a **real, unique FAQ set** (`service.faqs`) via `<FAQ items={service.faqs} />` but, same as homepage, **no FAQPage JSON-LD is emitted** for it.
- **Validation:** Fail — no schema on a page type that's the best-templated, most scalable content on the site (6+ persona pages, each with real FAQs and structured pain-point/benefit/process data — exactly the shape `Service` + `FAQPage` + `BreadcrumbList` schema wants).

### 1.5 `/compare/[slug]` (`src/app/compare/[slug]/page.tsx`, currently only `windsor-ai-vs-arlo`)
- **JSON-LD present:** yes — a `@graph` with `WebPage` (includes `breadcrumb`) + `FAQPage`.
- **Validation, property by property:**
  - `@context: "https://schema.org"` — Pass.
  - `WebPage.@type/name/description/url/dateModified` — Pass (dates in `content/comparisons.ts` are ISO `"2026-04-12"` — Pass on ISO 8601).
  - `WebPage.publisher: {"@id": "${SITE_URL}/#business"}` — **Fail (dangling reference)**. That node is never defined anywhere on the live graph (see Critical #2).
  - `breadcrumb.itemListElement` — 3 items, positions 1–3 correct; items 1–2 have `item` URLs, item 3 (current page) omits `item` — **acceptable** per Google's guidance (last/current item may omit URL), not an error.
  - `FAQPage.mainEntity` — well-formed `Question`/`Answer` pairs, real content (2 FAQs) — structurally Pass.
  - **Compliance note:** this is a commercial page (SaaS comparison), and Google restricted FAQ rich results to government/health sites in Aug 2023 (see rule set). This won't earn a FAQ rich snippet on Google, but it's real, useful content and genuinely useful for LLM/AI-Overview citation of "Windsor vs ARLO" queries — **flag as Info priority, not Critical**, per the restricted-schema rule. Do not remove it; just don't expect a Google SERP feature from it.
- **Missing on this page type:** no `Product`/`SoftwareApplication` comparison markup, no `ItemList` for the feature-comparison table (7 rows) even though the page is structurally a comparison table that maps almost 1:1 onto `ItemList`/`Question`-style comparison markup. See §3.6 for a ready-to-paste `ItemList` recommendation.
- Only one comparison page currently exists (`windsor-ai-vs-arlo`) despite ARLO's positioning against Supermetrics too (mentioned throughout copy/meta as a competitor) — a `/compare/supermetrics-vs-arlo` page is a clear content gap, unrelated to schema but worth a line item since the template is already schema-ready.

### 1.6 `/destinations` and `/destinations/[slug]`
- **JSON-LD present: none** on either the hub or detail pages.
- **Metadata:** hub has title/description (no canonical); detail page (`generateMetadata`) sets title + description from `d.tagline` only — **no canonical, no OG/Twitter override**.
- H1 on detail pages is just `{dest.name}` (e.g., "Looker Studio") with no ARLO-branded modifier — works, but a title like "Sync ARLO to Looker Studio" would carry more keyword equity and is still unique.
- **Validation:** Fail — no schema. Given the "325+ platforms" framing (see numeric inconsistency, Critical #10) this hub is a strong candidate for `ItemList`/`BreadcrumbList`, see §3.6.

### 1.7 `/work` and `/work/choquer-agency`
- **JSON-LD present: none.**
- `/work` hub metadata: title `Case Studies | ARLO`; description `"Real results from real companies. See how mid-market businesses replaced expensive SaaS with custom software they own."` — **same agency-template mismatch as `/about` and `/services`** (mid-market/custom-software framing bleeding into ARLO's actual SaaS case-study section). H1 "Real results. Real savings." — generic but not wrong.
- `/work/choquer-agency` itself is **authentic, accurate content**: real story (Choquer Agency built ARLO internally first), real named testimonial (Bryce Choquer, Founder, Choquer Agency), real metrics (30+ clients, 15 tools, <2s p95 latency, 5+ hrs/week saved). This is the one testimonial on the site safe to mark up with `Review` schema (see §3.7).
- No canonical, no OG override, no `Article`/`Review` schema despite being the strongest, most legitimate content asset on the site for both rich results and AI citation.
- **Validation:** Fail — no schema on the single best-qualified page for `Article` + `Review` markup on the entire site.

### 1.8 `/blog` and `/blog/[slug]`
- **`/blog` hub:** no JSON-LD, no canonical. Content note: `manifest.json` in `src/content/blog/` is currently empty (`[]`) and the blog index correctly falls back to "New articles coming soon" — **there are effectively zero published posts today**, so this is a pre-launch content gap more than a schema bug, but the template needs to be schema-correct before the first post ships.
- **`/blog/[slug]`:** JSON-LD present — `BlogPosting` with `headline`, `description`, `datePublished`, `dateModified`, `wordCount`, `url`, `author` (`Person`, `@id`-referenced), `publisher` (`Organization`, `@id`-referenced), `mainEntityOfPage`.
  - `@context` — **Fail: missing entirely.** The object at `src/app/blog/[slug]/page.tsx:49-73` has no `"@context": "https://schema.org"` key. As written this JSON-LD **will not validate** — it's a bare object with `@type` but no `@context`, which most validators (including Google's Rich Results Test) will reject outright.
  - `publisher.@id` → `${SITE_URL}/#business` — dangling, same issue as `/compare` (Critical #2).
  - `author.@id` → `${SITE_URL}/#founder` — dangling, same issue.
  - **Missing `image` property** — required by Google for `BlogPosting`/`Article` rich results (without it, no eligibility for the Top Stories/Article carousel treatment). The `BlogPost` type already has an optional `featuredImage` field (`src/content/blog/index.ts:31`) that isn't being passed into the schema object at all.
  - `openGraph`/`twitter` metadata on this page (via `generateMetadata`) is otherwise solid: title, description, url, siteName, type: article, publishedTime, modifiedTime, authors, canonical — genuinely the best-built `generateMetadata` block in the codebase. Just needs `images`.
  - **Validation: Fail** (missing `@context` is a hard validator failure; dangling `@id`s and missing `image` are secondary failures).

### 1.9 `/contact`
- **No `metadata` export of any kind** — this is a `"use client"` component page with zero title/description override. It silently inherits root layout's title (`ARLO | Ask Claude about any client, any platform`) and description verbatim.
- **No JSON-LD.**
- **Validation:** Fail — duplicate `<title>`/meta description with the homepage is a real, measurable on-page SEO defect (Search Console will flag "Duplicate, Google chose different canonical" or similar), independent of schema.

---

## 2. Title / Meta Description / H1 / OG Audit Table

| Page | `<title>` | Meta description | H1 | Canonical | OG images | Verdict |
|---|---|---|---|---|---|---|
| `/` | `ARLO \| Ask Claude about any client, any platform` — good, unique | Accurate, ARLO-specific, keyword-rich (Windsor/Supermetrics alternative terms) | "Ask Claude about any client, any platform." — unique, on-brand | ✅ Set | ❌ None | Best page on site |
| `/about` | `About ARLO \| AI Software Development Agency` — **wrong category** | **Wrong company name ("FuturLabs"), wrong ICP, wrong claims** | "We build software you own." — off-message for a SaaS | ❌ Missing | ❌ None | Needs full rewrite |
| `/services` (hub) | `Services \| ARLO` — generic | Agency-consulting copy, not ARLO's real "services" | "Software you own. SaaS you don't need." — contradicts ARLO being a SaaS | ❌ Missing | ❌ None | Needs rewrite |
| `/services/[slug]` (×6) | Unique per persona, good | Unique per persona, accurate | Unique per persona (`heroH1`) — good, real differentiation | ❌ Missing | ❌ None (no per-page OG) | Content good; technical meta incomplete |
| `/compare/windsor-ai-vs-arlo` | `Windsor.ai vs. ARLO \| Claude MCP for Agencies (2026)` — strong, unique | Strong, comparison-specific | `page.title` — long but unique and keyword-rich | ✅ Set | ❌ None | Best comparison template; needs more slugs (Supermetrics) |
| `/destinations` (hub) | `Destinations \| ARLO` — generic | Accurate | "Your data, in the tool your client already opens." — good | ❌ Missing | ❌ None | Fine copy, missing technical meta |
| `/destinations/[slug]` | `{name} \| Destinations \| ARLO` — good pattern | `d.tagline` only — thin | Just `{dest.name}` — not keyword-optimized | ❌ Missing | ❌ None | Works, could be stronger |
| `/work` (hub) | `Case Studies \| ARLO` — good | **Agency-template mismatch** ("mid-market businesses replaced expensive SaaS") | "Real results. Real savings." — generic but not wrong | ❌ Missing | ❌ None | Needs copy fix |
| `/work/choquer-agency` | `Choquer Agency Case Study \| ARLO Origin Story` — good, unique | Good, accurate | `cs.headline` — unique, strong | ❌ Missing | ❌ None | Best case-study content; needs technical meta + schema |
| `/blog` (hub) | `Blog \| ARLO` — generic | Generic ("insights on custom software, SaaS replacement...") — **again agency-flavored, not ARLO's actual blog framing** | "Insights & Resources" — generic | ❌ Missing | ❌ None | No posts published yet; fix template copy before first post |
| `/blog/[slug]` | `{title} \| ARLO` — good pattern | `post.excerpt` — good, unique | `post.title` — good, unique | ✅ Set | ❌ None (`openGraph` present but no `images`) | Best-built metadata block; missing `image` in both OG and schema |
| `/contact` | **None — inherits homepage title verbatim** | **None — inherits homepage description verbatim** | "Ask us anything about ARLO." — fine | ❌ Missing | ❌ None | Needs a `metadata` export, full stop |

**H1 uniqueness:** every page type produces a unique, non-duplicated H1 string across the sampled URLs — no collisions found. The failure mode here is *messaging accuracy* (About/Services/Work hubs), not duplication.

**OG/Twitter image coverage: 0 of 12 sampled page types** have a resolvable `openGraph.images`/`twitter.images`, and there is no `metadataBase` set in `layout.tsx` and no dedicated OG image asset in `public/`. Every social share of any URL on the site will render with a blank/default card.

---

## 3. Missing High-Value Schema — Recommendations

Priority order for implementation effort vs. impact:

### 3.1 Organization + WebSite (sitewide, root layout) — **Critical, implement first**
Replace the dead/incorrect `generateSchema()` Organization block. Add this once in `src/app/layout.tsx` (inside `<head>`), sourced from `siteConfig` so it can never drift from `AGENCY_NAME`/`SITE_URL` again. No `SearchAction` — confirmed via source (`sitemap.ts`, `src/components`) that there is no working on-site search endpoint today; do not add `WebSite.potentialAction.SearchAction` until one exists (a fake/non-functional SearchAction is itself a validator/policy violation).

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://askarlo.app/#organization",
      "name": "ARLO",
      "url": "https://askarlo.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://askarlo.app/images/logo.png",
        "width": 512,
        "height": 512
      },
      "description": "ARLO plugs Claude into every account your agency runs. One connector, every client, every platform — GA4, Search Console, Google Ads, Meta, YouTube, Shopify, and more. Live data, not exports.",
      "email": "hello@askarlo.app",
      "founder": {
        "@type": "Person",
        "@id": "https://askarlo.app/#founder",
        "name": "Bryce Choquer",
        "url": "https://askarlo.app/about"
      },
      "sameAs": [
        "https://linkedin.com/company/askarlo",
        "https://x.com/askarlo",
        "https://github.com/askarlo"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://askarlo.app/#website",
      "url": "https://askarlo.app",
      "name": "ARLO",
      "publisher": { "@id": "https://askarlo.app/#organization" }
    }
  ]
}
```

**Action required before shipping:** create a real `logo.png` asset (Google requires a resolvable, appropriately-sized logo for Organization rich results / Knowledge Panel eligibility — the existing `src/app/icon.png` is a favicon-sized asset, not a logo). Once this block exists at `#organization`, **every other page's `@id` reference to `${SITE_URL}/#business` must be updated to `${SITE_URL}/#organization`** (or duplicate the fragment identifier) — otherwise you've just moved the dangling-reference bug rather than fixed it. `${SITE_URL}/#founder` in `blog/[slug]/page.tsx` should also resolve against this same node.

### 3.2 SoftwareApplication with tiered Offers — **Critical, highest new-value item**
Add to the homepage (or a dedicated `/pricing`-equivalent section — currently pricing lives inline on `/` via the `Pricing` component). This is the single most important addition: it's what makes ARLO eligible for price-range/rating rich results and is the strongest possible AI-Overview signal for "ARLO pricing" / "ARLO vs Windsor.ai cost" queries. Sourced directly from the real tiers in `src/content/config.ts` — no placeholders.

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ARLO",
  "url": "https://askarlo.app",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "Marketing Analytics Connector",
  "operatingSystem": "Web, macOS, Windows",
  "description": "ARLO plugs Claude into every account your agency runs — GA4, Search Console, Google Ads, Meta, YouTube, Shopify, and more. Live data via one MCP connector, no data warehouse required.",
  "offers": [
    {
      "@type": "Offer",
      "name": "Free",
      "price": "0",
      "priceCurrency": "USD",
      "description": "1 client, 2 source types, 1 team member, 100 MCP calls/month.",
      "url": "https://askarlo.app/#pricing"
    },
    {
      "@type": "Offer",
      "name": "Solo",
      "price": "19",
      "priceCurrency": "USD",
      "description": "1 business, 7 source types, 3 team members, 2,500 MCP calls/month.",
      "url": "https://askarlo.app/#pricing"
    },
    {
      "@type": "Offer",
      "name": "Studio",
      "price": "99",
      "priceCurrency": "USD",
      "description": "Up to 10 clients, 12 source types, unlimited team members, 25,000 MCP calls/month.",
      "url": "https://askarlo.app/#pricing"
    },
    {
      "@type": "Offer",
      "name": "Agency",
      "price": "249",
      "priceCurrency": "USD",
      "description": "Up to 25 clients, 18 source types, unlimited team members, 100,000 MCP calls/month.",
      "url": "https://askarlo.app/#pricing"
    },
    {
      "@type": "Offer",
      "name": "Scale",
      "price": "499",
      "priceCurrency": "USD",
      "description": "Up to 75 clients, unlimited source types, unlimited team members, 500,000 MCP calls/month.",
      "url": "https://askarlo.app/#pricing"
    }
  ]
}
```

Notes:
- `Enterprise` (Custom pricing) is deliberately omitted from `offers` — Google's guidance is to avoid `Offer.price` for "contact us" pricing; if you want it represented, use a separate `Offer` with `priceSpecification` omitted and `availability` only, or leave it out of schema entirely (safest — matches current behavior of most SaaS competitors' markup).
- All `price` values must stay in sync with `src/content/config.ts` — treat this JSON-LD as **generated from that file**, not hand-maintained, or it will drift the first time pricing changes.
- Because monthly recurring pricing is being represented as a flat `price` rather than a subscription, consider adding `priceSpecification: { "@type": "UnitPriceSpecification", "price": "19", "priceCurrency": "USD", "unitText": "MONTH" }` in a follow-up pass for full correctness — flat `price` is acceptable and widely used, but `UnitPriceSpecification` is the more precise choice for recurring SaaS billing.
- Do **not** add `aggregateRating` to this block. There are no real, collected reviews yet (see Critical #9) — adding a fabricated or estimated rating here is a policy violation, not just a quality issue.

### 3.3 BreadcrumbList — **High, sitewide pattern**
Only `/compare/[slug]` currently has one (embedded inside its `WebPage` node), and even that one is missing from `/services/[slug]`, `/destinations/[slug]`, `/blog/[slug]`, `/work/[slug]` — every deep page type on the site. Below is the reusable shape for `/services/seo-specialist` as an example; the same pattern applies 1:1 to destinations and work.

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://askarlo.app" },
    { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://askarlo.app/services" },
    { "@type": "ListItem", "position": 3, "name": "For SEO Specialists" }
  ]
}
```

Implement this as a small shared helper (e.g. `buildBreadcrumbSchema(pairs: {name, item?}[])` in `src/lib/schema.ts` once that file is rehabilitated) so every dynamic route gets it for free instead of hand-writing it four more times.

### 3.4 BlogPosting fixes (not a new type — fixing what exists) — **Critical, cheapest fix on this list**
Three one-line fixes to `src/app/blog/[slug]/page.tsx`:
1. Add `"@context": "https://schema.org"` to the `blogPostSchema` object (currently absent — this alone makes the block fail validation today).
2. Add `"image"` sourced from `post.featuredImage` (already exists on the `BlogPost` type, just isn't being read into the schema object):
   ```json
   "image": ["https://askarlo.app/images/blog/{featuredImage}"]
   ```
   (fall back to the future Organization `logo` only if no featured image is set — never omit `image` entirely, since it's effectively required for Article rich-result eligibility).
3. Point `author.@id` and `publisher.@id` at the corrected `#founder`/`#organization` fragments from §3.1 instead of the currently-undefined `#business`.

### 3.5 FAQPage — **Info priority, not Critical (per restricted-schema rule)**
- **Existing** `FAQPage` on `/compare/windsor-ai-vs-arlo` is fine to keep — flag as **Info**, not Critical. It won't win a Google FAQ rich snippet (commercial site, restricted since Aug 2023), but it's real content that helps AI Overviews / ChatGPT / Perplexity cite ARLO directly for comparison queries, which matters more for a product actively competing for AI-driven discovery.
- **Adding new** `FAQPage` markup to the homepage FAQ section or the six `/services/[slug]` pages (all of which have real, unique, non-templated FAQ content) is **not recommended for a Google rich-result benefit** — but is reasonable if GEO/AI-citation is a stated priority, since these are genuine FAQs, not manufactured for schema. If you do add it, use the exact same pattern already proven on `/compare`:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Does ARLO connect to the Search Console I already use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. ARLO authenticates through your existing Google account, so every property you already have access to shows up automatically. You do not need to re-verify sites."
        }
      }
    ]
  }
  ```

### 3.6 ItemList — for `/compare/[slug]` feature table and `/destinations` catalog — **Medium**
The Windsor comparison page's 7-row feature table and the Destinations hub's 300+ item catalog are both naturally `ItemList`-shaped. Example for the comparison table (kept short — full 7 rows follow the same pattern):

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Windsor.ai vs. ARLO feature comparison",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Entry price", "description": "Windsor.ai: $19/mo (3 sources) — ARLO: $0 Free / $19 Solo / $99 Studio" },
    { "@type": "ListItem", "position": 2, "name": "Data warehouse required", "description": "Windsor.ai: Yes (BigQuery, Snowflake, Sheets) — ARLO: None, live queries" },
    { "@type": "ListItem", "position": 3, "name": "Claude / AI access", "description": "Windsor.ai: Not included — ARLO: included on every tier" }
  ]
}
```
Note: `ItemList` does not carry a distinct Google rich-result treatment for this use case the way it does for recipe/product carousels — treat this as a GEO/LLM-comprehension aid (helps an AI assistant extract the comparison cleanly) rather than a SERP-feature play.

### 3.7 Review — case study only, and only because it's real — **Medium, narrow scope**
Attach to `/work/choquer-agency` only, using the real, attributed testimonial already in `src/content/case-studies.ts`. Do **not** generalize this pattern to the homepage testimonials (placeholder data, see Critical #9).

```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "SoftwareApplication",
    "name": "ARLO"
  },
  "author": {
    "@type": "Person",
    "name": "Bryce Choquer"
  },
  "reviewBody": "We built this because we needed it. The fact that every other agency has the same problem was the business model reveal.",
  "publisher": {
    "@type": "Organization",
    "name": "Choquer Agency"
  }
}
```
Do not add `reviewRating` unless a real star rating was actually collected — an unrated testimonial should stay as `Review` without a `reviewRating` node rather than inventing one.

---

## 4. Prioritized Action Plan

**Critical (fix before anything else):**
1. Rewrite `/about`, `/services` hub, and `/work` hub copy to remove leftover "FuturLabs"/agency-consulting language and describe ARLO's real product, ICP, and pricing model.
2. Delete the `HowTo` block from `schema.ts` outright (deprecated, do not ship even dormant).
3. Rebuild `schema.ts`'s Organization block for ARLO (not ProfessionalService/$15K-$400K consulting) and wire it into `src/app/layout.tsx` so it actually renders — see §3.1.
4. Fix the missing `@context` on `blog/[slug]`'s `BlogPosting` (currently invalid JSON-LD) — see §3.4.
5. Resolve every dangling `#business`/`#founder` `@id` reference across `compare/[slug]` and `blog/[slug]` once §3.1's Organization/Person nodes exist.
6. Add a `metadata` export to `/contact` (currently duplicates the homepage title/description).
7. Never attach `Review`/`aggregateRating` schema to the homepage's placeholder testimonials.

**High:**
8. Implement `SoftwareApplication` + tiered `Offer` schema (§3.2) — biggest net-new opportunity on the site.
9. Add `metadataBase` + a real OG image asset + `openGraph.images`/`twitter.images` across all page types (currently 0 of 12 sampled types have a social preview image).
10. Add `BreadcrumbList` to `/services/[slug]`, `/destinations/[slug]`, `/blog/[slug]`, `/work/[slug]` (only `/compare/[slug]` has one today).
11. Add `image` to the `BlogPosting` schema and confirm every published post has a `featuredImage`.

**Medium:**
12. Add canonical URLs to every page type currently missing one (`/about`, `/services` hub + detail, `/destinations` hub + detail, `/work` hub + detail, `/blog` hub).
13. Add `ItemList` markup to `/compare/[slug]`'s feature table and consider it for the `/destinations` catalog.
14. Add `Review` schema (no fabricated rating) to `/work/choquer-agency` only.
15. Reconcile the 14 / 107+ / 325+ platform-count inconsistency before it lands in any `featureList` or `numberOfItems` property.

**Info:**
16. Keep the existing `FAQPage` on `/compare/windsor-ai-vs-arlo` — it won't earn a Google rich result on a commercial page, but it's legitimate content worth keeping for AI-Overview citation. Same guidance applies if `FAQPage` is later added to `/services/[slug]` or the homepage.
17. Publish a `/compare/supermetrics-vs-arlo` page using the exact `windsor-ai-vs-arlo` schema template — content gap, not a schema defect.
