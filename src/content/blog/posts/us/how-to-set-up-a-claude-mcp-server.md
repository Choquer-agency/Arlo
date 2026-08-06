---
slug: "how-to-set-up-a-claude-mcp-server"
title: "How to Set Up a Claude MCP Server: The Complete Guide"
excerpt: "Every way to connect an MCP server to Claude — remote/hosted connectors, local stdio servers, Claude Code — plus the setup steps, common errors, and how to pick one for marketing data."
author: bryce
date: "2026-08-06"
modifiedDate: "2026-08-06"
region: "us"
category: "Guides"
tags: ["claude mcp server", "mcp server for claude", "claude code mcp server setup", "how to install mcp"]
featuredImage: "/arlo/bg/tuscany.webp"
---

Searching "claude mcp server" mostly turns up two kinds of pages: developer docs that assume you're building a server from scratch, or vendor pitches that skip straight to "click here to connect" without explaining what's actually happening. This is the version in between — what an MCP server is in practice, the two different ways you'll encounter one, the actual click-by-click setup, and what to check when it doesn't connect on the first try.

If you want the plain-English definition of MCP itself first, [we cover that separately](/blog/what-is-an-mcp-connector) — this post assumes you already know roughly what MCP is and want to get a server running.

## The two kinds of Claude MCP server

"MCP server" covers two genuinely different setups, and knowing which one you're dealing with changes everything about how you install it.

**Remote (hosted) MCP servers** run on someone else's infrastructure — a vendor like ARLO, or any SaaS product that exposes an MCP endpoint. You don't install or run anything locally. You get a URL, you paste it into Claude, you authenticate (usually OAuth), and Claude calls that URL whenever it needs the tool. This is the pattern for almost every commercial MCP connector, because it means no local dependencies, no version updates to manage, and it works the same on any machine you're signed into.

**Local (stdio) MCP servers** run as a process on your own computer, launched by Claude Desktop itself — typically via `npx` for a Node-based server or a similar runner for other languages. Claude starts the process, talks to it over stdin/stdout, and stops it when you quit. This is the pattern for most open-source and community MCP servers (filesystem access, local databases, dev tools) — anything that needs to read your machine rather than a cloud account.

Most people searching "claude mcp server" for a marketing or business use case want the first kind — a remote connector to a platform they already use (GA4, Google Ads, Search Console, a CRM). The second kind matters mostly for developer tooling. Both install through the same Claude Desktop settings screen, but the steps differ slightly.

## Setting up a remote MCP server in Claude Desktop

This is the path for connecting Claude to a live account — analytics, ads, a CRM, anything with its own login.

1. **Get the server's MCP URL.** The vendor issues this after you sign in and, usually, grant OAuth access to the underlying platform. It's a unique link tied to your account — treat it like a password, not something to paste into a public channel.
2. **Open Claude Desktop → Settings → Connectors.** This is where every MCP server you've added shows up, remote or local.
3. **Add a custom connector and paste the URL.** Claude Desktop will attempt to connect immediately.
4. **Authenticate if prompted.** Most remote servers use OAuth — you'll see a browser window asking you to sign in and approve access, the same flow as connecting any third-party app to your Google account.
5. **Start a new conversation.** Existing chat windows don't always pick up a connector added mid-session — open a fresh one and the server's tools should be available to Claude.

That's the entire mechanic behind every "connect X to Claude" guide you'll find for a specific platform, ARLO's included — get a URL, paste it, authenticate once. Nothing to run, nothing to update.

## Setting up a local (stdio) MCP server

If you're installing a developer-facing server — the kind distributed as an npm package or a GitHub repo rather than a hosted URL — the process runs through a config file instead of a paste-a-URL flow:

1. Open Claude Desktop's configuration file (`claude_desktop_config.json`, found via Settings → Developer on most installs).
2. Add an entry under `mcpServers` naming the server and the command to launch it — commonly an `npx` command pointing at the package, plus any arguments or environment variables the server needs (API keys, file paths, etc.).
3. Save the file and restart Claude Desktop. It launches the process itself on startup.

Because this method runs arbitrary code on your machine, only add local servers from sources you trust — read what the command actually does before pasting it into your config, the same caution you'd apply to any script from the internet.

## Claude Code and other MCP-compatible clients

MCP isn't Claude-Desktop-specific — it's an open standard, so Claude Code, Cursor, and other MCP-compatible tools can connect to the same remote servers through their own connector settings. The general shape is identical (get a URL or command, register it, authenticate), but the exact menu or CLI syntax changes between tools and versions, so check the specific client's current MCP documentation rather than assuming Claude Desktop's steps transfer literally. If a vendor's server works with Claude Desktop, it's a good sign it'll work with Claude Code too — MCP compliance is what makes a server portable across clients in the first place, not a per-client integration.

## Common setup problems (and what they usually mean)

- **The connector shows "disconnected" right after adding it.** Almost always an auth issue — the OAuth grant didn't complete, or a token expired. Remove the connector and re-add it rather than troubleshooting a half-finished auth state.
- **Claude doesn't seem to know the tool exists.** Start a new conversation. Tools registered mid-session don't always populate into a chat that was already open.
- **A local server won't launch.** Check that the runtime it depends on (usually Node, for `npx`-based servers) is actually installed and on your system `PATH` — this is the single most common cause of a local server silently failing to start.
- **The connection works but calls return errors.** Check scope, not the connection itself — a valid OAuth grant with the wrong permissions (e.g., a GA4 login with no access to the property you're asking about) looks identical to a broken connector until you check what account actually authenticated.
- **It worked yesterday, not today.** OAuth tokens expire or get revoked (a password change, an admin revoking third-party app access) more often than the connector itself breaks. Re-authenticating is the first thing to try, not the last.

## Picking a Claude MCP server for marketing and client data

If the reason you're setting up an MCP server at all is to ask Claude about GA4, Search Console, Google Ads, or another marketing platform for one or more clients, a couple of things are worth checking before you connect anything to a client's account:

- **Is it read-only, or can it write?** For reporting use cases, you want read access only — a connector that can also change ad budgets or campaign settings is a bigger blast radius than most agencies want for a "just answer questions" tool.
- **Does it store your data, or just pass it through?** A connector that queries the source live and returns the answer without warehousing anything has a smaller data-handling footprint than one that syncs and caches — worth asking directly if it isn't stated.
- **Does one setup cover every client, or one per account?** For an agency managing dozens of clients, a connector that requires a fresh setup per client account doesn't scale the way a single OAuth grant covering the whole roster does.

ARLO is built around that last point specifically: one Google OAuth grant unlocks [GA4](/connect/google-analytics-mcp), [Search Console](/connect/search-console-mcp), [Google Ads](/connect/google-ads-mcp), [YouTube](/connect/youtube-mcp), and [Google Business Profile](/connect/google-business-profile-mcp) for every client you add, it's read-only and pass-through (nothing warehoused), and the install is the same five-step flow described above — paste one MCP URL into Claude Desktop → Settings → Connectors. See [what an MCP connector actually is](/blog/what-is-an-mcp-connector) for the concept, or [how ARLO compares to pipeline tools](/compare) like Windsor.ai and Supermetrics if you're also weighing a dashboard-based alternative.

## FAQ

**Do I need to know how to code to set up an MCP server?**
Not for a remote/hosted server — that's a paste-a-URL-and-authenticate flow, the same difficulty as connecting any app to your Google account. Local (stdio) servers lean more technical since you're editing a config file and running a command, but even that rarely requires writing code, just following the server's install instructions.

**Is "MCP server" the same thing as "MCP connector"?**
Yes, functionally. "MCP server" is the more technical term for the running service that implements the protocol; "connector" is the more common word for the same thing from a user's perspective — the thing you add to Claude to unlock a platform.

**Can I run more than one MCP server at once?**
Yes. Claude Desktop's Connectors list holds multiple servers simultaneously, remote and local mixed freely, and Claude decides which tool to call based on what the conversation actually needs.

**Why does Claude say it can't find the tool even though the connector is connected?**
Usually a fresh-conversation issue (see troubleshooting above) or a scope issue — the server is connected, but the specific account/property/client you're asking about wasn't granted in the OAuth step.

**Is a hosted MCP server less secure than running one locally?**
Not inherently — it depends on the vendor's own security practices (token encryption, read-only scoping, whether data is stored or pass-through) more than on hosted-vs-local as a category. A reputable hosted server should be able to tell you plainly what it stores and what it doesn't; if it can't, that's the bigger flag.

## Try a Claude MCP server built for agency reporting

ARLO connects Claude to GA4, Search Console, Google Ads, YouTube, and Business Profile with one OAuth grant — read-only, nothing stored, live answers per client. Free to start, no card required.

[Start free at askarlo.app →](/welcome)
