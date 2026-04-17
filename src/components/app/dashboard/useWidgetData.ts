"use client";

import { useEffect, useState } from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { MetricResult, DateRangeInput } from "@/lib/connectors/types";
import type { WidgetKind } from "@/lib/widgets/specs";

interface Args {
  workspaceId: Id<"workspaces"> | undefined;
  clientId: Id<"clients"> | undefined;
  kind: WidgetKind;
  dateRange: DateRangeInput;
  /** Set to false to skip the fetch (e.g. while waiting for assignment). */
  enabled: boolean;
}

interface Result {
  data: MetricResult | null;
  error: { message: string; code?: string } | null;
  loading: boolean;
  refetch: () => void;
}

/**
 * Calls /api/widgets with the given kind. Refetches when args change.
 * Brand-new — no caching beyond the route's HTTP Cache-Control header.
 */
export function useWidgetData({
  workspaceId,
  clientId,
  kind,
  dateRange,
  enabled,
}: Args): Result {
  const [data, setData] = useState<MetricResult | null>(null);
  const [error, setError] = useState<Result["error"]>(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled || !workspaceId || !clientId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/widgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, clientId, kind, dateRange }),
    })
      .then(async (res) => {
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError({ message: body.error ?? "Failed to fetch", code: body.code });
          setData(null);
        } else {
          setData(body as MetricResult);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError({ message: err instanceof Error ? err.message : "Network error" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, clientId, kind, JSON.stringify(dateRange), enabled, tick]);

  return { data, error, loading, refetch: () => setTick((t) => t + 1) };
}
