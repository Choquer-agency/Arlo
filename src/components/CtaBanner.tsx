"use client";

import { useContactForm } from "@/context/ContactFormContext";
import { trackCtaClick } from "@/lib/analytics";

export function CtaBanner() {
  const { openModal } = useContactForm();

  return (
    <section className="section-space-small theme-dark">
      <div className="u-container text-center">
        <p className="font-mono text-fluid-small uppercase tracking-wider opacity-40 mb-4">
          Free SaaS Replacement Assessment
        </p>
        <h2 className="font-sans font-medium text-fluid-h3 leading-[1.15] max-w-[28ch] mx-auto mb-4">
          Ready to own your software?
        </h2>
        <p className="font-sans text-fluid-main opacity-50 max-w-[44ch] mx-auto mb-8 leading-relaxed">
          Find out how much you could save by replacing your SaaS subscriptions with custom software you own.
        </p>
        <button
          onClick={() => { trackCtaClick("cta_banner", "Get Your Free Audit"); openModal(undefined, "cta_banner"); }}
          className="inline-flex items-center gap-3 bg-brand text-light rounded-sm px-8 py-4 font-sans font-medium text-fluid-main transition-all hover:brightness-110"
          style={{ transitionDuration: "0.3s" }}
        >
          Get Your Free Audit
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 14L14 2M14 2H5M14 2V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}
