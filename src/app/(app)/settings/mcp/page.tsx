"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { Copy, RotateCw, Check } from "lucide-react";

export default function McpSettingsPage() {
  const workspaces = useQuery(api.workspaces.listMine);
  const ws = workspaces?.[0];
  const tokens = useQuery(
    api.mcpTokens.listMine,
    ws ? { workspaceId: ws._id } : "skip"
  );
  const [copied, setCopied] = useState(false);

  const existingToken = tokens?.[0];
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://askarlo.app";
  const mcpUrl = existingToken
    ? `${baseUrl}/api/mcp?token=${existingToken._id}`
    : `${baseUrl}/api/mcp?token=<generate-token-first>`;

  async function copyUrl() {
    await navigator.clipboard.writeText(mcpUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="max-w-container-sm mx-auto">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
        Settings
      </p>
      <h1 className="font-sans text-fluid-h2 text-dark mb-10">Your MCP URL</h1>

      <section className="bg-dark text-white rounded-lg p-10 mb-8">
        <p className="font-mono text-xs uppercase tracking-wider text-brand-neon mb-4">
          Claude Desktop connector
        </p>
        <div className="bg-bg-dark border border-light-faded rounded-md p-5 mb-6 font-mono text-sm break-all text-brand-neon">
          {mcpUrl}
        </div>
        <div className="flex gap-3">
          <button
            onClick={copyUrl}
            disabled={!existingToken}
            className="flex items-center gap-2 bg-brand-neon text-dark px-6 py-3 font-mono text-sm uppercase tracking-wider rounded disabled:opacity-40 hover:opacity-90"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy URL"}
          </button>
          {existingToken && (
            <button
              className="flex items-center gap-2 border border-light-faded text-white px-6 py-3 font-mono text-sm uppercase tracking-wider rounded hover:bg-light-faded"
              onClick={() => {
                if (confirm("Revoke this token? Claude Desktop will stop working until you paste the new URL.")) {
                  // TODO: wire revoke + re-provision mutation
                  alert("Token rotation wiring coming in week 3 — see plan file.");
                }
              }}
            >
              <RotateCw size={16} />
              Rotate token
            </button>
          )}
        </div>
      </section>

      <section className="bg-white border border-dark-faded rounded-lg p-8">
        <h2 className="font-sans text-fluid-h4 text-dark mb-4">How to install</h2>
        <ol className="space-y-4 text-fluid-main text-dark opacity-80">
          <li>
            <span className="font-mono text-xs text-brand mr-2">01</span>
            Copy the URL above.
          </li>
          <li>
            <span className="font-mono text-xs text-brand mr-2">02</span>
            Open Claude Desktop → Settings → Connectors → Add custom connector.
          </li>
          <li>
            <span className="font-mono text-xs text-brand mr-2">03</span>
            Paste the URL. Leave OAuth fields blank.
          </li>
          <li>
            <span className="font-mono text-xs text-brand mr-2">04</span>
            Start a new chat and ask:{" "}
            <code className="font-mono bg-grey px-2 py-1 rounded">
              What clients do I have in ARLO?
            </code>
          </li>
        </ol>
      </section>

      <p className="text-fluid-small text-dark opacity-60 mt-8">
        Lost a laptop? <button className="text-brand underline">Rotate your token</button> and Claude Desktop on every machine will need the new URL.
      </p>
    </div>
  );
}
