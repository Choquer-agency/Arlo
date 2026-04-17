import { siteConfig, SITE_URL, AGENCY_NAME, CONTACT_EMAIL, PHONE } from "@/lib/siteConfig";
import { faqs, processSteps } from "@/content/shared";
import { getTier1Services } from "@/content/services";

export function generateSchema() {
  const services = getTier1Services();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": `${SITE_URL}/#business`,
        name: AGENCY_NAME,
        description: siteConfig.description,
        url: SITE_URL,
        telephone: PHONE,
        email: CONTACT_EMAIL,
        founder: { "@id": `${SITE_URL}/#founder` },
        areaServed: [
          { "@type": "Country", name: "Canada" },
          { "@type": "Country", name: "United States" },
        ],
        priceRange: "$15,000 - $400,000+",
        serviceType: services.map((s) => s.title),
        knowsAbout: [
          "Custom Software Development",
          "AI Agent Development",
          "AI Development Agency",
          "SaaS Replacement",
          "CRM Development",
          "ERP Development",
          "Business Process Automation",
          "Workflow Automation",
          "Business Intelligence",
          "Legacy System Modernization",
        ],
        sameAs: [
          siteConfig.social.linkedin,
          siteConfig.social.twitter,
          siteConfig.social.github,
        ],
      },

      {
        "@type": "Person",
        "@id": `${SITE_URL}/#founder`,
        name: siteConfig.founder,
        jobTitle: "Founder & CEO",
        url: `${SITE_URL}/about`,
        worksFor: { "@id": `${SITE_URL}/#business` },
        knowsAbout: [
          "AI Software Development",
          "Custom Software Architecture",
          "SaaS Replacement Strategy",
          "AI Agent Development",
          "Enterprise Software",
          "Mid-Market Technology",
        ],
        sameAs: [
          "https://linkedin.com/in/brycechoquer",
        ],
      },

      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: AGENCY_NAME,
        publisher: { "@id": `${SITE_URL}/#business` },
      },

      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: `${AGENCY_NAME} | AI-Powered Custom Software That Replaces SaaS`,
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
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },

      {
        "@type": "HowTo",
        name: "Our Custom Software Development Process",
        description: "Our five-step process for replacing SaaS with custom software you own.",
        step: processSteps.map((s) => ({
          "@type": "HowToStep",
          position: s.step,
          name: s.title,
          text: s.description,
        })),
      },

      ...services.map((service) => ({
        "@type": "Service",
        serviceType: service.title,
        name: service.title,
        description: service.description,
        url: `${SITE_URL}/services/${service.slug}`,
        provider: { "@id": `${SITE_URL}/#business` },
        areaServed: [
          { "@type": "Country", name: "Canada" },
          { "@type": "Country", name: "United States" },
        ],
        audience: {
          "@type": "BusinessAudience",
          audienceType: "Mid-market companies ($10M–$250M revenue)",
        },
        offers: {
          "@type": "Offer",
          description: `Custom ${service.shortTitle} development — replaces ${service.replaces.join(", ")}`,
          priceCurrency: "USD",
        },
      })),

      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
        ],
      },
    ],
  };
}
