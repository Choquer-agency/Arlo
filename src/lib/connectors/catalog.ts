/**
 * ARLO connector catalog — the master list of every platform we expose (or plan to
 * expose) through MCP. Status determines whether agencies can connect now, get on
 * the waitlist, or vote the platform up the roadmap.
 *
 * `live`       → fully implemented. OAuth + connector + Claude tools all work.
 * `beta`       → OAuth works, connector is wired but limited (e.g. read-only).
 * `coming_soon`→ on a confirmed roadmap date. Waitlist signups get priority + launch email.
 * `waitlist`   → possible future build. Email signups vote the platform up our roadmap.
 */

export type ConnectorStatus = "live" | "beta" | "coming_soon" | "waitlist";

export type ConnectorCategory =
  | "analytics"
  | "search"
  | "search_ads"
  | "social_ads"
  | "social_organic"
  | "programmatic"
  | "ecommerce"
  | "crm"
  | "email"
  | "support"
  | "call_tracking"
  | "attribution"
  | "product_analytics"
  | "seo_tools"
  | "reviews"
  | "forms"
  | "payments"
  | "subscriptions"
  | "finance"
  | "productivity"
  | "affiliate"
  | "ab_testing"
  | "data";

export interface CatalogEntry {
  id: string;
  name: string;
  category: ConnectorCategory;
  status: ConnectorStatus;
  /** ETA for coming_soon items. ISO-ish readable like "May 2026". */
  eta?: string;
  /** OAuth provider if different from id. */
  provider?: string;
  /** How connection works for this platform. */
  authType: "oauth2" | "oauth1" | "api_key" | "service_account" | "webhook" | "embed";
  /** True if each client gets its own connection (vs workspace-level like Google). */
  perClient?: boolean;
  /** Windsor comparison flag — true = "Windsor has it, so do we." */
  windsor?: boolean;
  color: string;
  tagline: string;
}

export const CONNECTOR_CATALOG: CatalogEntry[] = [
  // ── Analytics ─────────────────────────────────────────
  { id: "ga4", name: "Google Analytics 4", category: "analytics", status: "live", authType: "oauth2", color: "#E37400", windsor: true, tagline: "Sessions, users, events, conversions." },
  { id: "matomo", name: "Matomo", category: "analytics", status: "waitlist", authType: "api_key", color: "#3152A0", windsor: true, tagline: "Self-hosted Google Analytics alternative." },
  { id: "plausible", name: "Plausible Analytics", category: "analytics", status: "waitlist", authType: "api_key", color: "#5850EC", windsor: true, tagline: "Privacy-friendly, cookieless analytics." },
  { id: "adobe_analytics", name: "Adobe Analytics", category: "analytics", status: "waitlist", authType: "oauth2", color: "#FA0F00", windsor: true, tagline: "Enterprise web analytics." },
  { id: "yandex_metrica", name: "Yandex Metrica", category: "analytics", status: "waitlist", authType: "oauth2", color: "#FFCC00", windsor: true, tagline: "Russian-market analytics." },
  // Looker Studio moved to destinations catalog (src/lib/destinations/catalog.ts) — it's an outbound dashboard, not a source.

  // ── Search / Search Console ───────────────────────────
  { id: "gsc", name: "Google Search Console", category: "search", status: "live", authType: "oauth2", provider: "google", color: "#4285F4", windsor: true, tagline: "Impressions, clicks, position, indexation." },
  { id: "bing_webmaster", name: "Bing Webmaster Tools", category: "search", status: "waitlist", authType: "api_key", color: "#008373", tagline: "Bing organic search performance." },

  // ── Search Ads ────────────────────────────────────────
  { id: "google_ads", name: "Google Ads", category: "search_ads", status: "live", authType: "oauth2", provider: "google", color: "#4285F4", windsor: true, tagline: "Spend, clicks, conversions, quality score." },
  { id: "microsoft_ads", name: "Microsoft Ads (Bing)", category: "search_ads", status: "waitlist", authType: "oauth2", color: "#00B294", windsor: true, tagline: "Bing search ad performance." },
  { id: "amazon_ads", name: "Amazon Ads", category: "search_ads", status: "waitlist", authType: "oauth2", color: "#FF9900", windsor: true, tagline: "Sponsored Products, Brands, Display." },
  { id: "apple_search_ads", name: "Apple Search Ads", category: "search_ads", status: "waitlist", authType: "oauth2", color: "#000000", windsor: true, tagline: "App Store search ads." },
  { id: "yahoo_japan", name: "Yahoo! Japan Ads", category: "search_ads", status: "waitlist", authType: "oauth2", color: "#FF0033", windsor: true, tagline: "Japanese market search ads." },

  // ── Social Ads ────────────────────────────────────────
  { id: "meta_ads", name: "Meta Ads", category: "social_ads", status: "coming_soon", eta: "May 2026", authType: "oauth2", provider: "meta", color: "#1877F2", windsor: true, tagline: "Facebook + Instagram ad spend, CPA, ROAS." },
  { id: "linkedin_ads", name: "LinkedIn Ads", category: "social_ads", status: "coming_soon", eta: "May 2026", authType: "oauth2", provider: "linkedin", color: "#0A66C2", windsor: true, tagline: "B2B campaign performance." },
  { id: "tiktok_ads", name: "TikTok Ads", category: "social_ads", status: "coming_soon", eta: "June 2026", authType: "oauth2", provider: "tiktok", color: "#000000", windsor: true, tagline: "Video ad spend, CPM, conversion." },
  { id: "pinterest_ads", name: "Pinterest Ads", category: "social_ads", status: "waitlist", authType: "oauth2", color: "#E60023", windsor: true, tagline: "Pin-level spend and engagement." },
  { id: "snapchat_ads", name: "Snapchat Ads", category: "social_ads", status: "waitlist", authType: "oauth2", color: "#FFFC00", windsor: true, tagline: "Snap ad spend and delivery." },
  { id: "reddit_ads", name: "Reddit Ads", category: "social_ads", status: "waitlist", authType: "oauth2", color: "#FF4500", windsor: true, tagline: "Subreddit-targeted ad performance." },
  { id: "twitter_ads", name: "X (Twitter) Ads", category: "social_ads", status: "waitlist", authType: "oauth2", color: "#000000", windsor: true, tagline: "X promoted post analytics." },
  { id: "quora_ads", name: "Quora Ads", category: "social_ads", status: "waitlist", authType: "oauth2", color: "#B92B27", windsor: true, tagline: "Intent-based Quora ad spend." },
  { id: "spotify_ads", name: "Spotify Ads", category: "social_ads", status: "waitlist", authType: "oauth2", color: "#1DB954", windsor: true, tagline: "Audio ad delivery and listens." },

  // ── Social Organic ────────────────────────────────────
  { id: "youtube", name: "YouTube (Analytics)", category: "social_organic", status: "live", authType: "oauth2", provider: "google", color: "#FF0000", windsor: true, tagline: "Channel views, subscribers, watch time." },
  { id: "meta_pages", name: "Facebook / Instagram Pages", category: "social_organic", status: "coming_soon", eta: "May 2026", authType: "oauth2", provider: "meta", color: "#1877F2", windsor: true, tagline: "Organic reach, engagement, follower growth." },
  { id: "linkedin_pages", name: "LinkedIn Pages", category: "social_organic", status: "waitlist", authType: "oauth2", color: "#0A66C2", windsor: true, tagline: "Company page follower + post analytics." },
  { id: "tiktok_organic", name: "TikTok Organic", category: "social_organic", status: "waitlist", authType: "oauth2", color: "#000000", windsor: true, tagline: "Organic video performance." },
  { id: "pinterest_organic", name: "Pinterest Organic", category: "social_organic", status: "waitlist", authType: "oauth2", color: "#E60023", windsor: true, tagline: "Pin saves, impressions, boards." },
  { id: "x_organic", name: "X Organic", category: "social_organic", status: "waitlist", authType: "oauth2", color: "#000000", windsor: true, tagline: "Organic posts + profile stats." },
  { id: "threads", name: "Threads", category: "social_organic", status: "waitlist", authType: "oauth2", color: "#000000", windsor: true, tagline: "Meta Threads organic posts." },
  { id: "sprout_social", name: "Sprout Social", category: "social_organic", status: "waitlist", authType: "oauth2", color: "#759B84", windsor: true, tagline: "Multi-network social management." },
  { id: "instagram_public", name: "Instagram Public Data", category: "social_organic", status: "waitlist", authType: "api_key", color: "#E4405F", windsor: true, tagline: "Public competitor profile tracking." },

  // ── Programmatic / DSP ────────────────────────────────
  { id: "dv360", name: "Google DV360", category: "programmatic", status: "waitlist", authType: "oauth2", color: "#4285F4", windsor: true, tagline: "Display & Video 360 campaigns." },
  { id: "cm360", name: "Google CM360", category: "programmatic", status: "waitlist", authType: "oauth2", color: "#4285F4", windsor: true, tagline: "Campaign Manager 360." },
  { id: "sa360", name: "Google SA360", category: "programmatic", status: "waitlist", authType: "oauth2", color: "#4285F4", windsor: true, tagline: "Search Ads 360 performance." },
  { id: "google_ad_manager", name: "Google Ad Manager", category: "programmatic", status: "waitlist", authType: "oauth2", color: "#4285F4", windsor: true, tagline: "Ad server inventory and yield." },
  { id: "the_trade_desk", name: "The Trade Desk", category: "programmatic", status: "waitlist", authType: "oauth2", color: "#00BFAE", windsor: true, tagline: "Programmatic display + CTV." },
  { id: "stackadapt", name: "StackAdapt", category: "programmatic", status: "waitlist", authType: "oauth2", color: "#5C38F4", windsor: true, tagline: "Native + programmatic spend." },
  { id: "adform", name: "Adform", category: "programmatic", status: "waitlist", authType: "oauth2", color: "#0B0B0B", windsor: true, tagline: "European DSP performance." },
  { id: "adroll", name: "AdRoll", category: "programmatic", status: "waitlist", authType: "oauth2", color: "#85C440", windsor: true, tagline: "Retargeting spend and lift." },
  { id: "outbrain", name: "Outbrain", category: "programmatic", status: "waitlist", authType: "oauth2", color: "#F26722", windsor: true, tagline: "Content discovery placements." },
  { id: "taboola", name: "Taboola", category: "programmatic", status: "waitlist", authType: "oauth2", color: "#004B87", windsor: true, tagline: "Native content ad performance." },
  { id: "criteo", name: "Criteo", category: "programmatic", status: "waitlist", authType: "oauth2", color: "#F07C00", windsor: true, tagline: "Retargeting + commerce ads." },
  { id: "rtb_house", name: "RTB House", category: "programmatic", status: "waitlist", authType: "oauth2", color: "#FF3300", windsor: true, tagline: "Personalized retargeting." },
  { id: "mntn", name: "MNTN", category: "programmatic", status: "waitlist", authType: "oauth2", color: "#7839EE", windsor: true, tagline: "Connected TV advertising." },

  // ── E-commerce ────────────────────────────────────────
  { id: "shopify", name: "Shopify", category: "ecommerce", status: "coming_soon", eta: "April 2026", authType: "oauth2", provider: "shopify", perClient: true, color: "#95BF47", windsor: true, tagline: "Orders, revenue, AOV, conversion rate." },
  { id: "bigcommerce", name: "BigCommerce", category: "ecommerce", status: "waitlist", authType: "oauth2", perClient: true, color: "#121118", windsor: true, tagline: "Mid-market storefront performance." },
  { id: "woocommerce", name: "WooCommerce", category: "ecommerce", status: "waitlist", authType: "api_key", perClient: true, color: "#7F54B3", windsor: true, tagline: "WordPress e-commerce." },
  { id: "magento", name: "Magento / Adobe Commerce", category: "ecommerce", status: "waitlist", authType: "oauth1", perClient: true, color: "#EE672F", windsor: true, tagline: "Enterprise e-commerce platform." },
  { id: "prestashop", name: "PrestaShop", category: "ecommerce", status: "waitlist", authType: "api_key", perClient: true, color: "#DF0067", windsor: true, tagline: "European e-commerce orders." },
  { id: "amazon_sp", name: "Amazon Seller Central", category: "ecommerce", status: "waitlist", authType: "oauth2", color: "#FF9900", windsor: true, tagline: "Amazon seller orders + fees." },
  { id: "amazon_vendor", name: "Amazon Vendor Central", category: "ecommerce", status: "waitlist", authType: "oauth2", color: "#FF9900", windsor: true, tagline: "Amazon 1P vendor performance." },
  { id: "walmart_marketplace", name: "Walmart Marketplace", category: "ecommerce", status: "waitlist", authType: "api_key", color: "#0071DC", windsor: true, tagline: "Walmart third-party sales." },
  { id: "google_merchant", name: "Google Merchant Center", category: "ecommerce", status: "waitlist", authType: "oauth2", provider: "google", color: "#4285F4", windsor: true, tagline: "Shopping feed + product listing." },
  { id: "cart", name: "Cart.com", category: "ecommerce", status: "waitlist", authType: "api_key", perClient: true, color: "#FF5A4B", windsor: true, tagline: "Mid-market e-commerce platform." },
  { id: "shiphero", name: "ShipHero", category: "ecommerce", status: "waitlist", authType: "oauth2", color: "#2E3192", windsor: true, tagline: "Fulfillment + warehouse ops." },

  // ── CRM ───────────────────────────────────────────────
  { id: "hubspot", name: "HubSpot", category: "crm", status: "coming_soon", eta: "July 2026", authType: "oauth2", provider: "hubspot", color: "#FF7A59", windsor: true, tagline: "Deals, contacts, lifecycle, revenue." },
  { id: "salesforce", name: "Salesforce", category: "crm", status: "waitlist", authType: "oauth2", color: "#00A1E0", windsor: true, tagline: "Enterprise CRM + pipeline." },
  { id: "pipedrive", name: "Pipedrive", category: "crm", status: "waitlist", authType: "oauth2", color: "#FFA600", windsor: true, tagline: "Sales pipeline + activities." },
  { id: "zoho_crm", name: "Zoho CRM", category: "crm", status: "waitlist", authType: "oauth2", color: "#EF4C3A", windsor: true, tagline: "SMB CRM performance." },
  { id: "close", name: "Close", category: "crm", status: "waitlist", authType: "oauth2", color: "#0EB1D2", windsor: true, tagline: "Inside-sales CRM + call tracking." },
  { id: "freshsales", name: "Freshsales", category: "crm", status: "waitlist", authType: "oauth2", color: "#08AEEA", windsor: true, tagline: "Freshworks CRM pipeline." },
  { id: "insightly", name: "Insightly", category: "crm", status: "waitlist", authType: "oauth2", color: "#005687", windsor: true, tagline: "SMB CRM + project mgmt." },
  { id: "dynamics365", name: "Microsoft Dynamics 365", category: "crm", status: "waitlist", authType: "oauth2", color: "#0078D4", windsor: true, tagline: "Enterprise CRM + ERP." },
  { id: "pardot", name: "Salesforce Pardot", category: "crm", status: "waitlist", authType: "oauth2", color: "#00A1E0", windsor: true, tagline: "B2B marketing automation." },
  { id: "activecampaign", name: "ActiveCampaign", category: "crm", status: "waitlist", authType: "oauth2", color: "#356AE6", windsor: true, tagline: "CRM + email + automation." },

  // ── Email Marketing ───────────────────────────────────
  { id: "mailchimp", name: "Mailchimp", category: "email", status: "coming_soon", eta: "August 2026", authType: "oauth2", provider: "mailchimp", color: "#FFE01B", windsor: true, tagline: "Campaigns, opens, clicks, list growth." },
  { id: "mailerlite", name: "MailerLite", category: "email", status: "coming_soon", eta: "July 2026", authType: "api_key", color: "#09C269", windsor: true, tagline: "Newsletter + automation performance." },
  { id: "klaviyo", name: "Klaviyo", category: "email", status: "waitlist", authType: "oauth2", color: "#232B2B", windsor: true, tagline: "E-commerce email + SMS." },
  { id: "convertkit", name: "Kit (ConvertKit)", category: "email", status: "waitlist", authType: "oauth2", color: "#FB6970", windsor: true, tagline: "Creator email platform." },
  { id: "sendinblue", name: "Brevo (Sendinblue)", category: "email", status: "waitlist", authType: "api_key", color: "#0B996E", windsor: true, tagline: "Email + SMS + CRM suite." },
  { id: "emailoctopus", name: "EmailOctopus", category: "email", status: "waitlist", authType: "api_key", color: "#0968F2", windsor: true, tagline: "Affordable email marketing." },
  { id: "omnisend", name: "Omnisend", category: "email", status: "waitlist", authType: "api_key", color: "#F0822B", windsor: true, tagline: "E-commerce email + SMS." },
  { id: "customer_io", name: "Customer.io", category: "email", status: "waitlist", authType: "api_key", color: "#6066F1", windsor: true, tagline: "Behavioral email + messaging." },
  { id: "iterable", name: "Iterable", category: "email", status: "waitlist", authType: "api_key", color: "#6A0FAD", windsor: true, tagline: "Enterprise cross-channel messaging." },
  { id: "braze", name: "Braze", category: "email", status: "waitlist", authType: "api_key", color: "#FF7759", windsor: true, tagline: "Customer engagement platform." },
  { id: "sendgrid", name: "SendGrid", category: "email", status: "waitlist", authType: "api_key", color: "#1A82E2", windsor: true, tagline: "Transactional email stats." },
  { id: "mailgun", name: "Mailgun", category: "email", status: "waitlist", authType: "api_key", color: "#F06B66", tagline: "Transactional email deliverability." },

  // ── Support ───────────────────────────────────────────
  { id: "intercom", name: "Intercom", category: "support", status: "waitlist", authType: "oauth2", color: "#286EFA", windsor: true, tagline: "Support volume, response time, CSAT." },
  { id: "zendesk_support", name: "Zendesk Support", category: "support", status: "waitlist", authType: "oauth2", color: "#03363D", windsor: true, tagline: "Ticket volume + SLA performance." },
  { id: "freshdesk", name: "Freshdesk", category: "support", status: "waitlist", authType: "api_key", color: "#17A2B8", windsor: true, tagline: "Helpdesk ticket analytics." },
  { id: "freshservice", name: "Freshservice", category: "support", status: "waitlist", authType: "api_key", color: "#17A2B8", windsor: true, tagline: "ITSM ticket + incident data." },
  { id: "gorgias", name: "Gorgias", category: "support", status: "waitlist", authType: "oauth2", color: "#5D37AB", tagline: "E-commerce helpdesk analytics." },
  { id: "help_scout", name: "Help Scout", category: "support", status: "waitlist", authType: "oauth2", color: "#1292EE", tagline: "Email-first support metrics." },

  // ── Call Tracking ─────────────────────────────────────
  { id: "callrail", name: "CallRail", category: "call_tracking", status: "waitlist", authType: "api_key", color: "#45A2D9", windsor: true, tagline: "Inbound call attribution." },
  { id: "twilio", name: "Twilio", category: "call_tracking", status: "waitlist", authType: "api_key", color: "#F22F46", windsor: true, tagline: "SMS + voice programmable comms." },

  // ── Mobile Attribution ────────────────────────────────
  { id: "appsflyer", name: "AppsFlyer", category: "attribution", status: "waitlist", authType: "api_key", color: "#00D2FF", windsor: true, tagline: "Mobile install attribution." },
  { id: "adjust", name: "Adjust", category: "attribution", status: "waitlist", authType: "api_key", color: "#4285F4", windsor: true, tagline: "Mobile attribution + fraud detection." },
  { id: "branch", name: "Branch", category: "attribution", status: "waitlist", authType: "api_key", color: "#4B33D6", windsor: true, tagline: "Deep-linking + attribution." },

  // ── Product Analytics ─────────────────────────────────
  { id: "mixpanel", name: "Mixpanel", category: "product_analytics", status: "waitlist", authType: "api_key", color: "#7856FF", windsor: true, tagline: "Event-based product analytics." },
  { id: "amplitude", name: "Amplitude", category: "product_analytics", status: "waitlist", authType: "api_key", color: "#1E61F0", windsor: true, tagline: "Product usage + cohort analysis." },
  { id: "posthog", name: "PostHog", category: "product_analytics", status: "waitlist", authType: "api_key", color: "#000000", windsor: true, tagline: "Open-source product analytics." },
  { id: "pendo", name: "Pendo", category: "product_analytics", status: "waitlist", authType: "api_key", color: "#FF6F3C", windsor: true, tagline: "Product adoption + guides." },
  { id: "gainsight_px", name: "Gainsight PX", category: "product_analytics", status: "waitlist", authType: "api_key", color: "#1F6FEB", windsor: true, tagline: "Product experience analytics." },
  { id: "heap", name: "Heap", category: "product_analytics", status: "waitlist", authType: "api_key", color: "#5D48DB", tagline: "Auto-capture product analytics." },
  { id: "hotjar", name: "Hotjar", category: "product_analytics", status: "waitlist", authType: "api_key", color: "#FD3A5C", tagline: "Session recordings + heatmaps." },
  { id: "fullstory", name: "Fullstory", category: "product_analytics", status: "waitlist", authType: "api_key", color: "#FF3A00", tagline: "Digital experience analytics." },

  // ── SEO Tools ─────────────────────────────────────────
  { id: "pagespeed", name: "PageSpeed Insights", category: "seo_tools", status: "live", authType: "api_key", color: "#4285F4", windsor: true, tagline: "Core Web Vitals + Lighthouse scores." },
  { id: "ahrefs", name: "Ahrefs", category: "seo_tools", status: "waitlist", authType: "api_key", color: "#0070F3", tagline: "Backlinks, keyword rankings, site audit." },
  { id: "semrush", name: "Semrush", category: "seo_tools", status: "waitlist", authType: "api_key", color: "#FF642D", tagline: "Rank tracking + competitive SEO." },
  { id: "moz", name: "Moz", category: "seo_tools", status: "waitlist", authType: "api_key", color: "#1DA1F2", tagline: "Domain authority + link explorer." },
  { id: "dragonmetrics", name: "Dragon Metrics", category: "seo_tools", status: "waitlist", authType: "api_key", color: "#D7282A", windsor: true, tagline: "Multi-engine rank tracking." },
  { id: "serpstat", name: "Serpstat", category: "seo_tools", status: "waitlist", authType: "api_key", color: "#FF6B00", windsor: true, tagline: "Budget SEO research suite." },
  { id: "gbp", name: "Google Business Profile", category: "seo_tools", status: "live", authType: "oauth2", provider: "google", color: "#4285F4", windsor: true, tagline: "Listings, reviews, calls, directions." },

  // ── Reviews ───────────────────────────────────────────
  { id: "trustpilot", name: "Trustpilot", category: "reviews", status: "waitlist", authType: "oauth2", color: "#00B67A", tagline: "Review volume + sentiment." },
  { id: "yotpo", name: "Yotpo", category: "reviews", status: "waitlist", authType: "oauth2", color: "#2962FF", windsor: true, tagline: "E-commerce reviews + loyalty." },
  { id: "appfollow", name: "AppFollow", category: "reviews", status: "waitlist", authType: "api_key", color: "#FF5722", windsor: true, tagline: "App Store + Play Store reviews." },
  { id: "delighted", name: "Delighted", category: "reviews", status: "waitlist", authType: "api_key", color: "#FF5A5F", windsor: true, tagline: "NPS + CSAT surveys." },
  { id: "retently", name: "Retently", category: "reviews", status: "waitlist", authType: "api_key", color: "#2979FF", windsor: true, tagline: "Customer feedback + NPS." },

  // ── Forms ─────────────────────────────────────────────
  { id: "gravity_forms", name: "Gravity Forms", category: "forms", status: "waitlist", authType: "api_key", color: "#F15A29", windsor: true, tagline: "WordPress form submissions." },
  { id: "typeform", name: "Typeform", category: "forms", status: "waitlist", authType: "oauth2", color: "#262627", tagline: "Conversational forms + surveys." },
  { id: "surveymonkey", name: "SurveyMonkey", category: "forms", status: "waitlist", authType: "oauth2", color: "#00BF6F", windsor: true, tagline: "Survey responses + analysis." },
  { id: "jotform", name: "Jotform", category: "forms", status: "waitlist", authType: "api_key", color: "#F59A23", tagline: "Form builder submissions." },

  // ── Payments ──────────────────────────────────────────
  { id: "stripe", name: "Stripe", category: "payments", status: "coming_soon", eta: "June 2026", authType: "oauth2", provider: "stripe", color: "#635BFF", windsor: true, tagline: "Gross volume, MRR, churn, payouts." },
  { id: "paypal", name: "PayPal", category: "payments", status: "waitlist", authType: "oauth2", color: "#00457C", windsor: true, tagline: "Transaction volume + refunds." },
  { id: "braintree", name: "Braintree", category: "payments", status: "waitlist", authType: "oauth2", color: "#3D95CE", windsor: true, tagline: "PayPal-owned payment processing." },
  { id: "square", name: "Square", category: "payments", status: "waitlist", authType: "oauth2", color: "#3E4348", windsor: true, tagline: "POS + online payments." },

  // ── Subscriptions ─────────────────────────────────────
  { id: "chargebee", name: "Chargebee", category: "subscriptions", status: "waitlist", authType: "api_key", color: "#FF6600", windsor: true, tagline: "Subscription billing + revenue ops." },
  { id: "recurly", name: "Recurly", category: "subscriptions", status: "waitlist", authType: "api_key", color: "#4B40B4", tagline: "Subscription lifecycle metrics." },
  { id: "chartmogul", name: "ChartMogul", category: "subscriptions", status: "waitlist", authType: "api_key", color: "#0D233F", windsor: true, tagline: "Subscription analytics (MRR, churn, LTV)." },
  { id: "profitwell", name: "ProfitWell (Paddle)", category: "subscriptions", status: "waitlist", authType: "api_key", color: "#1F85DE", windsor: true, tagline: "Retention + pricing analytics." },
  { id: "recharge", name: "Recharge", category: "subscriptions", status: "waitlist", authType: "api_key", perClient: true, color: "#F26822", windsor: true, tagline: "Shopify subscription commerce." },
  { id: "maxio", name: "Maxio", category: "subscriptions", status: "waitlist", authType: "api_key", color: "#41B883", windsor: true, tagline: "B2B subscription billing." },

  // ── Finance / Accounting ──────────────────────────────
  { id: "quickbooks", name: "QuickBooks", category: "finance", status: "waitlist", authType: "oauth2", color: "#2CA01C", windsor: true, tagline: "Accounting P&L + cash flow." },
  { id: "xero", name: "Xero", category: "finance", status: "waitlist", authType: "oauth2", color: "#13B5EA", windsor: true, tagline: "SMB accounting performance." },
  { id: "netsuite", name: "NetSuite", category: "finance", status: "waitlist", authType: "oauth1", color: "#125B94", windsor: true, tagline: "Enterprise ERP financials." },
  { id: "fastbill", name: "FastBill", category: "finance", status: "waitlist", authType: "api_key", color: "#2A3F74", windsor: true, tagline: "German SMB invoicing." },

  // ── Affiliate ─────────────────────────────────────────
  { id: "impact", name: "Impact", category: "affiliate", status: "waitlist", authType: "api_key", color: "#32BBFE", windsor: true, tagline: "Partnership + affiliate ROI." },
  { id: "cj_affiliate", name: "CJ Affiliate", category: "affiliate", status: "waitlist", authType: "api_key", color: "#FFC20E", windsor: true, tagline: "Affiliate network sales." },
  { id: "awin", name: "Awin", category: "affiliate", status: "waitlist", authType: "api_key", color: "#A1009F", windsor: true, tagline: "European affiliate network." },
  { id: "shareasale", name: "ShareASale", category: "affiliate", status: "waitlist", authType: "api_key", color: "#0071BC", windsor: true, tagline: "Affiliate performance + commissions." },
  { id: "rakuten", name: "Rakuten Advertising", category: "affiliate", status: "waitlist", authType: "oauth2", color: "#BF0000", windsor: true, tagline: "Affiliate publishing network." },
  { id: "partnerstack", name: "PartnerStack", category: "affiliate", status: "waitlist", authType: "api_key", color: "#1A0061", windsor: true, tagline: "B2B partner programs." },
  { id: "firstpromoter", name: "FirstPromoter", category: "affiliate", status: "waitlist", authType: "api_key", color: "#2CA8E6", windsor: true, tagline: "SaaS affiliate tracking." },
  { id: "everflow", name: "Everflow", category: "affiliate", status: "waitlist", authType: "api_key", color: "#FF6B00", windsor: true, tagline: "Performance marketing platform." },

  // ── Productivity ──────────────────────────────────────
  { id: "notion", name: "Notion", category: "productivity", status: "waitlist", authType: "oauth2", color: "#000000", windsor: true, tagline: "Docs + project databases." },
  { id: "airtable", name: "Airtable", category: "productivity", status: "waitlist", authType: "oauth2", color: "#18BFFF", windsor: true, tagline: "Flexible database + workflows." },
  { id: "coda", name: "Coda", category: "productivity", status: "waitlist", authType: "oauth2", color: "#F46A54", windsor: true, tagline: "Docs-as-apps data." },
  { id: "monday", name: "Monday", category: "productivity", status: "waitlist", authType: "oauth2", color: "#FF3D57", windsor: true, tagline: "Work management + CRM." },
  { id: "clickup", name: "ClickUp", category: "productivity", status: "waitlist", authType: "oauth2", color: "#7B68EE", windsor: true, tagline: "Project management + tasks." },
  { id: "jira", name: "Jira", category: "productivity", status: "waitlist", authType: "oauth2", color: "#0052CC", windsor: true, tagline: "Engineering issues + sprints." },
  { id: "trello", name: "Trello", category: "productivity", status: "waitlist", authType: "oauth1", color: "#0079BF", windsor: true, tagline: "Kanban board activity." },
  { id: "asana", name: "Asana", category: "productivity", status: "waitlist", authType: "oauth2", color: "#F06A6A", tagline: "Project tasks + throughput." },
  { id: "slack", name: "Slack", category: "productivity", status: "waitlist", authType: "oauth2", color: "#4A154B", windsor: true, tagline: "Workspace messaging metrics." },

  // Warehouses and spreadsheets moved to destinations catalog (src/lib/destinations/catalog.ts).
  // They're outbound targets Arlo WRITES to, not inbound sources Arlo READS from.
];

export const CATEGORY_LABELS: Record<ConnectorCategory, string> = {
  analytics: "Analytics",
  search: "Search Console",
  search_ads: "Search Ads",
  social_ads: "Social Ads",
  social_organic: "Social Organic",
  programmatic: "Programmatic / DSP",
  ecommerce: "E-commerce",
  crm: "CRM",
  email: "Email Marketing",
  support: "Customer Support",
  call_tracking: "Call Tracking",
  attribution: "Mobile Attribution",
  product_analytics: "Product Analytics",
  seo_tools: "SEO Tools",
  reviews: "Reviews & Surveys",
  forms: "Forms",
  payments: "Payments",
  subscriptions: "Subscriptions",
  finance: "Finance / Accounting",
  affiliate: "Affiliate Networks",
  productivity: "Productivity",
  ab_testing: "A/B Testing",
  data: "Data Warehouse",
};

export function byCategory(entries: CatalogEntry[] = CONNECTOR_CATALOG): Record<string, CatalogEntry[]> {
  return entries.reduce<Record<string, CatalogEntry[]>>((acc, c) => {
    (acc[c.category] ||= []).push(c);
    return acc;
  }, {});
}

export function byStatus(status: ConnectorStatus): CatalogEntry[] {
  return CONNECTOR_CATALOG.filter((c) => c.status === status);
}

export const CATALOG_COUNT = CONNECTOR_CATALOG.length;
export const LIVE_COUNT = CONNECTOR_CATALOG.filter((c) => c.status === "live").length;
export const COMING_SOON_COUNT = CONNECTOR_CATALOG.filter((c) => c.status === "coming_soon").length;
export const WAITLIST_COUNT = CONNECTOR_CATALOG.filter((c) => c.status === "waitlist").length;
