"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-register";
import { processSteps } from "@/content/shared";

const stepColors = ["#D0FF71", "#27EAA6", "#8F93FF", "#EBFFF6", "#004D43"];

export function Process() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".process-heading", {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
        });
        gsap.from(".process-step", {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 65%", once: true },
        });
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} id="how-it-works" className="section-space-main" style={{ backgroundColor: "#ffffff" }}>
      <div className="u-container">
        <div className="text-center mb-16">
          <p className="process-heading eyebrow text-brand mb-4">How It Works</p>
          <h2 className="process-heading font-sans font-medium text-fluid-h2 leading-[1.1] text-dark max-w-[22ch] mx-auto">
            From SaaS audit to software you own
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-5 left-[10%] right-[10%] h-px bg-dark/10" />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-10 gap-x-4">
            {processSteps.map((step, i) => (
              <div key={step.step} className="process-step text-center px-2 relative">
                <div className="flex items-center justify-center mb-5">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center relative z-10"
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
      </div>
    </section>
  );
}
