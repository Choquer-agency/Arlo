"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type Persona = "solo" | "agency";

const SOLO_ONLY_ROUTES = ["/demo/solo-dashboard", "/demo/prompts"];
const AGENCY_ONLY_ROUTES = ["/demo/dashboard"];

/**
 * Returns the current demo persona. Persona-exclusive routes lock the toggle;
 * shared routes (clients, team, billing, settings, etc.) keep whatever the
 * user last picked via the sidebar toggle, stored in localStorage.
 */
export function usePersona(): Persona {
  const pathname = usePathname();
  const [persona, setPersona] = useState<Persona>("agency");

  useEffect(() => {
    if (SOLO_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
      setPersona("solo");
      localStorage.setItem("arlo-demo-persona", "solo");
      return;
    }
    if (AGENCY_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
      setPersona("agency");
      localStorage.setItem("arlo-demo-persona", "agency");
      return;
    }
    const stored = localStorage.getItem("arlo-demo-persona");
    setPersona(stored === "solo" ? "solo" : "agency");
  }, [pathname]);

  return persona;
}
