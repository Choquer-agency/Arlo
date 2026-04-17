import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientLayout } from "@/components/ClientLayout";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CtaBanner } from "@/components/CtaBanner";
import { AGENCY_NAME, SITE_URL } from "@/lib/siteConfig";
import { getComparisonBySlug, getAllComparisonSlugs } from "@/content/comparisons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllComparisonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getComparisonBySlug(slug);
  if (!page) return { title: "Not Found" };

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url: `${SITE_URL}/compare/${page.slug}`,
      siteName: AGENCY_NAME,
      type: "article",
    },
    alternates: { canonical: `${SITE_URL}/compare/${page.slug}` },
  };
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getComparisonBySlug(slug);
  if (!page) notFound();

  const { sections } = page;

  const comparisonSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: page.title,
        description: page.metaDescription,
        url: `${SITE_URL}/compare/${page.slug}`,
        dateModified: page.lastUpdated,
        publisher: { "@id": `${SITE_URL}/#business` },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE_URL}/compare` },
            { "@type": "ListItem", position: 3, name: page.saasName },
          ],
        },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonSchema) }}
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
              <li className="opacity-60 truncate max-w-[40ch]">{page.saasName} Alternatives</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-brand">Comparison</span>
              <span className="font-mono text-xs text-dark opacity-30">Updated {new Date(page.lastUpdated).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            </div>
            <h1 className="font-sans font-medium text-fluid-h2 leading-[1.1] text-dark mb-6">
              {page.title}
            </h1>
            {/* Answer-first TL;DR */}
            <div className="p-6 rounded-md border-l-4" style={{ borderColor: "#D0FF71", backgroundColor: "#EBFFF6" }}>
              <p className="font-sans text-fluid-main text-dark leading-relaxed">
                <strong>TL;DR:</strong> {page.tldr}
              </p>
            </div>
          </header>

          {/* Problem Section */}
          <section className="mb-16">
            <h2 className="font-sans font-medium text-fluid-h4 text-dark mb-4">{sections.problem.heading}</h2>
            <p className="font-sans text-fluid-main text-dark opacity-70 leading-relaxed">{sections.problem.body}</p>
          </section>

          {/* Comparison Table */}
          <section className="mb-16">
            <h2 className="font-sans font-medium text-fluid-h4 text-dark mb-6">Feature Comparison</h2>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-dark/20">
                    {sections.table.headers.map((header, i) => (
                      <th
                        key={header}
                        className={`py-3 px-4 font-sans font-medium text-dark text-left ${
                          i === sections.table.headers.length - 1 ? "bg-brand/10" : ""
                        }`}
                      >
                        {header}
                        {i === sections.table.headers.length - 1 && (
                          <span className="block font-mono text-[10px] text-brand uppercase tracking-wider mt-0.5">
                            Recommended
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sections.table.rows.map((row) => (
                    <tr key={row.feature} className="border-b border-dark/10 hover:bg-dark/[0.02]">
                      <td className="py-3 px-4 font-sans font-medium text-dark text-sm">{row.feature}</td>
                      {row.values.map((value, i) => (
                        <td
                          key={`${row.feature}-${i}`}
                          className={`py-3 px-4 font-sans text-dark opacity-70 text-sm ${
                            i === row.values.length - 1 ? "bg-brand/10 font-medium opacity-100" : ""
                          }`}
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* TCO Section */}
          {sections.tco && (
            <section className="mb-16">
              <h2 className="font-sans font-medium text-fluid-h4 text-dark mb-6">{sections.tco.heading}</h2>
              <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-dark/20">
                      <th className="py-3 px-4 font-sans font-medium text-dark text-left">Cost Category</th>
                      <th className="py-3 px-4 font-sans font-medium text-dark text-left">{page.saasName}</th>
                      <th className="py-3 px-4 font-sans font-medium text-dark text-left bg-brand/10">Custom Software</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.tco.rows.map((row) => (
                      <tr
                        key={row.label}
                        className={`border-b border-dark/10 ${
                          row.label.includes("Total") || row.label.includes("Cumulative") ? "font-medium bg-dark/[0.03]" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-sans text-dark text-sm">{row.label}</td>
                        <td className="py-3 px-4 font-sans text-dark opacity-70 text-sm">{row.saas}</td>
                        <td className="py-3 px-4 font-sans text-dark text-sm bg-brand/10">{row.custom}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 font-sans text-sm text-brand font-medium">{sections.tco.savingsNote}</p>
            </section>
          )}

          {/* When to Choose */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <section className="p-6 rounded-md" style={{ backgroundColor: "#EBFFF6" }}>
              <h3 className="font-sans font-medium text-fluid-h5 text-dark mb-4">Choose custom software when:</h3>
              <ul className="space-y-3">
                {sections.whenCustom.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-brand mt-1 flex-shrink-0">&#10003;</span>
                    <span className="font-sans text-sm text-dark opacity-70">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="p-6 rounded-md bg-dark/[0.03]">
              <h3 className="font-sans font-medium text-fluid-h5 text-dark mb-4">Stay with {page.saasName} when:</h3>
              <ul className="space-y-3">
                {sections.whenSaas.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-dark opacity-30 mt-1 flex-shrink-0">&mdash;</span>
                    <span className="font-sans text-sm text-dark opacity-70">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Case Study */}
          {sections.caseStudy && (
            <section className="mb-16 p-8 rounded-md border border-dark-faded">
              <p className="font-mono text-xs uppercase tracking-wider text-brand mb-3">Real-World Result</p>
              <h3 className="font-sans font-medium text-fluid-h5 text-dark mb-2">
                {sections.caseStudy.client}: {sections.caseStudy.headline}
              </h3>
              <ul className="space-y-2 mt-4 mb-4">
                {sections.caseStudy.metrics.map((metric) => (
                  <li key={metric} className="flex items-start gap-2">
                    <span className="text-brand font-bold">&#8226;</span>
                    <span className="font-sans text-sm text-dark opacity-70 font-medium">{metric}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/work/${sections.caseStudy.slug}`}
                className="font-sans text-sm text-brand hover:opacity-70 transition-opacity"
              >
                Read the full case study &rarr;
              </Link>
            </section>
          )}

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

          {/* Back Link */}
          <div className="mb-8">
            <Link
              href={`/services/${page.serviceSlug}`}
              className="font-sans text-fluid-main text-brand hover:opacity-70 transition-opacity"
            >
              &larr; Learn more about our {page.saasCategory} service
            </Link>
          </div>
        </article>
      </main>

      <CtaBanner />
      <Footer />
    </ClientLayout>
  );
}
