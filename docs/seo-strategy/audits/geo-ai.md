# GEO / AI-Search Readiness Audit — askarlo.app

**Audited:** 2026-07-04
**Auditor:** GEO specialist pass (automated fetch + manual schema/content review)
**Scope:** Homepage, `/robots.txt`, `/llms.txt`, `/sitemap.xml`, `/services` + 5 persona pages, `/compare/windsor-ai-vs-arlo`, `/about`, `/blog`, `/work` + case study, `/contact`. `/pricing` and `/docs` were requested because `llms.txt` links to them.

**Method note:** Fetches were done via a raw-HTTP + Playwright-fallback renderer (`render_page.py`, `mode=auto`) with `trafilatura` for boilerplate-stripped text extraction. Live rank-tracking (DataForSEO ChatGPT-visibility / LLM-mention tools) was **not available** in this session, so platform scores below are directional estimates based on known ranking-factor research, not measured SERP/answer positions. Re-run with DataForSEO MCP tools connected to convert estimates into measured citation rates.

---

## 1. GEO Health Score: 50 / 100 — Needs Work

| Dimension | Weight | Score | Weighted |
|---|---|---|---|
| Citability | 25% | 58 / 100 | 14.5 |
| Structural Readability | 20% | 62 / 100 | 12.4 |
| Multi-Modal Content | 15% | 35 / 100 | 5.25 |
| Authority & Brand Signals | 20% | 40 / 100 | 8.0 |
| Technical Accessibility | 20% | 50 / 100 | 10.0 |
| **Total** | **100%** | | **50.15 ≈ 50** |

**Headline finding:** Arlo has done the *easy* GEO homework (open robots.txt, an `llms.txt` file, an SSR Next.js site, a genuinely well-built comparison page) but is being held back by two silent, high-severity bugs — a **site-wide canonical/OG-tag bug** that tells crawlers every inner page is a duplicate of the homepage, and **zero `schema.org` structured data** anywhere except one comparison page — plus a **brand-identity collision** (ARLO / FuturLabs / Choquer Agency all resolve to the same founder and site) that actively confuses the entity graph LLMs use to decide who to cite. These are the two highest-leverage fixes on the list below.

---

## 2. AI Crawler Access (robots.txt)

`https://askarlo.app/robots.txt` returns 200 and is unusually thorough — it explicitly names 17 user-agents, all `Allow: /`, plus a `Sitemap:` directive.

| Crawler | Directive | Status |
|---|---|---|
| GPTBot | Allow: / | ✅ Allowed |
| ChatGPT-User | Allow: / | ✅ Allowed |
| OAI-SearchBot | Allow: / | ✅ Allowed |
| ClaudeBot | Allow: / | ✅ Allowed |
| Claude-SearchBot | Allow: / | ✅ Allowed |
| anthropic-ai | Allow: / | ✅ Allowed (training bot — see note) |
| PerplexityBot | Allow: / | ✅ Allowed |
| Perplexity-User | Allow: / | ✅ Allowed |
| Google-Extended | Allow: / | ✅ Allowed (Gemini/AIO grounding) |
| GoogleOther | Allow: / | ✅ Allowed |
| Applebot-Extended | Allow: / | ✅ Allowed (Apple Intelligence/Siri) |
| Amazonbot | Allow: / | ✅ Allowed (Alexa+/Rufus) |
| CCBot | Allow: / | ✅ Allowed (training bot — see note) |
| DeepSeekBot | Allow: / | ✅ Allowed |
| DuckAssistBot | Allow: / | ✅ Allowed |
| YouBot | Allow: / | ✅ Allowed |
| PhindBot | Allow: / | ✅ Allowed |
| `User-Agent: *` | Allow: / | ✅ Allowed |

**Verdict: Pass, and better than the task brief expected.** Every crawler the brief asked about (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot) is explicitly allowed, not just caught by the wildcard.

**One judgment call worth flagging:** `anthropic-ai` and `CCBot` — the two crawlers commonly used for *model-training* corpora rather than live retrieval — are also left open. The skill brief's default guidance is "optional block (training only)." For a product whose entire pitch is "we are the AI-native way to do agency reporting," being present in training data is arguably a feature (it's how a model "just knows" Arlo exists at inference time even without live browsing), so leaving these open is a defensible strategic choice, not an error — but it should be a deliberate decision, not an accident of copying a template. Confirm with the team that training-corpus inclusion is intentional.

---

## 3. `/llms.txt` Audit — Present, but contains stale/incorrect facts and 2 dead links

`https://askarlo.app/llms.txt` returns 200 with `Content-Type: text/plain; charset=utf-8` and follows the llms.txt spec structure (H1, blockquote summary, H2 sections, markdown links). `/llms-full.txt` also returns 200. **No RSL 1.0 licensing file was found** — `/rsl.xml` and `/.well-known/rsl.xml` both 404.

### What's good
- Clear one-paragraph summary of what Arlo is, who it's for, and how it works — well-suited to being lifted verbatim into an LLM's context window.
- Full platform list (14 integrations), audience segmentation (5 personas with links), and "Key Facts" block (founder, location, launch year, data-storage model, security model).
- Structured under conventional llms.txt H2s (`## What ARLO Does`, `## Supported Platforms`, `## Who ARLO Is For`, `## Key Facts`, `## Pages`, `## Contact`).

### Critical defects
1. **Pricing is wrong and doesn't match the live site.** `llms.txt` states: *"Pricing: Free ($0, 1 client) → Pro ($79/mo, 50 clients) → Scale ($249/mo, 200 clients) → Enterprise (custom)"*. The actual homepage pricing (confirmed by live fetch) is: **Free $0 → Solo $19/mo → Studio $99/mo (most popular) → Agency $249/mo → Scale $499/mo → Enterprise custom**. There is no "Pro" tier on the live site at all. Any LLM that cites `llms.txt` pricing verbatim (a very likely behavior — this is precisely the kind of structured fact block models quote) will tell a prospective buyer **the wrong price**, which is a direct trust/conversion risk, not just an SEO nitpick.
2. **Two of the seven links in `## Pages` are dead.** `https://askarlo.app/pricing` and `https://askarlo.app/docs` both return **404**. Neither URL is even linked from on-page navigation (checked the homepage's rendered HTML — no `href="/pricing"` or `href="/docs"` anywhere), meaning these are pages the llms.txt author intended to exist but that were never built or were removed, with no correction made to llms.txt. An LLM that tries to verify a claim by visiting the cited link will get a dead end, which measurably reduces the credibility crawlers/agents assign to the rest of the file.
3. No `llms.txt` reference to the `/compare/windsor-ai-vs-arlo` page — the one page on the site best structured for a head-to-head competitive query isn't surfaced in the file whose entire purpose is to hand an LLM a curated map of "what matters here."

**Recommendation:** Treat `llms.txt` as a build artifact, not a one-time hand-written file — generate the pricing block from the same source of truth (e.g., a `pricing.json`/CMS field) that renders the `/pricing` section of the homepage, so it can never drift again. Fix or remove the two dead links immediately; either ship `/pricing` and `/docs` as real pages (recommended — see §7) or point the llms.txt entries at the homepage `#pricing` anchor and `/services` instead.

---

## 4. Citability Analysis (passage-level)

### Homepage (`extracted_text`, trafilatura-cleaned, ~8,400 characters)
The homepage front-loads a strong, self-contained answer: *"ARLO plugs Claude into every account your agency runs. GA4, Search Console, Google Ads, Meta, YouTube, Shopify — one connector, every client, live numbers in seconds."* This is a 27-word, no-context-needed answer sitting in the first line of the page — excellent for AI-answer extraction of "what is Arlo" style queries.

The page also carries a full **15-question FAQ** rendered server-side (visible in raw HTML, not hidden behind client-side JS), covering exactly the buyer questions an AI system would need to answer a shortlisting query: what platforms are supported, does it store data, can teams share a workspace, is there a free trial, how does it differ from Windsor/Supermetrics, etc. This is the single richest citability asset on the site.

**Gap:** Most FAQ answers run **25–70 words** — well short of the 134–167-word window associated with highest AI-citation rates. They read as ad-copy-length answers, not "extract me whole" passages. A few (the Windsor/Supermetrics differentiation answer, the OAuth/security answer) are close to ideal length already. Recommend expanding the 6–8 highest-intent answers (data storage/security, Windsor/Supermetrics comparison, "is it for solo businesses," "how is this different from a dashboard tool") to the 134–167-word range by adding one concrete example or number per answer, while keeping the first sentence as a punchy 15–20-word direct answer (so it still works as a short snippet *and* a full passage).

### `/compare/windsor-ai-vs-arlo` (best page on the site for AI citation)
This page is meaningfully better-optimized than the rest of the site and should be the template for future comparison content:
- Opens with an explicit **TL;DR** block (~70 words, self-contained, names both products, states the mechanism difference and the dollar saving) — exactly the shape AI answer engines prefer to lift for "X vs Y" queries.
- Follows with a **markdown-style feature comparison table** (Entry price, Data warehouse required, Claude/AI access, Setup time, Data freshness, Per-client overhead, Team pricing) — tables are disproportionately favored by AI Overviews and Perplexity for comparison queries because they're trivially extractable as structured facts.
- Closes with explicit **"Choose Arlo when / Stay with Windsor.ai when"** bullet framing — this directly answers the implicit buyer question ("which one is right for me") rather than only listing features, and gives an LLM ready-made criteria to reason with rather than just recite.
- Carries **`FAQPage` + `WebPage` + `BreadcrumbList` JSON-LD** (the only page on the site with any schema at all).

**Gap — the biggest missed opportunity on the whole site:** the brief specifically names **Supermetrics** as a named competitor, and `/compare/supermetrics-vs-arlo` returns **404**. There is also no `/compare` index page (also 404) linking out to whichever comparisons exist. Given how well-built the Windsor page is, cloning its structure for Supermetrics (and ideally Improvado, since it's already name-dropped in body copy on both the homepage and the Windsor page) is the single fastest, highest-confidence content win available — it directly targets one of the four example queries in scope ("Supermetrics alternative for AI").

### Services/persona pages (`/services/seo-specialist` etc.)
Good use of heading hierarchy (1 H1, 5 H2s, 13 H3s on the SEO-specialist page) and the content is genuinely persona-specific rather than templated boilerplate reused across pages. However:
- **None of the H2/H3 headings are phrased as questions.** Headings read as statements ("The tab-hopping tax," "One prompt, every property") rather than the question form ("How does ARLO help SEO specialists monitor rankings across clients?") that both traditional featured-snippet extraction and AI-answer-engine passage retrieval favor. This is true site-wide, including the homepage — even the FAQ section header is literally "Common questions," not a specific question.
- Each persona page has its **own `<title>` and meta description** correctly tailored to its audience — good — but see §6 for a canonical-tag bug that likely nullifies this work for crawlers.

---

## 5. Structural Readability

- Heading hierarchy is clean and singular (one H1 per page, no skipped levels observed).
- Tables are used well on the comparison page; underused elsewhere (pricing on the homepage is presented as cards, not a table — a table would be more directly liftable by an AI answer engine building a price-comparison response, and would also let the llms.txt pricing block be auto-generated from the same markup).
- Bullet-listed "Choose X when / Stay with Y when" framing on the compare page is a strong pattern not yet reused on persona pages, where it would work well ("Choose Arlo if you manage 10+ clients and live in Claude already; choose a spreadsheet/Looker Studio setup if you only need one static monthly report").
- No breadcrumbs visible in rendered UI outside the one page carrying `BreadcrumbList` schema; breadcrumbs (visual, not just schema) would reinforce topical hierarchy for both users and crawlers on `/services/*` and `/compare/*`.

**Score driver:** headings/structure are solid; the deduction is almost entirely the lack of question-phrased headings and the pricing table being image/card-based rather than markup-extractable.

---

## 6. Technical Accessibility for AI Crawlers

### The good
- **Server-rendered, not a JS-dependent SPA.** `render_page.py`'s SPA heuristic returned `is_spa: False` for every URL tested, and raw (pre-JS) HTML for the homepage was 146 KB with the full FAQ, testimonials, and pricing content present in the initial server response — no client-side-only content that AI crawlers (which mostly don't execute JS, or execute it inconsistently) would miss. This is a real strength; a large share of GEO advice exists specifically to fix the failure mode Arlo doesn't have.
- Sitemap present at `/sitemap.xml`, well-formed, with `lastmod`/`changefreq`/`priority` on 25 URLs.
- Response headers are clean (HSTS present, Vercel edge, no odd blocking headers).

### The bad — site-wide canonical + Open Graph bug
Every inner page tested — `/services/seo-specialist`, `/about`, `/blog`, `/work/choquer-agency`, `/contact` — ships:
```html
<link rel="canonical" href="https://askarlo.app"/>
<meta property="og:title" content="ARLO | Ask Claude about any client, any platform"/>
<meta property="og:description" content="One MCP connector for every client and every platform...">
```
i.e., **the canonical tag on every one of those pages points at the homepage, not at itself**, and the Open Graph title/description are the homepage's, not the page's own (correctly written, persona-specific) `<title>`/meta description. Only the homepage itself and `/compare/windsor-ai-vs-arlo` have correct self-referencing canonicals and unique OG tags.

**Why this matters for GEO specifically, not just classic SEO:** a canonical tag is one of the strongest signals a crawler uses to decide "is this a distinct, citable document, or a duplicate I should fold into another URL's authority." Telling Google/Bing/AI crawlers that `/services/seo-specialist`, `/about`, `/work/choquer-agency`, `/contact`, and the entire `/blog` are all canonically "the homepage" means those pages' unique, well-written content (the SEO-specialist persona copy, the founder bio, the Choquer Agency origin-story case study) is at meaningful risk of **never being indexed or cited as its own entity** — every AI answer that would ideally cite `/services/seo-specialist` for a "Claude MCP for SEO reporting" query instead has a technical signal telling it to treat that content as the homepage. This is very likely the single highest-leverage fix available on the entire site. It is almost certainly a bug in a shared layout/metadata component (probably a hardcoded fallback in a Next.js `generateMetadata` or root layout) rather than an intentional choice, since the per-page `<title>` and meta description ARE correctly unique — only canonical/OG were left on the default.

### 404s found
| URL | Status | Note |
|---|---|---|
| `/pricing` | 404 | Linked from `llms.txt`; not linked in nav |
| `/docs` | 404 | Linked from `llms.txt`; not linked in nav |
| `/compare` | 404 | No comparison index page exists |
| `/compare/supermetrics-vs-arlo` | 404 | Named competitor with no comparison page |
| `/rsl.xml`, `/.well-known/rsl.xml` | 404 | No RSL 1.0 licensing signal present |
| `/humans.txt` | 404 | Minor; optional |

### Structured data (schema.org)
**Zero `application/ld+json` blocks found on the homepage, `/about`, `/services`, `/services/seo-specialist`, `/blog`, `/work`, or `/work/choquer-agency`.** The *only* schema on the entire site is on `/compare/windsor-ai-vs-arlo`, which carries `WebPage` + `FAQPage` + `BreadcrumbList`. Critically, that page's `WebPage.publisher` references `{"@id": "https://askarlo.app/#business"}` — **but no page on the site actually defines an entity with that `@id`.** This is a dangling reference: the one piece of Organization-level entity data the site attempts to expose resolves to nothing, meaning structured-data parsers (and, by extension, knowledge-graph-building AI crawlers) get an empty pointer instead of a name, logo, sameAs (social profiles), or founder link for Arlo.

**Missing schema types that would materially help AI citation, in priority order:**
1. `Organization` (with `sameAs` linking LinkedIn, and once they exist, Wikipedia/Crunchbase/G2) defined once, site-wide, at the `#business` `@id` already being referenced.
2. `SoftwareApplication` or `Product` with `Offer`/`AggregateOffer` for the 6 pricing tiers — this is exactly the kind of fact AI answer engines quote directly when asked "how much does Arlo cost," and having it as machine-readable `Offer` data removes the risk of a repeat of the `llms.txt` pricing-drift problem.
3. `FAQPage` on the **homepage** (15 ready-made Q&As already exist in the DOM, unmarked) and on each `/services/*` persona page.
4. `Person` schema for founder Bryce Choquer (ties the ARLO/Choquer Agency/FuturLabs entities together explicitly — see §7).
5. `BreadcrumbList` site-wide (currently only on one page).

---

## 7. Authority & Brand Signals

### Entity/brand identity collision — flagged because it directly contradicts the site's own stated identity rules
Your own project memory states: *"Arlo is a standalone product at askarlo.app; do not mix it with Choquer Creative or choquer.agency."* The live site currently violates this on its own `/about` page:
- The page's **meta description** reads: *"FuturLabs is a custom AI software development agency founded by Bryce Choquer... 40+ projects delivered, 25+ SaaS tools replaced, $180K average annual client savings."* — a completely different company name (FuturLabs), different value prop (bespoke dev agency, not a per-seat SaaS connector), and different stats than the ones ARLO itself uses elsewhere (Arlo's homepage says "40+ companies," "30+ clients served via MCP," "5+/wk reporting hours saved" — not $180K/yr savings or 25 SaaS tools replaced).
- The page **body content**, by contrast, talks entirely about ARLO in the first person ("We started ARLO because...").
- The homepage's own case-study section attributes ARLO's origin to **Choquer Agency** ("a boutique SEO and web development shop") — a third name.
- `og:title`/`og:description` on `/about` are (per the canonical bug in §6) the homepage's ARLO tags anyway, so three different brand names — ARLO, FuturLabs, Choquer Agency — are present across the visible meta/body/OG surface of a single page.

**Why this is a GEO problem, not just a copy-editing one:** LLMs build (and increasingly cite from) an entity graph — "who is behind this product, what else have they built, is this a credible, coherent company." A buyer asking Perplexity or ChatGPT "who makes Arlo, are they legit" that lands on `/about` gets three names and two different sets of business metrics for what is supposedly one founder. This measurably weakens the authority signal a single, consistent brand would carry, and risks an AI system either (a) conflating Arlo with an unrelated dev-agency page it also knows about, or (b) treating the page as low-trust boilerplate and declining to cite founder/company facts from it at all. **Recommend collapsing `/about` to a single, ARLO-only narrative** — the Choquer Agency origin story is a genuine asset (a believable "we built this for ourselves first" narrative that AI systems tend to favor over generic marketing claims) and should stay, but the FuturLabs meta description and stats appear to be boilerplate carried over from a different site template and should be removed or clearly reframed as "the studio ARLO was incubated inside," not swapped in as the page's primary identity.

### What's working
- **Named, attributed testimonials** with full name + title + company (Marcus Hale, Northpoint Digital; Priya Sundaram, Relay Performance; Jordan Flores, Staircase Studio) rather than anonymous quotes — this is a real authority signal and is exactly the kind of specific, checkable social proof AI systems weight more heavily than generic praise.
- **A genuine case study page** (`/work/choquer-agency`) with a founder-attributed origin story and concrete numbers (30+ clients via MCP, <2s p95 latency, 5+/wk hours saved) — good raw material, undermined only by the canonical bug making it invisible as its own URL.
- Founder is named consistently as **Bryce Choquer** across homepage, llms.txt, and about page — good, once the FuturLabs/Choquer Agency naming above is resolved.
- Specific, falsifiable technical claims (AES-256-GCM encryption at rest, per-user MCP tokens with audit logging, <5-minute setup, <2s p95 latency) — this kind of specificity is exactly what the citability research favors over vague marketing language, and it's a genuine strength of the current copy.

### External footprint (not independently verifiable in this session)
- `llms.txt` lists a LinkedIn company page (`linkedin.com/company/askarlo`); an automated check returned a 404, which is common for LinkedIn under bot/scraper access and **should not be read as proof the page doesn't exist** — verify manually.
- No evidence found (nor expected yet, given recency of launch) of a Wikipedia entity, Reddit presence/discussion, YouTube channel, or G2/Capterra listing — all four are the exact signals the brief's correlation table calls out as strongest predictors of AI-answer citation (YouTube ~0.737, Reddit high, Wikipedia high; Domain Rating only ~0.266). **This is the biggest structural gap in the Authority dimension and cannot be fixed on-site** — it requires an off-site program (see recommendations).

---

## 8. Multi-Modal Content

- No blog content exists yet — `/blog` renders "New articles coming soon. Check back shortly." This means **zero long-form, question-targeting content** exists anywhere on the domain for queries like "how to connect GA4 to Claude" or "how do agencies use MCP for reporting" — exactly the informational, top-of-funnel queries where AI Overviews/Perplexity/ChatGPT answer engines look for a citable explainer rather than a product page.
- No video (product demo, walkthrough) detected in extracted content on the homepage or persona pages, and (per the correlation table in scope) YouTube presence is the single strongest external signal correlated with AI citation — currently absent.
- No downloadable/structured assets found (no PDF one-pager, no public API/schema reference beyond `/docs`, which 404s).
- Screenshots/product UI imagery were not evaluated for alt-text quality in this pass (would require a full DOM crawl); recommend a follow-up accessibility/alt-text check once the canonical and blog gaps are closed, since it's a lower-leverage item relative to the fixes above.

---

## 9. Estimated Platform-Specific Readiness

These are **directional estimates** based on how each platform is known to source answers, weighted against the findings above — not measured citation rates. Connect DataForSEO's `ai_optimization_chat_gpt_scraper` and `ai_opt_llm_ment_search` (unavailable in this session) to replace these with live numbers.

| Platform | Est. Readiness | Reasoning |
|---|---|---|
| **Google AI Overviews** | ~30–35/100 | Heavily reliant on organic ranking + `schema.org` + Search Console signals — the missing Organization/FAQPage/Offer schema and the canonical bug (which risks de-indexing inner pages entirely) hit this platform hardest. |
| **ChatGPT (browse + training corpus)** | ~40/100 | `llms.txt` presence + open GPTBot/OAI-SearchBot access help, but the stale pricing fact in `llms.txt` is a specific risk here — ChatGPT is the platform most likely to quote a structured fact file verbatim. |
| **Perplexity** | ~50–55/100 | Best fit of the four today: PerplexityBot fully allowed, and the `/compare/windsor-ai-vs-arlo` page's TL;DR + table + FAQ structure is close to Perplexity's preferred citation shape. Would score meaningfully higher once a Supermetrics comparison exists and homepage FAQ carries schema. |
| **Bing Copilot / Microsoft Copilot** | ~30/100 | Similar dependency profile to Google (Bing index + schema); same structural gaps apply, and Bing Webmaster Tools / IndexNow submission status was not verifiable in this session — recommend confirming separately. |

**Read-across:** the product's positioning as "AI-native" is not yet matched by its AI-answer-engine readiness. Perplexity is closest to launch-ready; Google AIO and Bing Copilot are furthest behind, driven almost entirely by the schema and canonical gaps rather than content quality (the content itself is above average for a pre-launch SaaS site).

---

## 10. Prioritized Recommendations

### Critical (fix this week — technical bugs actively suppressing citation)
1. **Fix the site-wide canonical/OG-tag bug.** Every inner page must self-canonicalize and carry its own OG title/description. Likely a one-line fix in a shared `generateMetadata`/root-layout default. Highest-leverage item on this entire audit.
2. **Correct the pricing in `llms.txt`** to match the live site (Free / Solo $19 / Studio $99 / Agency $249 / Scale $499 / Enterprise), and generate it from the same source of truth used to render the homepage pricing section so it cannot drift again.
3. **Fix or remove the two dead links in `llms.txt`** (`/pricing`, `/docs`) — either ship the pages or repoint the references.
4. **Resolve the ARLO / FuturLabs / Choquer Agency identity collision on `/about`.** Rewrite so the page is unambiguously about ARLO, with Choquer Agency framed as the origin story (an asset) and the FuturLabs meta description/stats removed or clearly re-scoped.

### High (next 2–4 weeks — structured data + comparison content)
5. **Add `Organization` schema** (name, logo, `sameAs` list, founder) once, site-wide, resolving the currently-dangling `https://askarlo.app/#business` `@id` already referenced on the compare page.
6. **Add `FAQPage` schema to the homepage** (15 Q&As already exist in the DOM — this is pure markup work, no new content needed) and to each `/services/*` persona page.
7. **Build `/compare/supermetrics-vs-arlo`**, cloning the Windsor page's proven structure (TL;DR → feature table → "choose X when/stay with Y when" → FAQ + schema). This directly targets one of the four priority queries in scope and is the fastest content win available.
8. **Build a `/compare` index page** linking all comparison pages (fixes the current 404 and gives crawlers a discoverable hub).
9. **Add `SoftwareApplication`/`Product` + `Offer` schema for the 6 pricing tiers**, sourced from the same pricing data as the fix in #2.

### Medium (4–8 weeks — content depth + off-site signals)
10. **Rewrite H2/H3 headings in question form** where they map to real buyer questions (e.g., "How does ARLO connect GA4 to Claude?" instead of "One prompt, every property"), site-wide.
11. **Expand the 6–8 highest-intent FAQ answers** (data storage/security, Windsor/Supermetrics differentiation, solo vs. agency fit) to the 134–167-word range, keeping a punchy first sentence for snippet extraction.
12. **Launch the blog** with 3–5 pieces directly targeting the in-scope query set (see §11) — "Claude MCP for agency reporting: what it is and how it works," "How to connect GA4 to Claude Desktop," "Windsor.ai vs. Supermetrics vs. Arlo," etc. Currently zero informational content exists on the domain.
13. **Start an off-site authority program**: a YouTube walkthrough/demo (highest single correlation with AI citation per the brief's own data), a founder AMA or comparison thread seeded organically on relevant Reddit communities (r/agency, r/PPC, r/SEO), and a Product Hunt / G2 / Crunchbase listing to seed third-party entity data. Verify the LinkedIn company page manually (automated check was inconclusive due to LinkedIn's bot-blocking).
14. **Add visual breadcrumbs** (not just schema) to `/services/*` and `/compare/*` to reinforce topical hierarchy.

### Low (opportunistic)
15. Publish an `/.well-known/rsl.xml` (RSL 1.0) if the team wants to explicitly license content terms for AI training/crawling beyond what robots.txt conveys.
16. Convert the homepage pricing cards to a semantic `<table>` in addition to the visual cards, so it's directly extractable as structured data even before the `Offer` schema (#9) ships.
17. Follow-up alt-text/image-accessibility pass once the above are shipped.

---

## 11. ~15 Buyer-Shortlisting Prompts to Track

Track these across ChatGPT, Claude, Perplexity, and Google AI Overviews on a recurring cadence (weekly during the fix rollout, then monthly). Grouped by buyer intent:

**Category-defining (top of funnel):**
1. "Claude MCP for agency reporting"
2. "AI marketing analytics connector"
3. "MCP server for digital marketing agencies"
4. "how do agencies use Claude for client reporting"

**How-to / integration-specific (mid funnel):**
5. "connect GA4 to Claude"
6. "connect Google Ads to Claude Desktop"
7. "how to query Search Console data with Claude"
8. "MCP connector for GA4, Search Console, and Google Ads"
9. "Claude Desktop connector for Meta Ads and Shopify"

**Competitor-displacement (bottom of funnel):**
10. "Supermetrics alternative for AI"
11. "Windsor.ai alternative"
12. "AI alternative to Supermetrics and Windsor.ai"
13. "cheapest Supermetrics alternative for small agency"
14. "reporting tool without a data warehouse"

**Decision/validation (closest to purchase):**
15. "is Arlo MCP legit / reviews"
16. "Arlo vs Windsor.ai pricing"
17. "best AI tool to replace agency client dashboards"

---

## Appendix — Files Referenced

- Renderer used: `/Users/brycechoquer/.claude/skills/seo/scripts/render_page.py` (Playwright + trafilatura + htmldate; SSRF guard via `url_safety.py`)
- Live URLs fetched: `https://askarlo.app/`, `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/services`, `/services/seo-specialist`, `/services/google-ads-specialist`, `/services/account-manager`, `/services/agency-owner`, `/services/solo-business-owner`, `/compare/windsor-ai-vs-arlo`, `/compare` (404), `/compare/supermetrics-vs-arlo` (404), `/about`, `/blog`, `/work`, `/work/choquer-agency`, `/contact`, `/pricing` (404), `/docs` (404), `/rsl.xml` (404), `/.well-known/rsl.xml` (404), `/humans.txt` (404)
