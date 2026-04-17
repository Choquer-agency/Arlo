import type { Metadata } from "next";
import Link from "next/link";
import { ClientLayout } from "@/components/ClientLayout";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { AGENCY_NAME, CONTACT_EMAIL, siteConfig } from "@/lib/siteConfig";

const LAST_UPDATED = "April 14, 2026";

export const metadata: Metadata = {
  title: `Terms of Service | ${AGENCY_NAME}`,
  description: `The terms that govern your use of ${AGENCY_NAME}.`,
  alternates: { canonical: `${siteConfig.url}/terms` },
};

export default function TermsPage() {
  return (
    <ClientLayout>
      <Nav />
      <main className="section-space-hero" style={{ backgroundColor: "#EBFFF6" }}>
        <div className="u-container max-w-3xl">
          <p className="eyebrow text-brand mb-4">Legal</p>
          <h1 className="font-sans font-medium text-fluid-h2 leading-[1.1] tracking-tight text-dark mb-4">
            Terms of Service
          </h1>
          <p className="text-dark/60 font-mono text-xs uppercase tracking-wider">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </main>

      <article className="u-container max-w-3xl py-16 prose prose-dark prose-headings:font-sans prose-headings:font-medium prose-headings:text-dark prose-p:text-dark/80 prose-li:text-dark/80 prose-a:text-brand">
        <p>
          Welcome to {AGENCY_NAME}. By accessing or using our service, you agree
          to these terms. Please read them carefully.
        </p>

        <h2>1. The service</h2>
        <p>
          {AGENCY_NAME} is a software service that connects your business&apos;s
          marketing platforms (Google Analytics, Search Console, Ads, YouTube,
          Business Profile, and others) to large language models — most
          commonly Anthropic&apos;s Claude — through the Model Context Protocol
          (MCP). You connect each source once; {AGENCY_NAME} provides the
          authenticated bridge so you (or your workspace members) can ask
          questions about your data in natural language.
        </p>

        <h2>2. Your account</h2>
        <ul>
          <li>
            You must be at least 13 years old (16 in the EEA) to use{" "}
            {AGENCY_NAME}.
          </li>
          <li>
            You&apos;re responsible for the activity in your account, including
            anyone you invite as a workspace member.
          </li>
          <li>
            You must provide accurate information and keep your sign-in
            credentials secure. Tell us promptly if you suspect unauthorized
            access.
          </li>
        </ul>

        <h2>3. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>
            Connect a third-party platform you don&apos;t have authority to
            connect.
          </li>
          <li>
            Use {AGENCY_NAME} to violate any third party&apos;s terms (e.g.{" "}
            Google API ToS, Meta Platform Terms).
          </li>
          <li>
            Resell, sublicense, or expose the {AGENCY_NAME} API to end-users
            outside your workspace without our written agreement.
          </li>
          <li>
            Reverse-engineer, scrape, or attempt to circumvent our rate limits
            or security controls.
          </li>
          <li>
            Use the service for unlawful purposes or to process data you have
            no right to access.
          </li>
        </ul>

        <h2>4. Fees and billing</h2>
        <ul>
          <li>
            {AGENCY_NAME} offers paid plans listed at{" "}
            <Link href="/pricing">/pricing</Link>. Fees are charged in advance
            and are non-refundable except where required by law.
          </li>
          <li>
            We may change plan pricing or limits with at least 30 days&apos;
            notice; changes apply at the start of your next billing cycle.
          </li>
          <li>
            If you exceed your plan&apos;s usage limits we may throttle, queue,
            or pause queries until the next cycle, or prompt you to upgrade.
          </li>
        </ul>

        <h2>5. Your data</h2>
        <ul>
          <li>
            You retain ownership of all data you connect to {AGENCY_NAME}. We
            store and process it only to operate the service.
          </li>
          <li>
            Our handling of personal data is described in our{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </li>
          <li>
            You can disconnect any source or delete your workspace at any time;
            associated tokens and personal data are deleted within 30 days.
          </li>
        </ul>

        <h2>6. Third-party services</h2>
        <p>
          {AGENCY_NAME} integrates with services like Google, Meta, Anthropic,
          Stripe, and others. Your use of those services is governed by their
          respective terms. We&apos;re not responsible for changes they make to
          their APIs, pricing, or availability.
        </p>

        <h2>7. Service availability</h2>
        <p>
          We aim for high availability but don&apos;t guarantee uninterrupted
          service. Maintenance, third-party outages, or rate limits at upstream
          providers may temporarily affect responses.
        </p>

        <h2>8. AI-generated responses</h2>
        <p>
          {AGENCY_NAME} returns data from your connected sources. When that
          data is interpreted by Claude or another LLM, the resulting summaries
          and suggestions may contain errors. You are responsible for verifying
          insights before acting on them. We are not liable for business
          decisions made based on AI outputs.
        </p>

        <h2>9. Disclaimer of warranties</h2>
        <p>
          {AGENCY_NAME} is provided &quot;as is&quot; and &quot;as
          available&quot; without warranties of any kind, express or implied,
          including merchantability, fitness for a particular purpose, and
          non-infringement.
        </p>

        <h2>10. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, {AGENCY_NAME} and its
          contributors are not liable for any indirect, incidental, special,
          consequential, or punitive damages, or any loss of profits, revenue,
          data, or business opportunity, arising out of or related to your use
          of the service. Our total liability for any claim is limited to the
          amounts you paid us in the 12 months preceding the claim.
        </p>

        <h2>11. Termination</h2>
        <p>
          You may stop using {AGENCY_NAME} at any time by deleting your
          workspace. We may suspend or terminate accounts that violate these
          terms, with or without notice depending on the severity. On
          termination, your right to use the service ends immediately and we
          delete your data per our retention policy.
        </p>

        <h2>12. Changes</h2>
        <p>
          We may update these terms over time. We&apos;ll post the new version
          here and update the &quot;Last updated&quot; date. Material changes
          will be communicated by email at least 30 days before they take
          effect.
        </p>

        <h2>13. Governing law</h2>
        <p>
          These terms are governed by the laws of British Columbia, Canada,
          without regard to conflict-of-law principles. Disputes will be
          resolved in the courts of British Columbia, except where you have
          mandatory consumer-protection rights to pursue claims locally.
        </p>

        <h2>14. Contact</h2>
        <p>
          Questions? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or write to{" "}
          {AGENCY_NAME}, c/o {siteConfig.founder}, {siteConfig.location}.
        </p>

        <p className="mt-12 text-sm">
          See also our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </article>

      <Footer />
    </ClientLayout>
  );
}
