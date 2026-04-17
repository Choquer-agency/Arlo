import type { Metadata } from "next";
import Image from "next/image";
import { ClientLayout } from "@/components/ClientLayout";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { AGENCY_NAME, siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: `About ${AGENCY_NAME} | AI Software Development Agency`,
  description:
    "FuturLabs is a custom AI software development agency founded by Bryce Choquer. Based in Canada, serving mid-market companies ($10M–$250M revenue) across North America. 40+ projects delivered, 25+ SaaS tools replaced, $180K average annual client savings. Full code ownership.",
};

const values = [
  {
    title: "Own Your Code",
    description:
      "Every project delivers full IP ownership. No licensing fees, no vendor lock-in, no strings attached.",
  },
  {
    title: "AI-Native From Day One",
    description:
      "Every system we build is designed with AI capabilities at the foundation — not as an afterthought.",
  },
  {
    title: "Outcomes Over Hours",
    description:
      "We sell financial outcomes: reduced SaaS spend, increased efficiency, and technology you control.",
  },
  {
    title: "Build What You Need",
    description:
      "We build the features you actually use, plus custom capabilities your SaaS vendor can't offer.",
  },
];

export default function AboutPage() {
  return (
    <ClientLayout>
      <Nav />

      {/* Hero with image */}
      <header className="section-space-hero" style={{ backgroundColor: "#EBFFF6" }}>
        <div className="u-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="eyebrow text-brand mb-4">About {AGENCY_NAME}</p>
              <h1 className="font-sans font-medium text-fluid-h1 leading-[1.1] tracking-tight text-dark max-w-[16ch] mb-6">
                We build software you own.
              </h1>
              <p className="font-sans text-fluid-large text-dark opacity-60 max-w-[50ch] leading-relaxed">
                {siteConfig.description}
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/about-hero.webp"
                alt="Bryce Choquer, Founder"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={95}
                priority
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mission with photo grid */}
      <section className="section-space-main">
        <div className="u-container">
          <div className="grid md:grid-cols-5 gap-12">
            {/* Text */}
            <div className="md:col-span-3">
              <p className="eyebrow text-brand mb-4">The Mission</p>
              <h2 className="font-sans font-medium text-fluid-h3 text-dark mb-6">
                Mid-market companies deserve better than renting their technology.
              </h2>
              <div className="space-y-4 font-sans text-fluid-main text-dark opacity-60 leading-relaxed">
                <p>
                  The average mid-market company spends $75K–$1.5M annually on SaaS
                  subscriptions. Every year, those prices go up 10–15%. Over half the
                  licenses purchased go unused. And at the end of every year, you own
                  exactly none of it.
                </p>
                <p>
                  We started {AGENCY_NAME} because we believe there&apos;s a better model.
                  AI-accelerated development has fundamentally changed the economics — what
                  took 6 months to build now ships in 6–12 weeks. Custom software is no
                  longer a luxury reserved for enterprises.
                </p>
                <p>
                  We build AI-powered custom software that replaces your most expensive SaaS
                  subscriptions. You own every line of code. Break even in 2–3 years. Save
                  millions over 5.
                </p>
              </div>
            </div>
            {/* Photo collage */}
            <div className="md:col-span-2 grid grid-cols-2 gap-3">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                <Image
                  src="/images/about-mask-1.webp"
                  alt="Team member at work"
                  fill
                  className="object-cover"
                  sizes="25vw"
                  quality={95}
                />
              </div>
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mt-8">
                <Image
                  src="/images/about-mask-4.webp"
                  alt="Team culture"
                  fill
                  className="object-cover"
                  sizes="25vw"
                  quality={95}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo break — team walking */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <Image
          src="/images/about-mask-3.webp"
          alt="Team at work"
          fill
          className="object-cover object-center"
          sizes="100vw"
          quality={95}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(25,49,51,0.3), rgba(25,49,51,0.1))" }} />
      </div>

      {/* Values */}
      <section className="section-space-main" style={{ backgroundColor: "#EBFFF6" }}>
        <div className="u-container">
          <div className="text-center mb-12">
            <p className="eyebrow text-brand mb-4">How We Work</p>
            <h2 className="font-sans font-medium text-fluid-h2 leading-[1.1] text-dark">
              Our principles
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((value) => (
              <div key={value.title} className="p-6">
                <h3 className="font-sans font-medium text-fluid-h5 text-dark mb-3">
                  {value.title}
                </h3>
                <p className="font-sans text-fluid-main text-dark opacity-50 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="section-space-main">
        <div className="u-container">
          <div className="grid md:grid-cols-5 gap-12 items-center max-w-5xl mx-auto">
            {/* Photo */}
            <div className="md:col-span-2">
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="/images/founder-opt.webp"
                  alt={siteConfig.founder}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                  quality={95}
                />
              </div>
            </div>
            {/* Bio */}
            <div className="md:col-span-3">
              <p className="eyebrow text-brand mb-4">Founder</p>
              <h2 className="font-sans font-medium text-fluid-h3 text-dark mb-6">
                {siteConfig.founder}
              </h2>
              <div className="space-y-4 font-sans text-fluid-main text-dark opacity-60 leading-relaxed">
                <p>
                  Bryce has led 40+ custom software projects across healthcare,
                  construction, e-commerce, and professional services, helping
                  mid-market companies eliminate over $2M in combined annual SaaS
                  spend. He founded {AGENCY_NAME} to solve a problem he saw
                  repeatedly: companies paying $75K&ndash;$1.5M per year for SaaS
                  tools that didn&apos;t fit their workflows.
                </p>
                <p>
                  The thesis is simple: AI-accelerated development has made custom
                  software economically viable for mid-market companies for the first
                  time. What took 6 months to build now ships in 6&ndash;12 weeks.
                  The companies that own their technology stack will outcompete those
                  that rent it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team at work photo */}
      <div className="u-container pb-12">
        <div className="relative h-[35vh] md:h-[45vh] rounded-2xl overflow-hidden">
          <Image
            src="/images/about-mask-2.webp"
            alt="The team"
            fill
            className="object-cover object-center"
            sizes="100vw"
            quality={95}
          />
        </div>
      </div>

      {/* Tech Stack */}
      <section className="section-space-small" style={{ backgroundColor: "#EBFFF6" }}>
        <div className="u-container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="eyebrow text-brand mb-4">Technology</p>
            <h2 className="font-sans font-medium text-fluid-h3 text-dark mb-6">
              Modern stack. Proven tools.
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Next.js", "React", "TypeScript", "Node.js", "Python",
                "PostgreSQL", "AWS", "Vercel", "OpenAI", "Anthropic",
              ].map((tech) => (
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

      <Footer />
    </ClientLayout>
  );
}
