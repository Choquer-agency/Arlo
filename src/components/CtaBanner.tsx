"use client";

import { trackCtaClick } from "@/lib/analytics";
import { ShimmerButton } from "@/components/ShimmerButton";

export function CtaBanner() {
  return (
    <section className="section-space-small theme-dark">
      <div className="u-container text-center">
        <p className="eyebrow mb-5">Get started</p>
        <h2 className="font-serif text-fluid-h3 leading-[1.15] max-w-[28ch] mx-auto mb-8">
          Ask Claude about any client, today.
        </h2>
        <div className="flex justify-center">
          <ShimmerButton href="/welcome" onClick={() => trackCtaClick("cta_banner", "Start For Free")}>
            Start For Free
          </ShimmerButton>
        </div>
      </div>
    </section>
  );
}
