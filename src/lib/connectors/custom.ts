/**
 * Custom REST connector runtime — turns any platform with a queryable HTTP API into
 * a MarketingConnector without us writing per-platform code. Agencies configure:
 *  - base URL + path + method
 *  - auth type (bearer / API key / basic)
 *  - query params with {{variable}} substitution
 *  - response JSON path to totals (and optional breakdown)
 *  - metric + dimension catalog exposed to Claude
 *
 * Variables available in templates:
 *   {{dateRange.start}}, {{dateRange.end}}, {{dateRange.label}}
 *   {{metrics}}                     ← comma-joined metric names
 *   {{metrics|json}}                ← JSON-encoded array
 *   {{dimensions}}, {{dimensions|json}}
 *   {{limit}}
 *   {{client.<field>}}             ← any scalar field on the client doc
 */
import type { Doc } from "../../../convex/_generated/dataModel";
import { decryptCredentials } from "../crypto";
import type {
  ConnectorContext,
  DiscoveryResult,
  MarketingConnector,
  MetricQuery,
  MetricResult,
} from "./types";
import { ConnectorError } from "./types";

export interface CustomConnectorConfig {
  _id: string;
  slug: string;
  name: string;
  category: string;
  color: string;
  description?: string;

  authType: "bearer" | "api_key_header" | "api_key_query" | "basic" | "none";
  authHeaderName?: string;
  authQueryParam?: string;
  encryptedCredentials: string;
  credentialsIv: string;

  baseUrl: string;
  queryMethod: "GET" | "POST";
  queryPath: string;
  queryParams: Record<string, string>;
  queryBody?: Record<string, unknown>;
  extraHeaders?: Record<string, string>;

  totalsPath: string;
  breakdownPath?: string;
  metricsMap?: Record<string, string>;

  metrics: Array<{ name: string; description: string }>;
  dimensions: Array<{ name: string; description: string }>;
}

/** Replace {{dotted.path}} tokens in a string with values from `vars`. */
function substitute(template: string, vars: Record<string, unknown>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_match, expr: string) => {
    const [rawPath, filter] = expr.split("|").map((s) => s.trim());
    const value = getPath(vars, rawPath);
    if (value === undefined || value === null) return "";
    if (filter === "json") return JSON.stringify(value);
    if (Array.isArray(value)) return value.join(",");
    return String(value);
  });
}

function getPath(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function buildVars(query: MetricQuery, client: Doc<"clients">): Record<string, unknown> {
  return {
    dateRange: query.dateRange,
    metrics: query.metrics,
    dimensions: query.dimensions ?? [],
    limit: query.limit ?? 1000,
    client,
  };
}

function applyAuth(
  config: CustomConnectorConfig,
  credential: string,
  headers: Headers,
  url: URL
): void {
  switch (config.authType) {
    case "bearer":
      headers.set("Authorization", `Bearer ${credential}`);
      break;
    case "api_key_header": {
      const name = config.authHeaderName || "X-API-Key";
      headers.set(name, credential);
      break;
    }
    case "api_key_query": {
      const name = config.authQueryParam || "api_key";
      url.searchParams.set(name, credential);
      break;
    }
    case "basic": {
      headers.set("Authorization", `Basic ${Buffer.from(credential).toString("base64")}`);
      break;
    }
    case "none":
      break;
    default:
      throw new ConnectorError(`Unknown auth type: ${config.authType}`, "upstream_error");
  }
}

function extractByPath(obj: unknown, path: string): unknown {
  if (!path) return obj;
  return getPath(obj, path);
}

function normalizeMetrics(
  raw: Record<string, unknown>,
  map: Record<string, string> | undefined
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "number") {
      out[key] = value;
    } else if (typeof value === "string" && !Number.isNaN(Number(value))) {
      out[key] = Number(value);
    }
  }
  if (map) {
    for (const [localName, apiField] of Object.entries(map)) {
      if (out[apiField] !== undefined && out[localName] === undefined) {
        out[localName] = out[apiField];
      }
    }
  }
  return out;
}

export function buildCustomConnector(config: CustomConnectorConfig): MarketingConnector {
  return {
    platform: `custom:${config.slug}` as never,
    provider: "google", // provider field unused for custom; value is placeholder
    status: "beta",

    isConfigured(_ctx: ConnectorContext): boolean {
      return Boolean(config.baseUrl && config.queryPath);
    },

    missingReason(_ctx: ConnectorContext): string {
      return `Custom connector ${config.name} is misconfigured (missing URL or path).`;
    },

    discover(): DiscoveryResult {
      return {
        platform: `custom:${config.slug}` as never,
        status: "beta",
        metrics: config.metrics,
        dimensions: config.dimensions,
      };
    },

    async fetch(ctx: ConnectorContext, query: MetricQuery): Promise<MetricResult> {
      const credential = decryptCredentials(
        config.encryptedCredentials,
        config.credentialsIv
      );
      const vars = buildVars(query, ctx.client);

      const substitutedParams: Record<string, string> = {};
      for (const [k, v] of Object.entries(config.queryParams || {})) {
        substitutedParams[k] = substitute(v, vars);
      }

      const path = substitute(config.queryPath, vars);
      const url = new URL(
        config.baseUrl.replace(/\/$/, "") + (path.startsWith("/") ? path : `/${path}`)
      );
      for (const [k, v] of Object.entries(substitutedParams)) {
        if (v) url.searchParams.set(k, v);
      }

      const headers = new Headers({ Accept: "application/json" });
      for (const [k, v] of Object.entries(config.extraHeaders || {})) {
        headers.set(k, substitute(v, vars));
      }
      applyAuth(config, credential, headers, url);

      let body: string | undefined;
      if (config.queryMethod === "POST" && config.queryBody) {
        const substituted: Record<string, unknown> = {};
        for (const [k, val] of Object.entries(config.queryBody)) {
          substituted[k] =
            typeof val === "string" ? substitute(val, vars) : val;
        }
        body = JSON.stringify(substituted);
        headers.set("Content-Type", "application/json");
      }

      const res = await fetch(url.toString(), {
        method: config.queryMethod,
        headers,
        body,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new ConnectorError(
          `${config.name} returned ${res.status}: ${text.slice(0, 500)}`,
          res.status === 401 || res.status === 403 ? "auth_expired" : "upstream_error"
        );
      }

      const raw = (await res.json()) as unknown;
      const totalsObj = extractByPath(raw, config.totalsPath);
      if (totalsObj == null || typeof totalsObj !== "object") {
        throw new ConnectorError(
          `Response did not contain object at path "${config.totalsPath}"`,
          "upstream_error"
        );
      }
      const totals = normalizeMetrics(
        totalsObj as Record<string, unknown>,
        config.metricsMap
      );

      let breakdown: MetricResult["breakdown"] = [];
      if (config.breakdownPath) {
        const rows = extractByPath(raw, config.breakdownPath);
        if (Array.isArray(rows)) {
          breakdown = rows.map((row) => {
            const r = row as Record<string, unknown>;
            const dims: Record<string, string> = {};
            const mets: Record<string, number> = {};
            for (const [k, v] of Object.entries(r)) {
              if (typeof v === "number") mets[k] = v;
              else if (typeof v === "string" && !Number.isNaN(Number(v))) mets[k] = Number(v);
              else if (typeof v === "string") dims[k] = v;
            }
            return { dimensions: dims, metrics: mets };
          });
        }
      }

      return {
        platform: `custom:${config.slug}` as never,
        client: { id: ctx.client._id, name: ctx.client.name, slug: ctx.client.slug },
        dateRange: query.dateRange,
        totals,
        breakdown,
        meta: { connectorName: config.name, url: url.pathname },
      };
    },
  };
}
