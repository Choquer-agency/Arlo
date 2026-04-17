import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { getServiceSecret } from "./serviceSecret";
import {
  allBuiltinPlatforms,
  discover,
  getConnector,
  isCustomPlatform,
  listAllPlatformsForWorkspace,
  resolvePlatform,
  runQuery,
  type PlatformRef,
} from "./connectors/registry";
import type { MarketingPlatform, DateRangeInput } from "./connectors/types";
import { resolveDateRange } from "./date-ranges";
import { resolveClientFromList } from "./resolve-client";
import { buildConnectorContext } from "./mcp-context";
import type { McpCaller } from "./mcp-auth";
import { fetchDataset } from "./datasets/fetchDataset";

/**
 * Platform arg accepts any built-in id OR a `custom:<slug>` reference. Validated
 * at runtime against the workspace's registry + custom connectors.
 */
const PLATFORM_REF = z
  .string()
  .describe("Platform id (e.g. ga4, gsc, shopify) or custom:<slug> for a workspace's custom connector.");
const DateRangePresetEnum = z.enum([
  "today", "yesterday",
  "last_7_days", "last_14_days", "last_28_days", "last_30_days", "last_90_days",
  "last_12_months",
  "mtd", "qtd", "ytd",
  "last_week", "last_month", "last_quarter", "last_year",
]);

const DateRangeSchema = z.union([
  z.object({ preset: DateRangePresetEnum }),
  z.object({ start: z.string(), end: z.string() }),
]);

/**
 * Paraphrase of the end-user's question. We log it (never the raw prompt — MCP
 * doesn't see that) so the workspace owner can see what their team/clients are
 * asking Claude without having to infer it from tool args alone.
 */
const QUESTION_PARAM = z
  .string()
  .optional()
  .describe(
    "Paraphrase the user's question or intent in one short sentence. Always include this — the workspace uses it to understand what its users are asking."
  );

const MetricQueryShape = {
  clientName: z.string().describe("Client name or slug (fuzzy matched)"),
  platform: PLATFORM_REF,
  metrics: z.array(z.string()).min(1),
  dateRange: DateRangeSchema,
  dimensions: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(10000).optional(),
  question: QUESTION_PARAM,
};

async function loadClients(workspaceId: Id<"workspaces">): Promise<Doc<"clients">[]> {
  return fetchQuery(api.clients.list, { workspaceId, includeArchived: false });
}

async function logCall(
  caller: McpCaller,
  tool: string,
  args: unknown,
  success: boolean,
  durationMs: number,
  clientId: Id<"clients"> | undefined,
  errorMessage: string | undefined
) {
  try {
    await fetchMutation(api.mcpAuditLog.record, {
      _serviceSecret: getServiceSecret(),
      workspaceId: caller.workspaceId,
      userId: caller.userId,
      tokenId: caller.tokenId,
      tool,
      args,
      success,
      errorMessage,
      durationMs,
      clientId,
    });
    await fetchMutation(api.usageCounters.incrementToolCall, {
      _serviceSecret: getServiceSecret(),
      workspaceId: caller.workspaceId,
      isInsight: tool === "marketing_insights",
    });
  } catch {}
}

function wrap<T>(
  caller: McpCaller,
  tool: string,
  handler: (args: T) => Promise<{ data: unknown; clientId?: Id<"clients"> }>
) {
  return async (args: T) => {
    const started = Date.now();
    try {
      const { data, clientId } = await handler(args);
      await logCall(caller, tool, args, true, Date.now() - started, clientId, undefined);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await logCall(caller, tool, args, false, Date.now() - started, undefined, msg);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: msg }, null, 2) }],
        isError: true,
      };
    }
  };
}

export function registerTools(server: McpServer, caller: McpCaller): void {
  // ─── list_clients ──────────────────────────────────
  server.tool(
    "list_clients",
    "List every client in your workspace (id, name, slug, website).",
    { archived: z.boolean().optional(), question: QUESTION_PARAM },
    wrap(caller, "list_clients", async ({ archived }) => {
      const clients = await fetchQuery(api.clients.list, {
        workspaceId: caller.workspaceId,
        includeArchived: archived ?? false,
      });
      return {
        data: clients.map((c) => ({
          id: c._id,
          name: c.name,
          slug: c.slug,
          websiteUrl: c.websiteUrl,
        })),
      };
    })
  );

  // ─── client_connections ────────────────────────────
  server.tool(
    "client_connections",
    "Show which platforms are configured for a given client. Returns { connected, reason } per platform.",
    { clientName: z.string(), question: QUESTION_PARAM },
    wrap(caller, "client_connections", async ({ clientName }) => {
      const clients = await loadClients(caller.workspaceId);
      const client = resolveClientFromList(clients, clientName);
      const ctx = await buildConnectorContext(caller.workspaceId, client);
      const result: Record<string, { connected: boolean; reason?: string; status: string }> = {};
      for (const p of allBuiltinPlatforms()) {
        const c = getConnector(p);
        const ok = c.isConfigured(ctx);
        result[p] = ok
          ? { connected: true, status: c.status }
          : { connected: false, reason: c.missingReason(ctx), status: c.status };
      }
      return {
        data: { client: { id: client._id, name: client.name, slug: client.slug }, platforms: result },
        clientId: client._id,
      };
    })
  );

  // ─── list_platforms ────────────────────────────────
  server.tool(
    "list_platforms",
    "List every platform this workspace can query (built-in + custom). Use this to find out what's available before marketing_query.",
    { question: QUESTION_PARAM },
    wrap(caller, "list_platforms", async () => {
      const platforms = await listAllPlatformsForWorkspace(caller.workspaceId);
      return { data: platforms };
    })
  );

  // ─── marketing_discover ────────────────────────────
  server.tool(
    "marketing_discover",
    "List the metrics and dimensions available for a given platform. Supports built-in platforms (ga4, gsc, ...) and custom:<slug>.",
    { platform: PLATFORM_REF, question: QUESTION_PARAM },
    wrap(caller, "marketing_discover", async ({ platform }) => {
      const result = await discover(platform as PlatformRef, caller.workspaceId);
      return { data: result };
    })
  );

  // ─── marketing_query ───────────────────────────────
  // Routes through fetchDataset — the single chokepoint shared with the
  // destination sync runner. Fuzzy client resolution happens first (MCP UX
  // accepts "Penni Cart"); the resolved _id is then LOCKED into fetchDataset.
  server.tool(
    "marketing_query",
    "Run a single-platform query. Works with built-in platforms or custom:<slug> connectors. Returns totals + optional breakdown rows.",
    MetricQueryShape,
    wrap(caller, "marketing_query", async (input) => {
      const clients = await loadClients(caller.workspaceId);
      const client = resolveClientFromList(clients, input.clientName);
      const result = await fetchDataset({
        workspaceId: caller.workspaceId,
        clientId: client._id,
        platform: input.platform as PlatformRef,
        metrics: input.metrics,
        dimensions: input.dimensions,
        limit: input.limit,
        dateRange: input.dateRange as DateRangeInput,
      });
      return { data: result, clientId: client._id };
    })
  );

  // ─── marketing_compare ─────────────────────────────
  server.tool(
    "marketing_compare",
    "Compare the same metrics across two date ranges. Returns both periods plus deltas (abs + %).",
    {
      clientName: z.string(),
      platform: PLATFORM_REF,
      metrics: z.array(z.string()).min(1),
      periodA: DateRangeSchema,
      periodB: DateRangeSchema,
      question: QUESTION_PARAM,
    },
    wrap(caller, "marketing_compare", async (input) => {
      const clients = await loadClients(caller.workspaceId);
      const client = resolveClientFromList(clients, input.clientName);
      const ctx = await buildConnectorContext(caller.workspaceId, client);
      const [a, b] = await Promise.all([
        runQuery(input.platform as PlatformRef, ctx, {
          metrics: input.metrics,
          dateRange: resolveDateRange(input.periodA as DateRangeInput),
        }),
        runQuery(input.platform as PlatformRef, ctx, {
          metrics: input.metrics,
          dateRange: resolveDateRange(input.periodB as DateRangeInput),
        }),
      ]);
      const deltas: Record<string, { abs: number; pct: number | null }> = {};
      for (const m of input.metrics) {
        const av = a.totals[m] ?? 0;
        const bv = b.totals[m] ?? 0;
        deltas[m] = { abs: av - bv, pct: bv === 0 ? null : ((av - bv) / bv) * 100 };
      }
      return {
        data: { periodA: a, periodB: b, deltas },
        clientId: client._id,
      };
    })
  );

  // ─── marketing_report ──────────────────────────────
  server.tool(
    "marketing_report",
    "Cross-platform overview for one date range. Accepts built-in platform ids and custom:<slug>.",
    {
      clientName: z.string(),
      platforms: z.array(PLATFORM_REF).min(1),
      dateRange: DateRangeSchema,
      question: QUESTION_PARAM,
    },
    wrap(caller, "marketing_report", async (input) => {
      const clients = await loadClients(caller.workspaceId);
      const client = resolveClientFromList(clients, input.clientName);
      const ctx = await buildConnectorContext(caller.workspaceId, client);
      const date = resolveDateRange(input.dateRange as DateRangeInput);
      const results: Record<string, unknown> = {};
      for (const p of input.platforms as PlatformRef[]) {
        try {
          const c = isCustomPlatform(p)
            ? await resolvePlatform(p, caller.workspaceId)
            : getConnector(p as MarketingPlatform);
          if (!c.isConfigured(ctx)) {
            results[p] = { error: c.missingReason(ctx) };
            continue;
          }
          const res = await runQuery(p, ctx, {
            metrics: c.discover().metrics.slice(0, 4).map((m) => m.name),
            dateRange: date,
          });
          results[p] = res.totals;
        } catch (err) {
          results[p] = { error: err instanceof Error ? err.message : String(err) };
        }
      }
      return {
        data: {
          client: { id: client._id, name: client.name, slug: client.slug },
          dateRange: date,
          perPlatform: results,
        },
        clientId: client._id,
      };
    })
  );

  // ─── portfolio_query ───────────────────────────────
  // NOTE: loadClients honors the caller's scope at the Convex layer. Scoped
  // members will only see their allowed clients here — enforcement lives in
  // api.clients.list, not in this tool.
  server.tool(
    "portfolio_query",
    "Aggregate a single-platform query across every client the caller can access. Use for 'which of my clients had X this week' questions. Returns one row per client with totals or an error.",
    {
      platform: PLATFORM_REF,
      metrics: z.array(z.string()).min(1),
      dateRange: DateRangeSchema,
      question: QUESTION_PARAM,
    },
    wrap(caller, "portfolio_query", async (input) => {
      const clients = await loadClients(caller.workspaceId);
      const date = resolveDateRange(input.dateRange as DateRangeInput);
      const rows = await Promise.all(
        clients.map(async (client) => {
          try {
            const ctx = await buildConnectorContext(caller.workspaceId, client);
            const res = await runQuery(input.platform as PlatformRef, ctx, {
              metrics: input.metrics,
              dateRange: date,
            });
            return {
              clientId: client._id,
              clientName: client.name,
              totals: res.totals,
            };
          } catch (err) {
            return {
              clientId: client._id,
              clientName: client.name,
              error: err instanceof Error ? err.message : String(err),
            };
          }
        })
      );
      return { data: { platform: input.platform, dateRange: date, rows } };
    })
  );

  // ─── marketing_attribution ─────────────────────────
  server.tool(
    "marketing_attribution",
    "Compare conversions/revenue across multiple ad or marketing platforms for one client over the same date range. Returns each platform's totals side-by-side so Claude can reason about where conversions came from. Not multi-touch — this is a platform-by-platform snapshot.",
    {
      clientName: z.string(),
      platforms: z.array(PLATFORM_REF).min(1),
      dateRange: DateRangeSchema,
      conversionMetrics: z
        .array(z.string())
        .optional()
        .describe("Metrics to compare across platforms. Defaults to ['conversions', 'revenue'] if the platform supports them."),
      question: QUESTION_PARAM,
    },
    wrap(caller, "marketing_attribution", async (input) => {
      const clients = await loadClients(caller.workspaceId);
      const client = resolveClientFromList(clients, input.clientName);
      const ctx = await buildConnectorContext(caller.workspaceId, client);
      const date = resolveDateRange(input.dateRange as DateRangeInput);
      const metrics = input.conversionMetrics ?? ["conversions", "revenue"];
      const perPlatform: Record<string, unknown> = {};
      for (const p of input.platforms as PlatformRef[]) {
        try {
          const res = await runQuery(p, ctx, { metrics, dateRange: date });
          perPlatform[p] = res.totals;
        } catch (err) {
          perPlatform[p] = { error: err instanceof Error ? err.message : String(err) };
        }
      }
      return {
        data: {
          client: { id: client._id, name: client.name },
          dateRange: date,
          metrics,
          perPlatform,
        },
        clientId: client._id,
      };
    })
  );

  // ─── check_platform_health ─────────────────────────
  server.tool(
    "check_platform_health",
    "Diagnostic. For a client, returns which platforms are healthy and which are unhealthy with a reason (missing OAuth, expired token, not assigned). Call this before a data query if the user is complaining something looks wrong.",
    { clientName: z.string(), question: QUESTION_PARAM },
    wrap(caller, "check_platform_health", async ({ clientName }) => {
      const clients = await loadClients(caller.workspaceId);
      const client = resolveClientFromList(clients, clientName);
      const ctx = await buildConnectorContext(caller.workspaceId, client);
      const healthy: string[] = [];
      const unhealthy: { platform: string; reason: string }[] = [];
      for (const p of allBuiltinPlatforms()) {
        const c = getConnector(p);
        if (c.isConfigured(ctx)) {
          healthy.push(p);
        } else {
          unhealthy.push({
            platform: p,
            reason: c.missingReason(ctx) ?? "not configured",
          });
        }
      }
      return {
        data: {
          client: { id: client._id, name: client.name },
          healthy,
          unhealthy,
        },
        clientId: client._id,
      };
    })
  );
}
