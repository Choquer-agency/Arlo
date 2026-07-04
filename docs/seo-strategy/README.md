# ARLO SEO Strategy — Audit Index & Action Plan

**Domain:** https://askarlo.app · **Product:** Arlo — the MCP connector that plugs Claude into an
agency's marketing accounts (GA4, Search Console, Google Ads, Meta, YouTube, Shopify) for live
conversational reporting; priced per business tracked. **Market:** US + Canada. **Stage:** brand-new
domain (DA 0) → **6–12 month organic ramp**; month-1 success = indexation + first tracked rankings,
not leads.

**Audited:** 2026-07-04 (8 parallel specialists, live SE Ranking + Common Crawl data).

---

## Overall SEO Health: ~47/100 — "Needs Work / Foundation stage"

Not a penalty problem — a **new-domain + unfinished-migration** problem. The bones are good (SSR,
AI-crawler-friendly robots.txt, a genuinely strong `/compare/windsor-ai-vs-arlo` template and five
solid `/services/{persona}` pages), but the site is **contaminated with leftover FuturLabs/Choquer
Agency copy**, ships **near-zero valid structured data**, and has a **site-wide canonical bug** that
tells Google most inner pages are duplicates of the homepage.

| Lens | Score | Report |
|---|---|---|
| Technical | criticals present | [`audits/technical.md`](audits/technical.md) |
| Content & E-E-A-T | 46/100 | [`audits/content.md`](audits/content.md) |
| On-page & Schema | poor (dead JSON-LD) | [`audits/onpage-schema.md`](audits/onpage-schema.md) |
| GEO / AI-search | 50/100 | [`audits/geo-ai.md`](audits/geo-ai.md) |
| SXO / intent | 47/100 | [`audits/sxo.md`](audits/sxo.md) |
| Keyword research | live SE Ranking | [`audits/keyword-research.md`](audits/keyword-research.md) |
| Competitor gap | live SE Ranking | [`audits/competitor.md`](audits/competitor.md) |
| Backlinks & authority | new domain (empty) | [`audits/backlinks.md`](audits/backlinks.md) |

---

## The strategic thesis (what the keyword + competitor + SXO data agree on)

**Don't fight the DA-88 fortresses.** Supermetrics, Windsor, Funnel, AgencyAnalytics, Improvado,
Whatagraph own the head "marketing reporting / alternative" SERPs and can't be beaten near-term.

**Win the emerging MCP-integration cluster instead** — it's Arlo's exact category, low-KD, and growing
fast, with fragmented SERPs (personal blogs, Medium, micro-tools ranking next to Windsor/Supermetrics):

- `google analytics mcp` (KD 21, +39× YoY) · `google ads mcp` (590/mo, KD 18, +8×) · `mcp connector`
  (KD 11) · `claude mcp server` (810/mo, KD 21) · `meta ads mcp` · `google search console mcp` · `ga4 mcp`
- **Play:** a programmatic **connector-page matrix** — Arlo's 6 data sources × Claude/ChatGPT, each a
  step-by-step tutorial + example prompts + short video, GEO/citation-optimized (these queries fire AI
  Overviews and get researched inside LLMs).
- **Secondary (high commercial intent):** `supermetrics alternative` (KD 16, **$33.76 CPC**),
  `agencyanalytics alternative`/`whatagraph alternative` (KD 7), + the agency-persona terms
  `client reporting` (KD 6), `seo agency reporting software` (KD 16, zero competition).
- **Lead with the differentiator:** *"No dashboards, no exports, no warehouse — just ask Claude,
  priced per business."*

Full keyword table: [`audits/keyword-research.md`](audits/keyword-research.md).

---

## P0 — Critical (do first; blocks indexing/citation or is a trust/accuracy issue)

1. **Purge the FuturLabs/Choquer Agency contamination.** Flagged by 5 audits. Rewrite for Arlo's real
   SaaS positioning + $19–$499/mo pricing: `/about` (body + meta), `/services` hub, `/work` hub, blog
   metadata, homepage `TrustBar` ("Trusted by 40+ companies"), and the blog author bio (present Arlo as
   a standalone product, not "Choquer Agency's internal MCP"). *Files: `src/app/about/page.tsx`,
   `src/content/shared.ts`, service/work hub pages.*
2. **Remove fabricated testimonials.** `src/content/shared.ts` shows fake customer quotes (e.g. "Marcus
   Hale / Northpoint Digital") the code itself marks "placeholder." Take down or replace with the one
   real, attributed testimonial (`/work/choquer-agency`). Never attach `Review`/`aggregateRating` to
   placeholders.
3. **Fix the site-wide canonical bug.** `src/app/layout.tsx` hardcodes `alternates.canonical` to the
   homepage; Next.js shallow-merges metadata, so ~17 of 29 pages emit the homepage canonical instead of
   their own → Google treats them as homepage duplicates. Set per-page canonicals (and stop the same OG
   inheritance).
4. **Fix `public/llms.txt`.** Wrong pricing (advertises a "Pro $79/50 clients" tier that doesn't exist)
   and 3 dead links (`/pricing`, `/docs`, `/services/meta-ads-specialist` all 404). It's the one file
   meant to guide AI crawlers — make it accurate.
5. **Ship real, correct structured data.** `generateSchema()` is never imported (homepage has zero
   JSON-LD); existing `src/lib/schema.ts` encodes the *wrong* business (ProfessionalService, $15K–$400K,
   deprecated `HowTo`) and pages reference dangling `@id`s (`#business`, `#founder`). Replace with:
   `Organization` + `WebSite`(+SearchAction) + `SoftwareApplication`/`Product`+`Offer` (6 real tiers in
   `src/content/config.ts`) + `BreadcrumbList`; fix the invalid `BlogPosting` (missing `@context`).
   Ready-to-paste JSON-LD is in [`audits/onpage-schema.md`](audits/onpage-schema.md).
6. **`/services/meta-ads-specialist` 404s in prod** though it's linked in nav and has full content —
   `services/[slug]/page.tsx` only statically serves `tier === 1`. Fix the static params/rendering.

## P1 — High (significant ranking/experience impact; weeks 1–4)

7. **Build `/compare/supermetrics-vs-arlo`** by cloning the strong `/compare/windsor-ai-vs-arlo`
   template (TL;DR, feature table, "choose X when", FAQPage schema — it scores 71/100). Supermetrics is a
   named competitor and a target query; Windsor has near-zero brand demand, so lead comparisons with
   Supermetrics.
8. **Emit `FAQPage` schema from `src/components/FAQ.tsx`** (used on homepage + every service page) — one
   fix propagates AI-Overview-eligible FAQ markup across 6+ pages.
9. **Stop forcing dynamic rendering on marketing pages.** `ConvexAuthNextjsServerProvider` wraps the root
   layout → every page returns `Cache-Control: no-store` (no CDN caching) even for 100% static content.
   Scope auth to the app routes so marketing pages are static/cacheable (TTFB/LCP + Vercel cost).
10. **`noindex` the app/auth/demo routes.** `/sign-in`, `/welcome`, `/oauth/authorize`, `/demo/**`, and
    token-bearing `/preview/[token]`/`/share/[token]` return 200 and are crawlable — add `noindex` +
    robots rules.
11. **Start the connector-matrix wedge** — first 2–3 pages: "Connect GA4 to Claude", "Google Ads MCP",
    "Search Console MCP" (tutorial + prompts + video + FAQPage).
12. **`/contact` has no metadata** (silently duplicates homepage title/desc); add page metadata. Add
    `metadataBase` + a default OG image (0/12 pages currently have a resolvable OG/Twitter image).

## P2 — Medium (weeks 4–12)

13. Fill the empty blog (12-post plan in [`audits/content.md`](audits/content.md)) — persona + MCP
    education + comparison anchors.
14. Fix `sitemap.ts` (`new Date()` gives every URL a fake "modified now" `lastModified`); make `www` a
    permanent (301/308) redirect, not 307; add security headers; add IndexNow.
15. Off-page Phase 1 (weeks 1–4): MCP registries (Smithery, Glama, mcp.so, awesome-mcp-servers),
    AlternativeTo/SaaSHub/G2/Capterra, sequenced Product Hunt. Phase 2: digital PR + guest bylines. One
    disclosed contextual sister-link with choquer.agency — **never 301 any sister/legacy domain.** See
    [`audits/backlinks.md`](audits/backlinks.md).
16. Resolve the pricing-model contradiction (agency-owner FAQ says "per seat"; everywhere else "per
    business tracked") and remove leftover "custom build" template headings on persona pages.

---

## Quick wins (highest impact ÷ effort)

- Per-page canonicals (P0 #3) — unlocks indexing of ~17 pages in one change.
- `FAQPage` schema in the FAQ component (P1 #8) — AI-Overview markup across 6+ pages, one edit.
- Fix `llms.txt` pricing + dead links (P0 #4) — minutes; directly aids AI citation.
- Clone `supermetrics-vs-arlo` from the existing compare template (P1 #7).
- Remove fabricated testimonials (P0 #2) — trust + compliance, minutes.

---

## Next: Phase 2 (strategy) & Phase 3+ (automation)
- `12-week-strategy.md` — weekly playbooks front-loading the P0/P1 backlog + the connector-matrix wedge.
- `worklog.txt` — append-only source of truth for the autonomous routine.
- Phases 3–5 (GitHub-Actions email reports + twice-weekly cloud routines) need: Claude GitHub-app access
  to the private repo, Vercel auto-deploy on push, and Resend secrets in GitHub Actions.
