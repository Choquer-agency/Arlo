/**
 * Public share page — rendered server-side per request. Auth is the token in
 * the URL path; lookup is by_live_token_hash. The workspaceId + clientId come
 * from the matched destination row so the URL can NEVER be repurposed to query
 * a different client (same NDA story as /api/mcp/client/*).
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createHash } from "crypto";
import { fetchQuery } from "convex/nextjs";
import { internal } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { fetchDataset } from "@/lib/datasets/fetchDataset";
import type { DateRangeInput } from "@/lib/connectors/types";
import type { PlatformRef } from "@/lib/connectors/registry";

interface SourceSpec {
  platform: PlatformRef;
  label: string;
  metrics: string[];
  dimensions?: string[];
  dateRange: DateRangeInput;
}

interface ShareConfig {
  clientDisplayName?: string;
  brandColor?: string;
  sources: SourceSpec[];
  expiresAt?: number;
}

function hashToken(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Performance dashboard",
  robots: { index: false, follow: false },
};

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!token || token.length < 16) notFound();

  const tokenHash = hashToken(token);
  const resolved = await fetchQuery(internal.shareableDashboards.resolveByTokenHash, {
    tokenHash,
  });
  if (!resolved) notFound();

  const config = resolved.config as ShareConfig;
  if (config.expiresAt && Date.now() > config.expiresAt) {
    return <ExpiredNotice />;
  }
  if (!resolved.clientId) notFound();

  // Fetch every source in parallel. A source failure isolates to its card.
  const results = await Promise.all(
    config.sources.map(async (s) => {
      try {
        const data = await fetchDataset({
          workspaceId: resolved.workspaceId,
          clientId: resolved.clientId as Id<"clients">,
          platform: s.platform,
          metrics: s.metrics,
          dimensions: s.dimensions,
          dateRange: s.dateRange,
        });
        return { source: s, data, error: null as string | null };
      } catch (err) {
        return {
          source: s,
          data: null,
          error: err instanceof Error ? err.message : "Failed to load",
        };
      }
    })
  );

  const brandColor = config.brandColor ?? "#3E8F4A";
  const clientName = config.clientDisplayName ?? results[0]?.data?.client?.name ?? "Client";

  return (
    <div className="min-h-screen bg-grey">
      <header className="bg-white border-b border-dark-faded">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p
              className="font-mono text-xs uppercase tracking-wider mb-1"
              style={{ color: brandColor }}
            >
              Performance dashboard
            </p>
            <h1 className="font-sans text-fluid-h3 text-dark">{clientName}</h1>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-dark opacity-50">
            Live · refreshes on page load
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        {results.map((r) => (
          <SourceCard
            key={r.source.label}
            label={r.source.label}
            platform={String(r.source.platform)}
            brandColor={brandColor}
            data={r.data}
            error={r.error}
          />
        ))}

        <p className="text-center font-mono text-[11px] uppercase tracking-wider text-dark opacity-40 pt-4">
          Delivered by ARLO · askarlo.app
        </p>
      </main>
    </div>
  );
}

function SourceCard({
  label,
  platform,
  brandColor,
  data,
  error,
}: {
  label: string;
  platform: string;
  brandColor: string;
  data: Awaited<ReturnType<typeof fetchDataset>> | null;
  error: string | null;
}) {
  if (error || !data) {
    return (
      <section className="bg-white border border-bg-red/30 rounded-lg p-6">
        <p className="font-sans text-dark mb-1">{label}</p>
        <p className="font-mono text-xs text-bg-red">{error ?? "No data"}</p>
      </section>
    );
  }

  const totals = Object.entries(data.totals);
  const top = (data.breakdown ?? []).slice(0, 5);

  return (
    <section className="bg-white border border-dark-faded rounded-lg overflow-hidden">
      <div
        className="px-6 py-4 border-b border-dark-faded flex items-baseline justify-between gap-4 flex-wrap"
        style={{ borderTop: `3px solid ${brandColor}` }}
      >
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color: brandColor }}>
            {platform}
          </p>
          <p className="font-sans text-fluid-h5 text-dark mt-1">{label}</p>
        </div>
        <p className="font-mono text-[11px] text-dark opacity-60">
          {data.dateRange.label} · {data.dateRange.start} → {data.dateRange.end}
        </p>
      </div>
      <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-3 gap-4">
        {totals.map(([m, v]) => (
          <div key={m} className="bg-grey rounded-lg p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-dark opacity-60 mb-1">
              {m.replace(/_/g, " ")}
            </p>
            <p className="font-sans text-fluid-h5 text-dark">{formatMetric(m, v)}</p>
          </div>
        ))}
      </div>
      {top.length > 0 && (
        <div className="px-6 pb-6">
          <p className="font-mono text-[10px] uppercase tracking-wider text-dark opacity-60 mb-2">
            Top breakdown
          </p>
          <table className="w-full text-sm">
            <tbody>
              {top.map((row, i) => {
                const dims = row.dimensions ? Object.values(row.dimensions).join(" · ") : "—";
                const metric = Object.entries(row.metrics)[0];
                return (
                  <tr key={i} className="border-b border-dark-faded last:border-0">
                    <td className="py-2 text-dark">{dims}</td>
                    <td className="py-2 text-right font-mono text-dark">
                      {metric ? formatMetric(metric[0], metric[1]) : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function formatMetric(metric: string, value: number): string {
  if (!isFinite(value)) return "—";
  if (/rate|ctr|roas|engagement/.test(metric)) return `${(value * 100).toFixed(2)}%`;
  if (/cost|spend|revenue|aov|cpc|cpm/.test(metric))
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (/position/.test(metric)) return value.toFixed(1);
  if (Math.abs(value) >= 1000) return value.toLocaleString();
  return String(Math.round(value * 100) / 100);
}

function ExpiredNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-grey">
      <div className="bg-white border border-dark-faded rounded-lg p-10 max-w-md text-center">
        <p className="font-sans text-fluid-h4 text-dark mb-2">Link expired</p>
        <p className="text-dark opacity-60">
          This share link has passed its expiration date. Contact the agency that
          sent it for a refreshed URL.
        </p>
      </div>
    </div>
  );
}
