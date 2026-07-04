"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * Sends a just-provisioned client to /welcome (set password + onboarding) until
 * they've finished setup. Runs on every app route; /welcome lives outside the
 * app layout so there's no redirect loop.
 */
export function ProvisioningGate() {
  const state = useQuery(api.provisioning.myProvisioningState);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (state?.pending && !pathname.startsWith("/welcome")) {
      router.replace("/welcome");
    }
  }, [state, pathname, router]);

  return null;
}
