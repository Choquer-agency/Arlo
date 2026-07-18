import {
  MarketingConnector,
  ConnectorContext,
  MetricQuery,
  MetricResult,
  MetricResultRow,
  DiscoveryResult,
  ConnectorError,
} from "./types";

const API_VERSION = "v59.0";

const SUPPORTED_METRICS = [
  "leads_created",
  "opportunities_created",
  "opportunities_won",
  "won_value",
  "open_pipeline_value",
];

interface SoqlResponse {
  totalSize: number;
  records?: Record<string, unknown>[];
}

function mapHttpError(status: number, body: string): ConnectorError {
  if (status === 401) {
    return new ConnectorError(
      `Salesforce session is invalid or expired — reconnect Salesforce on /connections. (${body})`,
      "auth_expired"
    );
  }
  if (status === 429 || body.includes("REQUEST_LIMIT_EXCEEDED")) {
    return new ConnectorError(
      `Salesforce API request limit hit — retry later. (${body})`,
      "rate_limited"
    );
  }
  return new ConnectorError(`Salesforce API error (${status}): ${body}`, "upstream_error");
}

async function soql(
  instanceUrl: string,
  accessToken: string,
  queryText: string
): Promise<SoqlResponse> {
  const res = await fetch(
    `${instanceUrl}/services/data/${API_VERSION}/query?q=${encodeURIComponent(queryText)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw mapHttpError(res.status, await res.text());
  return (await res.json()) as SoqlResponse;
}

export const salesforceConnector: MarketingConnector = {
  platform: "salesforce",
  provider: "salesforce",
  status: "beta",

  isConfigured(): boolean {
    return true; // workspace-level connection; fetch() raises not_connected when absent
  },

  missingReason(): string {
    return "Salesforce isn't connected for this workspace. Connect it on /connections.";
  },

  discover(): DiscoveryResult {
    return {
      platform: "salesforce",
      status: "beta",
      metrics: [
        { name: "leads_created", description: "Leads created during the date range (Lead.CreatedDate)", type: "metric" },
        { name: "opportunities_created", description: "Opportunities created during the date range (Opportunity.CreatedDate)", type: "metric" },
        { name: "opportunities_won", description: "Opportunities won during the date range (IsWon = true with CloseDate in range)", type: "metric" },
        { name: "won_value", description: "Sum of Amount on opportunities won during the date range, in the org currency", type: "metric" },
        { name: "open_pipeline_value", description: "Sum of Amount on all currently open opportunities (IsClosed = false) — a point-in-time snapshot, not bound to the date range", type: "metric" },
      ],
      dimensions: [
        {
          name: "stage",
          description:
            "Group opportunities created during the date range by StageName. Each row carries opportunity_count and pipeline_value (SUM of Amount).",
          type: "dimension",
        },
      ],
    };
  },

  async fetch(ctx: ConnectorContext, query: MetricQuery): Promise<MetricResult> {
    for (const m of query.metrics) {
      if (!SUPPORTED_METRICS.includes(m)) {
        throw new ConnectorError(
          `Unknown Salesforce metric "${m}". Supported: ${SUPPORTED_METRICS.join(", ")}`,
          "invalid_metric"
        );
      }
    }
    const dimension = query.dimensions?.[0];
    if (dimension && dimension !== "stage") {
      throw new ConnectorError(
        `Unknown Salesforce dimension "${dimension}". Supported: stage`,
        "invalid_metric"
      );
    }

    const conn = await ctx.getConnection("salesforce");
    if (!conn) {
      throw new ConnectorError(
        "Salesforce isn't connected for this workspace. Connect it on /connections.",
        "not_connected"
      );
    }
    // The OAuth callback stores instance_url as accountId — the connector
    // can't read encrypted credentials, so this is its only route to the org.
    const instanceUrl = conn.accountId;
    if (!instanceUrl || !instanceUrl.startsWith("http")) {
      throw new ConnectorError(
        "Salesforce connection is missing its instance URL — reconnect Salesforce on /connections.",
        "not_connected"
      );
    }
    const accessToken = await ctx.getAccessToken("salesforce");

    // CreatedDate is a datetime → ISO datetime literals (no quotes in SOQL).
    const startDt = `${query.dateRange.start}T00:00:00Z`;
    const endDt = `${query.dateRange.end}T23:59:59Z`;
    const createdRange = `CreatedDate >= ${startDt} AND CreatedDate <= ${endDt}`;
    // CloseDate is a date field → date literals.
    const closeRange = `CloseDate >= ${query.dateRange.start} AND CloseDate <= ${query.dateRange.end}`;

    const totals: Record<string, number> = {};

    for (const m of query.metrics) {
      switch (m) {
        case "leads_created": {
          const r = await soql(
            instanceUrl,
            accessToken,
            `SELECT COUNT() FROM Lead WHERE ${createdRange}`
          );
          totals[m] = r.totalSize;
          break;
        }
        case "opportunities_created": {
          const r = await soql(
            instanceUrl,
            accessToken,
            `SELECT COUNT() FROM Opportunity WHERE ${createdRange}`
          );
          totals[m] = r.totalSize;
          break;
        }
        case "opportunities_won": {
          const r = await soql(
            instanceUrl,
            accessToken,
            `SELECT COUNT() FROM Opportunity WHERE IsWon = true AND ${closeRange}`
          );
          totals[m] = r.totalSize;
          break;
        }
        case "won_value": {
          const r = await soql(
            instanceUrl,
            accessToken,
            `SELECT SUM(Amount) v FROM Opportunity WHERE IsWon = true AND ${closeRange}`
          );
          totals[m] = Number(r.records?.[0]?.v ?? 0) || 0;
          break;
        }
        case "open_pipeline_value": {
          const r = await soql(
            instanceUrl,
            accessToken,
            `SELECT SUM(Amount) v FROM Opportunity WHERE IsClosed = false`
          );
          totals[m] = Number(r.records?.[0]?.v ?? 0) || 0;
          break;
        }
      }
    }

    let breakdown: MetricResultRow[] = [];
    if (dimension === "stage") {
      const r = await soql(
        instanceUrl,
        accessToken,
        `SELECT StageName, COUNT(Id) c, SUM(Amount) v FROM Opportunity WHERE ${createdRange} GROUP BY StageName`
      );
      breakdown = (r.records ?? []).map((rec) => ({
        dimensions: { stage: String(rec.StageName ?? "(no stage)") },
        metrics: {
          opportunity_count: Number(rec.c ?? 0) || 0,
          pipeline_value: Number(rec.v ?? 0) || 0,
        },
      }));
      if (query.sort) {
        const { metric, direction } = query.sort;
        breakdown.sort((a, b) => {
          const diff = (a.metrics[metric] ?? 0) - (b.metrics[metric] ?? 0);
          return direction === "asc" ? diff : -diff;
        });
      }
      if (query.limit && query.limit > 0) breakdown = breakdown.slice(0, query.limit);
    }

    return {
      platform: "salesforce",
      client: { id: ctx.client._id, name: ctx.client.name, slug: ctx.client.slug },
      dateRange: query.dateRange,
      totals,
      breakdown,
      meta: {
        instanceUrl,
        apiVersion: API_VERSION,
        notes: [
          query.metrics.includes("open_pipeline_value")
            ? "open_pipeline_value is a current snapshot, not bound to the date range"
            : undefined,
          dimension === "stage"
            ? "stage rows report opportunity_count and pipeline_value for opportunities created in the range"
            : undefined,
        ].filter(Boolean),
      },
    };
  },
};
