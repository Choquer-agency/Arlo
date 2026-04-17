"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import Link from "next/link";

export default function ClientsPage() {
  const workspaces = useQuery(api.workspaces.listMine);
  const ws = workspaces?.[0];
  const clients = useQuery(
    api.clients.list,
    ws ? { workspaceId: ws._id } : "skip"
  );
  const createClient = useMutation(api.clients.create);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  async function handleAdd() {
    if (!ws || !newName.trim()) return;
    await createClient({
      workspaceId: ws._id,
      name: newName.trim(),
      websiteUrl: newUrl.trim() || undefined,
    });
    setNewName("");
    setNewUrl("");
    setAdding(false);
  }

  return (
    <div className="max-w-container mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
            All clients
          </p>
          <h1 className="font-sans text-fluid-h2 text-dark">
            {clients?.length ?? 0} clients
          </h1>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="btn-secondary text-base px-6 py-3"
        >
          + Add client
        </button>
      </div>

      {adding && (
        <div className="bg-white border border-dark-faded rounded-lg p-6 mb-6">
          <input
            type="text"
            placeholder="Client name (e.g. Penni Cart)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full border border-dark-faded rounded px-4 py-3 font-sans text-fluid-main mb-3"
            autoFocus
          />
          <input
            type="url"
            placeholder="Website URL (optional)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full border border-dark-faded rounded px-4 py-3 font-sans text-fluid-main mb-4"
          />
          <div className="flex gap-3">
            <button onClick={handleAdd} className="btn-secondary px-6 py-2">
              Create
            </button>
            <button onClick={() => setAdding(false)} className="btn px-6 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {clients && clients.length === 0 && !adding && (
        <div className="bg-white border border-dark-faded rounded-lg p-16 text-center">
          <p className="font-sans text-fluid-h4 text-dark mb-3">No clients yet</p>
          <p className="text-dark opacity-60 mb-6">
            Add your first client, then assign their GA4 / Search Console / Ads accounts.
          </p>
          <button onClick={() => setAdding(true)} className="btn-secondary px-6 py-3">
            Add your first client
          </button>
        </div>
      )}

      {clients && clients.length > 0 && (
        <div className="bg-white border border-dark-faded rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-grey border-b border-dark-faded">
              <tr>
                <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">
                  Name
                </th>
                <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">
                  Website
                </th>
                <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">
                  Assignments
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const platformCount = [
                  c.ga4PropertyId, c.gscSiteUrl, c.googleAdsCustomerId,
                  c.youtubeChannelId, c.gbpLocationName,
                ].filter(Boolean).length;
                return (
                  <tr key={c._id} className="border-b border-dark-faded last:border-0 hover:bg-grey">
                    <td className="px-6 py-4">
                      <Link href={`/clients/${c._id}`} className="text-dark font-sans underline-offset-2 hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-dark opacity-60 font-mono text-sm">
                      {c.websiteUrl ?? "—"}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-dark opacity-60">
                      {platformCount} of 14 platforms
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
