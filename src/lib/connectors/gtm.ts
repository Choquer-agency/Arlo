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
 * Google Tag Manager — reads through the workspace's EXISTING Google OAuth
 * connection (provider "google"). This is an INVENTORY connector, not a
 * time-series one: it reports what tags/triggers/variables exist right now,
 * so the requested date range is ignored (noted in meta).
 *
 * NOTE: ARLO's Google OAuth does not currently request the tagmanager.readonly
 * scope — a 403 from the API is surfaced with a clear reconnect message.
 */

const API = "https://tagmanager.googleapis.com/tagmanager/v2";

const KNOWN_METRICS = new Set([
  "containers_total",
  "tags_total",
  "tags_paused",
  "triggers_total",
  "variables_total",
]);

interface GtmContainer {
  path?: string;
  name?: string;
  publicId?: string;
}
interface GtmTag {
  name?: string;
  type?: string;
  paused?: boolean;
  firingTriggerId?: string[];
}

async function gtmGet(path: string, token: string): Promise<unknown> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) {
    const text = (await res.text()).slice(0, 300);
    if (res.status === 401)
      throw new ConnectorError(
        "Google rejected the access token (401). Reconnect Google on /connections.",
        "auth_expired"
      );
    if (res.status === 403)
      throw new ConnectorError(
        "Google Tag Manager needs the tagmanager.readonly scope, which ARLO's Google connection doesn't request yet — reconnect Google after ARLO enables it.",
        "not_connected"
      );
    if (res.status === 429)
      throw new ConnectorError("Google Tag Manager rate limit hit (429). Try again shortly.", "rate_limited");
    throw new ConnectorError(`Google Tag Manager API error ${res.status}: ${text}`, "upstream_error");
  }
  return res.json();
}

export const gtmConnector: MarketingConnector = {
  platform: "gtm",
  provider: "google",
  status: "beta",

  isConfigured(): boolean {
    return true; // workspace-level connection; fetch() raises not_connected when absent
  },

  missingReason(): string {
    return "Google Tag Manager reads through the workspace's Google connection. Connect Google on /connections.";
  },

  discover(): DiscoveryResult {
    const inv = " GTM is an inventory (current-state) source — date ranges are ignored.";
    return {
      platform: "gtm",
      status: "beta",
      metrics: [
        { name: "containers_total", description: `Number of GTM containers the connected Google account can access.${inv}`, type: "metric" },
        { name: "tags_total", description: "Tags in the selected container's default workspace (use a 'container' filter to pick one; otherwise the first container is used)", type: "metric" },
        { name: "tags_paused", description: "Tags currently paused in the selected container", type: "metric" },
        { name: "triggers_total", description: "Triggers in the selected container's default workspace", type: "metric" },
        { name: "variables_total", description: "User-defined variables in the selected container's default workspace", type: "metric" },
      ],
      dimensions: [
        { name: "tag", description: "One row per tag in the selected container: tag name, type, status (active/paused), and how many firing triggers it has", type: "dimension" },
        { name: "container", description: "One row per accessible container (name + public GTM-XXXX ID)", type: "dimension" },
      ],
    };
  },

  async fetch(ctx: ConnectorContext, query: MetricQuery): Promise<MetricResult> {
    for (const m of query.metrics) {
      if (!KNOWN_METRICS.has(m)) {
        throw new ConnectorError(
          `Unknown GTM metric "${m}". Supported: ${Array.from(KNOWN_METRICS).join(", ")}.`,
          "invalid_metric"
        );
      }
    }
    const dimension = query.dimensions?.[0];
    if (dimension && dimension !== "tag" && dimension !== "container") {
      throw new ConnectorError(
        `Unknown GTM dimension "${dimension}". Supported: tag, container.`,
        "invalid_metric"
      );
    }

    let token: string;
    try {
      token = await ctx.getAccessToken("google");
    } catch {
      throw new ConnectorError(
        "Google isn't connected for this workspace. Connect Google on /connections to read Tag Manager.",
        "not_connected"
      );
    }

    // Accounts → containers.
    const accountsRes = (await gtmGet("/accounts", token)) as {
      account?: { path?: string; name?: string }[];
    };
    const gtmAccounts = accountsRes.account ?? [];
    if (gtmAccounts.length === 0) {
      throw new ConnectorError(
        "The connected Google account has no Google Tag Manager accounts.",
        "no_data"
      );
    }

    const containers: GtmContainer[] = [];
    for (const acct of gtmAccounts.slice(0, 10)) {
      if (!acct.path) continue;
      const res = (await gtmGet(`/${acct.path}/containers`, token)) as {
        container?: GtmContainer[];
      };
      containers.push(...(res.container ?? []));
    }

    // Optional container filter (by name or public GTM-XXXX id).
    const containerFilter = (query.filters ?? []).find((f) => f.dimension === "container");
    let selected = containers;
    if (containerFilter) {
      const needle = containerFilter.value.toLowerCase();
      selected = containers.filter((c) => {
        const hay = `${c.name ?? ""} ${c.publicId ?? ""}`.toLowerCase();
        return containerFilter.op === "contains"
          ? hay.includes(needle)
          : c.name?.toLowerCase() === needle || c.publicId?.toLowerCase() === needle;
      });
      if (selected.length === 0) {
        throw new ConnectorError(
          `No GTM container matched "${containerFilter.value}". Available: ${containers
            .map((c) => `${c.name} (${c.publicId})`)
            .join(", ")}.`,
          "no_data"
        );
      }
    }

    const target = selected[0];
    const totals: Record<string, number> = {};
    let breakdown: MetricResultRow[] = [];
    const meta: Record<string, unknown> = {
      note: "GTM is an inventory (current-state) source — the requested date range is ignored.",
      containersFound: containers.map((c) => `${c.name} (${c.publicId})`),
    };

    if (query.metrics.includes("containers_total")) {
      totals.containers_total = containers.length;
    }

    const needsWorkspace =
      query.metrics.some((m) => m !== "containers_total") || dimension === "tag";
    let tags: GtmTag[] = [];
    if (needsWorkspace && target?.path) {
      meta.selectedContainer = `${target.name} (${target.publicId})`;

      const wsRes = (await gtmGet(`/${target.path}/workspaces`, token)) as {
        workspace?: { path?: string; name?: string }[];
      };
      const workspace = wsRes.workspace?.[0];
      if (!workspace?.path) {
        throw new ConnectorError(
          `GTM container ${target.publicId} has no workspaces the connected account can read.`,
          "no_data"
        );
      }

      const [tagsRes, triggersRes, variablesRes] = await Promise.all([
        gtmGet(`/${workspace.path}/tags`, token) as Promise<{ tag?: GtmTag[] }>,
        gtmGet(`/${workspace.path}/triggers`, token) as Promise<{ trigger?: unknown[] }>,
        gtmGet(`/${workspace.path}/variables`, token) as Promise<{ variable?: unknown[] }>,
      ]);
      tags = tagsRes.tag ?? [];

      const wanted: Record<string, number> = {
        tags_total: tags.length,
        tags_paused: tags.filter((t) => t.paused === true).length,
        triggers_total: (triggersRes.trigger ?? []).length,
        variables_total: (variablesRes.variable ?? []).length,
      };
      for (const m of query.metrics) {
        if (m in wanted) totals[m] = wanted[m];
      }

      // Published (live) version info — defensive: 404s when never published.
      try {
        const live = (await gtmGet(`/${target.path}/versions:live`, token)) as {
          name?: string;
          containerVersionId?: string;
          tag?: unknown[];
        };
        meta.liveVersion = {
          name: live.name ?? "",
          versionId: live.containerVersionId ?? "",
          publishedTags: (live.tag ?? []).length,
        };
      } catch {
        meta.liveVersion = null;
      }
    }

    if (dimension === "tag") {
      breakdown = tags.map((t) => ({
        dimensions: {
          tag: t.name ?? "",
          type: t.type ?? "",
          status: t.paused ? "paused" : "active",
        },
        metrics: { firing_triggers: (t.firingTriggerId ?? []).length },
      }));
    } else if (dimension === "container") {
      breakdown = containers.map((c) => ({
        dimensions: { container: c.name ?? "", public_id: c.publicId ?? "" },
        metrics: { containers_total: 1 },
      }));
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
      platform: "gtm",
      client: { id: ctx.client._id, name: ctx.client.name, slug: ctx.client.slug },
      dateRange: query.dateRange,
      totals,
      breakdown,
      meta,
    };
  },
};
