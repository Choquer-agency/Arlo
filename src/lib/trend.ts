import type { MetricResult } from "@/lib/connectors/types";

/** Strip any separators: "2026-06-06" and "20260606" → "20260606". */
function compact(date: string): string {
  return date.replace(/-/g, "");
}

/** Every calendar day from start..end (inclusive) as compact YYYYMMDD keys. */
function dayKeys(startISO: string, endISO: string): string[] {
  const keys: string[] = [];
  const start = new Date(`${startISO}T00:00:00Z`);
  const end = new Date(`${endISO}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return keys;
  for (let d = start; d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    keys.push(
      `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(
        d.getUTCDate()
      ).padStart(2, "0")}`
    );
  }
  return keys;
}

/**
 * Build a daily time series for one metric from a `date`-dimensioned widget
 * result, zero-filling days the source omitted so the sparkline reflects real
 * gaps instead of connecting sparse points into a misleading line.
 */
export function dailySeries(result: MetricResult | null, metric: string): number[] {
  if (!result) return [];
  const byDay = new Map<string, number>();
  for (const row of result.breakdown ?? []) {
    const d = row.dimensions?.date;
    if (d) byDay.set(compact(d), row.metrics[metric] ?? 0);
  }
  const axis = dayKeys(result.dateRange.start, result.dateRange.end);
  // Fall back to whatever rows we have (sorted) if the axis can't be built.
  if (axis.length === 0) {
    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }
  return axis.map((k) => byDay.get(k) ?? 0);
}
