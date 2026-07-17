'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { AGENCY_NAME } from '@/lib/siteConfig';
import { ChevronDown } from 'lucide-react';
import { getTier1Services } from '@/content/services';
import { trackCtaClick } from '@/lib/analytics';
import { ShimmerButton } from '@/components/ShimmerButton';

const tier1Services = getTier1Services();

// Menu mirrors the home/services (arlo) nav exactly.
const links: { label: string; href: string; hasDropdown?: boolean }[] = [
  { label: 'Services', href: '#', hasDropdown: true },
  { label: 'Destinations', href: '/destinations' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export function Nav() {
  const [open, setOpen] = React.useState(false);
  const [servicesOpen, setServicesOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const linkClass =
    'px-3.5 py-2 text-[0.95rem] text-[#14181c]/80 hover:text-[#14181c] transition-colors rounded-full';

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className={cn('w-full px-5 md:px-8 transition-all duration-300', scrolled ? 'py-3' : 'py-4')}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/arlo/arlo-logo-purple.svg" alt={AGENCY_NAME} className="h-6 w-auto" />
            <span className="font-display text-[1.625rem] leading-none text-[#14181c]">{AGENCY_NAME}</span>
          </Link>

          {/* Centered link pill */}
          <nav className="hidden md:flex items-center gap-0.5 rounded-full border border-black/[0.04] bg-white/55 px-3.5 py-1.5 backdrop-blur-md">
            {links.map((link) =>
              link.hasDropdown ? (
                <div key={link.label} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setServicesOpen(!servicesOpen)}
                    className={cn(linkClass, 'inline-flex items-center gap-1')}
                  >
                    {link.label}
                    <ChevronDown size={14} className={cn('transition-transform', servicesOpen && 'rotate-180')} />
                  </button>
                  {servicesOpen && (
                    <div className="absolute top-full left-1/2 mt-3 w-[300px] -translate-x-1/2 rounded-2xl border border-black/5 bg-white p-2 shadow-xl">
                      {tier1Services.map((service) => (
                        <Link
                          key={service.slug}
                          href={`/services/${service.slug}`}
                          className="block rounded-xl px-4 py-2.5 text-[0.95rem] text-[#14181c]/80 transition-colors hover:bg-[#F4F3EE] hover:text-[#14181c]"
                          onClick={() => setServicesOpen(false)}
                        >
                          {service.shortTitle}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={link.label} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          {/* Right actions — Login + shimmer in one pill, matching home */}
          <div className="hidden md:flex items-center gap-1 rounded-full border border-black/[0.04] bg-white/55 p-1.5 backdrop-blur-md">
            <Link
              href="/sign-in"
              className="px-4 py-1.5 text-[0.95rem] text-[#14181c]/70 hover:text-[#14181c] transition-colors"
            >
              Login
            </Link>
            <ShimmerButton href="/welcome" onClick={() => trackCtaClick('nav', 'Start For Free')}>
              Start For Free
            </ShimmerButton>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden rounded-full border border-black/10 p-2 text-[#14181c]"
            aria-label="Menu"
          >
            <MenuToggleIcon open={open} className="size-5" duration={300} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-x-0 top-[64px] bottom-0 z-50 flex flex-col bg-[#F4F3EE] md:hidden',
          open ? 'block' : 'hidden',
        )}
      >
        <div className="flex h-full w-full flex-col justify-between gap-y-2 p-6">
          <div className="grid gap-y-1">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="py-3 text-lg text-[#14181c] border-b border-black/5"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="py-3 text-lg text-left text-[#14181c] border-b border-black/5"
            >
              Login
            </Link>
          </div>
          <ShimmerButton
            href="/welcome"
            className="w-full"
            onClick={() => { setOpen(false); trackCtaClick('nav_mobile', 'Start For Free'); }}
          >
            Start For Free
          </ShimmerButton>
        </div>
      </div>
    </header>
  );
}
