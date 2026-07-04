import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { neueMontreal, neueBit, ibmPlexMono } from "./fonts";
import { siteConfig } from "@/lib/siteConfig";
import { GoogleTagManager, GoogleTagManagerNoscript, GoogleAnalytics } from "@/components/GoogleTagManager";

const GA4_MEASUREMENT_ID = "G-CP22NBPLFP";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import "./globals.css";

export const metadata: Metadata = {
  // metadataBase lets per-page relative canonicals/OG resolve to absolute URLs.
  metadataBase: new URL(siteConfig.url),
  title: `${siteConfig.name} | Ask Claude about any client, any platform`,
  description:
    "ARLO plugs Claude into every account your agency runs. Connect GA4, Search Console, Google Ads, Meta, YouTube, Shopify and more in one URL. Live data, every client, every platform — no exports, no dashboards, no warehouse.",
  keywords:
    "Claude MCP, agency reporting, Claude Desktop connector, MCP server, GA4 reporting, Search Console, Google Ads reporting, Meta Ads reporting, client dashboard alternative, Windsor alternative, Supermetrics alternative, AI agency tools",
  openGraph: {
    title: `${siteConfig.name} | Ask Claude about any client, any platform`,
    description:
      "One MCP connector for every client and every platform. GA4, Search Console, Google Ads, Meta, YouTube, Shopify — live, conversational, no exports.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Ask Claude about any client, any platform`,
    description: siteConfig.description,
  },
  // NOTE: no site-wide canonical here. A hardcoded homepage canonical in the
  // root layout was being inherited by every page (Next.js shallow-merges
  // metadata), telling Google ~17 inner pages were duplicates of the homepage.
  // Each page now self-canonicalizes (or sets its own alternates.canonical).
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const convexConfigured = !!process.env.NEXT_PUBLIC_CONVEX_URL;

  const shell = (
    <html
      lang="en"
      suppressHydrationWarning
      className={`w-mod-js lenis ${neueMontreal.variable} ${neueBit.variable} ${ibmPlexMono.variable}`}
      data-scroll-orientation="vertical"
    >
      <head suppressHydrationWarning>
        {siteConfig.gtmId && <GoogleTagManager gtmId={siteConfig.gtmId} />}
        <GoogleAnalytics measurementId={GA4_MEASUREMENT_ID} />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        {siteConfig.gtmId && <GoogleTagManagerNoscript gtmId={siteConfig.gtmId} />}
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );

  return convexConfigured ? (
    <ConvexAuthNextjsServerProvider>{shell}</ConvexAuthNextjsServerProvider>
  ) : (
    shell
  );
}
