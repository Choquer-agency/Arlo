"use client";

import { useState } from "react";
import { Copy, RotateCw, Check } from "lucide-react";

const MCP_URL = "https://askarlo.app/api/mcp?token=ak_8f3c2b9e4d1a7h6k5m9n2p8q3r5t7v1";

export default function DemoMcpSettingsPage() {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    await navigator.clipboard.writeText(MCP_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="max-w-container-sm mx-auto">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
        Settings
      </p>
      <h1 className="font-sans text-fluid-h2 text-dark mb-10">Your MCP URL</h1>

      <section className="bg-brand-lime text-dark rounded-lg p-10 mb-8">
        <p className="font-mono text-xs uppercase tracking-wider text-dark/70 mb-4">
          Claude Desktop connector
        </p>
        <div className="bg-dark rounded-md p-5 mb-6 font-mono text-sm break-all text-brand-lime">
          {MCP_URL}
        </div>
        <div className="flex gap-3">
          <button
            onClick={copyUrl}
            className="flex items-center gap-2 bg-dark text-brand-lime px-6 py-3 font-mono text-sm uppercase tracking-wider rounded hover:opacity-90"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy URL"}
          </button>
          <button className="flex items-center gap-2 border border-dark/20 text-dark px-6 py-3 font-mono text-sm uppercase tracking-wider rounded hover:bg-dark/5">
            <RotateCw size={16} />
            Rotate token
          </button>
        </div>
      </section>

      <section className="bg-white border border-dark-faded rounded-lg p-8 mb-6">
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
            <code className="font-mono bg-grey px-2 py-1 rounded text-sm">
              What clients do I have in ARLO?
            </code>
          </li>
        </ol>
      </section>

      <section className="bg-white border border-dark-faded rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-faded">
          <h2 className="font-sans text-fluid-h5 text-dark">Your recent activity</h2>
        </div>
        <table className="w-full">
          <thead className="bg-grey">
            <tr>
              <th className="text-left px-6 py-3 font-mono text-xs uppercase tracking-wider text-dark">When</th>
              <th className="text-left px-6 py-3 font-mono text-xs uppercase tracking-wider text-dark">Tool</th>
              <th className="text-left px-6 py-3 font-mono text-xs uppercase tracking-wider text-dark">Client</th>
              <th className="text-right px-6 py-3 font-mono text-xs uppercase tracking-wider text-dark">Duration</th>
            </tr>
          </thead>
          <tbody>
            {[
              { t: "2m ago", tool: "marketing_query", client: "Penni Cart", ms: 1240 },
              { t: "41m ago", tool: "marketing_query", client: "Penni Cart", ms: 1104 },
              { t: "3h ago", tool: "marketing_compare", client: "Far North Crane", ms: 2201 },
              { t: "yesterday", tool: "marketing_insights", client: "Pedigree Painting", ms: 4812 },
            ].map((r, i) => (
              <tr key={i} className="border-b border-dark-faded last:border-0">
                <td className="px-6 py-3 font-mono text-xs text-dark opacity-60">{r.t}</td>
                <td className="px-6 py-3 font-mono text-sm text-brand">{r.tool}</td>
                <td className="px-6 py-3 text-dark text-sm">{r.client}</td>
                <td className="px-6 py-3 font-mono text-xs text-dark opacity-60 text-right">{r.ms}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
