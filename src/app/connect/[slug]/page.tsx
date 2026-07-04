import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientLayout } from "@/components/ClientLayout";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CtaBanner } from "@/components/CtaBanner";
import { AGENCY_NAME, SITE_URL } from "@/lib/siteConfig";
import { getConnectorBySlug, getAllConnectorSlugs, connectors } from "@/content/connectors";
import { getServiceConfig } from "@/content/services";
import { getComparisonBySlug } from "@/content/comparisons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllConnectorSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getConnectorBySlug(slug);
  if (!page) return { title: "Not Found" };

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url: `${SITE_URL}/connect/${page.slug}`,
      siteName: AGENCY_NAME,
      type: "article",
    },
    alternates: { canonical: `${SITE_URL}/connect/${page.slug}` },
  };
}

export default async function ConnectorPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getConnectorBySlug(slug);
  if (!page) notFound();

  const { sections } = page;
  const relatedServices = page.relatedServiceSlugs
    .map((s) => getServiceConfig(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const relatedComparisons = page.relatedComparisonSlugs
    .map((s) => getComparisonBySlug(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const relatedConnectors = page.relatedConnectorSlugs
    .map((s) => connectors[s])
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const connectorSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: page.title,
        description: page.metaDescription,
        url: `${SITE_URL}/connect/${page.slug}`,
        dateModified: page.lastUpdated,
        publisher: { "@id": `${SITE_URL}/#business` },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
            { "@type": "ListItem", position: 3, name: page.sourceName },
          ],
        },
      },
      {
        "@type": "HowTo",
        name: `How to connect ${page.sourceName} to Claude`,
        description: page.tldr,
        step: sections.steps.map((step, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: step.title,
          text: step.description,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: sections.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <ClientLayout>
      <Nav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(connectorSchema) }}
      />

      <main className="pt-32 pb-20">
        <article className="u-container max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center gap-2 font-mono text-xs text-dark opacity-40">
              <li><Link href="/" className="hover:text-brand transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link href="/services" className="hover:text-brand transition-colors">Services</Link></li>
              <li>/</li>
              <li className="opacity-60 truncate max-w-[40ch]">{page.sourceName}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-brand">MCP Integration</span>
              <span className="font-mono text-xs text-dark opacity-30">Updated {new Date(page.lastUpdated).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            </div>
            <h1 className="font-sans font-medium text-fluid-h2 leading-[1.1] text-dark mb-6">
              {page.title}
            </h1>
            <div className="p-6 rounded-md border-l-4" style={{ borderColor: "#D0FF71", backgroundColor: "#EBFFF6" }}>
              <p className="font-sans text-fluid-main text-dark leading-relaxed">
                <strong>TL;DR:</strong> {page.tldr}
              </p>
            </div>
          </header>

          {/* Why */}
          <section className="mb-16">
            <h2 className="font-sans font-medium text-fluid-h4 text-dark mb-4">{sections.why.heading}</h2>
            <p className="font-sans text-fluid-main text-dark opacity-70 leading-relaxed">{sections.why.body}</p>
          </section>

          {/* 3-step connect */}
          <section className="mb-16">
            <h2 className="font-sans font-medium text-fluid-h4 text-dark mb-8">
              Connect {page.sourceShortName} in 3 steps
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {sections.steps.map((step, i) => (
                <div key={step.title} className="p-6 rounded-md border border-dark-faded">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: "#D0FF71" }}
                  >
                    <span className="font-display text-sm leading-none text-dark">{i + 1}</span>
                  </div>
                  <h3 className="font-sans font-medium text-fluid-h6 text-dark mb-2">{step.title}</h3>
                  <p className="font-sans text-sm text-dark opacity-70 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Example prompts */}
          <section className="mb-16">
            <h2 className="font-sans font-medium text-fluid-h4 text-dark mb-6">
              Things to ask Claude once {page.sourceShortName} is connected
            </h2>
            <ul className="space-y-3">
              {sections.prompts.map((prompt) => (
                <li
                  key={prompt}
                  className="p-4 rounded-md bg-dark/[0.03] font-mono text-sm text-dark opacity-80"
                >
                  &ldquo;{prompt}&rdquo;
                </li>
              ))}
            </ul>
          </section>

          {/* Metrics & dimensions */}
          <section className="mb-16">
            <h2 className="font-sans font-medium text-fluid-h4 text-dark mb-6">
              What Claude can query from {page.sourceShortName}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-sans font-medium text-sm uppercase tracking-wider text-dark opacity-50 mb-3">Metrics</h3>
                <ul className="space-y-3">
                  {sections.metrics.map((m) => (
                    <li key={m.name} className="flex gap-3">
                      <span className="text-brand mt-1 flex-shrink-0">&#10003;</span>
                      <span className="font-sans text-sm text-dark opacity-70">
                        <span className="font-medium opacity-100">{m.name}</span> — {m.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-sans font-medium text-sm uppercase tracking-wider text-dark opacity-50 mb-3">Dimensions</h3>
                <ul className="space-y-3">
                  {sections.dimensions.map((d) => (
                    <li key={d.name} className="flex gap-3">
                      <span className="text-brand mt-1 flex-shrink-0">&#10003;</span>
                      <span className="font-sans text-sm text-dark opacity-70">
                        <span className="font-medium opacity-100">{d.name}</span> — {d.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="font-sans font-medium text-fluid-h4 text-dark mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {sections.faqs.map((faq) => (
                <details key={faq.question} className="group border-b border-dark-faded pb-6">
                  <summary className="font-sans font-medium text-dark cursor-pointer list-none flex items-center justify-between">
                    {faq.question}
                    <span className="text-dark opacity-30 group-open:rotate-45 transition-transform text-xl ml-4">+</span>
                  </summary>
                  <p className="font-sans text-sm text-dark opacity-70 leading-relaxed mt-3">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Related links */}
          <div className="mb-8 flex flex-col gap-2">
            {relatedServices.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="font-sans text-fluid-main text-brand hover:opacity-70 transition-opacity"
              >
                &larr; See how {service.shortTitle.replace(/^For /, "")} use ARLO
              </Link>
            ))}
            {relatedComparisons.map((cmp) => (
              <Link
                key={cmp.slug}
                href={`/compare/${cmp.slug}`}
                className="font-sans text-fluid-main text-brand hover:opacity-70 transition-opacity"
              >
                &rarr; ARLO vs. {cmp.saasName}
              </Link>
            ))}
            {relatedConnectors.map((c) => (
              <Link
                key={c.slug}
                href={`/connect/${c.slug}`}
                className="font-sans text-fluid-main text-brand hover:opacity-70 transition-opacity"
              >
                &rarr; Connect {c.sourceShortName} to Claude
              </Link>
            ))}
          </div>
        </article>
      </main>

      <CtaBanner />
      <Footer />
    </ClientLayout>
  );
}
