import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  MetricResultRow,
  DiscoveryResult,
  ConnectorError,
} from "./types";

/**
 * Microsoft Clarity — workspace-level API-token connection (Settings → Data
 * export in the Clarity project). The Data Export API only serves the LAST
 * 1-3 DAYS of data, so the requested date range is ignored: we always ask for
 * the last 3 days (1 if the range is "today") and say so in meta.note.
 * Clarity also rate-limits this API to ~10 requests per project per day.
 */

const API_URL = "https://www.clarity.ms/export-data/api/v1/project-live-insights";

interface ClarityInfoRow {
  [key: string]: string | number | null | undefined;
}
interface ClaritySection {
  metricName?: string;
  information?: ClarityInfoRow[];
}

/** metric name → { section (case-insensitive metricName), candidate fields }. */
const METRIC_MAP: Record<string, { section: string; fields: string[] }> = {
  sessions: { section: "traffic", fields: ["totalSessionCount"] },
  distinct_users: { section: "traffic", fields: ["distantUserCount", "distinctUserCount"] },
  pages_per_session: { section: "traffic", fields: ["pagesPerSessionPercentage", "pagesPerSession"] },
  engagement_time: { section: "engagementtime", fields: ["totalTime"] },
  active_time: { section: "engagementtime", fields: ["activeTime"] },
  scroll_depth: { section: "scrolldepth", fields: ["averageScrollDepth"] },
  rage_clicks: { section: "rageclickcount", fields: ["subTotal"] },
  rage_clicks_pct: { section: "rageclickcount", fields: ["sessionsWithMetricPercentage"] },
  dead_clicks: { section: "deadclickcount", fields: ["subTotal"] },
  dead_clicks_pct: { section: "deadclickcount", fields: ["sessionsWithMetricPercentage"] },
  excessive_scrolling: { section: "excessivescroll", fields: ["subTotal"] },
  excessive_scrolling_pct: { section: "excessivescroll", fields: ["sessionsWithMetricPercentage"] },
  quickback_clicks: { section: "quickbackclick", fields: ["subTotal"] },
  quickback_clicks_pct: { section: "quickbackclick", fields: ["sessionsWithMetricPercentage"] },
  script_errors: { section: "scripterrorcount", fields: ["subTotal"] },
  script_errors_pct: { section: "scripterrorcount", fields: ["sessionsWithMetricPercentage"] },
};

/** Metrics that should be averaged (not summed) when a dimension splits rows. */
const AVG_METRICS = new Set([
  "pages_per_session",
  "scroll_depth",
  "rage_clicks_pct",
  "dead_clicks_pct",
  "excessive_scrolling_pct",
  "quickback_clicks_pct",
  "script_errors_pct",
]);

const DIMENSION_MAP: Record<string, string> = {
  os: "OS",
  browser: "Browser",
  device: "Device",
  country: "Country",
};

function num(v: string | number | null | undefined): number {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** Pull the dimension value out of an info row, tolerating key-name drift. */
function dimValue(row: ClarityInfoRow, dimParam: string): string {
  for (const key of Object.keys(row)) {
    if (key.toLowerCase() === dimParam.toLowerCase()) return String(row[key] ?? "");
  }
  // Fallback: first string-valued field that isn't obviously a number.
  for (const value of Object.values(row)) {
    if (typeof value === "string" && value !== "" && Number.isNaN(Number(value))) {
      return value;
    }
  }
  return "(unknown)";
}

export const clarityConnector: MarketingConnector = {
  platform: "clarity",
  provider: "clarity",
  status: "beta",

  isConfigured(): boolean {
    return true; // workspace-level connection; fetch() raises not_connected when absent
  },

  missingReason(): string {
    return "Microsoft Clarity isn't connected for this workspace. Add the data-export API token on /connections.";
  },

  discover(): DiscoveryResult {
    const note = " IMPORTANT: Clarity's export API only returns the last 1-3 days of data — requested date ranges are ignored.";
    return {
      platform: "clarity",
      status: "beta",
      metrics: [
        { name: "sessions", description: `Total sessions in the last 3 days.${note}`, type: "metric" },
        { name: "distinct_users", description: `Distinct users in the last 3 days.${note}`, type: "metric" },
        { name: "pages_per_session", description: "Average pages viewed per session (last 3 days)", type: "metric" },
        { name: "engagement_time", description: "Total time spent on the site in seconds (last 3 days)", type: "metric" },
        { name: "active_time", description: "Active (engaged) time in seconds (last 3 days)", type: "metric" },
        { name: "scroll_depth", description: "Average scroll depth percentage (last 3 days)", type: "metric" },
        { name: "rage_clicks", description: "Sessions/pages with rage clicks — rapid repeated clicking indicating frustration", type: "metric" },
        { name: "rage_clicks_pct", description: "Percent of sessions containing rage clicks", type: "metric" },
        { name: "dead_clicks", description: "Dead clicks — clicks that produced no effect on the page", type: "metric" },
        { name: "dead_clicks_pct", description: "Percent of sessions containing dead clicks", type: "metric" },
        { name: "excessive_scrolling", description: "Sessions with excessive scrolling (users hunting for content)", type: "metric" },
        { name: "excessive_scrolling_pct", description: "Percent of sessions with excessive scrolling", type: "metric" },
        { name: "quickback_clicks", description: "Quickback clicks — users navigating to a page and immediately returning", type: "metric" },
        { name: "quickback_clicks_pct", description: "Percent of sessions with quickback clicks", type: "metric" },
        { name: "script_errors", description: "JavaScript errors detected during sessions", type: "metric" },
        { name: "script_errors_pct", description: "Percent of sessions with JavaScript errors", type: "metric" },
      ],
      dimensions: [
        { name: "os", description: "Operating system (Windows, macOS, iOS, Android, ...)", type: "dimension" },
        { name: "browser", description: "Browser (Chrome, Safari, Edge, ...)", type: "dimension" },
        { name: "device", description: "Device type (PC, Mobile, Tablet)", type: "dimension" },
        { name: "country", description: "Visitor country", type: "dimension" },
      ],
    };
  },

  async fetch(ctx: ConnectorContext, query: MetricQuery): Promise<MetricResult> {
    const conn = await ctx.getConnection("clarity");
    if (!conn) {
      throw new ConnectorError(
        "Microsoft Clarity isn't connected for this workspace. Add the data-export API token on /connections.",
        "not_connected"
      );
    }

    for (const m of query.metrics) {
      if (!METRIC_MAP[m]) {
        throw new ConnectorError(
          `Unknown Clarity metric "${m}". Supported: ${Object.keys(METRIC_MAP).join(", ")}.`,
          "invalid_metric"
        );
      }
    }
    const dimension = query.dimensions?.[0];
    if (dimension && !DIMENSION_MAP[dimension]) {
      throw new ConnectorError(
        `Unknown Clarity dimension "${dimension}". Supported: ${Object.keys(DIMENSION_MAP).join(", ")}.`,
        "invalid_metric"
      );
    }

    const token = await ctx.getAccessToken("clarity");
    const numOfDays = query.dateRange.label === "today" ? 1 : 3;
    const params = new URLSearchParams({ numOfDays: String(numOfDays) });
    if (dimension) params.set("dimension1", DIMENSION_MAP[dimension]);

    const res = await fetch(`${API_URL}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) {
      const text = (await res.text()).slice(0, 300);
      if (res.status === 401 || res.status === 403)
        throw new ConnectorError(
          "Clarity rejected the API token. Generate a new token under Settings → Data export in the Clarity project and re-add it on /connections.",
          "auth_expired"
        );
      if (res.status === 429)
        throw new ConnectorError(
          "Clarity rate limit hit — the data-export API allows about 10 requests per project per day.",
          "rate_limited"
        );
      throw new ConnectorError(`Clarity API error ${res.status}: ${text}`, "upstream_error");
    }
    const sections = (await res.json()) as ClaritySection[];
    if (!Array.isArray(sections)) {
      throw new ConnectorError("Clarity returned an unexpected response shape.", "upstream_error");
    }

    const bySection = new Map<string, ClarityInfoRow[]>();
    for (const s of sections) {
      if (s.metricName) bySection.set(s.metricName.toLowerCase(), s.information ?? []);
    }

    const totals: Record<string, number> = {};
    let breakdown: MetricResultRow[] = [];

    const readField = (row: ClarityInfoRow, fields: string[]): number => {
      for (const f of fields) {
        for (const key of Object.keys(row)) {
          if (key.toLowerCase() === f.toLowerCase() && row[key] != null) return num(row[key]);
        }
      }
      return 0;
    };

    if (dimension) {
      const dimParam = DIMENSION_MAP[dimension];
      const rowMap = new Map<string, Record<string, number>>();
      for (const metric of query.metrics) {
        const { section, fields } = METRIC_MAP[metric];
        for (const row of bySection.get(section) ?? []) {
          const dv = dimValue(row, dimParam);
          const bucket = rowMap.get(dv) ?? {};
          bucket[metric] = (bucket[metric] ?? 0) + readField(row, fields);
          rowMap.set(dv, bucket);
        }
      }
      breakdown = Array.from(rowMap.entries()).map(([dv, metrics]) => ({
        dimensions: { [dimension]: dv },
        metrics,
      }));
      for (const metric of query.metrics) {
        const values = breakdown.map((r) => r.metrics[metric] ?? 0);
        const sum = values.reduce((s, v) => s + v, 0);
        totals[metric] = AVG_METRICS.has(metric) && values.length > 0 ? sum / values.length : sum;
      }
    } else {
      for (const metric of query.metrics) {
        const { section, fields } = METRIC_MAP[metric];
        const rows = bySection.get(section) ?? [];
        totals[metric] = rows.reduce((s, row) => s + readField(row, fields), 0);
      }
    }

    if (query.sort) {
      const { metric, direction } = query.sort;
      breakdown = [...breakdown].sort((a, b) => {
        const diff = (a.metrics[metric] ?? 0) - (b.metrics[metric] ?? 0);
        return direction === "asc" ? diff : -diff;
      });
    }
    if (query.limit && query.limit > 0) breakdown = breakdown.slice(0, query.limit);

    return {
      platform: "clarity",
      client: { id: ctx.client._id, name: ctx.client.name, slug: ctx.client.slug },
      dateRange: query.dateRange,
      totals,
      breakdown,
      meta: {
        note: `Clarity's data-export API only serves the most recent days: this data covers the LAST ${numOfDays} DAY${
          numOfDays > 1 ? "S" : ""
        }, regardless of the requested range (${query.dateRange.start} to ${query.dateRange.end}). The API is limited to ~10 requests per project per day.`,
        numOfDays,
      },
    };
  },
};
