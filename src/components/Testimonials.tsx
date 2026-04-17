"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-register";
import { testimonials } from "@/content/shared";
import { trackCtaClick } from "@/lib/analytics";

export function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".ct-heading", {
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

  function scrollCards(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.6;
    scrollRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  }

  return (
    <section ref={ref} className="py-16 md:py-20" style={{ backgroundColor: "#ffffff" }}>
      <div className="u-container">
        <div className="flex items-end justify-between mb-12">
          <h2 className="ct-heading font-sans font-medium text-fluid-h2 leading-[1.1] text-dark max-w-[14ch]">
            They say it better than we do
          </h2>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => scrollCards("left")}
              className="w-12 h-12 rounded-full border border-dark-faded flex items-center justify-center hover:bg-dark hover:text-light transition-colors"
              style={{ transitionDuration: "0.3s" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 2L4 8L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => scrollCards("right")}
              className="w-12 h-12 rounded-full border border-dark-faded flex items-center justify-center hover:bg-dark hover:text-light transition-colors"
              style={{ transitionDuration: "0.3s" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 2L12 8L6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="ct-card flex-shrink-0 w-[85vw] md:w-[32.5%] rounded-lg p-8 flex flex-col justify-between min-h-[340px] snap-start"
              style={{ backgroundColor: t.color }}
            >
              <p className="font-sans text-fluid-h5 leading-[1.3] text-dark mb-8">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dark/10 flex items-center justify-center">
                  <span className="font-sans font-medium text-sm text-dark">
                    {t.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-sans font-medium text-sm text-dark">{t.name}</p>
                  <p className="font-sans text-xs text-dark opacity-60">
                    {t.title}, {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/sign-in"
            onClick={() => trackCtaClick("testimonials", "Start for free")}
            className="inline-flex items-center gap-3 bg-brand text-light rounded-sm px-8 py-4 font-sans font-medium text-fluid-main transition-all hover:brightness-110"
            style={{ transitionDuration: "0.3s" }}
          >
            Start for free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 14L14 2M14 2H5M14 2V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
