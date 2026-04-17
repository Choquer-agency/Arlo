"use client";

import { InfiniteSlider } from "@/components/ui/infinite-slider";

const logos = [
  { src: "/images/logos/Oracle.svg", alt: "Oracle", heightScale: 0.5 },
  { src: "/images/logos/Pinnacle.svg", alt: "Pinnacle Fertility" },
  { src: "/images/logos/Penni.png", alt: "Penni", heightScale: 0.9 },
  { src: "/images/logos/Pedigree.svg", alt: "Pedigree Painting" },
  { src: "/images/logos/ChoquerAgencyLogo.svg", alt: "Choquer Agency", heightScale: 0.68 },
  { src: "/images/logos/Ahara.svg", alt: "Ahara Med" },
  { src: "/images/logos/WebflowJobs.svg", alt: "Webflow Jobs" },
  { src: "/images/logos/Northmark.svg", alt: "Northmark" },
  { src: "/images/logos/Midwest.svg", alt: "Midwest" },
  { src: "/images/logos/haven.svg", alt: "Haven" },
  { src: "/images/logos/Motorsport.svg", alt: "Motorsport" },
  { src: "/images/logos/Slat.svg", alt: "Slat" },
  { src: "/images/logos/TOA.svg", alt: "TOA" },
];

export function TrustBar() {
  return (
    <section className="pb-6 border-b border-dark-faded">
      <p className="font-mono text-fluid-small text-dark opacity-40 text-center mb-4">
        Trusted by 40+ companies to own their technology
      </p>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] [--logo-h:1.25rem] md:[--logo-h:1.5rem]">
        <InfiniteSlider gap={56} reverse speed={40}>
          {logos.map((logo) => {
            const s = logo.heightScale ?? 1;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={logo.src}
                src={logo.src}
                alt={logo.alt}
                className="pointer-events-none select-none opacity-40"
                style={{ height: `calc(${s} * var(--logo-h))` }}
                loading="lazy"
              />
            );
          })}
        </InfiniteSlider>
      </div>
    </section>
  );
}
