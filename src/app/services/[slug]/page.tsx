import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientLayout } from "@/components/ClientLayout";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { FAQ } from "@/components/FAQ";
import { getServiceConfig, getTier1Services } from "@/content/services";
import HeroGridAnimation from "@/components/HeroGridAnimation";

const iconMap: Record<string, string> = {
  Users: "/images/icons/Group 1707479797.svg",
  Building2: "/images/icons/Group 1707479803.svg",
  Bot: "/images/icons/Group 1707479804.svg",
  Workflow: "/images/icons/Group 1707479806.svg",
  BarChart3: "/images/icons/Group 1707479807.svg",
  RefreshCcw: "/images/icons/Group 1707479808.svg",
};

const serviceColorFilters: Record<string, string> = {
  Users: "brightness(0) saturate(100%) invert(78%) sepia(52%) saturate(500%) hue-rotate(107deg)",
  Building2: "brightness(0) saturate(100%) invert(58%) sepia(89%) saturate(400%) hue-rotate(212deg)",
  Bot: "brightness(0) saturate(100%) invert(88%) sepia(40%) saturate(600%) hue-rotate(30deg)",
  Workflow: "brightness(0) saturate(100%) invert(55%) sepia(80%) saturate(500%) hue-rotate(310deg)",
  BarChart3: "brightness(0) saturate(100%) invert(70%) sepia(60%) saturate(600%) hue-rotate(160deg)",
  RefreshCcw: "brightness(0) saturate(100%) invert(72%) sepia(50%) saturate(500%) hue-rotate(350deg)",
};

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getTier1Services().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceConfig(slug);
  if (!service) return {};
  return {
    title: service.metaTitle,
    description: service.metaDescription,
  };
}

const stepColors = ["#D0FF71", "#27EAA6", "#8F93FF", "#EBFFF6", "#004D43"];

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceConfig(slug);

  if (!service || service.tier !== 1) {
    notFound();
  }

  return (
    <ClientLayout>
      <HeroGridAnimation>
        <Nav />
        {/* Hero */}
        <header className="section-space-hero relative overflow-hidden" style={{ backgroundColor: "transparent", paddingBottom: "clamp(8rem, 12vw, 14rem)" }}>
          <div className="u-container relative">
            <div className="max-w-[60rem]">
              <p className="eyebrow text-brand mb-4">{service.shortTitle}</p>
              <h1 className="font-sans font-medium text-fluid-h1 leading-[1.1] tracking-tight text-dark max-w-[18ch] mb-6">
                {service.heroH1}
              </h1>
              <p className="font-sans text-fluid-large text-dark opacity-60 max-w-[50ch] leading-relaxed mb-6">
                {service.heroSubhead}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="font-mono text-xs text-dark opacity-40">Replaces:</span>
                {service.replaces.map((tool) => (
                  <span
                    key={tool}
                    className="font-mono text-xs px-3 py-1 rounded-full border border-dark-faded text-dark opacity-60"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            {/* Large service icon — bottom right, 10% off page */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconMap[service.icon] || "/images/icons/Group 1707479797.svg"}
              alt=""
              className="absolute w-[280px] h-[280px] md:w-[380px] md:h-[380px] opacity-15"
              style={{
                filter: serviceColorFilters[service.icon] || "",
                right: "-5%",
                bottom: "-20%",
              }}
            />
          </div>
        </header>
      </HeroGridAnimation>

      {/* Problem */}
      <section className="section-space-main">
        <div className="u-container">
          <div className="text-center mb-12">
            <p className="eyebrow text-brand mb-4">The Problem</p>
            <h2 className="font-sans font-medium text-fluid-h2 leading-[1.1] text-dark max-w-[24ch] mx-auto mb-4">
              {service.problemHeading}
            </h2>
            <p className="font-sans text-fluid-main text-dark opacity-50 max-w-[50ch] mx-auto">
              {service.problemSubhead}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {service.painPoints.map((point) => (
              <div key={point.title} className="p-6 rounded-lg border border-dark-faded">
                <h3 className="font-sans font-medium text-fluid-h6 text-dark mb-2">
                  {point.title}
                </h3>
                <p className="font-sans text-fluid-main text-dark opacity-50 leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-space-main">
        <div className="u-container">
          <div className="text-center mb-12">
            <p className="eyebrow text-brand mb-4">The Solution</p>
            <h2 className="font-sans font-medium text-fluid-h2 leading-[1.1] text-dark max-w-[22ch] mx-auto">
              What you get with a custom build
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {service.benefits.map((benefit) => (
              <div key={benefit.title} className="p-6">
                <h3 className="font-sans font-medium text-fluid-h5 text-dark mb-2">
                  {benefit.title}
                </h3>
                <p className="font-sans text-fluid-main text-dark opacity-50 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-space-main">
        <div className="u-container">
          <div className="text-center mb-12">
            <p className="eyebrow text-brand mb-4">Process</p>
            <h2 className="font-sans font-medium text-fluid-h2 leading-[1.1] text-dark max-w-[22ch] mx-auto">
              How we build it
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-8 max-w-5xl mx-auto">
            {service.processSteps.map((step, i) => (
              <div key={step.step} className="text-center px-3">
                <div className="flex items-center justify-center mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: stepColors[i % stepColors.length] }}
                  >
                    <span className="font-display text-[1.1rem] leading-none text-dark">
                      {String(step.step).padStart(2, "0")}
                    </span>
                  </div>
                </div>
                <h3 className="font-sans font-medium text-fluid-h6 text-dark mb-1">
                  {step.title}
                </h3>
                <p className="font-sans text-fluid-small text-dark opacity-50 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best fit */}
      <section className="section-space-small">
        <div className="u-container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="eyebrow text-brand mb-4">Best Fit</p>
            <h2 className="font-sans font-medium text-fluid-h3 text-dark mb-6">
              Who this is for
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {service.bestFitCompanies.map((company) => (
                <span
                  key={company}
                  className="font-sans text-sm px-4 py-2 rounded-full border border-dark-faded text-dark opacity-60"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FAQ items={service.faqs} />
      <Footer />
    </ClientLayout>
  );
}
