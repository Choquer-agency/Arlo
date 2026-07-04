"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Copy, RotateCw, Check, AlertTriangle } from "lucide-react";
import { track } from "@/lib/posthog";

export default function ConnectToClaudePage() {
  const workspaces = useQuery(api.workspaces.listMine);
  const ws = workspaces?.[0];

  const [token, setToken] = useState<string | null | undefined>(undefined); // undefined = loading
  const [copied, setCopied] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [rotating, setRotating] = useState(false);
  const generatedRef = useRef(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://askarlo.app";
  const mcpUrl = token ? `${baseUrl}/api/mcp?token=${token}` : "";

  // Reveal the existing token; auto-generate one the first time so the URL is
  // always ready to copy.
  useEffect(() => {
    if (!ws) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/mcp/token?workspaceId=${ws._id}`);
      const data = await res.json().catch(() => ({}));
      if (cancelled) return;
      if (data.token) {
        setToken(data.token);
      } else if (!generatedRef.current) {
        generatedRef.current = true;
        await rotate(false);
      } else {
        setToken(null);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ws?._id]);

  async function rotate(manual = false) {
    if (!ws) return;
    setRotating(true);
    try {
      const res = await fetch("/api/mcp/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: ws._id }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        if (manual) track("mcp_token_rotated");
      }
    } finally {
      setRotating(false);
      setConfirmRotate(false);
    }
  }

  async function copyUrl() {
    if (!mcpUrl) return;
    await navigator.clipboard.writeText(mcpUrl);
    track("mcp_url_copied");
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="max-w-container-sm mx-auto">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
        Claude Desktop
      </p>
      <h1 className="font-sans text-fluid-h2 text-dark mb-3">Connect to Claude</h1>
      <p className="text-dark/60 text-fluid-main max-w-xl mb-10">
        Two steps and Claude Desktop can answer questions about your businesses — sessions,
        clicks, rankings, all of it. No technical setup, and you never have to know what any
        of the acronyms mean.
      </p>

      {/* STEP 1 — copy */}
      <section className="mb-6">
        <StepHeader n={1} title="Copy your connection link" />
        <div className="bg-dark text-white rounded-lg p-6">
          <div className="flex items-center gap-2 bg-bg-dark border border-light-faded rounded-md pl-4 pr-2 py-2 mb-4">
            <span className="flex-1 min-w-0 font-mono text-sm break-all text-brand-neon">
              {token === undefined || rotating ? (
                <span className="opacity-50">Preparing your link…</span>
              ) : token ? (
                mcpUrl
              ) : (
                <span className="opacity-50">Couldn&apos;t load your link — rotate to create one.</span>
              )}
            </span>
            <button
              onClick={() => setConfirmRotate(true)}
              disabled={rotating}
              title="Rotate — create a new link and disable the old one"
              className="shrink-0 flex items-center gap-1.5 pl-2.5 pr-3 py-2 rounded text-white/70 hover:text-white hover:bg-light-faded disabled:opacity-40"
            >
              <RotateCw size={14} className={rotating ? "animate-spin" : ""} />
              <span className="font-mono text-[11px] uppercase tracking-wider">Rotate</span>
            </button>
          </div>
          <button
            onClick={copyUrl}
            disabled={!token || rotating}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-neon text-dark px-8 py-3 font-mono text-sm uppercase tracking-wider rounded disabled:opacity-40 hover:opacity-90"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </section>

      {/* STEP 2 — add to Claude Desktop */}
      <section className="mb-8">
        <StepHeader n={2} title="Add it in Claude Desktop" />
        <div className="bg-white border border-dark-faded rounded-lg p-6 sm:p-8">
          <ol className="space-y-5">
            <SubStep>
              Open <b>Claude Desktop</b>. In the <b>left menu</b>, click{" "}
              <b>Customize → Connectors</b>.
            </SubStep>
            <SubStep>
              Click the <b>+</b>, then <b>Add custom connector</b>.
            </SubStep>
            <SubStep>
              In the popup, set the <b>Name</b> to{" "}
              <code className="font-mono bg-grey px-1.5 py-0.5 rounded text-dark">Arlo</code>.
            </SubStep>
            <SubStep>
              Paste your link into the <b>URL</b> field. <b>Leave every other field blank</b> —
              don&apos;t touch Advanced settings or the OAuth boxes.
            </SubStep>
            <SubStep>
              Click <b>Add</b>. That&apos;s it — Claude is connected.
            </SubStep>
          </ol>

          <div className="mt-7 pt-6 border-t border-dark-faded">
            <p className="font-mono text-[11px] uppercase tracking-wider text-dark/50 mb-2">
              Try it — start a new chat and ask
            </p>
            <code className="block font-mono text-sm bg-grey px-4 py-3 rounded text-dark">
              What clients do I have in Arlo?
            </code>
          </div>
        </div>
      </section>

      <p className="text-fluid-small text-dark/50">
        Lost a laptop or shared the link by mistake?{" "}
        <button onClick={() => setConfirmRotate(true)} className="text-brand underline">
          Rotate your link
        </button>{" "}
        — the old one stops working everywhere and you&apos;ll paste the new one into Claude again.
      </p>

      {confirmRotate && (
        <RotateConfirm
          rotating={rotating}
          onCancel={() => setConfirmRotate(false)}
          onConfirm={() => rotate(true)}
        />
      )}
    </div>
  );
}

function StepHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="w-7 h-7 rounded-full bg-dark text-brand-lime font-mono text-sm flex items-center justify-center shrink-0">
        {n}
      </span>
      <h2 className="font-sans text-fluid-h5 text-dark">{title}</h2>
    </div>
  );
}

function SubStep({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-fluid-main text-dark/85">
      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}

function RotateConfirm({
  rotating,
  onCancel,
  onConfirm,
}: {
  rotating: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-dark/50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <span className="w-9 h-9 rounded-full bg-bg-yellow/40 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-dark" />
          </span>
          <div>
            <h3 className="font-sans text-fluid-h5 text-dark mb-1">Rotate your connection link?</h3>
            <p className="text-dark/70 text-sm leading-relaxed">
              This creates a brand-new link and <b>immediately disables the current one</b>. Any
              Claude Desktop already connected will stop working until you paste the new link in
              again. Only do this if you want to cut off the old link.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={rotating}
            className="px-5 py-2.5 rounded font-mono text-xs uppercase tracking-wider text-dark border border-dark-faded hover:bg-grey disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={rotating}
            className="px-5 py-2.5 rounded font-mono text-xs uppercase tracking-wider bg-dark text-white hover:opacity-90 disabled:opacity-40 inline-flex items-center gap-2"
          >
            {rotating && <RotateCw size={13} className="animate-spin" />}
            {rotating ? "Rotating…" : "Yes, rotate"}
          </button>
        </div>
      </div>
    </div>
  );
}
