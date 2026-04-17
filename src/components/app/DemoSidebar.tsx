"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Plug,
  UserRound,
  Settings,
  Terminal,
  Sparkles,
} from "lucide-react";

const AGENCY_NAV = [
  { href: "/demo/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/demo/clients", label: "Clients", icon: Users },
  { href: "/demo/connections", label: "Connections", icon: Plug },
  { href: "/demo/custom-connectors", label: "Custom APIs", icon: Terminal },
  { href: "/demo/team", label: "Team", icon: UserRound },
  { href: "/demo/settings/mcp", label: "MCP URL", icon: Terminal },
  { href: "/demo/settings/billing", label: "Billing", icon: Settings },
];

const SOLO_NAV = [
  { href: "/demo/solo-dashboard", label: "Dashboard", icon: LayoutDashboard, tour: "dashboard" },
  { href: "/demo/connections", label: "Connections", icon: Plug, tour: "connections" },
  { href: "/demo/prompts", label: "Prompts", icon: Sparkles, tour: "prompts" },
  { href: "/demo/custom-connectors", label: "Custom APIs", icon: Terminal },
  { href: "/demo/team", label: "Team", icon: UserRound, tour: "team" },
  { href: "/demo/settings/mcp", label: "MCP URL", icon: Terminal, tour: "mcp-url" },
  { href: "/demo/settings/billing", label: "Billing", icon: Settings },
];

const SOLO_ONLY_ROUTES = ["/demo/solo-dashboard", "/demo/prompts"];
const AGENCY_ONLY_ROUTES = ["/demo/dashboard"];

export function DemoSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSolo, setIsSolo] = useState(false);

  useEffect(() => {
    // Persona-exclusive routes flip the toggle automatically. Shared routes
    // (clients, connections, settings…) keep whatever the user last picked.
    if (SOLO_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
      setIsSolo(true);
      localStorage.setItem("arlo-demo-persona", "solo");
      return;
    }
    if (AGENCY_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
      setIsSolo(false);
      localStorage.setItem("arlo-demo-persona", "agency");
      return;
    }
    const stored = localStorage.getItem("arlo-demo-persona");
    setIsSolo(stored === "solo");
  }, [pathname]);

  const nav = isSolo ? SOLO_NAV : AGENCY_NAV;

  function toggleView(toSolo: boolean) {
    localStorage.setItem("arlo-demo-persona", toSolo ? "solo" : "agency");
    setIsSolo(toSolo);
    router.push(toSolo ? "/demo/solo-dashboard" : "/demo/dashboard");
  }

  return (
    <aside className="w-64 shrink-0 flex flex-col">
      <div className="px-6 py-6 border-b border-dark/5">
        <Link href="/" className="font-display text-fluid-h5 text-dark block">
          ARLO
        </Link>
        <p className="font-mono text-[10px] uppercase tracking-wider text-dark/40 mt-1">
          Demo mode
        </p>
      </div>

      {/* Persona toggle — switch between agency and solo layouts live */}
      <div className="px-3 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-dark/50 px-3 mb-2">
          Viewing as
        </p>
        <div className="grid grid-cols-2 gap-1 bg-dark/5 p-1 rounded-lg">
          <button
            onClick={() => toggleView(false)}
            className={`font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded-md text-center transition-colors ${
              !isSolo ? "bg-dark text-brand-lime" : "text-dark/60 hover:text-dark"
            }`}
          >
            Agency
          </button>
          <button
            onClick={() => toggleView(true)}
            className={`font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded-md text-center transition-colors ${
              isSolo ? "bg-dark text-brand-lime" : "text-dark/60 hover:text-dark"
            }`}
          >
            Solo
          </button>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 mt-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const tourAttr = (item as { tour?: string }).tour;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={tourAttr}
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
        {isSolo ? "Solo · Tessellate Coffee" : "Agency · Northpoint Digital"}
      </div>
    </aside>
  );
}
