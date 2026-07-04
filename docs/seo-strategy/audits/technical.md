# Technical SEO Audit — askarlo.app

**Audited:** 2026-07-04
**Site:** https://askarlo.app (Next.js 14, App Router, deployed on Vercel; auth/data via Convex)
**Scope:** Crawlability, indexability, canonicalization, redirects, URL structure, mobile, HTTPS/security headers, Core Web Vitals (lab estimate from source), JS rendering/SSR, structured data, IndexNow.
**Method:** Live HTTP inspection (curl, headers, HTML source) of https://askarlo.app cross-referenced against `/Users/brycechoquer/Desktop/Arlo/website/src/app` source. No changes were made to `choquer.agency`, `choquer.app`, or `futurlabs.dev` — none of the fixes below require touching those domains.

**Overall Technical Score: 58 / 100** — Crawlability and hosting fundamentals (HTTPS, robots.txt, AI-bot allow list, single-hop redirects, mobile viewport) are solid, but a site-wide canonical-tag bug and a stale/broken `llms.txt` are actively undermining indexing and AI-citation correctness. A forced-dynamic rendering config is silently killing CDN caching for 100% of the marketing site.

---

## Category Pass/Fail Summary

| Category | Status | Notes |
|---|---|---|
| 1. Crawlability (robots, sitemap, noindex) | ⚠️ Partial | robots.txt/sitemap correct; several app/auth routes crawlable with no `noindex` |
| 2. Indexability (canonicals, duplicates) | ❌ Fail | ~17 of 29 sitemap URLs self-canonicalize to the homepage |
| 3. Security (HTTPS, headers) | ⚠️ Partial | HTTPS + HSTS present; no CSP/X-Frame-Options/X-Content-Type-Options/Referrer-Policy/Permissions-Policy |
| 4. URL Structure / Redirects | ✅ Pass | Clean slugs, single-hop redirects, no chains found |
| 5. Mobile | ✅ Pass | Correct viewport meta, fluid type scale in CSS |
| 6. Core Web Vitals (lab estimate) | ⚠️ Partial | No CDN caching (forced dynamic render) is the main structural risk; animation-heavy hero is a secondary LCP/CLS risk |
| 7. Structured Data | ❌ Fail | Homepage/about/services/work/destinations ship **zero** JSON-LD; the one Organization schema in the codebase describes the wrong business and isn't even wired in |
| 8. JS Rendering / SSR | ✅ Pass (with caveats) | Marketing pages are server-rendered (content visible in raw HTML); a few pages are unnecessarily client-only |
| 9. IndexNow | ❌ Not implemented | No IndexNow key file or ping integration found for Bing/Yandex/Naver |

---

## CRITICAL — Fix immediately (indexing/entity integrity at risk)

### C1. Site-wide canonical-tag bug — almost every non-root page canonicalizes to the homepage
**Verified live** on `/about`, `/services/seo-specialist`, `/destinations/looker_studio`, `/work/choquer-agency` — all four return:
```html
<link rel="canonical" href="https://askarlo.app"/>
```
instead of their own URL.

**Root cause:** `src/app/layout.tsx` sets a hardcoded root-level canonical:
```ts
alternates: { canonical: siteConfig.url },   // = https://askarlo.app
```
Next.js metadata merging is **shallow per top-level key** — if a page's `generateMetadata()`/`metadata` export doesn't include its own `alternates` key, it silently **inherits the parent's**, it does not clear it. The following route files only set `title`/`description` and never set `alternates.canonical`, so they all inherit the homepage canonical:

- `src/app/about/page.tsx`
- `src/app/work/page.tsx`
- `src/app/work/[slug]/page.tsx` (case studies, e.g. `/work/choquer-agency`)
- `src/app/blog/page.tsx`
- `src/app/destinations/page.tsx`
- `src/app/destinations/[slug]/page.tsx` (all 14 destination detail pages)
- `src/app/services/page.tsx`
- `src/app/services/[slug]/page.tsx` (all 5 tier-1 persona pages)
- `src/app/contact/page.tsx` (no metadata export at all — see H-3)

That's roughly **17 of the 29 sitemap URLs** telling Google "the canonical version of this page is the homepage." At minimum this dilutes indexing signals and risks Google collapsing these pages out of the index in favor of `/`; at worst it actively suppresses ranking for the exact commercial pages (persona/services pages, comparison-adjacent destination pages, case study) that are supposed to carry long-tail intent.

**Pages that already do this correctly (use as the template):**
- `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` — `alternates: { canonical: \`${siteConfig.url}/privacy\` } }`
- `src/app/blog/[slug]/page.tsx` — `alternates: { canonical: \`${SITE_URL}/blog/${post.slug}\` } }`
- `src/app/compare/[slug]/page.tsx` — `alternates: { canonical: \`${SITE_URL}/compare/${page.slug}\` } }`

**Fix:** Add `alternates: { canonical: \`${SITE_URL}/<path>\` }` to every `metadata`/`generateMetadata()` export listed above. Best long-term fix: write a small helper (`buildMetadata({ title, description, path })`) that always sets canonical from `path`, so it's impossible to add a new route and forget it.

---

### C2. `/about` page content and meta description describe the wrong company entirely
**Verified live:** page `<title>` reads "About ARLO | AI Software Development Agency" but the meta description and the entire page body are about a *different, sister business*:

`src/app/about/page.tsx` (lines 8–12):
```ts
export const metadata: Metadata = {
  title: `About ${AGENCY_NAME} | AI Software Development Agency`,
  description:
    "FuturLabs is a custom AI software development agency founded by Bryce Choquer. Based in Canada, serving mid-market companies ($10M–$250M revenue) across North America. 40+ projects delivered, 25+ SaaS tools replaced, $180K average annual client savings. Full code ownership.",
};
```
The body copy (lines 37–251) continues in the same vein: "Mid-market companies deserve better than renting their technology," "We build AI-powered custom software that replaces your most expensive SaaS subscriptions," "Own Your Code / No licensing fees, no vendor lock-in," a tech-stack badge list, etc. This is FuturLabs/Choquer-agency boilerplate that was never rewritten for Arlo (a per-business-tracked MCP SaaS product, not a bespoke-dev agency selling code ownership). It directly contradicts Arlo's own `/llms.txt` description and every other page on the site.

**Why this matters for technical SEO specifically (not just copy):** search engines build a topical/entity model of the domain from aggregate content. One of 29 indexed URLs asserting the site is a "custom AI software development agency" selling "$15,000–$400,000" projects to "$10M–$250M mid-market companies" (see C3, same language appears in dead code) actively confuses topical relevance for a SaaS product priced per business tracked, and will produce an incorrect/embarrassing meta description in the SERP snippet and in AI Overviews / answer engines that surface this page for "who is Arlo" or "About Arlo" queries.

**Fix:** Rewrite `src/app/about/page.tsx` metadata and body to describe Arlo (the MCP connector, its founding story — Choquer Agency origin story already exists correctly in `src/content/case-studies.ts` and can be reused/linked), the actual pricing model, and the actual audience (agencies/teams in US+Canada). Also add the missing canonical (folds into C1).

---

### C3. `public/llms.txt` — 3 of ~11 linked pages are dead (404), fed straight to AI crawlers
Verified live:
```
curl -I https://askarlo.app/services/meta-ads-specialist   → 404
curl -I https://askarlo.app/pricing                        → 404
curl -I https://askarlo.app/docs                            → 404
```
`llms.txt` is the file specifically designed to hand a clean, authoritative page map to GPTBot/ChatGPT-User, ClaudeBot, PerplexityBot, etc. — all of which are explicitly allowed in `robots.ts`. Shipping three dead links in it directly undermines AI-answer-engine citation quality and self-defeats the reason the file exists.

Root cause detail:
- `/services/meta-ads-specialist` — `content/services.ts` defines this persona with `tier: 2`, but `src/app/services/[slug]/page.tsx` explicitly gates the route: `if (!service || service.tier !== 1) notFound();`, and `sitemap.ts` / `generateStaticParams()` both call `getTier1Services()` only — so this page is unreachable no matter what. Either promote it to tier 1 (real page + add to sitemap) or remove it from `llms.txt`.
- `/pricing` and `/docs` — no such routes exist anywhere under `src/app`. Either build these pages or remove the links from `public/llms.txt`.
- Separately, `llms.txt`'s "Who ARLO Is For" list omits two personas that *do* have live pages (`/services/solo-business-owner`, `/services/google-ads-specialist`) while listing the broken `meta-ads-specialist` — the file has drifted from the actual route list.

**Fix:** Regenerate `public/llms.txt` from the same source of truth as `sitemap.ts` (or generate it programmatically from `getTier1Services()` + real routes) so it can never drift again.

---

## HIGH

### H1. Entire site is served with `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` — no CDN/edge caching on any page
Verified on every page tested (`/`, `/about`, `/services/seo-specialist`, `/destinations/looker_studio`, `/compare/windsor-ai-vs-arlo`, `/work/choquer-agency`) — identical header on all of them, including 100%-static marketing content.

**Root cause:** `src/app/layout.tsx` unconditionally wraps the *entire* app, including all public marketing routes, in `ConvexAuthNextjsServerProvider` whenever Convex is configured (which it is in production):
```tsx
return convexConfigured ? (
  <ConvexAuthNextjsServerProvider>{shell}</ConvexAuthNextjsServerProvider>
) : ( shell );
```
Convex Auth's server provider reads auth cookies via Next's `cookies()` API on every request, which opts the *entire request tree* out of static rendering/ISR in the App Router — including pages that have nothing to do with auth (`/`, `/about`, `/services/*`, `/compare/*`, `/destinations/*`, `/work/*`, `/blog/*`). The practical effect: every single page load, for every visitor and every crawler, is a full serverless function invocation with no edge cache, instead of a pre-rendered static asset served from Vercel's CDN.

**Impact:** higher and more variable TTFB (directly feeds LCP), no stale-while-revalidate resilience under traffic spikes/crawler bursts, and materially higher Vercel function-invocation cost for what is fundamentally a static content site.

**Fix:** Scope the Convex auth provider to only the routes that need it — wrap it in the `(app)` route-group layout (`src/app/(app)/layout.tsx`) and the specific standalone auth-adjacent pages (`/sign-in`, `/onboarding`, `/welcome`, `/oauth/authorize`), not the root layout. Let marketing routes render statically (default Next.js behavior) so Vercel can cache them at the edge.

### H2. `sitemap.ts` sets `lastModified: new Date()` on nearly every entry — every URL always reports "modified right now"
Verified live: every `<lastmod>` in `sitemap.xml` carries the exact same timestamp, equal to the moment the sitemap was requested (`2026-07-04T18:08:03.702Z` for all 28 of 29 URLs; only the blog loop correctly uses `post.modifiedDate`).

`src/app/sitemap.ts` calls `new Date()` inline for the homepage, `/services`, all 5 service entries, `/work`, all case-study entries, `/about`, `/contact`, `/blog`, `/destinations`, all 14 destination entries, and all comparison entries.

**Impact:** `lastmod` becomes meaningless noise. Google has stated it will discount unreliable `lastmod` signals; a sitemap that claims every URL changed at the exact same instant on every crawl is a textbook example of the pattern Google ignores, wasting the (small but real) value `lastmod` has for recrawl prioritization.

**Fix:** Use actual content-modification dates — e.g., derive from git history at build time, a CMS field, or an explicit `lastUpdated` field on each content object (comparisons already have `page.lastUpdated` in `content/comparisons.ts` — reuse that instead of `new Date()` for the compare entries at minimum; add equivalent fields for services/destinations/case studies).

### H3. `/contact` has no page-level metadata at all
`src/app/contact/page.tsx` is a `"use client"` component with no `metadata`/`generateMetadata` export, so it fully inherits the root layout's title ("ARLO | Ask Claude about any client, any platform") and description verbatim — plus the wrong canonical (C1). `/contact` is indistinguishable from the homepage in search results.

**Fix:** Split into a small server component wrapper that exports its own `metadata` (unique title, description, canonical `${SITE_URL}/contact`) and renders the existing client form as a child.

### H4. Auth/app/demo/token routes are publicly crawlable with no `noindex` and no page-level metadata
Verified live, all return `200` with **no `<meta name="robots">` tag**:
- `/sign-in`
- `/welcome`
- `/oauth/authorize`
- `/demo/dashboard` (and the rest of `src/app/demo/**`)
- `/preview/[token]`, `/share/[token]` (token-in-URL pages — these should never be indexable, and a crawlable, guessable/enumerable token URL is also a minor data-exposure concern independent of SEO)

None of these are in `sitemap.xml`, and `robots.txt` allows `/` for everyone, so nothing currently blocks a crawler that discovers them via an internal link from indexing a login screen, an internal demo clone of the product, or a client-specific preview/share link.

**Fix:** Add `export const metadata = { robots: { index: false, follow: false } }` (or a shared `noindex` metadata object) to: `src/app/sign-in/page.tsx`, `src/app/onboarding/page.tsx`, `src/app/welcome/page.tsx`, `src/app/oauth/authorize/page.tsx`, `src/app/demo/layout.tsx` (covers all `/demo/**`), `src/app/preview/[token]/page.tsx`, `src/app/share/[token]/page.tsx`. Also add these path prefixes to `robots.ts`'s disallow rules as defense in depth.

### H5. `/compare/[slug]` JSON-LD breadcrumb links to a `/compare` index that doesn't exist (404), and disagrees with the visible breadcrumb
`src/app/compare/[slug]/page.tsx` embeds:
```ts
breadcrumb: {
  itemListElement: [
    { position: 1, name: "Home", item: SITE_URL },
    { position: 2, name: "Compare", item: `${SITE_URL}/compare` },   // 404 — no compare/page.tsx exists
    { position: 3, name: page.saasName },
  ],
},
```
but the **visible** on-page breadcrumb a few lines later renders `Home / Services / {saasName} Alternatives` (i.e., links to `/services`, not `/compare`). Structured data must match visible content per Google's guidelines, and the `item` URL in position 2 is a dead link regardless.

**Fix:** Either build a real `/compare` index page and make both breadcrumbs point to it, or drop the middle breadcrumb level from both the JSON-LD and the visible nav so they agree (`Home / {saasName} Alternatives`).

---

## MEDIUM

### M1. Orphaned Organization/Service structured data describes the wrong business (currently dormant, but a landmine)
`src/lib/schema.ts` exports `generateSchema()`, a full `@graph` of `Organization`/`ProfessionalService`, `Person`, `WebSite`, `WebPage`, `FAQPage`, `HowTo`, `Service`, and `BreadcrumbList` nodes. Content is 100% FuturLabs/Choquer-agency: `priceRange: "$15,000 - $400,000+"`, `knowsAbout: ["Custom Software Development", "CRM Development", "ERP Development", ...]`, `audience.audienceType: "Mid-market companies ($10M–$250M revenue)"`, `HowTo name: "Our Custom Software Development Process"`.

Confirmed **not currently rendered anywhere** — `grep -rn "generateSchema"` finds only the definition in `lib/schema.ts`, no imports/usages in any `layout.tsx` or `page.tsx`, and the live homepage HTML contains **zero** `<script type="application/ld+json">` tags. So today this is dead code, not a live bug — but it's a landmine: if anyone wires it into the layout later (a very plausible "let's finally add schema markup" fix) it will ship completely wrong entity data.

**Fix:** Either delete `src/lib/schema.ts`, or rewrite it to describe Arlo (SoftwareApplication/Product entity, correct pricing tiers from `llms.txt`/`content/shared.ts`, correct audience) before it's ever imported, and use the real per-page FAQ/breadcrumb data already available in `content/services.ts`, `content/shared.ts`.

### M2. Zero structured data on the pages that matter most commercially
Confirmed 0 `ld+json` blocks on `/`, `/about`, `/services`, `/services/[slug]`, `/work`, `/work/[slug]`, `/destinations`, `/destinations/[slug]` — only `/blog/[slug]` and `/compare/[slug]` currently emit JSON-LD (Article/FAQPage respectively). Given Arlo has clean tiered pricing (`Free/$0`, `Pro/$79`, `Scale/$249`, `Enterprise`) already documented in `public/llms.txt` and `src/content/shared.ts`, a `SoftwareApplication` + `Offer` schema on the homepage, plus `Service`/`FAQPage` schema on the 5 tier-1 persona pages (`content/services.ts` already has a `faqs` array per service — it's just not emitted as JSON-LD), would be low-effort, high-value additions for rich results and AI answer-engine grounding.

### M3. Duplicate GA4 tagging via both GTM and direct `gtag.js`
`src/app/layout.tsx` loads both `<GoogleTagManager gtmId={siteConfig.gtmId} />` and `<GoogleAnalytics measurementId="G-CP22NBPLFP" />` (`src/components/GoogleTagManager.tsx`) on every page. Both use `next/script strategy="afterInteractive"`, so this is not a render-blocking/LCP problem, but it is redundant JS (two separate script downloads/executions) and, if the GTM container also fires a GA4 config tag for the same measurement ID, a risk of double-counted pageviews/events. Confirm the GTM container's tag config and drop whichever path is redundant.

### M4. Missing security headers
Live header dump on every route tested shows only `strict-transport-security` (Vercel platform default). `next.config.mjs` defines no `headers()` function at all, so there is no `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, or `Permissions-Policy` anywhere on the site. This doesn't block indexing, but it's a standard line item in technical SEO/security audits and a low-cost fix.

**Fix:** Add a `headers()` block to `next.config.mjs` applying at minimum `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN` (or a CSP `frame-ancestors 'self'`), and `Permissions-Policy` restricting camera/mic/geolocation.

### M5. `/privacy` and `/terms` are excluded from `sitemap.xml`
Both pages exist, resolve `200`, and already have correct self-referencing canonicals (`src/app/privacy/page.tsx`, `src/app/terms/page.tsx`), but `src/app/sitemap.ts` never lists them (confirmed: sitemap has exactly 29 URLs, neither `/privacy` nor `/terms` among them). Not harmful — Google will still find them via footer links — but inconsistent with the rest of the canonical-URL discipline on the site.

**Fix:** Add both to `sitemap.ts`.

### M6. IndexNow protocol not implemented
No IndexNow key file (e.g. `/<key>.txt` at root) or ping-on-publish integration was found anywhere in `src/app` or `public/`. Given the brief calls this out explicitly and the stack already has a cron/webhook pattern in place (`src/app/api/cron/destinations/route.ts`, `src/app/api/webhook/formspark/route.ts`) integrating IndexNow on publish/update (new blog posts, comparison pages) would be low-effort and would speed up Bing/Yandex/Naver discovery, which matters for an early-stage product trying to build authority fast.

**Fix:** Generate an IndexNow key, serve it at `public/<key>.txt`, and add a ping call to the IndexNow API in the blog-publish and sitemap-regeneration paths.

---

## LOW

### L1. `www.askarlo.app → askarlo.app` redirect uses `307 Temporary Redirect`
Verified: `curl -I https://www.askarlo.app/` → `HTTP/2 307`, `location: https://askarlo.app/`. Apex-vs-www canonicalization is a permanent decision; it should be a `301`/`308` so search engines and browsers cache the redirect and pass full signal confidence. (The `http → https` redirect is correctly a `308`; only the `www` host redirect is a `307`.) This is very likely a default Vercel domain-redirect setting rather than app code — confirm in the Vercel project's Domains configuration.

### L2. Trailing-slash redirect is a correct single hop, no chains found
`https://askarlo.app/about/` → `308` → `/about`. Good — no multi-hop redirect chains were found anywhere tested (`http→https→apex→final` all resolve in ≤1 hop each). No action needed; noted here only because the brief asked redirect chains to be explicitly checked.

### L3. `destinations/[slug]/page.tsx` generateMetadata sets no Open Graph/Twitter overrides
`src/app/destinations/[slug]/page.tsx`'s `generateMetadata()` only returns `title`/`description`; social shares of destination pages (e.g. `/destinations/looker_studio`) will fall back to the root layout's homepage OG title/description/image. Low priority since these are not primary link-building targets, but cheap to fix alongside C1's canonical fix.

### L4. `content/services.ts` carries a fully authored, unreachable tier-2 page (`meta-ads-specialist`)
Complete hero/benefits/FAQ content exists for this persona but the route 404s (see C3). Either ship it as a real tier-1 page (there's clear product justification — Meta/LinkedIn/TikTok Ads connectors are listed in `llms.txt`) or remove the dead content and its `llms.txt` reference.

---

## What's already working well (no action needed)

- `robots.txt` (`src/app/robots.ts`) is comprehensive and correctly `Allow: /` for Google, Bing/generic, and the full modern AI-crawler roster (GPTBot, ChatGPT-User, OAI-SearchBot, anthropic-ai, ClaudeBot, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended, GoogleOther, Applebot-Extended, Amazonbot, CCBot, DeepSeekBot, DuckAssistBot, YouBot, PhindBot) with a correct `Sitemap:` pointer.
- `sitemap.xml` returns exactly the 29 URLs expected, all `https://askarlo.app/...` absolute, no trailing slashes, no parameterized duplicates.
- HTTPS is enforced end-to-end with HSTS (`max-age=63072000`); `http→https` and apex/`www` consolidation both work (redirect status codes aside, see L1).
- Mobile viewport is correctly set (`width=device-width, initial-scale=1`) and the design system uses fluid `clamp()`-based type scales (`text-fluid-h1`, etc.) and container utilities consistent with responsive-first layout.
- Marketing pages are genuinely server-rendered — page content (headings, copy, FAQ text) is present in the raw HTML `curl` response, not requiring JS execution to be crawlable. This is correct for an SEO-dependent Next.js App Router site.
- `/blog/[slug]` and `/compare/[slug]` both already do canonical tags, Open Graph, and JSON-LD (Article/FAQPage) correctly — use these two files as the reference implementation when fixing the other route types above.
- No redirect chains (>1 hop) found anywhere tested.

---

## Priority Fix Order (recommended)

1. **C1** — add missing `alternates.canonical` to the 9 route files listed (single highest-leverage fix; ~30 min of mechanical work).
2. **C2** — rewrite `/about` content/metadata to describe Arlo, not FuturLabs.
3. **C3** — fix or remove the 3 dead links in `public/llms.txt`; resolve `meta-ads-specialist`'s tier-2/404 mismatch.
4. **H1** — rescope `ConvexAuthNextjsServerProvider` out of the root layout so marketing pages can be statically cached.
5. **H4** — add `noindex` to `/sign-in`, `/welcome`, `/oauth/authorize`, `/demo/**`, `/preview/[token]`, `/share/[token]`.
6. **H2, H3, H5** — sitemap `lastmod` accuracy, `/contact` metadata, compare-page breadcrumb consistency.
7. **M1–M6** — structured data cleanup/build-out, duplicate analytics, security headers, sitemap completeness, IndexNow.
8. **L1–L4** — cosmetic/low-effort cleanup.
