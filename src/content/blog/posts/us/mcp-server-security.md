---
slug: "mcp-server-security"
title: "MCP Server Security: What Actually Happens to Your Clients' Data"
excerpt: "A vendor-neutral look at MCP server security — the real risk categories (OAuth scope, data retention, local vs. hosted servers, third-party packages), and the specific questions to ask before you connect any MCP tool to client accounts."
author: bryce
date: "2026-08-17"
modifiedDate: "2026-08-17"
region: "us"
category: "Guides"
tags: ["mcp server security", "mcp security", "data privacy", "agency reporting"]
featuredImage: "/arlo/bg/venus-sunset.webp"
---

Connecting an MCP server to Claude means granting an AI assistant a live path into your Google Analytics, Search Console, Google Ads, or CRM data — the same accounts that hold your clients' business numbers. Before that grant happens, "is this safe?" is a fair question, and the honest answer is: it depends entirely on the specific server, not on MCP as a technology.

That distinction matters more than it sounds like it should. MCP (Model Context Protocol) is an open standard — a shared language for how an AI model talks to outside tools. The protocol itself doesn't store data, encrypt tokens, or scope permissions; the *server* you connect does, or doesn't. Asking "is MCP secure?" is a bit like asking "is HTTP secure?" — the protocol enables both a bank's login page and a phishing site. What matters is which implementation you're actually connecting to.

This post walks through the real risk categories worth understanding before connecting any MCP server to client accounts, and the specific questions to ask a vendor — including us — to get a straight answer.

## The risk categories that actually matter

**1. What the server does with your data after it fetches it.** This is the single biggest variable between MCP servers. Some are pass-through: they query the source platform live, hand the result to Claude, and keep nothing. Others cache responses, log full payloads, or route data through a third-party warehouse for "performance" reasons that aren't disclosed up front. The difference is invisible from the outside — both kinds of server complete the same query in the same chat window. The only way to know which one you're using is to ask directly, in writing, and treat a vague answer as the answer.

**2. How broad the OAuth scope is.** Google, Meta, and most platforms let an app request a wide range of permissions — anywhere from "read this one report" to "manage this entire account." A server that only needs to read GA4 reports has no legitimate reason to request write access to your Google Ads campaigns. Overly broad scope requests are the single easiest thing to check yourself: the OAuth consent screen lists exactly what's being requested before you approve it. If a reporting tool asks for edit or admin permissions it doesn't need, that's worth a direct question before you grant it, not after.

**3. Local vs. hosted servers.** MCP servers run in one of two places: locally on your machine (a process Claude Desktop launches and talks to directly) or hosted remotely by a vendor (Claude Desktop talks to a URL). Local servers put the security question on your own machine's configuration — what the process can access, whether its source is auditable. Hosted servers move the question to the vendor's infrastructure — where their servers run, who has access, what their own security practices are. Neither is inherently safer; a well-run hosted server and a carefully audited local one both work. A local server pulled from an unmaintained GitHub repo with no clear author, or a hosted server that won't say where data lives, are the versions of each that deserve real scrutiny.

**4. Community and third-party packages of unclear provenance.** The MCP ecosystem is young and growing fast, which means a lot of servers — especially local, npm-installed ones — are built by individual developers or small projects rather than established vendors. That's not automatically a problem (plenty of genuinely useful tools start that way), but it does mean the usual due diligence applies: who maintains it, how recently was it updated, does it have any real usage or reviews beyond a GitHub star count, and — critically — what does it actually request access to versus what the tool's stated purpose requires. Installing an unfamiliar local MCP server is closer to installing an unfamiliar browser extension than clicking a link; treat the permission request the same way.

**5. Prompt injection.** This is a newer, less understood risk class specific to AI-assistant tooling generally, MCP included: if an AI model reads untrusted content (a webpage, an email, a document) as part of answering a question, that content can theoretically contain instructions designed to manipulate the model into taking an unintended action through a connected tool. It's an active area of security research across the whole AI-agent ecosystem, not unique to any one vendor, and the practical mitigation today is the same one that matters for the risks above: connectors that only have the permissions they actually need can only do limited damage even if something goes wrong, which is exactly why scope minimization (risk #2) is worth taking seriously rather than treating as a formality.

## The questions worth asking before you connect anything

A reputable MCP provider — for client-facing agency work especially, where the data isn't even yours to begin with — should be able to answer all of these plainly, without hedging:

- **Do you store our data, and if so, where and for how long?** "No" is a complete answer. "We cache it for performance" needs a follow-up: cached where, for how long, and can you turn it off.
- **Is the connection read-only, or can it write/modify anything in our accounts?** For a reporting use case, there's rarely a legitimate reason to need write access.
- **Are OAuth tokens encrypted at rest?** A yes/no question with a yes/no answer. If the response is unclear, that's the answer.
- **Can we revoke access ourselves, immediately, without contacting support?** Access control you don't hold yourself isn't really access control.
- **Is there an audit log of what was queried, by whom, and when?** For agency work specifically, this is what lets you answer a client's "who looked at our data" question honestly.
- **What happens to our data if we cancel?** The connections should be revoked and nothing about the client's underlying accounts should change — the data was always theirs, sitting in Google or Meta or Shopify, not in the connector.

If a vendor answers all six clearly, that's a genuinely good sign regardless of which vendor it is. If any answer is evasive, that's worth treating as the real answer.

## How ARLO answers these, specifically

ARLO is pass-through by design: every query fetches live data from the connected platform's API — GA4, Search Console, Google Ads, YouTube, Google Business Profile — and returns it to Claude for that one response. Nothing is warehoused, and there's no cached copy of client analytics or ad data sitting anywhere after the answer comes back.

Against the checklist above: OAuth tokens are encrypted at rest. The connection is read-only against the platforms it connects to — ARLO reads reports, it doesn't modify campaigns or properties. Every team member gets their own MCP token, so the audit log shows exactly who queried what, for which client, and when — reviewable any time by an agency admin. Disconnecting is a single action in your workspace settings, and it revokes the OAuth grant immediately; your clients' actual data in Google or Meta is completely untouched, because it was never anywhere else to begin with. If you cancel, the connections are revoked and there's nothing further to clean up on ARLO's side, because there was nothing stored to clean up.

One honest limitation worth stating plainly, in the same spirit as the rest of this post: ARLO doesn't currently publish a SOC 2 report or a dedicated third-party security audit. The architecture (pass-through, no data at rest beyond encrypted tokens) reduces what there is to audit in the first place, but for agencies with a hard compliance requirement for formal certification, that's a real gap today, not a claim we're going to paper over.

## Where this leaves you

None of this is really about MCP specifically — it's the same vendor-security diligence that's always applied to any tool that touches client data, applied to a newer category of tool. The protocol being open and new doesn't change the questions worth asking; it just means fewer of the answers are established or well-known yet, so it's on you to ask directly rather than assume.

- [Connect GA4 to Claude](/connect/google-analytics-mcp)
- [Search Console MCP](/connect/search-console-mcp)
- [Google Ads MCP](/connect/google-ads-mcp)
- [What is an MCP connector?](/blog/what-is-an-mcp-connector) — for the underlying concept
- [How ARLO compares to pipeline tools](/compare) like Windsor.ai and Supermetrics

ARLO is free during early access — unlimited clients, sources, and team seats, no card required.

## FAQ

**Is MCP itself secure?**
The protocol has no data-handling behavior of its own — it's a specification for how an AI model talks to a tool, not a service that stores or processes anything. Security depends entirely on the specific server implementation you connect to, the same way a website's security depends on how it's built, not on HTTP as a protocol.

**What's the biggest security risk with MCP servers today?**
For agency use specifically, the two worth prioritizing are unclear data retention (does the server keep a copy of what it fetches) and overly broad OAuth scopes (does it request more access than the stated purpose needs). Both are answerable with a direct question to the vendor before connecting, and both are visible on the OAuth consent screen if you read it before approving.

**Is a locally-run MCP server safer than a hosted one?**
Neither is inherently safer — they move the trust question to different places. A local server puts scrutiny on what runs on your own machine and who maintains the code; a hosted server puts scrutiny on the vendor's infrastructure and practices. A well-run version of either is fine; an unaudited, unmaintained version of either is the thing to be cautious about.

**Does ARLO store our client data?**
No. ARLO is pass-through — each query fetches live data from the connected platform and returns it to Claude for that one response. OAuth tokens are encrypted at rest; the underlying analytics, ads, or business data isn't cached or warehoused anywhere.

**Can a client ask us to prove what an MCP tool has access to?**
With ARLO, yes — the per-user audit log shows every query by user, client, and timestamp, and the OAuth scope granted is visible in your Google/Meta account's own connected-apps settings, independent of anything ARLO tells you. Both are things you can show a client directly rather than take on faith.
