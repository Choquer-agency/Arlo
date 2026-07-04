import type { Metadata } from "next";

// /contact is a client component and can't export metadata itself; this layout
// supplies it (previously the page silently inherited the homepage title/desc).
export const metadata: Metadata = {
  title: "Contact ARLO | Talk to us about connecting Claude to your stack",
  description:
    "Questions about ARLO — the MCP connector that plugs Claude into GA4, Search Console, Google Ads, Meta, YouTube, and more? Get in touch.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
