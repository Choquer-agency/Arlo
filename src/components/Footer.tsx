"use client";

import Link from "next/link";
import { AGENCY_NAME } from "@/lib/siteConfig";
import { trackCtaClick } from "@/lib/analytics";
import { ShimmerButton } from "@/components/ShimmerButton";

// Columns mirror the home/services (arlo) footer exactly.
const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/arlo" },
      { label: "Destinations", href: "/destinations" },
      { label: "Pricing", href: "/welcome" },
      { label: "Start free", href: "/welcome" },
    ],
  },
  {
    title: "For your role",
    links: [
      { label: "SEO Specialists", href: "/services/seo-specialist" },
      { label: "Google Ads", href: "/services/google-ads-specialist" },
      { label: "Meta & Social", href: "/services/meta-ads-specialist" },
      { label: "Account Managers", href: "/services/account-manager" },
      { label: "Agency Owners", href: "/services/agency-owner" },
      { label: "Solo Owners", href: "/services/solo-business-owner" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Start free", href: "/welcome" },
      { label: "Login", href: "/sign-in" },
      { label: "Book a demo", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(18,18,18,0.86), rgba(18,18,18,0.82)), url(/arlo/bg/footer-statue.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* CTA */}
      <div className="u-container py-[clamp(4rem,8vw,8rem)] text-center">
        <p className="eyebrow mb-5">Get started</p>
        <h2 className="font-serif text-fluid-h2 leading-[1.12] max-w-[20ch] mx-auto mb-8">
          Ask Claude about any client, today.
        </h2>
        <div className="flex justify-center">
          <ShimmerButton href="/welcome" onClick={() => trackCtaClick("footer_cta", "Start For Free")}>
            Start For Free
          </ShimmerButton>
        </div>
      </div>

      {/* Divider */}
      <div className="u-container">
        <div className="h-px w-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
      </div>

      {/* Link columns */}
      <div className="u-container grid grid-cols-2 gap-8 py-14 md:grid-cols-6">
        {/* Brand */}
        <div className="col-span-2 flex flex-col gap-5">
          <span className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/arlo/arlo-logo.svg" alt={AGENCY_NAME} className="h-[34px] w-auto" />
            <span className="font-display text-[1.625rem] leading-none text-white">{AGENCY_NAME}</span>
          </span>
          <p className="font-sans text-sm text-white/55 max-w-xs leading-relaxed">
            One connector plugs Claude into every client account your agency runs — live, no warehouse.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <span className="font-sans text-sm text-white/40">{col.title}</span>
            <div className="flex flex-col gap-2">
              {col.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="w-max text-sm text-white/65 hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Copyright */}
      <div className="u-container">
        <div className="h-px w-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
        <p className="py-6 text-center font-sans text-sm text-white/40">
          © {year} {AGENCY_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
