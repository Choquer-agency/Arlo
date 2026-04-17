import type { Metadata } from "next";
import Link from "next/link";
import { ClientLayout } from "@/components/ClientLayout";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { AGENCY_NAME, CONTACT_EMAIL, siteConfig } from "@/lib/siteConfig";

const LAST_UPDATED = "April 14, 2026";

export const metadata: Metadata = {
  title: `Privacy Policy | ${AGENCY_NAME}`,
  description: `How ${AGENCY_NAME} collects, uses, and protects your data.`,
  alternates: { canonical: `${siteConfig.url}/privacy` },
};

export default function PrivacyPage() {
  return (
    <ClientLayout>
      <Nav />
      <main className="section-space-hero" style={{ backgroundColor: "#EBFFF6" }}>
        <div className="u-container max-w-3xl">
          <p className="eyebrow text-brand mb-4">Legal</p>
          <h1 className="font-sans font-medium text-fluid-h2 leading-[1.1] tracking-tight text-dark mb-4">
            Privacy Policy
          </h1>
          <p className="text-dark/60 font-mono text-xs uppercase tracking-wider">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </main>

      <article className="u-container max-w-3xl py-16 prose prose-dark prose-headings:font-sans prose-headings:font-medium prose-headings:text-dark prose-p:text-dark/80 prose-li:text-dark/80 prose-a:text-brand">
        <p>
          {AGENCY_NAME} (&quot;{AGENCY_NAME}&quot;, &quot;we&quot;, &quot;us&quot;)
          provides a tool that lets businesses connect their marketing platforms
          (Google Analytics, Search Console, Ads, YouTube, Business Profile, and
          others) to Claude Desktop via the Model Context Protocol (MCP). This
          policy explains what data we collect, why, and how we protect it.
        </p>

        <h2>1. Data we collect</h2>
        <h3>Account data</h3>
        <ul>
          <li>
            Your name, email address, and Google account ID when you sign in.
          </li>
          <li>
            Your business name, website URL, and any team members you invite.
          </li>
        </ul>

        <h3>Connection credentials</h3>
        <ul>
          <li>
            OAuth access and refresh tokens for any third-party platform you
            connect (Google Analytics, Search Console, Google Ads, YouTube,
            Google Business Profile, and others as added). These tokens grant{" "}
            {AGENCY_NAME} permission to read data from those platforms on your
            behalf.
          </li>
          <li>
            Tokens are encrypted at rest using AES-256 before being stored in
            our database.
          </li>
          <li>
            We never receive or store your account passwords for any third-party
            platform.
          </li>
        </ul>

        <h3>Usage data</h3>
        <ul>
          <li>
            An audit log of every Model Context Protocol tool call made through
            your workspace — which tool was called, with which arguments,
            success/failure, and duration. This is used for billing, debugging,
            and to give workspace owners visibility into how their team uses
            the product.
          </li>
          <li>
            Standard web analytics (page views, referrers) on our marketing
            site.
          </li>
        </ul>

        <h2>2. How we use Google user data</h2>
        <p>
          {AGENCY_NAME}&apos;s use and transfer to any other app of information
          received from Google APIs will adhere to the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
        <p>
          Specifically, when you connect a Google account, we request access to
          one or more of the following scopes — only the ones you grant — and
          use them strictly to fulfil the queries you (or Claude, acting on
          your behalf) send to {AGENCY_NAME}:
        </p>
        <ul>
          <li>
            <strong>analytics.readonly</strong> — read-only access to your
            Google Analytics 4 properties to surface traffic, conversion, and
            user-behaviour data on your dashboard and answer questions in Claude.
          </li>
          <li>
            <strong>webmasters.readonly</strong> — read-only access to your
            Search Console properties to surface organic search performance.
          </li>
          <li>
            <strong>adwords</strong> — read-only access to Google Ads spend,
            conversions, and campaign performance.
          </li>
          <li>
            <strong>youtube.readonly + yt-analytics.readonly</strong> —
            read-only access to your YouTube channel performance.
          </li>
          <li>
            <strong>business.manage</strong> — read your Google Business
            Profile insights (Maps views, direction requests, calls, reviews).
            We do not modify your Business Profile.
          </li>
        </ul>
        <p>
          We do not use Google user data for advertising, do not transfer it to
          third parties except to provide the service you requested, and do not
          allow humans to read it except (a) with your explicit consent, (b) as
          needed for security or to comply with law, or (c) when the data is
          aggregated and used for internal operations in a way that cannot
          identify you.
        </p>

        <h2>3. Sub-processors</h2>
        <p>We share data with these third parties only as required to operate the service:</p>
        <ul>
          <li>
            <strong>Convex</strong> — database and serverless backend hosting.
          </li>
          <li>
            <strong>Vercel</strong> — application hosting and edge delivery.
          </li>
          <li>
            <strong>Anthropic</strong> — when you connect your {AGENCY_NAME} MCP
            URL to Claude Desktop, your queries (and the data {AGENCY_NAME}{" "}
            returns to Claude) flow through Anthropic to generate responses.
            Anthropic&apos;s privacy policy applies to that interaction.
          </li>
          <li>
            <strong>Stripe</strong> — payment processing for paid plans.
          </li>
        </ul>

        <h2>4. Data retention &amp; deletion</h2>
        <ul>
          <li>
            You can disconnect any platform at any time from the Connections
            page; we immediately revoke and delete the stored tokens.
          </li>
          <li>
            You can delete your workspace at any time, which permanently
            removes all your data within 30 days.
          </li>
          <li>
            Audit logs are retained for up to 3 years depending on your plan
            (see your plan&apos;s details).
          </li>
        </ul>

        <h2>5. Security</h2>
        <ul>
          <li>OAuth tokens are encrypted at rest with AES-256.</li>
          <li>All data transfer uses TLS 1.2+.</li>
          <li>
            We follow least-privilege access controls internally; no member of
            our team has direct production database access without a signed
            access request and audit trail.
          </li>
        </ul>

        <h2>6. Your rights</h2>
        <p>
          Depending on your jurisdiction (GDPR, CCPA, PIPEDA, etc.) you may have
          the right to access, correct, export, or delete the personal data we
          hold about you. Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we&apos;ll
          respond within 30 days.
        </p>

        <h2>7. Children</h2>
        <p>
          {AGENCY_NAME} is not directed to children under 13 (or under 16 in
          the EEA) and we do not knowingly collect data from them.
        </p>

        <h2>8. Changes to this policy</h2>
        <p>
          We&apos;ll update this page when our practices change and revise the
          &quot;Last updated&quot; date at the top. For material changes,
          we&apos;ll notify active workspaces by email at least 30 days before
          the change takes effect.
        </p>

        <h2>9. Contact</h2>
        <p>
          Questions? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or write to{" "}
          {AGENCY_NAME}, c/o {siteConfig.founder}, {siteConfig.location}.
        </p>

        <p className="mt-12 text-sm">
          See also our <Link href="/terms">Terms of Service</Link>.
        </p>
      </article>

      <Footer />
    </ClientLayout>
  );
}
