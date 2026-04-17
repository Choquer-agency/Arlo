import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientLayout } from "@/components/ClientLayout";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CtaBanner } from "@/components/CtaBanner";
import { getCaseStudy, getAllCaseStudySlugs } from "@/content/case-studies";

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) return {};
  return {
    title: cs.metaTitle,
    description: cs.metaDescription,
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);

  if (!cs) {
    notFound();
  }

  return (
    <ClientLayout>
      <Nav />

      {/* Hero */}
      <header className="section-space-hero" style={{ backgroundColor: "#EBFFF6" }}>
        <div className="u-container">
          <div className="max-w-[60rem]">
            <Link
              href="/work"
              className="font-mono text-xs text-brand hover:underline mb-4 inline-block"
            >
              &larr; All Case Studies
            </Link>
            <p className="eyebrow opacity-50 mb-4">{cs.industry}</p>
            <h1 className="font-sans font-medium text-fluid-h2 leading-[1.1] tracking-tight text-dark max-w-[22ch] mb-6">
              {cs.headline}
            </h1>
            <p className="font-sans text-fluid-large text-dark opacity-60 max-w-[50ch] leading-relaxed">
              {cs.summary}
            </p>
          </div>
        </div>
      </header>

      {/* Metrics */}
      <section className="py-12 border-y border-dark-faded">
        <div className="u-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {cs.metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <p className="font-display text-fluid-h2 text-brand">{metric.value}</p>
                <p className="font-sans text-sm text-dark opacity-50 mt-1">{metric.label}</p>
                {metric.description && (
                  <p className="font-sans text-xs text-dark opacity-30 mt-1">{metric.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge & Solution */}
      <section className="section-space-main">
        <div className="u-container">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <p className="eyebrow text-brand mb-4">The Challenge</p>
              <p className="font-sans text-fluid-main text-dark opacity-60 leading-relaxed">
                {cs.challenge}
              </p>
            </div>
            <div>
              <p className="eyebrow text-brand mb-4">The Solution</p>
              <p className="font-sans text-fluid-main text-dark opacity-60 leading-relaxed">
                {cs.solution}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section-space-small" style={{ backgroundColor: "#EBFFF6" }}>
        <div className="u-container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="eyebrow text-brand mb-4">Technology</p>
            <div className="flex flex-wrap justify-center gap-3">
              {cs.techStack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-sm px-4 py-2 rounded-full border border-dark-faded text-dark opacity-60"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      {cs.testimonial && (
        <section className="section-space-main">
          <div className="u-container">
            <div className="max-w-3xl mx-auto text-center">
              <blockquote>
                <p className="font-sans text-fluid-h4 text-dark leading-[1.3] mb-6">
                  &ldquo;{cs.testimonial.quote}&rdquo;
                </p>
                <p className="font-sans text-fluid-main text-dark opacity-50">
                  — {cs.testimonial.name}, {cs.testimonial.title}
                </p>
              </blockquote>
            </div>
          </div>
        </section>
      )}

      <CtaBanner />
      <Footer />
    </ClientLayout>
  );
}
