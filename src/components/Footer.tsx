"use client";

import Link from "next/link";
import { useContactForm } from "@/context/ContactFormContext";
import { AGENCY_NAME } from "@/lib/siteConfig";
import { trackCtaClick } from "@/lib/analytics";
import { LinkedinIcon, TwitterIcon } from "lucide-react";

const services = [
  { title: "SEO Specialists", href: "/services/seo-specialist" },
  { title: "Google Ads Specialists", href: "/services/google-ads-specialist" },
  { title: "Meta Ads Specialists", href: "/services/meta-ads-specialist" },
  { title: "Account Managers", href: "/services/account-manager" },
  { title: "Agency Owners", href: "/services/agency-owner" },
  { title: "Business Owners", href: "/services/solo-business-owner" },
];

const company = [
  { title: "About", href: "/about" },
  { title: "Case Studies", href: "/work" },
  { title: "Blog", href: "/blog" },
  { title: "Contact", href: "/contact" },
  { title: "FAQ", href: "/#faq" },
];

const socialLinks = [
  { icon: <LinkedinIcon className="size-4" />, link: "#" },
  { icon: <TwitterIcon className="size-4" />, link: "#" },
];

export function Footer() {
  const { openModal } = useContactForm();
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: "#193133", color: "#ffffff" }}>
      {/* Big CTA section */}
      <div className="section-space-large">
        <div className="u-container text-center">
          <p className="font-mono text-fluid-small uppercase tracking-wider opacity-60 mb-6">
            14-day free trial
          </p>
          <p className="font-sans font-medium text-fluid-h1 leading-[1.05] max-w-[20ch] mx-auto mb-4">
            Ask Claude about any client, today.
          </p>
          <p className="font-sans text-fluid-main opacity-50 max-w-[44ch] mx-auto mb-8">
            Connect Google in one click, assign a client, paste your MCP URL into Claude
            Desktop. First working query happens in under five minutes.
          </p>
          <Link
            href="/sign-in"
            onClick={() => trackCtaClick("footer_cta", "Start for free")}
            className="inline-flex items-center gap-3 rounded-sm px-8 py-4 font-sans font-medium text-fluid-main transition-all hover:brightness-110"
            style={{ transitionDuration: "0.3s", background: "#D0FF71", color: "#193133" }}
          >
            Start for free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 14L14 2M14 2H5M14 2V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="font-sans text-fluid-small opacity-40 mt-6">
            No credit card. Cancel any time.
          </p>
        </div>
      </div>

      {/* Minimal footer bar */}
      <div className="relative">
        <div
          className="mx-auto max-w-5xl md:border-x"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background: "radial-gradient(35% 80% at 30% 0%, rgba(208,255,113,0.08), transparent)",
          }}
        >
          {/* Top divider */}
          <div className="absolute inset-x-0 h-px w-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />

          <div className="grid max-w-5xl grid-cols-6 gap-6 p-6 md:p-8">
            {/* Logo + description + social */}
            <div className="col-span-6 flex flex-col gap-5 md:col-span-3">
              <span className="flex items-center gap-2.5 opacity-60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo.svg"
                  alt={AGENCY_NAME}
                  className="h-[1.125rem] w-auto brightness-0 invert"
                />
                <span className="font-display text-xl tracking-tight leading-none">
                  {AGENCY_NAME}
                </span>
              </span>
              <p className="font-mono text-sm opacity-40 max-w-sm text-balance">
                ARLO plugs Claude into every account your agency runs. One connector, every
                client, live numbers in seconds.
              </p>
              <div className="flex gap-2">
                {socialLinks.map((item, i) => (
                  <a
                    key={i}
                    className="rounded-md border p-1.5 opacity-40 hover:opacity-100 transition-opacity"
                    style={{ borderColor: "rgba(255,255,255,0.15)" }}
                    target="_blank"
                    href={item.link}
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Services column */}
            <div className="col-span-3 w-full md:col-span-1">
              <span className="font-mono text-xs uppercase tracking-wider opacity-30 mb-2 block">
                Services
              </span>
              <div className="flex flex-col gap-1">
                {services.map(({ href, title }, i) => (
                  <Link
                    key={i}
                    className="w-max py-1 text-sm opacity-50 hover:opacity-100 transition-opacity duration-200"
                    href={href}
                  >
                    {title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Company column */}
            <div className="col-span-3 w-full md:col-span-1">
              <span className="font-mono text-xs uppercase tracking-wider opacity-30 mb-2 block">
                Company
              </span>
              <div className="flex flex-col gap-1">
                {company.map(({ href, title }, i) => (
                  <Link
                    key={i}
                    className="w-max py-1 text-sm opacity-50 hover:opacity-100 transition-opacity duration-200"
                    href={href}
                  >
                    {title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Get Started column */}
            <div className="col-span-6 w-full md:col-span-1">
              <span className="font-mono text-xs uppercase tracking-wider opacity-30 mb-2 block">
                Get Started
              </span>
              <div className="flex flex-col gap-1">
                <Link
                  href="/sign-in"
                  onClick={() => trackCtaClick("footer_links", "Start for free")}
                  className="w-max py-1 text-sm opacity-50 hover:opacity-100 transition-opacity duration-200"
                >
                  Start for free
                </Link>
                <Link
                  href="/contact"
                  className="w-max py-1 text-sm opacity-50 hover:opacity-100 transition-opacity duration-200"
                >
                  Ask a question
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom divider + copyright */}
          <div className="absolute inset-x-0 h-px w-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
          <div className="flex max-w-5xl flex-col justify-between gap-2 pt-3 pb-6 px-6 md:px-8">
            <p className="text-center font-mono text-xs opacity-30">
              &copy; {year} {AGENCY_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
