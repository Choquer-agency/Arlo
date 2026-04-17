"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-register";
import { getTier1Services } from "@/content/services";
import { GlowCard } from "@/components/ui/spotlight-card";
import { PixelIcon } from "@/components/PixelIcon";

export function ServicePillars() {
  const ref = useRef<HTMLElement>(null);
  const services = getTier1Services();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".pillars-heading", {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
        });
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="section-space-main" style={{ backgroundColor: "#ffffff" }}>
      <div className="u-container">
        <div className="text-center mb-12">
          <p className="pillars-heading eyebrow text-brand mb-4">Who ARLO is for</p>
          <h2 className="pillars-heading font-sans font-medium text-fluid-h2 leading-[1.1] text-dark max-w-[24ch] mx-auto">
            One connector. Every role at your agency, or your own business.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="block group"
            >
              <GlowCard
                glowColor="green"
                customSize
                className="!aspect-auto !shadow-none !p-0 !grid-rows-1 h-full"
              >
                <div className="p-8 relative z-10 h-full flex flex-col">
                  <div className="mb-5">
                    {/* Per-persona pixel icon tinted with the persona's brand color.
                        Each icon is a unique 7x7 design — see PixelIcon.tsx. */}
                    <PixelIcon icon={service.icon} color={service.color} size={52} />
                  </div>
                  <h3 className="font-sans font-medium text-fluid-h5 text-dark mb-2">
                    {service.shortTitle}
                  </h3>
                  <p className="font-sans text-fluid-main text-dark opacity-50 leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <div className="flex items-end justify-between mt-auto">
                    <div className="flex flex-wrap gap-2">
                      {service.replaces.slice(0, 3).map((tool) => (
                        <span
                          key={tool}
                          className="font-mono text-xs px-2 py-1 rounded bg-grey text-dark opacity-60"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 ml-3 flex-shrink-0">
                      <ArrowIcon color={service.color} />
                    </div>
                  </div>
                </div>
              </GlowCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArrowIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M8 20L20 8M20 8H10M20 8V18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
