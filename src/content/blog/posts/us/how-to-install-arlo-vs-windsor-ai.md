---
slug: "how-to-install-arlo-vs-windsor-ai"
title: "How to Install ARLO (and How It Compares to Windsor.ai)"
excerpt: "Install ARLO in about five minutes — and see how this live-query Windsor.ai alternative differs from data-pipeline tools like Windsor.ai and Supermetrics."
author: bryce
date: "2026-07-04"
modifiedDate: "2026-07-04"
region: "us"
category: "Product"
tags: ["windsor.ai alternative", "supermetrics alternative", "marketing data connector", "how to install arlo"]
featuredImage: "/arlo/bg/pyramids.webp"
---

If you run an agency, you already know the tax you pay to answer a simple question. A client asks "how did paid search do last month versus organic?" and somewhere behind that question is a pipeline moving data into a warehouse, a Looker Studio report someone has to keep alive, and an afternoon you're not getting back. ARLO takes a different route. It's a live-query **Windsor.ai alternative** that connects Claude Desktop straight to every client's marketing data and answers in plain English — nothing stored, no dashboard to maintain. This guide walks you through installing it in about five minutes, then lays out honestly how it differs from data-pipeline tools like Windsor.ai and Supermetrics.

Let's install it first, then talk about where each model fits.

## What ARLO actually is

ARLO is the MCP layer for agencies. It uses the [Model Context Protocol](https://modelcontextprotocol.io) — the open standard for connecting AI assistants to live systems — to wire Claude Desktop into every client's marketing accounts: GA4, Google Search Console, Google Ads, Meta, YouTube, Google Business Profile, Shopify, and Stripe.

The important part: ARLO is a pure pass-through connector. It stores nothing. There's no ARLO database sitting between you and your clients, and no warehouse quietly accumulating a copy of their data. When you ask a question, Claude queries each connected account live and answers on the spot. When you're done, there's nothing to clean up and nothing to keep in sync.

That "stores nothing" design is the whole point, and it's the cleanest line between ARLO and a traditional **marketing data connector**. Pipeline tools exist to move and hold data. ARLO exists to answer questions against data that stays exactly where it already lives.

## How to install ARLO in about 5 minutes

You don't need a warehouse, a data engineer, or a credit card. Here's the whole thing.

1. **Sign up at [askarlo.app](https://askarlo.app) with your agency email.** No credit card required. ARLO is free right now in early access.
2. **Connect Google with one OAuth grant.** A single authorization covers GA4, Search Console, Google Ads, YouTube, and Google Business Profile — across every client. You're not re-authenticating account by account.
3. **Add and assign your clients.** Map each property or ad account to a client name so ARLO knows that "Acme" means Acme's GA4 property, Acme's Ads account, and so on.
4. **Copy your personal MCP URL.** Every team member gets their own MCP URL and token, so access is per-person rather than a shared login you have to rotate.
5. **Paste the MCP URL into Claude Desktop.** Open Settings → Connectors, add a connector, and drop in your URL.
6. **Ask your first question in plain English.** Something like "Which of my clients lost organic traffic last month?" Your first working query typically lands in about five minutes from signup.

That's the full setup. There's no report to build afterward, because asking the question *is* the report.

## Windsor.ai alternative: two different models, not two versions of the same thing

Here's where fairness matters. [Windsor.ai](https://windsor.ai) is a genuinely good product at what it does — and what it does is different from ARLO.

Windsor.ai is a marketing-data pipeline, or ETL tool. It pulls data from hundreds of sources and moves it *into* a destination you choose — Looker Studio, Google Sheets, BigQuery, Snowflake, Excel — where you then build and maintain reports on top of it. [Supermetrics](https://supermetrics.com) sits in the same category. Both are priced by the connectors or data sources you turn on, and both are built around the idea that your data should land somewhere central so you can report on it.

ARLO inverts that. Instead of piping data into a warehouse and building a dashboard, Claude queries each connected account live through MCP and answers your question on demand. Nothing is stored, there's no report to maintain, and there's no per-connector meter running. You ask; it answers.

Neither model is universally "better." They're solving different jobs:

| | ARLO | Windsor.ai |
|---|---|---|
| **What you get** | Live answers inside Claude, in plain English | Your data delivered into a destination you report on |
| **Data warehouse** | None — pure pass-through, stores nothing | Common; often the whole point (BigQuery, Snowflake, Sheets) |
| **How you consume it** | Ask a question | Build and maintain a dashboard or spreadsheet |
| **Freshness** | Live at the moment you ask | Scheduled refresh (hourly/daily syncs) |
| **Setup** | ~5 minutes, one OAuth grant, no engineer | Connect sources, configure destination, model the data |
| **Pricing model** | Free in early access, then simple | Per-connector / per-source tiers |
| **Best for** | Fast answers across many clients without maintaining reports | Warehoused data feeding scheduled, always-on dashboards |

If you specifically need warehoused data — a historical store you can join against other tables, or a set of scheduled dashboards that refresh on their own for stakeholders who live in Looker Studio — a pipeline tool like Windsor.ai is the right call, and ARLO isn't trying to replace that. What ARLO removes is the overhead for the far more common case: you just need the answer, now, and you don't want to build or babysit a report to get it.

## Is ARLO a Supermetrics alternative too?

Yes — for the same reason it's a **Windsor.ai alternative**. Supermetrics is another excellent pipeline product, widely used to feed Looker Studio and spreadsheets. If you're evaluating a **supermetrics alternative** because your Looker Studio reports have quietly turned into a maintenance job — refreshes to babysit, connectors to renew, a growing library of dashboards nobody fully reads — ARLO is worth a look precisely because it removes the artifact you're maintaining.

Think of it as a **looker studio alternative** for the questions that don't actually need a dashboard. Plenty of agency reporting is really just recurring questions: how are we pacing, what changed, which client needs attention this week. Those don't need a permanent report. They need a fast, trustworthy answer against live data — which is exactly what ARLO is built to give you. If you want to sharpen how you use AI against that data, our guide on [how to use AI for SEO](/blog/how-to-use-ai-for-seo) pairs well with this workflow.

## But what if you *do* want data pushed out?

Sometimes you genuinely want data to leave Claude and land somewhere — a client who insists on a Looker Studio dashboard, a finance team that wants numbers in a warehouse, a Slack channel that should get a Monday-morning digest. ARLO handles that too.

Beyond live querying, ARLO can push data out to optional destinations: Looker Studio, Google Sheets, BigQuery, Snowflake, Slack digests, and branded PDFs. So the choice isn't "live answers *or* warehoused reporting" — you can start with live queries for everyday questions and turn on outbound delivery only where a client or stakeholder actually needs it.

- See the full list of [ARLO destinations](/destinations) you can push to.
- If your stack is warehouse-first, you can [push to BigQuery](/destinations/bigquery) and keep your existing reporting on top of it.
- Running paid campaigns? [ARLO for Google Ads specialists](/services/google-ads-specialist) shows how live querying speeds up day-to-day account work.

The difference from a pure pipeline tool is that outbound delivery is optional in ARLO, not the foundation. You're not forced to warehouse everything just to answer a question.

## Why the "stores nothing" model matters for agencies

For an agency handling multiple clients, the pass-through design isn't just architecturally tidy — it's practically useful.

- **Less to maintain.** No warehouse to model, no report to keep alive, no sync schedule to debug when a client's numbers look off. The data stays at the source; you query it when you need it.
- **One grant, every client.** A single Google OAuth authorization covers GA4, Search Console, Ads, YouTube, and Business Profile across your whole book. You're not repeating setup per account.
- **Per-person access.** Every team member gets their own MCP URL and token, so you're not sharing one login and hoping nobody's laptop walks off.
- **No per-connector meter.** Adding another platform or another client doesn't tick up a per-source bill.

Good **marketing agency reporting** has always been bottlenecked by the plumbing, not the thinking. ARLO's bet is that if you remove the plumbing — the warehouse, the pipeline, the dashboard maintenance — what's left is just you asking sharp questions and getting straight answers.

## FAQ

**Is ARLO a Windsor.ai alternative?**
Yes, but on a different model. Windsor.ai pipes marketing data into a destination (Looker Studio, BigQuery, Sheets) where you build reports. ARLO connects Claude to your clients' live data and answers questions in plain English with nothing stored. If you need warehoused data for scheduled dashboards, Windsor.ai fits; if you mainly need fast answers, ARLO fits.

**Do I need a data warehouse?**
No. ARLO is pure pass-through — it queries each account live and stores nothing, so there's no warehouse to set up or maintain. If you *want* to send data to BigQuery, Snowflake, or Looker Studio, ARLO can push to those destinations optionally.

**How long does ARLO take to set up?**
About five minutes. Sign up, connect Google with one OAuth grant, assign your clients, paste your personal MCP URL into Claude Desktop, and ask. Your first working query usually lands in around five minutes.

**Is ARLO free?**
Yes. ARLO is free right now in early access, no credit card required — and founding pricing is locked in for early users.

## Install ARLO free in about five minutes

If you've been maintaining dashboards to answer questions you could just ask, this is the shortcut. Connect your clients once, then ask Claude anything about their live marketing data — no warehouse, no report to babysit, nothing stored.

[Start free at askarlo.app →](/welcome)
