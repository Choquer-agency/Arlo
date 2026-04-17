"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function ConnectionsPage() {
  const workspaces = useQuery(api.workspaces.listMine);
  const ws = workspaces?.[0];
  const connections = useQuery(
    api.platformConnections.listForWorkspace,
    ws ? { workspaceId: ws._id } : "skip"
  );

  const googleConn = connections?.find((c) => c.provider === "google");

  return (
    <div className="max-w-container mx-auto">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
        Platform connections
      </p>
      <h1 className="font-sans text-fluid-h2 text-dark mb-10">Connect your platforms</h1>

      <div className="bg-white border border-dark-faded rounded-lg p-8 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-sans text-fluid-h4 text-dark">Google</h2>
            <p className="text-dark opacity-60 text-fluid-main">
              One OAuth unlocks GA4, Search Console, Google Ads, YouTube, and Business Profile for every client.
            </p>
          </div>
          {googleConn?.status === "active" ? (
            <span className="font-mono text-xs uppercase tracking-wider text-brand bg-mint px-3 py-1 rounded">
              Connected as {googleConn.accountEmail}
            </span>
          ) : (
            <a
              href="/api/oauth/google/start"
              className="btn-secondary px-6 py-3"
            >
              Connect Google
            </a>
          )}
        </div>
        {googleConn?.availableAccounts && (
          <div className="mt-6 pt-6 border-t border-dark-faded grid grid-cols-5 gap-4 text-center">
            <AccountCount kind="ga4_property" label="GA4 properties" accounts={googleConn.availableAccounts} />
            <AccountCount kind="gsc_site" label="GSC sites" accounts={googleConn.availableAccounts} />
            <AccountCount kind="ads_customer" label="Ads customers" accounts={googleConn.availableAccounts} />
            <AccountCount kind="yt_channel" label="YouTube channels" accounts={googleConn.availableAccounts} />
            <AccountCount kind="gbp_location" label="GBP locations" accounts={googleConn.availableAccounts} />
          </div>
        )}
      </div>

      {["Meta", "LinkedIn", "TikTok", "Shopify", "Stripe", "HubSpot", "MailerLite", "Mailchimp"].map((provider) => (
        <div key={provider} className="bg-white border border-dark-faded rounded-lg p-6 mb-3 flex items-center justify-between opacity-60">
          <div>
            <h3 className="font-sans text-fluid-h5 text-dark">{provider}</h3>
            <p className="text-dark opacity-60 text-fluid-small">Coming soon</p>
          </div>
          <span className="font-mono text-xs uppercase tracking-wider text-dark opacity-40">Phase 2</span>
        </div>
      ))}
    </div>
  );
}

function AccountCount({
  kind,
  label,
  accounts,
}: {
  kind: string;
  label: string;
  accounts: Array<{ id: string; name: string; kind: string }>;
}) {
  const count = accounts.filter((a) => a.kind === kind).length;
  return (
    <div>
      <p className="font-sans text-fluid-h4 text-dark">{count}</p>
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60">{label}</p>
    </div>
  );
}
