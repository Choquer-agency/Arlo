import type { Metadata } from "next";
import Link from "next/link";
import { ClientLayout } from "@/components/ClientLayout";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CtaBanner } from "@/components/CtaBanner";
import { getAllCaseStudies } from "@/content/case-studies";
import { AGENCY_NAME } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: `Case Studies | ${AGENCY_NAME}`,
  description:
    "Real results from real companies. See how mid-market businesses replaced expensive SaaS with custom software they own.",
};

export default function WorkHub() {
  const caseStudies = getAllCaseStudies();

  return (
    <ClientLayout>
      <Nav />

      <header className="section-space-hero" style={{ backgroundColor: "#EBFFF6" }}>
        <div className="u-container">
          <p className="eyebrow text-brand mb-4">Case Studies</p>
          <h1 className="font-sans font-medium text-fluid-h1 leading-[1.1] tracking-tight text-dark max-w-[16ch] mb-6">
            Real results. Real savings.
          </h1>
          <p className="font-sans text-fluid-large text-dark opacity-60 max-w-[48ch] leading-relaxed">
            See how companies replaced expensive SaaS subscriptions with custom
            software they own — and the measurable impact on their bottom line.
          </p>
        </div>
      </header>

      <section className="section-space-main">
        <div className="u-container">
          <div className="grid gap-8">
            {caseStudies.map((cs) => (
              <Link
                key={cs.slug}
                href={`/work/${cs.slug}`}
                className="group grid md:grid-cols-[1fr_300px] gap-8 p-8 md:p-10 rounded-xl border border-dark-faded hover:border-brand/30 transition-all"
                style={{ transitionDuration: "0.3s" }}
              >
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider opacity-40 mb-2">
                    {cs.industry}
                  </p>
                  <h2 className="font-sans font-medium text-fluid-h4 text-dark mb-3 group-hover:text-brand transition-colors">
                    {cs.headline}
                  </h2>
                  <p className="font-sans text-fluid-main text-dark opacity-50 leading-relaxed mb-4">
                    {cs.summary}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="font-mono text-xs text-dark opacity-40">Replaced:</span>
                    <span className="font-mono text-xs px-2 py-1 rounded bg-grey text-dark opacity-60">
                      {cs.saasReplaced}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 self-center">
                  {cs.metrics.slice(0, 4).map((metric) => (
                    <div
                      key={metric.label}
                      className="text-center p-4 rounded-lg"
                      style={{ backgroundColor: cs.color + "15" }}
                    >
                      <p className="font-display text-fluid-h4 text-brand">
                        {metric.value}
                      </p>
                      <p className="font-sans text-xs text-dark opacity-50 mt-1">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
      <Footer />
    </ClientLayout>
  );
}
