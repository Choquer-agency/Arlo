import { siteConfig, SITE_URL, AGENCY_NAME, CONTACT_EMAIL } from "@/lib/siteConfig";

/**
 * The SoftwareApplication node, kept standalone (not just inlined in
 * generateSchema()'s @graph) so pages that don't use the homepage's full
 * graph — e.g. the /services/* persona pages — can still embed the real
 * Offer data instead of carrying none at all.
 *
 * Pricing source of truth is the live `/pricing` page
 * (`src/app/pricing/_content/pricing.ts`): ARLO is free for everyone during
 * early access, full stop — "we'll introduce pricing down the road." It is
 * NOT `src/content/shared.ts`'s `pricingTiers` (Free/Solo $19/Studio $99/
 * Agency $249/Scale $499/Enterprise), which models a paid-tier structure
 * that was never shipped and isn't rendered on any live page (`Pricing.tsx`,
 * the only component that reads it, is never imported anywhere). Building
 * an AggregateOffer from that array — as this function previously did —
 * told Google/AI crawlers ARLO charges $19–$499/mo and linked every tier to
 * `/#pricing`, an anchor that doesn't exist on the current homepage: the
 * exact live-pricing-drift failure mode `llms.txt` was fixed for earlier.
 */
export function getSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: AGENCY_NAME,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Marketing analytics / MCP connector",
    operatingSystem: "Web, Claude Desktop (MCP)",
    url: SITE_URL,
    description: siteConfig.description,
    publisher: { "@id": `${SITE_URL}/#business` },
    featureList: [
      "One OAuth connects GA4, Search Console, Google Ads, YouTube, and Business Profile",
      "Live conversational reporting inside Claude via MCP — no exports, no dashboards, no warehouse",
      "Per-client account assignment across every connected platform",
      "Per-user MCP tokens with rotate + revoke and full audit log",
      "Pass-through data model — no ETL, no persistent client data",
    ],
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: "0",
      description:
        "Free for every feature, every client, and every destination during early access — no credit card, no usage limits. Paid plans will be introduced later.",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/pricing`,
    },
  };
}

/**
 * Site-level JSON-LD for ARLO (a SaaS MCP connector — NOT an agency). Rendered
 * on the homepage. Describes the real product, entity, founder, pricing offers,
 * and FAQ so Google and AI answer engines model Arlo correctly and as a
 * STANDALONE product (not Choquer Agency / FuturLabs).
 */
export function generateSchema() {
  const { "@context": _ctx, ...softwareApplication } = getSoftwareApplicationSchema();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#business`,
        name: AGENCY_NAME,
        legalName: "ARLO",
        description: siteConfig.description,
        url: SITE_URL,
        email: CONTACT_EMAIL,
        founder: { "@id": `${SITE_URL}/#founder` },
        foundingDate: "2026",
        areaServed: [
          { "@type": "Country", name: "United States" },
          { "@type": "Country", name: "Canada" },
        ],
        knowsAbout: [
          "Model Context Protocol",
          "MCP server",
          "Claude connector",
          "AI marketing analytics",
          "Marketing agency reporting",
          "GA4 reporting",
          "Google Search Console",
          "Google Ads reporting",
          "Meta Ads reporting",
          "Conversational analytics",
        ],
        sameAs: [
          siteConfig.social.linkedin,
          siteConfig.social.twitter,
          siteConfig.social.github,
        ],
      },

      softwareApplication,

      {
        "@type": "Person",
        "@id": `${SITE_URL}/#founder`,
        name: siteConfig.founder,
        jobTitle: "Founder",
        url: `${SITE_URL}/about`,
        worksFor: { "@id": `${SITE_URL}/#business` },
        knowsAbout: [
          "Model Context Protocol",
          "AI marketing analytics",
          "Marketing agency operations",
          "Claude / MCP development",
        ],
        sameAs: ["https://linkedin.com/in/brycechoquer"],
      },

      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: AGENCY_NAME,
        description: siteConfig.description,
        publisher: { "@id": `${SITE_URL}/#business` },
      },

      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: `${AGENCY_NAME} | Ask Claude about any client, any platform`,
        description: siteConfig.description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#business` },
      },

      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        ],
      },
    ],
  };
}
