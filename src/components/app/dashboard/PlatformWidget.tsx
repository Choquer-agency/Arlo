"use client";

import { ReactNode, useState } from "react";
import { Check, Copy, Plus, RefreshCw, AlertTriangle } from "lucide-react";

interface Props {
  icon: ReactNode;
  color: string;
  platform: string;
  detail: string;
  /** Right-side status pill — "Connected" / "Not connected" / etc. */
  status: ReactNode;
  /** Action button shown after the status pill — refresh, configure, etc. */
  trailing?: ReactNode;
  /** The widget body — metric tiles, picker, CTA, error, whatever. */
  children: ReactNode;
  /** Sample prompts shown at the bottom. */
  prompts: string[];
}

/**
 * Shared platform widget shell. Header (icon + name + detail + status) +
 * variable body + "Try asking Claude" footer with copy buttons. The body is
 * passed in by the specific widget (Ga4Widget, etc.) which knows how to render
 * its own connected/loading/error/data states.
 */
export function PlatformWidget({
  icon,
  color,
  platform,
  detail,
  status,
  trailing,
  children,
  prompts,
}: Props) {
  return (
    <section className="bg-white border border-dark-faded rounded-lg p-8 mb-6">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <h2 className="font-sans text-fluid-h5 text-dark">{platform}</h2>
            <p className="font-mono text-[11px] text-dark opacity-60 mt-0.5 truncate">
              {detail}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {status}
          {trailing}
        </div>
      </div>

      {children}

      <div className="border-t border-dark-faded pt-4 mt-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-dark opacity-60 mb-2">
          Try asking Claude
        </p>
        <div className="space-y-2">
          {prompts.map((p, i) => (
            <PromptRow key={i} text={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Status pills ─────────────────────────────────── */

export function ConnectedPill() {
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-brand bg-mint px-2 py-1 rounded">
      Connected
    </span>
  );
}

export function NotConnectedPill() {
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-dark/60 bg-grey px-2 py-1 rounded">
      Not connected
    </span>
  );
}

export function NeedsAssignmentPill() {
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-dark bg-bg-yellow/40 px-2 py-1 rounded">
      Pick account
    </span>
  );
}

/* ─── Body states ──────────────────────────────────── */

export function ConnectGoogleCta({ valueProp }: { valueProp: string }) {
  return (
    <div className="rounded-lg border border-dashed border-dark/20 p-6">
      <p className="text-dark text-sm mb-4 max-w-xl">{valueProp}</p>
      <a
        href="/api/oauth/google/start"
        className="inline-flex items-center gap-2 btn-secondary px-5 py-2.5 text-sm"
      >
        <Plus size={14} /> Connect Google
      </a>
    </div>
  );
}

export function NoAccountAvailable({
  platform,
  message,
}: {
  platform: string;
  message?: string;
}) {
  return (
    <div className="rounded-lg bg-grey p-5 text-sm text-dark/80">
      {message ??
        `Your Google account doesn't have any ${platform} accounts. Grant access in Google or sign in with a different account.`}
    </div>
  );
}

export function WidgetError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-lg border border-bg-red/30 bg-bg-red/5 p-5 flex items-start gap-3">
      <AlertTriangle size={16} className="text-bg-red mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-dark text-sm mb-2">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-dark/70 hover:text-dark"
          >
            <RefreshCw size={12} /> Retry
          </button>
        )}
      </div>
    </div>
  );
}

export function MetricGrid({
  loading,
  metrics,
}: {
  loading: boolean;
  metrics: { label: string; value: string; sub?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {metrics.map((m) => (
        <div key={m.label} className="bg-grey rounded-lg p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-dark opacity-60 mb-1">
            {m.label}
          </p>
          {loading ? (
            <div className="h-6 w-20 bg-dark/10 rounded animate-pulse" />
          ) : (
            <p className="font-sans text-fluid-h5 text-dark">{m.value}</p>
          )}
          {m.sub && !loading && (
            <p className="font-mono text-xs text-dark/50 mt-1">{m.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function TopItemsList({
  loading,
  label,
  items,
}: {
  loading: boolean;
  label: string;
  items: { left: string; right: string }[];
}) {
  return (
    <div className="mb-2">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-3">
        {label}
      </p>
      <div className="divide-y divide-dark-faded">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 gap-3">
                <div className="h-3.5 w-1/3 bg-dark/10 rounded animate-pulse" />
                <div className="h-3 w-24 bg-dark/10 rounded animate-pulse" />
              </div>
            ))
          : items.length === 0
          ? (
            <p className="text-dark/60 text-sm py-3">No data yet for this date range.</p>
          )
          : items.map((it, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 gap-3">
                <span className="text-dark text-sm truncate">{it.left}</span>
                <span className="font-mono text-xs text-dark/60 shrink-0">{it.right}</span>
              </div>
            ))}
      </div>
    </div>
  );
}

/* ─── Prompts ──────────────────────────────────────── */

const PROMPT_PREFIX = "Using Arlo — ";

function PromptRow({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(PROMPT_PREFIX + text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 bg-grey rounded text-sm">
      <span className="text-dark/80 truncate">
        <span className="text-brand font-medium">Using Arlo —</span> {text}
      </span>
      <button
        onClick={copy}
        className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-dark/70 hover:text-dark shrink-0"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
