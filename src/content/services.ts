import type { ServicePillar } from "./config";

export const serviceMap: Record<string, ServicePillar> = {
  "seo-specialist": {
    slug: "seo-specialist",
    title: "ARLO for SEO Specialists",
    shortTitle: "For SEO Specialists",
    description:
      "Stop living in Search Console tabs. Ask ARLO about rankings, indexation, and Core Web Vitals across every client in one window.",
    icon: "Search",
    color: "#BCEFFF",
    replaces: [
      "Search Console tab-hopping across 40 properties",
      "Weekly manual ranking PDFs",
      "Five-tool workflows to audit one client",
      "Screenshot-stitched Core Web Vitals reports",
      "Spreadsheets tracking position changes by hand",
    ],
    heroH1: "Your whole SEO stack, answered in one sentence.",
    heroSubhead:
      "ARLO plugs Claude Desktop into Search Console, GA4, PageSpeed, and Google Business Profile so you can ask about any client without opening another tab.",
    problemHeading:
      "Monday morning shouldn't be 45 minutes of Search Console tabs.",
    problemSubhead:
      "When you manage SEO for 20+ clients, the real work starts after you've finished pulling the data. ARLO gets you there faster.",
    painPoints: [
      {
        title: "The tab-hopping tax",
        description:
          "Every client audit means switching GSC properties, refiltering by country, then repeating in GA4. Half your morning is gone before you've found a single insight.",
      },
      {
        title: "Ranking shifts you catch too late",
        description:
          "A client drops from position 3 to 11 on a money keyword and you don't notice until they email on Thursday. Manual tracking across 40 properties is a losing game.",
      },
      {
        title: "Indexation audits that take all day",
        description:
          "Coverage reports, sitemap cross-checks, crawl stats - pulling this for one client is tolerable. Doing it monthly for your whole book is soul-draining.",
      },
      {
        title: "Core Web Vitals nobody monitors",
        description:
          "PageSpeed scores drift after every deploy. You'd check more often if it didn't mean running URLs one at a time and copying numbers into a doc.",
      },
    ],
    benefits: [
      {
        title: "One prompt, every property",
        description:
          "Ask 'which clients lost top-3 keywords this week' and ARLO pulls from every connected GSC property at once. No switching, no exporting.",
      },
      {
        title: "Indexation status on demand",
        description:
          "'How many of Acme's product pages are indexed versus submitted?' becomes a one-line question instead of a 20-minute coverage report deep-dive.",
      },
      {
        title: "Core Web Vitals you actually track",
        description:
          "ARLO pulls PageSpeed data on demand for any URL or full client domain. Watch CWV drift week over week without clicking through individual reports.",
      },
      {
        title: "Local SEO without the GBP sprawl",
        description:
          "Connect Google Business Profile once and ask about calls, directions, and review trends for every location a client owns. Multi-location clients stop being a nightmare.",
      },
    ],
    processSteps: [
      {
        step: 1,
        title: "Sign up in 60 seconds",
        description:
          "Create your ARLO account with your agency email. No credit card needed to see the interface.",
      },
      {
        step: 2,
        title: "Connect Google",
        description:
          "OAuth into the Google account that has access to your clients' Search Console, GA4, and Business Profile data. One click covers all three.",
      },
      {
        step: 3,
        title: "Add your clients",
        description:
          "Pick the GSC properties and GA4 streams you manage. ARLO groups them by client so prompts stay clean.",
      },
      {
        step: 4,
        title: "Copy your MCP URL",
        description:
          "ARLO generates a Claude Desktop-ready URL. Paste it into your MCP settings - done in under a minute.",
      },
      {
        step: 5,
        title: "Ask anything",
        description:
          "Open Claude and ask the questions you used to answer by hand. 'Which clients lost impressions this week?' now takes seconds.",
      },
    ],
    faqs: [
      {
        question: "Does ARLO connect to the Search Console I already use?",
        answer:
          "Yes. ARLO authenticates through your existing Google account, so every property you already have access to shows up automatically. You do not need to re-verify sites.",
        category: "technical",
      },
      {
        question: "Can I pull reports across all clients at once?",
        answer:
          "That is the whole point. Ask a question like 'show me every client whose non-brand clicks dropped more than 15 percent this week' and ARLO queries every connected property in a single response.",
        category: "general",
      },
      {
        question: "How is this different from a Looker Studio dashboard?",
        answer:
          "Dashboards answer the questions you set up in advance. ARLO answers the question you just thought of, using live data, without you building a template first.",
        category: "general",
      },
      {
        question: "Will it replace my rank tracker?",
        answer:
          "ARLO uses Search Console data, which gives you actual impressions, clicks, and average position from Google. For pixel-level daily rank tracking on specific keywords, a dedicated rank tracker is still useful. For weekly client reporting, most SEOs find ARLO covers it.",
        category: "technical",
      },
    ],
    bestFitCompanies: [
      "Boutique SEO shops managing 10-50 clients",
      "Full-service agencies with an SEO lead",
      "In-house search teams at multi-brand companies",
      "Freelance SEO consultants",
      "Local SEO agencies with multi-location clients",
    ],
    metaTitle: "ARLO for SEO Specialists - Search Console in Claude",
    metaDescription:
      "Ask Claude Desktop about rankings, indexation, Core Web Vitals, and local SEO across every client. ARLO connects GSC, GA4, PageSpeed, and GBP in one prompt.",
    tier: 1,
  },

  "google-ads-specialist": {
    slug: "google-ads-specialist",
    title: "ARLO for Google Ads Specialists",
    shortTitle: "For PPC Managers",
    description:
      "Stop switching MCC accounts all day. Ask ARLO about spend, QS drops, and campaign health across every client from one window.",
    icon: "Target",
    color: "#D0FF71",
    replaces: [
      "MCC account switching to find one number",
      "Morning spend-check spreadsheets",
      "Manual Quality Score audits",
      "Cross-account reporting built in slide decks",
      "Checking every client's search terms report by hand",
    ],
    heroH1: "Audit every Google Ads account without switching once.",
    heroSubhead:
      "ARLO plugs Claude Desktop into your MCC and GA4 so you can ask about spend, conversions, Quality Score, and search terms across every client at once.",
    problemHeading: "Your MCC was not designed for 30 active accounts.",
    problemSubhead:
      "The more clients you add, the slower every question gets. ARLO collapses that workflow into a single prompt.",
    painPoints: [
      {
        title: "The MCC switching treadmill",
        description:
          "Checking yesterday's spend across 30 clients means 30 account loads. By the time you finish, the numbers you pulled first are already stale.",
      },
      {
        title: "Brand defenders bleeding money",
        description:
          "A brand campaign's CPC doubles overnight because a competitor started bidding. You find out three days later when you get to that client in the rotation.",
      },
      {
        title: "Quality Score drops nobody flags",
        description:
          "A keyword falls from QS 8 to QS 4 and ad rank tanks before you notice. There is no single view that shows QS shifts across your book.",
      },
      {
        title: "Search terms reports you skip",
        description:
          "You know the junk queries are in there. You also know it's 45 minutes of scrolling per client. So the negative keyword work keeps slipping to next week.",
      },
    ],
    benefits: [
      {
        title: "One prompt across the whole MCC",
        description:
          "'Which accounts spent more than 20 percent above pace yesterday?' runs against every connected Google Ads account in one response. No account switching.",
      },
      {
        title: "Spot QS drops the same day",
        description:
          "Ask for any Quality Score changes over the last 7 days across all clients. ARLO surfaces the keywords that moved so you can diagnose before ad rank suffers.",
      },
      {
        title: "Cross-account campaign comparisons",
        description:
          "Compare CPA across similar campaigns in similar verticals in seconds. Stop rebuilding the same pivot table every Monday.",
      },
      {
        title: "Search terms you actually act on",
        description:
          "'Show me the 20 highest-spend search terms with zero conversions across all clients.' The negative keyword list writes itself.",
      },
    ],
    processSteps: [
      {
        step: 1,
        title: "Sign up in 60 seconds",
        description:
          "Create your ARLO account with your agency email. Start the MCC connection right from onboarding.",
      },
      {
        step: 2,
        title: "Connect Google",
        description:
          "OAuth with the Google account that owns your MCC and GA4 access. ARLO picks up every linked client automatically.",
      },
      {
        step: 3,
        title: "Add your clients",
        description:
          "Confirm which Google Ads accounts and GA4 properties belong to which client. ARLO groups them so prompts stay scoped correctly.",
      },
      {
        step: 4,
        title: "Copy your MCP URL",
        description:
          "ARLO gives you a Claude Desktop MCP URL. Paste it into your settings and connect.",
      },
      {
        step: 5,
        title: "Ask anything",
        description:
          "'Which clients are pacing to miss budget this month?' Ask and answer in one sentence instead of 30 tabs.",
      },
    ],
    faqs: [
      {
        question: "Does ARLO work with MCC accounts?",
        answer:
          "Yes. Connect the Google account that has MCC access and every linked client account is available. ARLO respects the existing permissions on your MCC, nothing gets exposed that you cannot already see.",
        category: "technical",
      },
      {
        question: "Can it make changes to campaigns?",
        answer:
          "Today ARLO is read-focused: it pulls data and answers questions. Bulk editing and campaign changes are on the roadmap but are opt-in, since most agencies want a clear line between analysis and execution.",
        category: "technical",
      },
      {
        question: "What about Performance Max opacity?",
        answer:
          "ARLO surfaces every PMax metric the API exposes, including asset group performance and search category insights. You get the same visibility Google gives the Ads UI, just queryable in plain language.",
        category: "technical",
      },
      {
        question: "Does this replace Optmyzr or similar tools?",
        answer:
          "Different job. Optmyzr is built around recommendations and bulk actions. ARLO is built around asking live questions across all your accounts at once. Most PPC teams we talk to use both.",
        category: "general",
      },
    ],
    bestFitCompanies: [
      "Performance agencies running 20+ paid accounts",
      "PPC boutiques managing MCCs",
      "Full-service agencies with a dedicated paid lead",
      "Freelance Google Ads consultants",
      "In-house paid teams at multi-brand companies",
    ],
    metaTitle: "ARLO for Google Ads Specialists - MCC in Claude",
    metaDescription:
      "Ask Claude Desktop about spend, Quality Score, search terms, and conversions across every Google Ads account in your MCC. One prompt, every client.",
    tier: 1,
  },

  "meta-ads-specialist": {
    slug: "meta-ads-specialist",
    title: "ARLO for Meta, LinkedIn, and TikTok Ad Buyers",
    shortTitle: "For Paid Social Buyers",
    description:
      "Paid social was built for one account at a time. ARLO is building the cross-platform view buyers actually need - starting with GA4 today and Meta, LinkedIn, and TikTok in Phase 2.",
    icon: "Megaphone",
    color: "#8F93FF",
    replaces: [
      "Jumping between Ads Manager, Campaign Manager, and TikTok Ads Manager",
      "Manual fatigue checks on every creative",
      "Cross-platform CPA comparisons in spreadsheets",
      "Weekly decks rebuilt from scratch",
      "Checking every ad account individually for spend pacing",
    ],
    heroH1: "One prompt for every paid social platform you run.",
    heroSubhead:
      "ARLO connects to GA4 today and brings Meta, LinkedIn, and TikTok ads into Claude Desktop in Phase 2. Plan for the workflow you actually want, not the one three dashboards forced on you.",
    problemHeading:
      "Paid social reporting is three dashboards in a trench coat.",
    problemSubhead:
      "Every platform reports differently, attributes differently, and tells a different lift story. ARLO is being built so you can stop translating between them.",
    painPoints: [
      {
        title: "Three Ads Managers, one question",
        description:
          "A client asks 'how did paid social do last week?' and you are in Meta, LinkedIn, and TikTok for 30 minutes before you can answer. Every platform uses a different attribution window.",
      },
      {
        title: "Ad fatigue you catch after the fact",
        description:
          "Frequency creeps past 3.5, CPM jumps, and you notice when performance has already tanked. Manual fatigue checks across 50 active ad sets do not happen at the pace they should.",
      },
      {
        title: "CPA creep that hides in averages",
        description:
          "Blended CPA looks fine all week, then one campaign's drift eats the whole budget. Without cross-platform comparisons, the outlier hides until month-end.",
      },
      {
        title: "Weekly recaps that cost half a day",
        description:
          "You pull CSVs, dedupe platform totals against GA4, build a chart, write the story. Every client. Every week. It never gets faster.",
      },
    ],
    benefits: [
      {
        title: "GA4 cross-platform now, native platforms in Phase 2",
        description:
          "Today ARLO uses GA4 as the source of truth for attributed paid social performance. Phase 2 adds native Meta, LinkedIn, and TikTok connections for full platform-level metrics.",
      },
      {
        title: "One language across platforms",
        description:
          "Ask 'which channel had the best CPA for Acme last week?' and ARLO treats Meta, LinkedIn, and TikTok the same way - because the question is the same.",
      },
      {
        title: "Fatigue and creep, flagged on demand",
        description:
          "Once native connections ship, asking 'which ad sets have frequency above 4 and CPM up week over week?' becomes a single prompt across all clients.",
      },
      {
        title: "Weekly recaps that write themselves",
        description:
          "Draft your client recap email by asking ARLO what moved, why, and what to do next. The spreadsheet step disappears.",
      },
    ],
    processSteps: [
      {
        step: 1,
        title: "Sign up in 60 seconds",
        description:
          "Create your ARLO account with your agency email. Start with GA4 today; platform connections arrive as they launch.",
      },
      {
        step: 2,
        title: "Connect Google",
        description:
          "OAuth your Google account for GA4 access. This is what powers cross-platform attribution until native paid social connectors ship.",
      },
      {
        step: 3,
        title: "Add your clients",
        description:
          "Map GA4 properties to client names. When Phase 2 launches, you will connect Meta, LinkedIn, and TikTok ad accounts the same way.",
      },
      {
        step: 4,
        title: "Copy your MCP URL",
        description:
          "Paste ARLO's MCP URL into Claude Desktop. Your setup is ready in under a minute.",
      },
      {
        step: 5,
        title: "Ask anything",
        description:
          "Ask about attributed paid social performance in Claude today. Ask platform-native questions when Phase 2 ships.",
      },
    ],
    faqs: [
      {
        question: "When does Meta Ads support land?",
        answer:
          "Meta, LinkedIn, and TikTok ad platform connections are Phase 2 on our roadmap. We are not going to promise a week, but we will tell you the second betas open. Early ARLO accounts get first access.",
        category: "general",
      },
      {
        question: "What can I actually do today for paid social?",
        answer:
          "Everything GA4 can tell you about paid social performance: sessions, conversions, revenue, and assisted conversions by channel and campaign. That covers most weekly client reporting questions before native connectors even ship.",
        category: "general",
      },
      {
        question: "Will it use the Conversions API data?",
        answer:
          "Yes. When native Meta support launches in Phase 2, ARLO will read whichever attribution signal the ad account is configured to use, including CAPI-enriched data. You see what Ads Manager sees.",
        category: "technical",
      },
      {
        question: "Is pricing different for Phase 2 features?",
        answer:
          "Phase 2 platform connectors are included in your ARLO subscription. No surprise upcharges when they ship, you get the new platforms on the plan you already have.",
        category: "pricing",
      },
    ],
    bestFitCompanies: [
      "Paid social agencies across Meta, LinkedIn, TikTok",
      "Performance agencies with a social buyer",
      "DTC-focused shops running meta-heavy stacks",
      "B2B agencies running LinkedIn lead gen",
      "Creator-economy agencies leaning on TikTok",
    ],
    metaTitle: "ARLO for Meta, LinkedIn, TikTok Ad Buyers",
    metaDescription:
      "One prompt for paid social across Meta, LinkedIn, and TikTok. Live on GA4 today, native platform connectors coming in Phase 2. Built for agency buyers.",
    tier: 2,
  },

  "account-manager": {
    slug: "account-manager",
    title: "ARLO for Account Managers",
    shortTitle: "For Account Managers",
    description:
      "When the client Slack hits at 4pm asking how things are going, ARLO answers in seconds instead of an hour of tab-hopping.",
    icon: "Users",
    color: "#F79C42",
    replaces: [
      "The 4pm scramble across five dashboards",
      "Pre-QBR data-pulls that eat a full afternoon",
      "Weekly recap emails rebuilt from scratch",
      "Slack threads asking specialists for numbers",
      "Google Docs full of screenshots",
    ],
    heroH1: "Answer the 4pm client ping in under a minute.",
    heroSubhead:
      "ARLO plugs every channel your client runs into Claude Desktop - GA4, Google Ads, Search Console, Business Profile - so you can answer the status question without pinging three specialists.",
    problemHeading: "Client questions don't wait for the weekly report.",
    problemSubhead:
      "When the CMO asks how this week is going on a Thursday afternoon, you need the answer now, not after you've assembled it from five tools.",
    painPoints: [
      {
        title: "The 4pm Slack from the client",
        description:
          "'Hey, quick one, how are we trending this month?' sends you into five dashboards while your calendar fills with other meetings. The answer takes an hour you don't have.",
      },
      {
        title: "QBR prep that eats a full day",
        description:
          "Every quarter you rebuild the same narrative from the same tools. Data pulls, chart rebuilds, talking points - by the time the deck is done you are sick of your own story.",
      },
      {
        title: "Weekly recap emails that never scale",
        description:
          "Every client gets a Friday update. Every update takes 20 minutes. Do the math on 15 clients and Friday afternoon disappears.",
      },
      {
        title: "Pinging specialists for one number",
        description:
          "You just need last week's spend or yesterday's conversions. The SEO lead is in a meeting, the PPC lead is heads-down. You wait, or you fumble through a tool you don't live in.",
      },
    ],
    benefits: [
      {
        title: "Instant status answers",
        description:
          "'How is Acme trending this month versus last?' pulls live GA4 and Ads data in one response. You reply to Slack before the client has refilled their coffee.",
      },
      {
        title: "QBR prep in a fraction of the time",
        description:
          "Ask ARLO for the quarter's story across organic, paid, and local. You get the shape of the narrative in minutes and spend your time on the strategic layer, not the data pull.",
      },
      {
        title: "Recap emails you draft in Claude",
        description:
          "Prompt ARLO for the week's movement across channels. Get a draft you edit for voice instead of assembling from scratch.",
      },
      {
        title: "Stop interrupting your specialists",
        description:
          "Pull your own numbers without pulling your SEO or PPC leads off deep work. They thank you, the client gets faster answers, the agency runs smoother.",
      },
    ],
    processSteps: [
      {
        step: 1,
        title: "Sign up in 60 seconds",
        description:
          "Create your ARLO account with your agency email. You do not need admin access to get started.",
      },
      {
        step: 2,
        title: "Connect Google",
        description:
          "OAuth the Google account that has access to your clients' GA4, Ads, Search Console, and Business Profile data.",
      },
      {
        step: 3,
        title: "Add your clients",
        description:
          "Confirm which properties belong to which client. ARLO groups multi-channel data so you can ask questions about 'Acme' instead of account IDs.",
      },
      {
        step: 4,
        title: "Copy your MCP URL",
        description:
          "Grab ARLO's MCP URL and paste it into Claude Desktop. Done in under a minute.",
      },
      {
        step: 5,
        title: "Ask anything",
        description:
          "Next time the client pings, ask Claude. Have the answer before you finish typing 'let me check'.",
      },
    ],
    faqs: [
      {
        question: "I am not technical. Will this fit how I work?",
        answer:
          "If you can use Slack and Google Docs, you can use ARLO. There is no SQL, no dashboard building, and no query language. You type the question the same way you would ask a teammate.",
        category: "general",
      },
      {
        question: "Can I share answers with clients?",
        answer:
          "Yes. Claude gives you plain-text responses you can paste into a recap email or Slack reply, or turn into talking points for a QBR. Many account managers use ARLO to draft the update and then polish it.",
        category: "general",
      },
      {
        question: "What happens when specialists change account access?",
        answer:
          "ARLO inherits whatever Google permissions you already have. When access changes, the data available to you updates automatically. Nothing to re-sync.",
        category: "technical",
      },
      {
        question: "Does it work for multi-location clients?",
        answer:
          "Yes. Ask ARLO about a client with 40 Google Business Profile locations and it aggregates the view while still letting you drill into any one location. Great for franchise and multi-location brands.",
        category: "general",
      },
    ],
    bestFitCompanies: [
      "Client-services agencies with dedicated AMs",
      "Full-service shops with pod-based teams",
      "Agencies running QBR-heavy client programs",
      "Freelance account leads on retainer",
      "In-house marketing ops coordinators",
    ],
    metaTitle: "ARLO for Account Managers - Client Answers in Claude",
    metaDescription:
      "Answer client pings in under a minute. ARLO connects GA4, Google Ads, Search Console, and GBP to Claude Desktop so account managers can reply live, not later.",
    tier: 1,
  },

  "agency-owner": {
    slug: "agency-owner",
    title: "ARLO for Agency Owners",
    shortTitle: "For Agency Owners",
    description:
      "See which clients are trending down before they churn, which accounts your team is actually billable on, and what new hires are moving the needle.",
    icon: "Building",
    color: "#27EAA6",
    replaces: [
      "Monthly health-check spreadsheets",
      "End-of-quarter churn surprises",
      "Guessing at team utilization",
      "Cross-client comparisons pieced together from decks",
      "Manual audits of who did what on which account",
    ],
    heroH1: "See every client, every channel, every trend line.",
    heroSubhead:
      "ARLO gives agency owners a single window across GA4, Google Ads, Search Console, and Business Profile, plus an audit log that shows who asked what about which client.",
    problemHeading: "Most churn is visible six weeks before it happens.",
    problemSubhead:
      "The signals are in the data. The problem is nobody in the agency has time to pull them all together. ARLO fixes that.",
    painPoints: [
      {
        title: "Churn that surprises you",
        description:
          "A client leaves and you realize their performance had been sliding for two months. The signals were in the data, but nobody had a single view to catch it.",
      },
      {
        title: "Team billability you guess at",
        description:
          "You know your top specialist is overloaded. You don't know which three clients are eating 60 percent of their week, or whether those clients are your biggest accounts.",
      },
      {
        title: "ROI on new hires that takes a year",
        description:
          "You bring on a senior PPC lead. Six months later you still can't point to which accounts they have measurably improved. The data lives in 20 places.",
      },
      {
        title: "Cross-client comparisons that never happen",
        description:
          "Which of your e-commerce clients is outperforming the rest on organic? You genuinely don't know, because pulling it would take a week of manual work.",
      },
    ],
    benefits: [
      {
        title: "Churn signals, surfaced early",
        description:
          "'Which clients are down more than 10 percent on revenue quarter over quarter?' runs across every connected account. You see the risk list before it becomes a resignation email.",
      },
      {
        title: "Team metrics you can act on",
        description:
          "ARLO's audit log shows which team members are asking questions about which clients. Pair that with actual account performance and you get a real view of where effort is going.",
      },
      {
        title: "Compare clients head to head",
        description:
          "'Show me my top five e-commerce clients by organic revenue growth this quarter.' Cross-client benchmarking in one sentence, not one week.",
      },
      {
        title: "Audit log for client confidence",
        description:
          "When a client asks what changed on their account, you can show them. Every ARLO query is logged by user, client, and timestamp. Useful for retros, audits, and peace of mind.",
      },
    ],
    processSteps: [
      {
        step: 1,
        title: "Sign up in 60 seconds",
        description:
          "Create your agency workspace in ARLO. Invite your team as you go, owner controls are built in from day one.",
      },
      {
        step: 2,
        title: "Connect Google",
        description:
          "OAuth the primary Google account that holds your MCC and GA4 access. ARLO pulls in every client account linked to it.",
      },
      {
        step: 3,
        title: "Add your clients",
        description:
          "Group properties by client so every prompt maps to a real book-of-business entry. Set team permissions per client if needed.",
      },
      {
        step: 4,
        title: "Copy your MCP URL",
        description:
          "Share the ARLO MCP URL with your team. Everyone connects Claude Desktop once and you have agency-wide reach.",
      },
      {
        step: 5,
        title: "Ask anything",
        description:
          "Start with the questions you wish you had answers to: churn risk, team loading, margin outliers. ARLO answers in plain language.",
      },
    ],
    faqs: [
      {
        question: "How does ARLO handle team access?",
        answer:
          "Every team member signs in with their own account under your agency workspace. You control who can see which clients, and the audit log shows you every query by user, client, and timestamp.",
        category: "ownership",
      },
      {
        question: "Can I use this to justify a new hire?",
        answer:
          "Yes. Pair ARLO's performance data with the audit log to see which accounts a new hire is working on and whether those accounts are improving. It will not replace a proper billability tool, but it gives you the outcomes side of the equation.",
        category: "general",
      },
      {
        question: "What about data governance and client trust?",
        answer:
          "ARLO only reads the Google accounts you connect, never stores client data outside your workspace, and keeps a full audit log for you to review. Client data never leaves your permission scope.",
        category: "technical",
      },
      {
        question: "How does pricing work as the team grows?",
        answer:
          "ARLO is priced per seat with agency plans for 10+ users. We keep pricing simple on purpose: no per-client fees, no per-query fees, no surprise bills when usage spikes during QBR season.",
        category: "pricing",
      },
    ],
    bestFitCompanies: [
      "Independent agencies with 10-100 team members",
      "Holding-co portfolio agencies",
      "Managing partners at digital boutiques",
      "Founder-led performance shops",
      "Fractional CMOs running agency-like teams",
    ],
    metaTitle: "ARLO for Agency Owners - Client Portfolio in Claude",
    metaDescription:
      "Spot churn early, see team utilization, compare clients head to head. ARLO gives agency owners one queryable view across every client in Claude Desktop.",
    tier: 1,
  },

  "solo-business-owner": {
    slug: "solo-business-owner",
    title: "ARLO for Business Owners",
    shortTitle: "For Business Owners",
    description:
      "Skip the dashboards. Ask Claude about your own business's traffic, ads, sales, and email performance in one conversation.",
    icon: "Home",
    color: "#FFCA94",
    replaces: [
      "Monday-morning tab rituals (GA4, Search Console, Meta Ads Manager, Shopify, Mailchimp, repeat)",
      "Static weekly PDF reports that are already stale when they land",
      "Hiring an analyst just to answer \"how did last week go?\"",
      "Looker Studio dashboards nobody opens after week 3",
    ],
    heroH1: "Your whole business, answerable in one conversation.",
    heroSubhead:
      "ARLO's Solo plan plugs Claude into GA4, Search Console, Google Ads, Meta, Shopify, Stripe and more — for one business, yours. No agency overhead, no per-seat tax. Just a $19/mo AI layer on top of what you already run.",
    problemHeading: "Running your own business means you are the analyst.",
    problemSubhead:
      "You don't have an agency answering questions at 4pm. You open seven tabs and try to hold it all in your head. That's not a strategy — it's a bottleneck.",
    painPoints: [
      {
        title: "Seven tabs, one question",
        description:
          "GA4 for traffic, Search Console for organic, Ads for spend, Meta for creative performance, Shopify for sales, Stripe for revenue, Mailchimp for opens. Any weekly check-in means seven logins and ten CSVs.",
      },
      {
        title: "Investor or partner updates take hours",
        description:
          "You already know the story in your head. Proving it with screenshots and pivot tables is the part that eats your Friday afternoon.",
      },
      {
        title: "Anomalies only surface after they hurt",
        description:
          "A 3-day drop in Meta ROAS, a stalled conversion rate, a spike in refunds — you catch these weeks late because nothing is actively watching for you.",
      },
      {
        title: "Tools sold to enterprises, priced for enterprises",
        description:
          "Windsor, Supermetrics, Looker Studio Pro — all priced for teams of 10. You're one person with one business, not Coca-Cola.",
      },
    ],
    benefits: [
      {
        title: "One plan, one price, one business",
        description:
          "$19/mo, 7 source types, 2,500 queries. Enough for even a busy e-commerce or service business without agency-tier pricing.",
      },
      {
        title: "Natural-language over every platform",
        description:
          "\"How did we do last week vs. the week before?\" — Claude fans out to every connected source and answers in seconds.",
      },
      {
        title: "Ask for recommendations, not just numbers",
        description:
          "\"What ad creative is underperforming?\" \"Which campaign has the worst CAC trend?\" Claude can pull the data and tell you what to look at next.",
      },
      {
        title: "Simple dashboard, not agency sprawl",
        description:
          "No \"switch client\" selector, no multi-tenant everything. A single-business view from the moment you sign in.",
      },
    ],
    processSteps: [
      { step: 1, title: "Sign up as Solo", description: "Choose \"I run one business\" at signup. 14-day trial, no card." },
      { step: 2, title: "Connect Google", description: "One OAuth grant covers GA4, Search Console, Google Ads, YouTube, and Business Profile for your business." },
      { step: 3, title: "Connect your other platforms", description: "Meta, Shopify, Stripe, your email tool — pick from our 107-platform catalog." },
      { step: 4, title: "Copy your MCP URL", description: "Paste it into Claude Desktop → Settings → Connectors. That's the install." },
      { step: 5, title: "Start asking", description: "\"How did last week go?\" \"What's my 7-day ROAS trend?\" \"Compare November to October.\" You ask, Claude fetches, you act." },
    ],
    faqs: [
      {
        category: "general",
        question: "Is Solo really just for one person, or one business?",
        answer:
          "One business. You can have up to 3 teammates under the Solo plan — perfect for a founder + ops person + part-time marketer. Everyone gets their own personal MCP URL to paste into their Claude Desktop.",
      },
      {
        category: "pricing",
        question: "What if my business grows and I start managing other brands?",
        answer:
          "Upgrade to Studio ($99/mo) when you add a 2nd client — we'll prompt you automatically. Your existing connections and data carry over. If you're running a portfolio of personal brands, Studio is probably the right tier from day one.",
      },
      {
        category: "technical",
        question: "Do I still get all 14 launch connectors on Solo?",
        answer:
          "You get to activate 7 source types out of the 14+ at launch. Most business owners never need more than that (GA4, GSC, Ads, Meta, Shopify, Stripe, one email tool = 7 exactly). If you need more, Studio or Agency unlock higher source limits.",
      },
      {
        category: "general",
        question: "Can I use ARLO without Claude Desktop?",
        answer:
          "Any MCP-compatible client works — Cursor, Cline, and others. Claude Desktop is the supported default because it's free, stable, and the best UX for day-to-day queries. ARLO does not have its own chat interface — we are a connector, not a chat app.",
      },
    ],
    bestFitCompanies: [
      "E-commerce operators",
      "Local service businesses",
      "SaaS founders",
      "Restaurants & cafes",
      "Freelance consultants",
    ],
    metaTitle: "ARLO for Business Owners | Claude on Your Own Analytics",
    metaDescription:
      "Solo plan for single-business owners. Connect your own GA4, Ads, Meta, Shopify, Stripe, email. Ask Claude about your business in plain English — $19/mo.",
    tier: 1,
  },
};

export const services: ServicePillar[] = Object.values(serviceMap);

export function getServiceConfig(slug: string): ServicePillar | null {
  return serviceMap[slug] ?? null;
}

export function getTier1Services(): ServicePillar[] {
  return services.filter((s) => s.tier === 1);
}

export function getTier2Services(): ServicePillar[] {
  return services.filter((s) => s.tier === 2);
}

export function getAllServiceSlugs(): string[] {
  return Object.keys(serviceMap);
}
