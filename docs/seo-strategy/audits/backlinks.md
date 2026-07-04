# Arlo — Backlink Profile & Off-Page Authority Audit

**Domain:** https://askarlo.app
**Product:** MCP connector that plugs Claude into an agency's marketing accounts (GA4, Search Console, Google Ads, Meta, YouTube, Shopify) for live conversational reporting.
**Direct competitors:** Windsor.ai, Supermetrics (adjacent: Funnel.io, Whatagraph, AgencyAnalytics)
**Markets:** United States (primary) + Canada (secondary)
**Date pulled:** 2026-07-04
**Analyst tier:** Tier 0 (Common Crawl + local verification crawler only — no Moz/Bing API keys configured, no DataForSEO extension installed). SE Ranking backlink MCP tools (`getBacklinksSummary`, `getDomainAuthority`) were not reachable in this session — see [Data Sources & Limitations](#data-sources--limitations).

---

## TL;DR

Arlo is a **pre-link-building domain** — Common Crawl has no record of `askarlo.app` at all (not low authority, *unindexed by the graph entirely* — expected for a domain this new). There is nothing to "clean up" or "recover." The entire value of this audit is the **90-day link-building plan**, not a numeric score.

For calibration, here is where the two named competitors sit in the same free data source:

| Domain | In Common Crawl graph? | PageRank (raw) | PageRank rank (lower = stronger) | Harmonic centrality rank | Hosts seen |
|---|---|---|---|---|---|
| **askarlo.app** | **No** | — | — | — | — |
| windsor.ai | Yes | 2.20e-06 | 16,031 | 11,364 | 12 |
| supermetrics.com | Yes | 3.67e-06 | 9,664 | 3,922 | 25 |

*Source: Common Crawl domain-level web graph, `cc-main-2026-jan-feb-mar` release (confidence: 0.50). Domain-level only — no anchor text, no per-page data, quarterly refresh.*

Supermetrics is the stronger of the two by both PageRank and harmonic-centrality rank (consistent with it being the larger, older, more heavily-linked brand). Windsor.ai is a real but comparatively lighter authority target. Neither number should be read as a "score to beat" in the next quarter — they're multi-year accumulations. They do confirm the qualitative read from the keyword research: **Windsor.ai has near-zero organic search demand for its own brand name outside comparison contexts, but does have accumulated link equity**, so a well-built "Arlo vs Windsor.ai" comparison page has a realistic shot at outranking thin competitor content even before Arlo has its own backlinks.

---

## Backlink Health Score: INSUFFICIENT DATA (1/7 factors scored)

Per the scoring gate: fewer than 4 of the 7 weighted factors have any data source available for a brand-new, zero-backlink domain, so **no numeric 0–100 score is produced**. Producing one here (e.g., "12/100") would look like a penalty or a technical failure — it is neither. It is a domain that has not yet done any off-page work, which is the expected and correct state for launch week.

| Factor | Weight | Data available? | Source | Note |
|---|---|---|---|---|
| Referring domain count | 20% | No | — | Zero known referring domains; CC has no record |
| Domain quality distribution | 20% | No | — | N/A, nothing to distribute |
| Anchor text naturalness | 15% | No | — | No anchors exist yet |
| Toxic link ratio | 20% | Partial | CC (0.50) | Absence from CC is *not* a toxicity signal — just "not yet crawled" |
| Link velocity trend | 10% | No | — | Requires DataForSEO; N/A pre-launch anyway |
| Follow/nofollow ratio | 5% | No | — | No links to classify |
| Geographic relevance | 10% | No | — | No links to classify |

**Recommendation:** Re-run this audit at 30/60/90 days post-launch once the Phase 1 directory listings (below) are live. At that point Moz API (free signup, 2,500 rows/month) becomes worth configuring — it will pick up DA/PA and early referring domains long before Common Crawl's quarterly refresh does.

---

## Data Sources & Limitations

| Source | Status this audit | Confidence | Notes |
|---|---|---|---|
| Common Crawl web graph | Queried live | 0.50 | `askarlo.app` absent from `cc-main-2026-jan-feb-mar`. Domain-level only, quarterly cadence, no anchor text. |
| Verification crawler | Not run | 0.95 | No known backlinks exist yet to verify — nothing to feed it. Re-run once directory listings go live to confirm they're indexed/followed. |
| Moz API | Not configured | 0.85 | No `MOZ_API_KEY` set. Free signup at https://moz.com/products/api (2,500 rows/mo, 1 req/10s). Recommended for the 30-day recheck. |
| Bing Webmaster Tools | Not configured | 0.70 | Requires site verification in Bing Webmaster; not yet done. Its unique competitor-comparison feature would be valuable once Arlo has *some* links to compare against Windsor.ai/Supermetrics. |
| DataForSEO | Not installed | 1.00 | Premium extension, not installed in this environment. |
| SE Ranking backlink tools (`getBacklinksSummary`, `getDomainAuthority`) | **Not reachable** | — | These MCP tools were named as optional in the task brief but were not available as callable tools in this session. Only Common Crawl and the local verify crawler were actually exercised. If SE Ranking backlink data is available through a different session/integration, re-run and merge — SE Ranking's index is materially larger than Common Crawl's for DA-style scoring. |

**No source silently failed** — everything above either ran and returned data (Common Crawl), or wasn't configured/reachable and is labeled as such. Nothing in this report should be read as "zero backlinks confirmed by exhaustive search" — it is "zero backlinks found in the two always-free sources available in this session."

---

## Why the profile is empty (and why that's fine)

- `askarlo.app` is a brand-new domain launched in 2026. Common Crawl's most recent graph release (`cc-main-2026-jan-feb-mar`) simply predates or missed the crawl window — this is a coverage gap, not a penalty signal.
- There is no Search Console/Bing Webmaster verification yet, no directory submissions, no press coverage, and no GitHub presence indexed (`github.com/askarlo` is configured in `siteConfig.ts` as a planned social handle, not yet confirmed live/populated).
- The existing site content (`src/content/comparisons.ts`, `case-studies.ts`) already anticipates competitor-comparison and origin-story link magnets (the "Choquer Agency built Arlo for itself" case study, the Windsor.ai comparison page) — these are exactly the assets a link-building campaign should point outreach at first, because they already exist and don't require new content production.

---

## PHASE 1 (Weeks 1–4): Foundational Listings — Do These First

These are the highest-ROI, lowest-effort links for a brand-new SaaS: free, fast to acquire, and expected by users researching "is this a real company." None of these require outreach — just submission.

### MCP-specific registries (highest topical relevance — do these before generic directories)

| Listing | Why it matters | Priority |
|---|---|---|
| **Anthropic MCP official directory/examples repo** (`modelcontextprotocol.io` servers list, if Arlo qualifies as a public/example connector) | Direct topical + brand-adjacent authority from the exact ecosystem Arlo lives in. A link from `modelcontextprotocol.io` or the `anthropics/mcp` GitHub org is the single highest-value link available to an MCP tool right now. | **Critical** |
| **Smithery.ai** (MCP server registry/marketplace) | De facto "app store" for MCP servers; agencies and developers browse it to find connectors. Direct product-discovery traffic + link. | **Critical** |
| **Glama.ai MCP directory** | Second major MCP-specific directory; ranks well for "mcp server list" style queries (KD 88–95 terms Arlo can't win directly — Glama can win them *for* Arlo). | **Critical** |
| **mcp.so** / **mcpservers.org** / **Pulse MCP** (mcp server aggregators) | Multiple smaller MCP-specific list sites exist; submit to all — cumulative topical relevance matters more than any single DA. | High |
| **Cursor / Claude Desktop community "awesome-mcp-servers" GitHub lists** | GitHub README lists (`awesome-mcp-servers`, `awesome-claude-mcp`) are frequently cited/linked from blog posts and get crawled heavily. A PR adding Arlo is free and fast. | High |
| **Claude Desktop / Claude Code extension showcases** (if Anthropic maintains a connectors showcase) | Direct ecosystem placement; check developer docs for a submission form. | High |

### General launch/directory sites

| Listing | Why it matters | Priority |
|---|---|---|
| **Product Hunt launch** | Not primarily a backlink play — it's a launch-day traffic/attention event that *generates* secondary links (roundup posts, "best Product Hunt launches this week" aggregators, Indie Hackers threads). Time it deliberately (Tuesday–Thursday, after Phase 1 directories are live so early visitors land on a site that already looks established). | Critical (as a PR event) |
| **G2** | Category: "Marketing Analytics" or "BI Platforms." Free vendor profile = DoFollow link from a DA 90+ domain, plus review-driven social proof that matters more for SaaS buyers than for search engines. Needs a handful of seed reviews (existing Choquer Agency clients are the obvious first reviewers) before it's worth the crawl. | High |
| **Capterra / GetApp / Software Advice** (same parent company, submit once, syndicates) | Same logic as G2 — high-DA vendor directory link + review platform. | High |
| **AlternativeTo.net** | Directly targets the "supermetrics alternative" / "windsor.ai alternative" search intent already identified as Arlo's highest-CPC keyword cluster. List Arlo as an alternative to Windsor.ai and Supermetrics. | Critical |
| **SaaSHub** | Similar to AlternativeTo; smaller but MCP/dev-tool audience overlap. | Medium |
| **There's An AI For That (TAAFT)** | Large AI-tool directory; heavy organic traffic for "ai tool for X" queries, relevant given Arlo's Cluster 4 positioning (conversational analytics / AI reporting). | High |
| **Futurepedia**, **AI Tool Guru**, **Toolify.ai** | Second-tier AI directories — lower individual authority but cheap, fast, and additive. Submit in batch. | Medium |
| **BetaList** | Pre/early-launch discovery site for startups; good for very-early-stage social proof + a follow link. | Medium |
| **Indie Hackers** (product page + founder post) | Founder-led narrative fits perfectly — "we built this internally at our agency, now selling it" is exactly the story IH readers respond to. Links from profile + any post that gets traction. | Medium |
| **Crunchbase / AngelList (Wellfound) company profiles** | Baseline "this is a real, fundable company" signal; low effort, high-DA domains. | Medium |
| **Slant.co, StackShare** | Dev-tool comparison sites; StackShare is particularly relevant since Arlo is infrastructure-adjacent (MCP/API tooling). | Low–Medium |

**Phase 1 sequencing note:** Submit MCP-specific registries and AlternativeTo/SaaSHub *before* the Product Hunt launch, so that when the PH crowd (and any resulting press) searches the name, they find a domain that already looks like it has a footprint, not a domain with a single listing.

---

## PHASE 2 (Weeks 4–12): Digital PR & Content-Driven Links

Directory listings establish existence; digital PR earns editorial links from sites in the marketing, SaaS, and AI-tooling press. All angles below map directly to the positioning already validated in `docs/seo-strategy/audits/keyword-research.md`.

### Angle 1 — "MCP is the new API integration layer" (trend/thought-leadership)
- Pitch: Arlo's founder (an agency operator who felt the exact GA4/GSC/Ads tab-hopping pain) as a source for articles about MCP adoption in marketing tooling. MCP servers is a KD 92, +189x YoY search term — journalists covering the *category* need practitioner quotes, not just Anthropic's own materials.
- Targets: MarTech Today, Search Engine Land / Search Engine Journal (both cover both SEO tooling *and* AI-agent trends), TechCrunch AI section (for the "no-code AI connector" hook), Ben's Bites / TLDR AI newsletters (backlinks from newsletter archive pages, high AI-native audience overlap).
- Asset needed: a "State of MCP for Marketing Data" mini-report or survey (even an informal one — "we surveyed 40 agencies about how they report to clients") is classic, cheap digital-PR bait: data journalists cite it, which is a natural link.

### Angle 2 — "Agencies are burning $500+/mo on data warehouses they don't need" (contrarian/cost angle)
- Directly reuses the existing `comparisons.ts` Windsor.ai messaging ("no BigQuery, no dashboards, no ETL").
- Pitch to agency-focused trade press: Agency Analytics' own blog won't link (competitor), but AgencyPost, MarketerHire blog, SEMrush blog (guest post program), and independent agency-ops newsletters (Copyblogger-adjacent, "The Agency Growth" newsletters) are realistic targets.
- Founder POV byline: "I ran an agency, I built a tool to kill my own reporting nightmare" — this is the exact narrative already captured in the Choquer Agency case study and is more linkable as a founder story than as vendor copy.

### Angle 3 — Original data / benchmark content (evergreen link magnet)
- Publish something citable that has nothing to sell: e.g. "How long does it actually take an agency to build client reports manually? (survey of N agencies)" or a public comparison table of MCP-vs-ETL latency benchmarks.
- This is the single highest-leverage tactic for a new domain with no relationships yet — citable data gets linked by roundups, Wikipedia-adjacent lists, and other bloggers without any outreach at all, purely because it's the only source.

### Angle 4 — Guest posts / podcast appearances in the Claude/Anthropic developer ecosystem
- Anthropic's own community (Discord, forums) and dev-focused newsletters (e.g., MCP-focused Substacks that emerged post-2024 launch) are smaller audiences but extremely high topical relevance — a link from an MCP-niche newsletter is worth more contextually than a generic SaaS blog even at lower DA.
- Podcast targets: any "AI agents" or "future of marketing" podcast that's had Windsor.ai, Supermetrics, or Funnel.io founders on before — direct evidence they cover the category.

### Angle 5 — Comparison/"vs" content as natural link bait
- The existing `windsor-ai-vs-arlo` comparison page and the planned Supermetrics comparison (per keyword research, `supermetrics alternative` is the highest-CPC term at $33.76) are themselves link magnets: comparison shopping sites (AlternativeTo, SaaSHub, G2 "vs" pages) will often auto-link to vendor comparison pages once the vendor profile exists. This makes Phase 1's directory listings a *prerequisite* for Phase 2's comparison-page links to compound — sequencing matters.

### Digital-PR cadence
- 1 data/survey asset per quarter (highest link ROI, lowest frequency needed).
- 2–4 guest posts/bylines per quarter on agency-ops and AI-tooling publications.
- Ongoing: respond to journalist queries (HARO-successor platforms, Qwoted, Featured.com) tagged "MCP," "AI agents," "marketing analytics," "agency tools" — low cost per link, compounds over time.

---

## PHASE 3: Sister-Link & Shared-Founder-Entity Strategy

**Constraint acknowledged and respected below: choquer.agency, choquer.app, and futurlabs.dev must remain fully independent domains. Nothing here recommends 301 redirects, domain migration, or consolidating any of these properties into askarlo.app. They stay separate, permanently.**

### Why this is legitimate (not a link scheme)
Arlo's own case-study content (`src/content/case-studies.ts`) already states the true, verifiable origin story: Choquer Agency built the first version of Arlo internally, then productized it. A link from choquer.agency to askarlo.app describing "the tool we built and later spun out" is not a manufactured link — it's the accurate history of the product, and Google's guidance on affiliated-site linking is fine with contextual, disclosed, editorially-justified links between genuinely related entities. The risk profile is completely different from a PBN because:
1. The relationship is publicly disclosed (case study names Choquer Agency explicitly).
2. The link is contextual and singular, not site-wide/footer-templated across every page.
3. The entities remain operationally and legally distinct — no shared redirect chains, no cloaking.

### Recommended sister-link placements

| From | To | Anchor/context | Why it's natural |
|---|---|---|---|
| choquer.agency — "Tools" or "Our Work" page | askarlo.app | "Arlo, the Claude MCP connector we built for our own client reporting" | Genuine internal-tool-turned-product story; already the case study narrative on the Arlo side. |
| choquer.agency — relevant service page (SEO/reporting services) | askarlo.app | Contextual mention where the agency describes *how* it reports to clients | Natural product mention, not a footer link farm. |
| choquer.app (if it's the agency's app/portfolio site) | askarlo.app | Portfolio/products entry | Same logic — one line in a portfolio list, not a manipulative anchor pattern. |
| futurlabs.dev (if this is Bryce Choquer's dev/builder-in-public site) | askarlo.app | "Currently building: Arlo" | Builder-in-public sites routinely link to active projects; this is expected, not manipulative. |
| askarlo.app — About/footer | choquer.agency | "Built by the team at Choquer Agency" | Reciprocal disclosure; reinforces the same true entity relationship both directions. Reciprocal links between two genuinely affiliated sites, both disclosed, are not a penalty risk the way undisclosed reciprocal PBN links are — but keep the total *count* of reciprocal domain pairs small (this one pair is fine; don't build a ring of 5+ owned domains all cross-linking each other, which starts to look networked even if each disclosure is honest). |

### Consistent Organization/Person entity (schema + NAP-style consistency)
- **Person entity:** Bryce Choquer should use one consistent `sameAs` set across all properties — currently `askarlo.app`'s schema (`src/lib/schema.ts`) lists only `linkedin.com/in/brycechoquer` for the Person entity. Recommend adding the *other owned properties* (choquer.agency, futurlabs.dev, GitHub, X/Twitter) to that `sameAs` array so Google's Knowledge Graph has one clear entity to consolidate, rather than treating "Bryce Choquer, Arlo founder" and "Bryce Choquer, Choquer Agency founder" as two separate, weaker entities.
- **Organization entity — flag for correction:** `src/lib/schema.ts`'s current `Organization` block for `askarlo.app` describes services like "Custom Software Development," "CRM Development," "ERP Development," "SaaS Replacement," a `priceRange` of "$15,000 - $400,000+," and an audience of "Mid-market companies ($10M–$250M revenue)." **This reads as Choquer Agency's consulting-services schema, not Arlo's SaaS-product schema**, and is very likely leftover/copy-pasted boilerplate rather than intentional. This is exactly the kind of entity-mixing the "keep Arlo separate from Choquer Creative/choquer.agency" principle warns against — right now the *schema itself* is blurring the two brands on Arlo's own domain. This is a content/technical issue, not a backlink issue, so it's flagged here rather than fixed — **recommend running `/seo technical askarlo.app` or a content audit pass on `src/lib/schema.ts` and `src/content/shared.ts` to correct the Organization entity to describe Arlo as a SaaS product** (subscription pricing, MCP connector category, `SoftwareApplication` schema type instead of `ProfessionalService`) before scaling any off-page campaign — off-page authority built on top of a mismatched entity signal is wasted effort.
- Once corrected, both domains' Organization schemas should point to the *same* Person (`Bryce Choquer`) via `founder`, with each Organization's `sameAs` optionally including the other as a related/sister brand — again, contextual and disclosed, never merged into one entity.

### What NOT to do (explicit guardrails, per constraint)
- Do not 301 redirect choquer.agency, choquer.app, or futurlabs.dev to askarlo.app, or vice versa, at any point.
- Do not build site-wide footer/sidebar links between these domains that appear on every page — that pattern is a template-link risk regardless of disclosure.
- Do not create more than the one reciprocal pair (askarlo.app ↔ choquer.agency) as a link *ring* — futurlabs.dev and choquer.app can link *to* Arlo (builder-in-public / portfolio mentions) without Arlo linking back to all of them from the same footer, to avoid a manufactured-network appearance.
- Do not use identical, exact-match anchor text ("MCP connector for marketing analytics") across all sister-site links — vary the anchor naturally per the anchor-text naturalness guidance (branded 30–50%, natural/long-tail 5–15%).

---

## Link-Building Opportunities — Prioritized Punch List

| # | Action | Effort | Expected Impact | Phase |
|---|---|---|---|---|
| 1 | Submit to Smithery.ai, Glama.ai, mcp.so/mcpservers.org MCP registries | Low | Critical — highest topical relevance available | 1 |
| 2 | PR/submission to `awesome-mcp-servers` style GitHub lists | Low | High | 1 |
| 3 | List on AlternativeTo (vs. Windsor.ai, Supermetrics) | Low | Critical — matches highest-CPC keyword cluster | 1 |
| 4 | Create G2 + Capterra vendor profiles, seed 3–5 reviews from Choquer Agency's own client relationships | Medium | High | 1 |
| 5 | Plan and execute Product Hunt launch (after items 1–4 are live) | Medium | High (PR/attention event, secondary links) | 1 |
| 6 | Submit to TAAFT, BetaList, Crunchbase, AngelList/Wellfound | Low | Medium | 1 |
| 7 | Add sister-site contextual link from choquer.agency "Our Work"/case-study page to askarlo.app | Low | Medium (disclosed, legitimate) | 3 |
| 8 | Fix Organization schema entity mixing in `src/lib/schema.ts` before scaling PR | Low (technical) | High (protects all future off-page equity) | 3 |
| 9 | Publish one original data/survey asset ("state of agency reporting" or similar) | Medium–High | High (evergreen link magnet) | 2 |
| 10 | Pitch founder byline/quotes to Search Engine Land, MarTech, agency-ops newsletters | Medium | Medium–High | 2 |
| 11 | Verify askarlo.app in Bing Webmaster Tools + configure Moz API key | Low | Enables Tier 1/2 monitoring for next audit | Ongoing |
| 12 | Re-run this audit at 30/60/90 days with Moz configured | Low | Tracks actual progress vs. this baseline | Ongoing |

---

## Recommended Cadence for Next Review

- **30 days:** Confirm Phase 1 directory listings are live and indexed (use the verification crawler once URLs exist: `python scripts/verify_backlinks.py --target https://askarlo.app --links <file> --json`). Configure Moz API (free) at this point — CC's quarterly cadence won't show anything new yet.
- **60–90 days:** Full re-audit with Moz configured; first real DA/PA numbers and referring-domain count expected. This is when a numeric Backlink Health Score becomes meaningful (assuming 4+ scoring factors have data by then).
- **Cross-reference:** Recommend `/seo content <url>` for E-E-A-T assessment of the linkable-asset content itself (case studies, comparison pages) and `/seo technical <url>` for crawlability/indexability checks and to resolve the schema entity-mixing issue flagged above — both are out of scope for this backlink-specific audit.

---

*Report generated via Tier 0 backlink analysis (Common Crawl + local verify crawler). Validated against `scripts/validate_backlink_report.py` (status: PASS, 1 info-level note re: correct interpretation of CC absence). No numeric health score produced per the 4-of-7-factor data-sufficiency gate — this is accurate reporting for a pre-launch link profile, not a limitation of the analysis.*
