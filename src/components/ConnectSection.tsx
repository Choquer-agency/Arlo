"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-register";
import { useContactForm } from "@/context/ContactFormContext";
import {
  FloatingIconsHero,
  type FloatingIconsHeroProps,
} from "@/components/ui/floating-icons-hero-section";

/* ─── Integration icons (SVG components) ─── */

const IconSalesforce = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="none"><path d="M10.1 4.5a4.5 4.5 0 0 1 7.8 0A4 4 0 0 1 22 8.3a4 4 0 0 1-2.2 7.2 4.5 4.5 0 0 1-7.8 0 4 4 0 0 1-5.8 0A4.5 4.5 0 0 1 2 8.3a4 4 0 0 1 4.2-3.8A4.5 4.5 0 0 1 10.1 4.5z" fill="#00A1E0"/></svg>
);
const IconHubSpot = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#FF7A59"/><circle cx="12" cy="12" r="4" fill="white"/></svg>
);
const IconSlack = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="4" height="8" rx="2" fill="#36C5F0"/><rect x="10" y="2" width="4" height="8" rx="2" fill="#2EB67D"/><rect x="18" y="10" width="4" height="8" rx="2" fill="#ECB22E"/><rect x="6" y="14" width="8" height="4" rx="2" fill="#E01E5A"/></svg>
);
const IconZapier = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="none"><path d="M12 2l3 5h5l-4 4 2 5-6-3-6 3 2-5-4-4h5l3-5z" fill="#FF4A00"/></svg>
);
const IconStripe = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="4" fill="#635BFF"/><path d="M11 8c-1.5 0-3 .7-3 2.5 0 3 6 2 6 4.5 0 1.5-1.5 2.5-3.5 2.5" stroke="white" strokeWidth="2" fill="none"/></svg>
);
const IconAWS = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="none"><path d="M3 14c3-2 6-3 9-3s6 1 9 3" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round"/><path d="M12 6v8" stroke="#232F3E" strokeWidth="2" strokeLinecap="round"/><path d="M8 10l4-4 4 4" stroke="#232F3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
);
const IconGoogle = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="none"><path d="M22 12.24c0-.75-.07-1.48-.19-2.19H12.3v4.11h5.62a4.81 4.81 0 0 1-2 3.08v2.6h3.56c2.08-1.92 3.28-4.74 3.28-7.6z" fill="#4285F4"/><path d="M12.3 22c2.9 0 5.35-1 7.19-2.68l-3.56-2.6c-.97.65-2.2 1.08-3.66 1.08-2.81 0-5.19-1.88-6.06-4.32H2.59v2.67C4.39 20.03 8.06 22 12.3 22z" fill="#34A853"/><path d="M6.28 13.84A5.87 5.87 0 0 1 5.96 12c0-.63.12-1.24.28-1.84V7.33H2.6A10.02 10.02 0 0 0 1.45 12c0 1.6.41 3.13 1.14 4.51l3.73-2.67z" fill="#FBBC05"/><path d="M12.33 5.68c1.56 0 2.98.55 4.05 1.56l2.81-2.81C17.68 2.29 15.23 1.33 12.33 1.33 8.06 1.33 4.39 3.97 2.59 7.33L6.28 10A6.18 6.18 0 0 1 12.33 5.68z" fill="#EA4335"/></svg>
);
const IconNotion = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" fill="#000"/><path d="M8 7h8M8 11h5M8 15h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
);
const IconFigma = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="#1ABCFE"/><rect x="6" y="3" width="6" height="6" rx="3" fill="#F24E1E"/><rect x="12" y="3" width="6" height="6" rx="3" fill="#FF7262"/><rect x="6" y="9" width="6" height="6" rx="3" fill="#A259FF"/><rect x="6" y="15" width="6" height="6" rx="3" fill="#0ACF83"/></svg>
);
const IconMicrosoft = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="9" height="9" fill="#F25022"/><rect x="13" y="2" width="9" height="9" fill="#7FBA00"/><rect x="2" y="13" width="9" height="9" fill="#00A4EF"/><rect x="13" y="13" width="9" height="9" fill="#FFB900"/></svg>
);
const IconGitHub = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="currentColor" style={{ color: 'rgba(255,255,255,0.7)' }}><path d="M12 .3C5.37.3 0 5.67 0 12.3c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.38-1.33-1.74-1.33-1.74-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.28-1.23 3.28-1.23.65 1.65.24 2.87.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.42.36.81 1.1.81 2.22v3.29c0 .32.22.69.82.57A12.01 12.01 0 0 0 24 12.3C24 5.67 18.63.3 12 .3z"/></svg>
);
const IconOpenAI = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#10A37F"/><path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
);
const IconShopify = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="none"><path d="M15.3 4.4s-.3-.1-.5 0c-.2 0-3.4 1-3.4 1s-1.2-1.2-1.4-1.3c-.1-.1-.3-.1-.4-.1L9 22l8.5-1.8S15.5 5.2 15.4 4.8c0-.2-.1-.4-.1-.4z" fill="#95BF47"/><path d="M15.3 4.4s-.3-.1-.5 0l-.5.2c-.1.4-.3 1-.6 1.5-.8 1.5-1.6 1.9-2 2l-2.1 14 8.4-1.9S15.5 5.2 15.4 4.8c0-.2-.1-.4-.1-.4z" fill="#5E8E3E"/></svg>
);
const IconJira = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="none"><path d="M22.2 11.2L12.8 1.8 12 1l-8.2 8.2-2.8 2.8a1 1 0 0 0 0 1.4l7 7L12 24l8.2-8.2.7-.7a1 1 0 0 0 0-1.4l-6.7-6.7zM12 15.4L8.6 12 12 8.6l3.4 3.4-3.4 3.4z" fill="#2684FF"/></svg>
);
const IconTwilio = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#F22F46"/><circle cx="9" cy="9" r="2" fill="white"/><circle cx="15" cy="9" r="2" fill="white"/><circle cx="9" cy="15" r="2" fill="white"/><circle cx="15" cy="15" r="2" fill="white"/></svg>
);
const IconPostgres = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="7" rx="8" ry="4" fill="#336791"/><path d="M4 7v10c0 2.2 3.6 4 8 4s8-1.8 8-4V7" stroke="#336791" strokeWidth="1.5" fill="none"/><ellipse cx="12" cy="13" rx="8" ry="3" fill="#336791" opacity="0.3"/></svg>
);
const IconVercel = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} viewBox="0 0 24 24" fill="currentColor" style={{ color: 'rgba(255,255,255,0.7)' }}><path d="M12 2L2 22h20L12 2z"/></svg>
);

const demoIcons: FloatingIconsHeroProps['icons'] = [
  { id: 1, icon: IconSalesforce, className: 'top-[8%] left-[8%]' },
  { id: 2, icon: IconHubSpot, className: 'top-[15%] right-[12%]' },
  { id: 3, icon: IconSlack, className: 'top-[75%] left-[6%]' },
  { id: 4, icon: IconZapier, className: 'bottom-[12%] right-[8%]' },
  { id: 5, icon: IconStripe, className: 'top-[6%] left-[35%]' },
  { id: 6, icon: IconAWS, className: 'top-[6%] right-[35%]' },
  { id: 7, icon: IconGoogle, className: 'bottom-[10%] left-[30%]' },
  { id: 8, icon: IconNotion, className: 'top-[45%] left-[4%]' },
  { id: 9, icon: IconFigma, className: 'top-[45%] right-[4%]' },
  { id: 10, icon: IconMicrosoft, className: 'bottom-[25%] right-[15%]' },
  { id: 11, icon: IconGitHub, className: 'top-[25%] left-[18%]' },
  { id: 12, icon: IconOpenAI, className: 'bottom-[20%] left-[15%]' },
  { id: 13, icon: IconShopify, className: 'top-[12%] left-[50%]' },
  { id: 14, icon: IconJira, className: 'top-[65%] right-[35%]' },
  { id: 15, icon: IconTwilio, className: 'top-[70%] left-[25%]' },
  { id: 16, icon: IconPostgres, className: 'bottom-[8%] left-[50%]' },
  { id: 17, icon: IconVercel, className: 'top-[10%] right-[18%]' },
  { id: 18, icon: IconShopify, className: 'bottom-[35%] right-[5%]' },
];

export function ConnectSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { openModal } = useContactForm();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(innerRef.current, {
          width: "90%",
          height: "90%",
          borderRadius: "2rem",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=40%",
            scrub: true,
            pin: true,
          },
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <div ref={sectionRef} className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-white">
      <div
        ref={innerRef}
        className="w-full h-full overflow-hidden"
        style={{ willChange: "width, height, border-radius" }}
      >
        <FloatingIconsHero
          title="Connect everything. Send it anywhere."
          subtitle="Pull data from 325+ platforms and sync it to Looker Studio, BigQuery, Slack, Sheets, or a branded PDF — so every client sees performance in the tool they already open."
          ctaText="See How It Connects"
          onCtaClick={() => openModal()}
          icons={demoIcons}
        />
      </div>
    </div>
  );
}
