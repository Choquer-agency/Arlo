import { siteConfig, SITE_URL, AGENCY_NAME, CONTACT_EMAIL } from "@/lib/siteConfig";
import { faqs, pricingTiers } from "@/content/shared";

/**
 * Site-level JSON-LD for ARLO (a SaaS MCP connector — NOT an agency). Rendered
 * on the homepage. Describes the real product, entity, founder, pricing offers,
 * and FAQ so Google and AI answer engines model Arlo correctly and as a
 * STANDALONE product (not Choquer Agency / FuturLabs).
 */
export function generateSchema() {
  // Map the real pricing tiers to Offers.
  const offers = pricingTiers.map((t) => {
    const num = t.priceRange.replace(/[^0-9.]/g, "");
    const isCustom = t.priceRange.toLowerCase().includes("custom") || num === "";
    return {
      "@type": "Offer",
      name: t.name,
      priceCurrency: "USD",
      price: isCustom ? "0" : num,
      description: t.description,
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/#pricing`,
      ...(isCustom ? { eligibleCustomerType: "Enterprise (custom pricing)" } : {}),
    };
  });

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

      {
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
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: "0",
          highPrice: "499",
          offerCount: pricingTiers.length,
          offers,
        },
      },

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
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
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
