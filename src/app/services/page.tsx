import type { Metadata } from "next";
import { ClientLayout } from "@/components/ClientLayout";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getTier2Services } from "@/content/services";
import { AGENCY_NAME } from "@/lib/siteConfig";
import { ServicePillars } from "@/components/ServicePillars";

export const metadata: Metadata = {
  title: `Services | ${AGENCY_NAME}`,
  description:
    "How each role at your agency uses ARLO — SEO and Google Ads specialists, account managers, agency owners, and solo business owners — to query live marketing data from Claude, no exports or dashboards required.",
};

export default function ServicesHub() {
  const tier2 = getTier2Services();

  return (
    <ClientLayout>
      <Nav />

      <header className="section-space-hero" style={{ backgroundColor: "#EBFFF6" }}>
        <div className="u-container">
          <p className="eyebrow text-brand mb-4">Services</p>
          <h1 className="font-sans font-medium text-fluid-h1 leading-[1.1] tracking-tight text-dark max-w-[18ch] mb-6">
            One connector. Every role at your agency.
          </h1>
          <p className="font-sans text-fluid-large text-dark opacity-60 max-w-[48ch] leading-relaxed">
            See how SEO specialists, paid-media managers, account managers, and agency
            owners each use {AGENCY_NAME} to get live answers from GA4, Search Console,
            Google Ads, and more — without leaving Claude.
          </p>
        </div>
      </header>

      <ServicePillars />

      <section className="section-space-main" style={{ backgroundColor: "#EBFFF6" }}>
        <div className="u-container">
          <h2 className="font-sans font-medium text-fluid-h3 text-dark mb-8">
            More roles
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tier2.map((service) => (
              <div
                key={service.slug}
                className="p-6 rounded-lg border border-dark-faded bg-white"
              >
                <div
                  className="w-3 h-3 rounded-full mb-4"
                  style={{ backgroundColor: service.color }}
                />
                <h3 className="font-sans font-medium text-fluid-h6 text-dark mb-2">
                  {service.shortTitle}
                </h3>
                <p className="font-sans text-sm text-dark opacity-50 leading-relaxed mb-3">
                  {service.description}
                </p>
                <p className="font-mono text-xs text-brand">Coming soon</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </ClientLayout>
  );
}
