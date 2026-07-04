import type { Metadata } from "next";
import Image from "next/image";
import { ClientLayout } from "@/components/ClientLayout";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { AGENCY_NAME, siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: `About ${AGENCY_NAME} | The MCP connector for agency marketing data`,
  description:
    "ARLO plugs Claude into every marketing account an agency runs — GA4, Search Console, Google Ads, Meta, YouTube, Shopify — for live conversational reporting with no exports, dashboards, or warehouse. Founded by Bryce Choquer. Priced per business tracked.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    title: "Ask, don't export",
    description:
      "Marketing data should answer questions, not live in spreadsheets. ARLO turns every connected account into something you just ask Claude about — in plain English.",
  },
  {
    title: "One connector, every platform",
    description:
      "Connect once with Google OAuth and every client's GA4, Search Console, Google Ads, YouTube, and Business Profile comes with it. Add Meta, Shopify, and more.",
  },
  {
    title: "Live, never warehoused",
    description:
      "ARLO is pass-through. Every answer hits the source API in real time — no ETL, no dashboards, no stored client data, nothing to go stale.",
  },
  {
    title: "Your data stays yours",
    description:
      "Per-user MCP tokens you can rotate and revoke, plus a full audit log of every question asked — each scoped to exactly what that teammate should see.",
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
                Marketing data should be a conversation.
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
                Agencies were never supposed to live in dashboards.
              </h2>
              <div className="space-y-4 font-sans text-fluid-main text-dark opacity-60 leading-relaxed">
                <p>
                  A modern agency runs a dozen platforms per client — GA4, Search Console,
                  Google Ads, Meta, YouTube, and more. Answering one simple question,
                  &ldquo;how did last month go?&rdquo;, means tab-hopping across all of them,
                  exporting CSVs, or paying for yet another dashboard nobody opens.
                </p>
                <p>
                  We built {AGENCY_NAME} because Claude changed what&apos;s possible. The
                  Model Context Protocol lets an AI assistant read your live accounts
                  directly — so instead of building reports, you just ask. One OAuth grant
                  connects every platform; assign each client&apos;s properties once; and
                  everyone on the team queries in plain English from Claude.
                </p>
                <p>
                  No exports. No dashboards. No data warehouse. {AGENCY_NAME} never stores
                  your clients&apos; data — every answer is live, pulled on demand, and
                  scoped to exactly who should see it. Priced per business you track, not
                  per seat.
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
              <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-40 mb-6">
                Founder &amp; CEO, {AGENCY_NAME}
              </p>
              <div className="space-y-4 font-sans text-fluid-main text-dark opacity-60 leading-relaxed">
                <p>
                  Bryce Choquer is the founder and CEO of {AGENCY_NAME}. He built it after
                  watching marketing teams and agencies burn hours every week stitching the
                  same numbers together from GA4, Search Console, Google Ads, and a
                  half-dozen other platforms — just to answer a question a client asked in a
                  single sentence.
                </p>
                <p>
                  {AGENCY_NAME} is his answer: connect once, then ask. The moment Anthropic
                  shipped the Model Context Protocol, it became possible to hand Claude a
                  live, secure line into every account an agency runs — no warehouse, no
                  exports, no dashboard busywork. The teams that spend their time acting on
                  data, instead of assembling it, win.
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
            <p className="eyebrow text-brand mb-4">Under the hood</p>
            <h2 className="font-sans font-medium text-fluid-h3 text-dark mb-6">
              Built on the Model Context Protocol. Connects to everything.
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Model Context Protocol", "Claude", "GA4", "Search Console",
                "Google Ads", "YouTube", "Business Profile", "Meta Ads",
                "Shopify", "Stripe", "HubSpot",
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
