"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  LayoutDashboard,
  Users,
  Plug,
  UserRound,
  Settings,
  Terminal,
  Building2,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const workspaces = useQuery(api.workspaces.listMine);
  const ws = workspaces?.[0];
  const isSolo = ws?.workspaceType === "solo";

  const nav = isSolo
    ? [
        { href: "/solo-dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/clients", label: "My Business", icon: Building2 },
        { href: "/connections", label: "Connections", icon: Plug },
        { href: "/team", label: "Team", icon: UserRound },
        { href: "/settings/mcp", label: "MCP URL", icon: Terminal },
        { href: "/settings/billing", label: "Billing", icon: Settings },
      ]
    : [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/clients", label: "Clients", icon: Users },
        { href: "/connections", label: "Connections", icon: Plug },
        { href: "/team", label: "Team", icon: UserRound },
        { href: "/settings/mcp", label: "MCP URL", icon: Terminal },
        { href: "/settings/billing", label: "Billing", icon: Settings },
      ];

  return (
    <aside className="w-64 shrink-0 flex flex-col">
      <div className="px-6 py-6 border-b border-dark/5">
        <Link href="/dashboard" className="font-display text-fluid-h5 text-dark block">
          ARLO
        </Link>
        {isSolo && (
          <p className="font-mono text-[10px] uppercase tracking-wider text-dark/50 mt-1">
            Solo · single business
          </p>
        )}
      </div>
      <nav className="flex-1 py-4 px-3">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg font-mono text-sm uppercase tracking-wider transition-colors ${
                active ? "bg-dark text-brand-lime" : "text-dark hover:bg-white/60"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t border-dark/5 text-xs font-mono text-dark/40">
        v0.1 · askarlo.app
      </div>
    </aside>
  );
}
