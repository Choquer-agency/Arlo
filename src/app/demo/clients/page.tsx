"use client";

import { useRouter } from "next/navigation";

const DEMO_CLIENTS = [
  { id: "penni-cart", name: "Penni Cart", url: "pennicart.io", platforms: 6, lastQuery: "2m ago" },
  { id: "far-north-crane", name: "Far North Crane", url: "farnorthcrane.ca", platforms: 4, lastQuery: "4m ago" },
  { id: "pedigree-painting", name: "Pedigree Painting", url: "pedigreepainting.com", platforms: 5, lastQuery: "22m ago" },
  { id: "ahara-med", name: "Ahara Med", url: "aharamed.com", platforms: 5, lastQuery: "14m ago" },
  { id: "dfi-forensics", name: "DFI Forensics", url: "dfiforensics.com", platforms: 3, lastQuery: "28m ago" },
  { id: "select-decks", name: "Select Decks", url: "selectdecks.ca", platforms: 4, lastQuery: "1h ago" },
  { id: "pinnacle-fertility", name: "Pinnacle Fertility", url: "pinnaclefertility.com", platforms: 6, lastQuery: "2h ago" },
  { id: "relay-performance", name: "Relay Performance", url: "relayperformance.io", platforms: 7, lastQuery: "3h ago" },
  { id: "staircase-studio", name: "Staircase Studio", url: "staircasestudio.co", platforms: 5, lastQuery: "5h ago" },
  { id: "ridgeline-roofing", name: "Ridgeline Roofing", url: "ridgelineroofing.com", platforms: 3, lastQuery: "yesterday" },
];

export default function DemoClientsPage() {
  const router = useRouter();
  return (
    <div className="max-w-container mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
            All clients
          </p>
          <h1 className="font-sans text-fluid-h2 text-dark">47 clients</h1>
        </div>
        <button className="btn-secondary text-base px-6 py-3">+ Add client</button>
      </div>

      <div className="bg-white border border-dark-faded rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-grey border-b border-dark-faded">
            <tr>
              <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">Name</th>
              <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">Website</th>
              <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">Platforms</th>
              <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">Last query</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_CLIENTS.map((c) => (
              <tr
                key={c.id}
                onClick={() => router.push(`/demo/clients/${c.id}`)}
                className="border-b border-dark-faded last:border-0 hover:bg-grey cursor-pointer"
              >
                <td className="px-6 py-4 text-dark font-sans">{c.name}</td>
                <td className="px-6 py-4 text-dark opacity-60 font-mono text-sm">{c.url}</td>
                <td className="px-6 py-4 font-mono text-xs text-dark">
                  <span className="text-brand">{c.platforms}</span>
                  <span className="opacity-40"> of 14</span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-dark opacity-60">{c.lastQuery}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-center font-mono text-xs text-dark opacity-40 mt-8">
        Showing 10 of 47 · Scroll for more
      </p>
    </div>
  );
}
