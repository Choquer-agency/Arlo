"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-register";
import { useContactForm } from "@/context/ContactFormContext";
import { trackCtaClick } from "@/lib/analytics";

const featureColors = ["#D0FF71", "#27EAA6", "#FFB84D"];

const features = [
  { num: "01", label: "One Connector" },
  { num: "02", label: "Every Platform" },
  { num: "03", label: "Any Destination" },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { openModal } = useContactForm();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(".hero-heading", {
          y: 60,
          opacity: 0,
          duration: 1,
        })
          .from(".hero-body", { y: 30, opacity: 0, duration: 0.8 }, "-=0.5")
          .from(
            ".hero-feature",
            { y: 40, opacity: 0, duration: 0.7, stagger: 0.12 },
            "-=0.4"
          )
          .from(".hero-cta", { y: 20, opacity: 0, duration: 0.6 }, "-=0.3")
          .from(".hero-partners", { y: 20, opacity: 0, duration: 0.6 }, "-=0.3");
      });
    },
    { scope: ref }
  );

  return (
    <header ref={ref} className="section-space-hero" style={{ backgroundColor: "transparent" }}>
      <div className="u-container">
        <div className="max-w-[85rem] mx-auto">
          {/* Eyebrow */}
          <div className="hero-heading flex items-center gap-2.5 mb-6">
            <span className="font-mono text-xs uppercase tracking-wider text-brand">
              MCP for agencies and business owners
            </span>
          </div>

          {/* Main heading */}
          <h1 className="hero-heading font-sans font-medium text-fluid-h1 leading-[1.1] tracking-tight text-dark max-w-[18ch] mb-6">
            Ask Claude about any client,{" "}
            <span className="text-brand">any platform.</span>
          </h1>

          {/* Subhead */}
          <p className="hero-body font-sans text-fluid-large text-dark opacity-60 max-w-[52ch] mb-6 leading-relaxed">
            ARLO plugs Claude into every account your agency runs. GA4, Search
            Console, Google Ads, Meta, YouTube, Shopify — one connector, every
            client, live numbers in seconds.
          </p>

          {/* Qualifier */}
          <p className="hero-body font-sans text-fluid-main text-dark opacity-40 max-w-[52ch] mb-3 leading-relaxed">
            For agencies managing 10-200 clients, and for business owners who
            just want Claude on top of their own analytics, ads, and store.
          </p>

          {/* Destinations kicker */}
          <p className="hero-body font-sans text-fluid-main text-dark opacity-40 max-w-[52ch] mb-10 leading-relaxed">
            Ask Claude, or sync to Looker Studio, Sheets, BigQuery, or Slack —
            same data, your choice.
          </p>

          {/* CTA */}
          <div className="hero-cta flex flex-col sm:flex-row gap-4 mb-16">
            <a
              href="/sign-in"
              onClick={() => trackCtaClick("hero", "Start free")}
              className="btn-secondary text-base px-8 py-4"
            >
              Start free — 14 days
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 14L14 2M14 2H5M14 2V11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              href="#how-it-works"
              onClick={() => trackCtaClick("hero", "See How It Works")}
              className="btn text-base"
            >
              <span>See how it works</span>
              <span className="btn-arrow">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 1V13M7 13L1 7M7 13L13 7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
          </div>

          {/* Feature items */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-16">
            {features.map((feat, i) => (
              <div key={feat.num} className="hero-feature flex items-center gap-5">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: featureColors[i] }}
                />
                <div>
                  <span className="font-mono text-xs text-grey-1 uppercase tracking-wider">
                    [{feat.num}]
                  </span>
                  <p className="font-sans font-medium text-fluid-main text-dark uppercase tracking-wide">
                    {feat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
