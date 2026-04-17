'use client';

import React from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { useContactForm } from '@/context/ContactFormContext';
import { AGENCY_NAME } from '@/lib/siteConfig';
import { ChevronDown } from 'lucide-react';
import { getTier1Services } from '@/content/services';
import { trackCtaClick } from '@/lib/analytics';

const tier1Services = getTier1Services();

const iconMap: Record<string, string> = {
  Users: "/images/icons/Group 1707479797.svg",
  Building2: "/images/icons/Group 1707479803.svg",
  Bot: "/images/icons/Group 1707479804.svg",
  Workflow: "/images/icons/Group 1707479806.svg",
  BarChart3: "/images/icons/Group 1707479807.svg",
  RefreshCcw: "/images/icons/Group 1707479808.svg",
};

const serviceColorFilters: Record<string, string> = {
  Users: "brightness(0) saturate(100%) invert(78%) sepia(52%) saturate(500%) hue-rotate(107deg)",
  Building2: "brightness(0) saturate(100%) invert(58%) sepia(89%) saturate(400%) hue-rotate(212deg)",
  Bot: "brightness(0) saturate(100%) invert(88%) sepia(40%) saturate(600%) hue-rotate(30deg)",
  Workflow: "brightness(0) saturate(100%) invert(55%) sepia(80%) saturate(500%) hue-rotate(310deg)",
  BarChart3: "brightness(0) saturate(100%) invert(70%) sepia(60%) saturate(600%) hue-rotate(160deg)",
  RefreshCcw: "brightness(0) saturate(100%) invert(72%) sepia(50%) saturate(500%) hue-rotate(350deg)",
};

const links: { label: string; href: string; hasDropdown?: boolean; isContact?: boolean }[] = [
  { label: 'Services', href: '/services', hasDropdown: true },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '#', isContact: true },
];

export function Nav() {
  const [open, setOpen] = React.useState(false);
  const [servicesOpen, setServicesOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const { openModal } = useContactForm();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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

  return (
    <header
      className={cn(
        'sticky top-0 z-50 mx-auto w-full max-w-6xl mt-4 md:rounded-md md:transition-all md:ease-out',
        {
          'bg-background/95 supports-[backdrop-filter]:bg-background/50 border border-border backdrop-blur-lg md:top-4 md:max-w-5xl md:shadow':
            scrolled && !open,
          'bg-transparent border-transparent': !scrolled && !open,
          'bg-background/90': open,
        },
      )}
    >
      <nav
        className={cn(
          'flex h-16 w-full items-center justify-between px-4 md:h-14 md:transition-all md:ease-out',
          {
            'md:px-3': scrolled,
          },
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-sans font-medium text-foreground">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.svg"
            alt={AGENCY_NAME}
            className="h-[1.125rem] w-auto"
          />
          <span className="font-display text-[1.625rem] tracking-tight leading-none text-dark">{AGENCY_NAME}</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) =>
            link.hasDropdown ? (
              <div key={link.label} className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'gap-1',
                  )}
                >
                  {link.label}
                  <ChevronDown
                    size={14}
                    className={cn('transition-transform', servicesOpen && 'rotate-180')}
                  />
                </button>

                {servicesOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] rounded-lg border bg-background p-4 shadow-xl">
                    <div className="grid grid-cols-2 gap-1">
                      {tier1Services.map((service) => (
                        <Link
                          key={service.slug}
                          href={`/services/${service.slug}`}
                          className="group rounded-md p-3 transition-colors hover:bg-accent flex items-start gap-3"
                          onClick={() => setServicesOpen(false)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={iconMap[service.icon] || "/images/icons/Group 1707479797.svg"}
                            alt=""
                            className="w-6 h-6 flex-shrink-0 mt-0.5"
                            style={{ filter: serviceColorFilters[service.icon] || "" }}
                          />
                          <div>
                            <p className="font-sans text-sm font-medium text-foreground group-hover:text-brand transition-colors">
                              {service.shortTitle}
                            </p>
                            <p className="font-sans text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              Replaces {service.replaces.slice(0, 2).join(', ')}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-3 border-t pt-3">
                      <Link
                        href="/services"
                        className="font-sans text-sm text-brand hover:underline"
                        onClick={() => setServicesOpen(false)}
                      >
                        View all services &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : link.isContact ? (
              <button
                key={link.label}
                className={buttonVariants({ variant: 'ghost' })}
                onClick={() => { trackCtaClick("nav", "Contact"); openModal(undefined, "nav"); }}
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.label}
                className={buttonVariants({ variant: 'ghost' })}
                href={link.href}
              >
                {link.label}
              </Link>
            ),
          )}
          <Link href="/sign-in">
            <Button
              onClick={() => trackCtaClick("nav", "Start for free")}
            >
              Start for free
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden">
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'bg-background/90 fixed top-16 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden',
          open ? 'block' : 'hidden',
        )}
      >
        <div
          data-slot={open ? 'open' : 'closed'}
          className={cn(
            'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
            'flex h-full w-full flex-col justify-between gap-y-2 p-4',
          )}
        >
          <div className="grid gap-y-1">
            {links.map((link) => link.isContact ? (
              <button
                key={link.label}
                className={buttonVariants({
                  variant: 'ghost',
                  className: 'justify-start text-base',
                })}
                onClick={() => { setOpen(false); trackCtaClick("nav_mobile", "Contact"); openModal(undefined, "nav_mobile"); }}
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.label}
                className={buttonVariants({
                  variant: 'ghost',
                  className: 'justify-start text-base',
                })}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/sign-in" onClick={() => setOpen(false)} className="w-full">
              <Button
                className="w-full"
                onClick={() => trackCtaClick("nav_mobile", "Start for free")}
              >
                Start for free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
