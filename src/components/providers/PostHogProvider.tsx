"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { posthog, analyticsEnabled, POSTHOG_KEY, POSTHOG_HOST, track } from "@/lib/posthog";

/**
 * Initializes PostHog for the authenticated app, identifies the signed-in user,
 * groups them by workspace (with plan / trial / managed-by-agency context), and
 * captures pageviews on client-side navigation. Inert without a PostHog key.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!analyticsEnabled || initialized.current) return;
    posthog.init(POSTHOG_KEY!, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // we send $pageview manually on route change
      capture_pageleave: true,
      persistence: "localStorage+cookie",
    });
    initialized.current = true;
    track("session_started");
  }, []);

  return (
    <>
      <Identify />
      <Suspense fallback={null}>
        <PageViews />
      </Suspense>
      {children}
    </>
  );
}

function Identify() {
  const me = useQuery(api.users.me);
  const workspaces = useQuery(api.workspaces.listMine);
  const done = useRef<string | null>(null);

  useEffect(() => {
    if (!analyticsEnabled || !me) return;
    const ws = workspaces?.[0];
    const key = `${me._id}:${ws?._id ?? "none"}`;
    if (done.current === key) return;
    done.current = key;

    posthog.identify(me._id, {
      email: me.email ?? undefined,
      name: me.name ?? undefined,
    });

    if (ws) {
      posthog.group("workspace", ws._id, {
        name: ws.name,
        plan: ws.plan,
        workspace_type: ws.workspaceType,
        trial_ends_at: ws.trialEndsAt ?? null,
        managed_by_agency: (ws as { managedByAgencyUserId?: string }).managedByAgencyUserId
          ? true
          : false,
      });
    }
  }, [me, workspaces]);

  return null;
}

function PageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!analyticsEnabled) return;
    let url = window.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);
  return null;
}
