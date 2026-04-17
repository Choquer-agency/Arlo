"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function TeamPage() {
  const workspaces = useQuery(api.workspaces.listMine);
  const ws = workspaces?.[0];
  const members = useQuery(
    api.members.list,
    ws ? { workspaceId: ws._id } : "skip"
  );

  return (
    <div className="max-w-container mx-auto">
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
        Team
      </p>
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-sans text-fluid-h2 text-dark">
          {members?.length ?? 0} members
        </h1>
        <button className="btn-secondary px-6 py-3" disabled>
          Invite teammate (week 5)
        </button>
      </div>

      {members && (
        <div className="bg-white border border-dark-faded rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-grey border-b border-dark-faded">
              <tr>
                <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">Name</th>
                <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">Email</th>
                <th className="text-left px-6 py-4 font-mono text-xs uppercase tracking-wider text-dark">Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id} className="border-b border-dark-faded last:border-0">
                  <td className="px-6 py-4 text-dark">{m.user?.name ?? "—"}</td>
                  <td className="px-6 py-4 text-dark opacity-60 font-mono text-sm">{m.user?.email ?? "—"}</td>
                  <td className="px-6 py-4 font-mono text-xs uppercase tracking-wider text-brand">{m.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
