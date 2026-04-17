"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-register";
import { getAllCaseStudies } from "@/content/case-studies";

/* Map each case study slug to a portfolio screenshot */
const caseStudyImages: Record<string, string> = {
  "penni-cart": "/images/portfolio/project-4.webp",
  "pinnacle-fertility": "/images/portfolio/project-2.webp",
  "far-north-crane": "/images/portfolio/project-5.webp",
};

export function FeaturedCaseStudy() {
  const ref = useRef<HTMLElement>(null);
  const caseStudies = getAllCaseStudies();
  const featured = caseStudies[0];

  useGSAP(
    () => {
      if (!featured) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".featured-heading", {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
        });
        gsap.from(".featured-card", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 65%", once: true },
        });
      });
    },
    { scope: ref, dependencies: [featured] }
  );

  if (!featured) return null;

  return (
    <section ref={ref} className="section-space-main">
      <div className="u-container">
        <div className="text-center mb-12">
          <p className="featured-heading eyebrow text-brand mb-4">Proof</p>
          <h2 className="featured-heading font-sans font-medium text-fluid-h2 leading-[1.1] text-dark max-w-[22ch] mx-auto">
            Real results from real companies
          </h2>
        </div>

        {/* Featured — large card with image */}
        <div
          className="featured-card rounded-2xl overflow-hidden max-w-5xl mx-auto"
          style={{ border: `1px solid ${featured.color}40` }}
        >
          <div className="grid md:grid-cols-2">
            {/* Image side */}
            <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
              <Image
                src={caseStudyImages[featured.slug] || "/images/portfolio/project-2.webp"}
                alt={featured.client}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${featured.color}90, ${featured.color}30)`,
                  mixBlendMode: "multiply",
                }}
              />
              {/* Floating metrics on image */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="grid grid-cols-2 gap-3">
                  {featured.metrics.slice(0, 2).map((metric) => (
                    <div
                      key={metric.label}
                      className="backdrop-blur-md bg-white/80 rounded-lg p-3 text-center"
                    >
                      <p className="font-display text-fluid-h4 text-dark">{metric.value}</p>
                      <p className="font-sans text-xs text-dark opacity-60">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content side */}
            <div className="p-8 md:p-10 flex flex-col justify-between bg-white">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider opacity-50 mb-2">
                  {featured.industry}
                </p>
                <h3 className="font-sans font-medium text-fluid-h4 text-dark mb-4">
                  {featured.headline}
                </h3>
                <p className="font-sans text-fluid-main text-dark opacity-50 leading-relaxed mb-6">
                  {featured.summary}
                </p>

                {/* Remaining metrics */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {featured.metrics.slice(2).map((metric) => (
                    <div
                      key={metric.label}
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: featured.color + "15" }}
                    >
                      <p className="font-display text-fluid-h5 text-brand">{metric.value}</p>
                      <p className="font-sans text-xs text-dark opacity-50 mt-1">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {featured.testimonial && (
                <blockquote className="border-l-2 border-brand pl-4 mb-6">
                  <p className="font-sans text-sm text-dark opacity-70 italic leading-relaxed">
                    &ldquo;{featured.testimonial.quote}&rdquo;
                  </p>
                  <p className="font-sans text-xs text-dark opacity-50 mt-2">
                    — {featured.testimonial.name}, {featured.testimonial.title}
                  </p>
                </blockquote>
              )}

              <Link
                href={`/work/${featured.slug}`}
                className="inline-flex items-center gap-2 font-sans text-brand font-medium hover:underline"
              >
                Read the full case study
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 14L14 2M14 2H5M14 2V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Other case studies — image cards */}
        <div className="grid sm:grid-cols-3 gap-6 mt-8 max-w-5xl mx-auto">
          {caseStudies.map((cs) => (
            <Link
              key={cs.slug}
              href={`/work/${cs.slug}`}
              className="featured-card group rounded-xl overflow-hidden border border-dark-faded hover:border-brand/30 transition-colors bg-white"
              style={{ transitionDuration: "0.3s" }}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={caseStudyImages[cs.slug] || "/images/portfolio/project-1.webp"}
                  alt={cs.client}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div
                  className="absolute inset-0 opacity-40 group-hover:opacity-20 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to top, ${cs.color}, transparent)`,
                  }}
                />
              </div>
              <div className="p-5">
                <p className="font-mono text-xs uppercase tracking-wider opacity-40 mb-1">
                  {cs.industry}
                </p>
                <p className="font-sans font-medium text-fluid-main text-dark group-hover:text-brand transition-colors mb-2">
                  {cs.client}
                </p>
                <p className="font-sans text-sm text-dark opacity-50">
                  {cs.metrics[0]?.label}: <span className="font-medium text-brand">{cs.metrics[0]?.value}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
