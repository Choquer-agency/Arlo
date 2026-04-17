import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function DemoDashboardPage() {
  return (
    <div className="max-w-container mx-auto">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
        Welcome back, Marcus
      </p>
      <h1 className="font-sans text-fluid-h2 text-dark mb-10">Northpoint Digital</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard label="Clients" value="47" sub="+3 this month" href="/demo/clients" />
        <StatCard label="MCP calls this month" value="18,427" sub="of 50,000" />
        <StatCard label="AI insights" value="126" sub="of 500" />
        <StatCard label="Team members" value="8" sub="1 pending invite" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2 bg-white border border-dark-faded rounded-lg p-8">
          <h2 className="font-sans text-fluid-h4 text-dark mb-1">Top 10 most-queried clients</h2>
          <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-6">
            Last 30 days
          </p>
          <ol className="space-y-3">
            {[
              { name: "Penni Cart", calls: 1247, trend: "+32%" },
              { name: "Far North Crane", calls: 984, trend: "+18%" },
              { name: "Pedigree Painting", calls: 812, trend: "-4%" },
              { name: "Ahara Med", calls: 761, trend: "+9%" },
              { name: "DFI Forensics", calls: 649, trend: "+12%" },
              { name: "Select Decks", calls: 584, trend: "+3%" },
              { name: "Pinnacle Fertility", calls: 512, trend: "-8%" },
              { name: "Relay Performance", calls: 463, trend: "+22%" },
              { name: "Staircase Studio", calls: 407, trend: "+5%" },
              { name: "Ridgeline Roofing", calls: 382, trend: "+1%" },
            ].map((c, i) => (
              <li key={c.name} className="flex items-center justify-between text-fluid-main text-dark">
                <span>
                  <span className="font-mono text-xs text-dark opacity-40 mr-3">{String(i + 1).padStart(2, "0")}</span>
                  {c.name}
                </span>
                <span className="flex items-center gap-4">
                  <span className="font-mono text-xs text-dark opacity-60">{c.calls.toLocaleString()} calls</span>
                  <span
                    className={`font-mono text-xs ${c.trend.startsWith("+") ? "text-brand" : "text-bg-red"}`}
                  >
                    {c.trend}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white border border-dark-faded rounded-lg p-8">
            <h2 className="font-sans text-fluid-h4 text-dark mb-1">Calls by team member</h2>
            <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-6">
              This month
            </p>
            <div className="space-y-4">
              {[
                { name: "Priya Sundaram", calls: 891 },
                { name: "Jordan Flores", calls: 623 },
                { name: "Marcus Hale", calls: 412 },
                { name: "Devin Park", calls: 214 },
                { name: "Sam Wexler", calls: 129 },
              ].map((m, _, arr) => {
                const pct = Math.round((m.calls / arr[0].calls) * 100);
                return (
                  <div key={m.name}>
                    <div className="flex justify-between mb-1">
                      <span className="font-sans text-sm text-dark">{m.name}</span>
                      <span className="font-mono text-xs text-dark opacity-60">
                        {m.calls.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-grey rounded-full overflow-hidden">
                      <div className="h-full bg-brand-lime" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <div className="bg-white border border-dark-faded rounded-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-dark-faded flex items-center justify-between">
          <div>
            <h2 className="font-sans text-fluid-h4 text-dark">Recent MCP activity</h2>
            <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mt-1">
              Across every workspace member
            </p>
          </div>
          <Link
            href="/demo/settings/audit"
            className="font-mono text-xs uppercase tracking-wider text-brand"
          >
            Full audit log →
          </Link>
        </div>
        <table className="w-full">
          <thead className="bg-grey">
            <tr>
              <th className="text-left px-8 py-3 font-mono text-xs uppercase tracking-wider text-dark">When</th>
              <th className="text-left px-8 py-3 font-mono text-xs uppercase tracking-wider text-dark">Who</th>
              <th className="text-left px-8 py-3 font-mono text-xs uppercase tracking-wider text-dark">Tool</th>
              <th className="text-left px-8 py-3 font-mono text-xs uppercase tracking-wider text-dark">Client</th>
              <th className="text-right px-8 py-3 font-mono text-xs uppercase tracking-wider text-dark">Duration</th>
            </tr>
          </thead>
          <tbody>
            {[
              { t: "2m ago", who: "priya@northpoint.co", tool: "marketing_query", client: "Penni Cart", ms: 1240 },
              { t: "4m ago", who: "marcus@northpoint.co", tool: "marketing_compare", client: "Far North Crane", ms: 1890 },
              { t: "11m ago", who: "priya@northpoint.co", tool: "list_clients", client: "—", ms: 120 },
              { t: "14m ago", who: "jordan@northpoint.co", tool: "marketing_report", client: "Ahara Med", ms: 3412 },
              { t: "22m ago", who: "priya@northpoint.co", tool: "marketing_insights", client: "Pedigree Painting", ms: 4801 },
              { t: "28m ago", who: "marcus@northpoint.co", tool: "marketing_query", client: "DFI Forensics", ms: 872 },
              { t: "41m ago", who: "jordan@northpoint.co", tool: "marketing_query", client: "Penni Cart", ms: 1104 },
            ].map((r, i) => (
              <tr key={i} className="border-b border-dark-faded last:border-0">
                <td className="px-8 py-4 font-mono text-xs text-dark opacity-60">{r.t}</td>
                <td className="px-8 py-4 font-mono text-sm text-dark">{r.who}</td>
                <td className="px-8 py-4 font-mono text-sm text-brand">{r.tool}</td>
                <td className="px-8 py-4 text-dark">{r.client}</td>
                <td className="px-8 py-4 font-mono text-xs text-dark opacity-60 text-right">{r.ms}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, href }: { label: string; value: string; sub?: string; href?: string }) {
  const content = (
    <div className="relative bg-white border border-dark-faded rounded-lg p-6 hover:border-brand transition-colors h-full">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">{label}</p>
      <p className="font-sans text-fluid-h3 text-dark">{value}</p>
      {sub && <p className="font-mono text-xs text-dark opacity-40 mt-1">{sub}</p>}
      {href && (
        <span className="absolute top-4 right-4 w-7 h-7 rounded-full bg-grey text-dark/60 flex items-center justify-center transition-colors group-hover:bg-dark group-hover:text-brand-neon">
          <ArrowUpRight size={14} />
        </span>
      )}
    </div>
  );
  return href ? (
    <Link href={href} className="group block no-underline">
      {content}
    </Link>
  ) : (
    content
  );
}
