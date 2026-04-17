/**
 * fetchDataset — the single chokepoint where ARLO data exits Convex on its way to
 * any outbound surface. Both the MCP marketing_query tool and the destination
 * sync runner call this. Because it takes a RESOLVED clientId (never a fuzzy
 * client name) and passes that locked client through to the connector,
 * NDA scoping is enforced by construction — params cannot override clientId.
 *
 * Keep this file small and opinionated. Adding new parameters (filters, sort,
 * etc.) should happen here so every downstream surface gets them for free.
 */
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  runQuery,
  type PlatformRef,
} from "../connectors/registry";
import type { MetricResult, DateRangeInput } from "../connectors/types";
import { resolveDateRange } from "../date-ranges";
import { buildConnectorContext } from "../mcp-context";

export interface FetchDatasetInput {
  workspaceId: Id<"workspaces">;
  /** Locked at the call site. Must NOT be overrideable by params. */
  clientId: Id<"clients">;
  platform: PlatformRef;
  metrics: string[];
  dimensions?: string[];
  dateRange: DateRangeInput;
  limit?: number;
}

export async function fetchDataset(input: FetchDatasetInput): Promise<MetricResult> {
  const client = await fetchQuery(api.clients.get, {
    workspaceId: input.workspaceId,
    clientId: input.clientId,
  });
  if (!client) {
    throw new Error(`Client not found: ${input.clientId}`);
  }

  const ctx = await buildConnectorContext(input.workspaceId, client);
  return runQuery(input.platform, ctx, {
    metrics: input.metrics,
    dimensions: input.dimensions,
    limit: input.limit,
    dateRange: resolveDateRange(input.dateRange),
  });
}
