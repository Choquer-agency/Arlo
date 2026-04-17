import type { DateRangeInput, ResolvedDateRange } from "./connectors/types";

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function sub(d: Date, days: number): Date {
  return new Date(d.getTime() - days * 86400000);
}

function range(s: Date, e: Date, label: string): ResolvedDateRange {
  return { start: iso(s), end: iso(e), label };
}

export function resolveDateRange(input: DateRangeInput): ResolvedDateRange {
  if ("start" in input) {
    return { start: input.start, end: input.end, label: `${input.start}→${input.end}` };
  }
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();

  switch (input.preset) {
    case "today": {
      const s = iso(today);
      return { start: s, end: s, label: "today" };
    }
    case "yesterday": {
      const s = iso(sub(today, 1));
      return { start: s, end: s, label: "yesterday" };
    }
    case "last_7_days":
      return range(sub(today, 7), sub(today, 1), "last_7_days");
    case "last_14_days":
      return range(sub(today, 14), sub(today, 1), "last_14_days");
    case "last_28_days":
      return range(sub(today, 28), sub(today, 1), "last_28_days");
    case "last_30_days":
      return range(sub(today, 30), sub(today, 1), "last_30_days");
    case "last_90_days":
      return range(sub(today, 90), sub(today, 1), "last_90_days");
    case "last_12_months": {
      const start = new Date(y - 1, m, today.getDate());
      return range(start, today, "last_12_months");
    }
    case "mtd":
      return range(new Date(y, m, 1), today, "mtd");
    case "qtd": {
      const qm = Math.floor(m / 3) * 3;
      return range(new Date(y, qm, 1), today, "qtd");
    }
    case "ytd":
      return range(new Date(y, 0, 1), today, "ytd");
    case "last_week": {
      const d = today.getDay();
      const lastSun = sub(today, d + 7);
      const lastSat = sub(today, d + 1);
      return range(lastSun, lastSat, "last_week");
    }
    case "last_month": {
      const first = new Date(y, m - 1, 1);
      const last = new Date(y, m, 0);
      return range(first, last, "last_month");
    }
    case "last_quarter": {
      const qm = Math.floor(m / 3) * 3 - 3;
      const first = new Date(y, qm, 1);
      const last = new Date(y, qm + 3, 0);
      return range(first, last, "last_quarter");
    }
    case "last_year": {
      const first = new Date(y - 1, 0, 1);
      const last = new Date(y - 1, 11, 31);
      return range(first, last, "last_year");
    }
  }
  throw new Error(`Unknown date preset: ${(input as { preset: string }).preset}`);
}
