---
name: weekly-execution-prompt
description: Reusable prompt template to paste every Monday for executing that week's blog content across all 26 domains
type: reference
---

## Weekly Execution Prompt Template

Paste this every Monday, replacing [X], [Topic], and [Monday date]:

```
Execute Week [X] — [Topic]

Skills: content-strategy, ai-seo, schema-markup, programmatic-seo

Rules:
- One post per live domain (26 posts)
- Write 7 cluster anchor posts FIRST (one per cluster), then regional variants
- Each post: 2,500–3,500 words, H2/H3, FAQ section (4-5 Qs)
- Answer-first opening: 40–60 word extractable block in first paragraph
- Article + FAQPage schema on every post
- Internal links: homepage + 1 related post + 1 service page (where relevant)
- Uniqueness rules:
  - 1 locally sourced statistic with citation unique to that region
  - 1 real local business/organization/economic reference
  - Different structural entry point per cluster (same topic, different angle)
  - No more than 20% shared phrasing across any two posts
- Statistics with sources (+37% LLM citation boost)
- Expert attribution where applicable (+25-30% citation boost)
- Publish date: [Monday of that week]
- Author: Bryce Choquer (Founder & Lead Developer)
- ai-seo: Open answer blocks must be 40–60 words, self-contained,
  citable without surrounding context
- programmatic-seo: Verify no two posts share a structural entry
  point — same topic, genuinely different angle per cluster
- Files: src/content/blog/posts/[region]/[slug].md
```

**Why:** Standardizes execution so every week's content follows AEO rules, duplicate content prevention, and schema requirements without re-explaining the system.

**How to apply:** Copy-paste into Claude Code at the start of each week's content session. Reference `memory/content-strategy-weeks-3-12.md` for that week's specific topic, keyword, buyer stage, cluster angles, and internal linking targets.
