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
 * QuickBooks Online (Intuit) — workspace-level connection, private beta.
 *
 * Unlike the Google sources there is no per-client account mapping yet: the
 * whole workspace shares one QBO company (the realmId captured at OAuth time
 * on the platformConnection.accountId). P&L metrics come from the Reports API;
 * invoice metrics from the Query API.
 */

const PROD_BASE = "https://quickbooks.api.intuit.com";
const SANDBOX_BASE = "https://sandbox-quickbooks.api.intuit.com";
const MINOR_VERSION = "70";

function apiBase(): string {
  return process.env.QUICKBOOKS_ENV === "sandbox" ? SANDBOX_BASE : PROD_BASE;
}

// ── Metric catalog ──────────────────────────────────────────────────────────
// P&L report metrics keyed by the report's section `group` name.
const PNL_METRICS: Record<string, string> = {
  total_income: "Income",
  cogs: "COGS",
  gross_profit: "GrossProfit",
  total_expenses: "Expenses",
  net_operating_income: "NetOperatingIncome",
  net_income: "NetIncome",
};
const INVOICE_METRICS = new Set([
  "invoice_count",
  "invoice_total",
  "open_invoice_count",
  "open_invoice_total",
  "overdue_invoice_count",
  "overdue_invoice_total",
]);

// ── QBO report JSON walking ─────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
type QboRow = {
  type?: string;
  group?: string;
  ColData?: { value?: string }[];
  Summary?: { ColData?: { value?: string }[] };
  Rows?: { Row?: QboRow[] };
  Header?: { ColData?: { value?: string }[] };
};

const num = (s: string | undefined) => {
  const n = parseFloat((s ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/** Collect every section's Summary ColData, keyed by group name. */
function collectSummaries(rows: QboRow[] | undefined, out: Record<string, { value?: string }[]>) {
  for (const row of rows ?? []) {
    if (row.group && row.Summary?.ColData) out[row.group] = row.Summary.ColData;
    if (row.Rows?.Row) collectSummaries(row.Rows.Row, out);
  }
}

/** Collect leaf data rows (account name → amount) under a section group. */
function collectAccountRows(
  rows: QboRow[] | undefined,
  inSection: boolean,
  wantedGroups: Set<string>,
  out: { account: string; amount: number }[]
) {
  for (const row of rows ?? []) {
    const isWanted = inSection || (row.group ? wantedGroups.has(row.group) : false);
    if (row.type === "Data" && isWanted && row.ColData?.length) {
      out.push({
        account: row.ColData[0]?.value ?? "(unnamed)",
        amount: num(row.ColData[row.ColData.length - 1]?.value),
      });
    }
    if (row.Rows?.Row) collectAccountRows(row.Rows.Row, isWanted, wantedGroups, out);
  }
}

async function qboFetch(accessToken: string, path: string): Promise<any> {
  const res = await fetch(`${apiBase()}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  if (res.status === 401) {
    throw new ConnectorError("QuickBooks auth expired — reconnect on /connections.", "auth_expired");
  }
  if (res.status === 429) {
    throw new ConnectorError("QuickBooks rate limit hit — try again in a minute.", "rate_limited");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new ConnectorError(`QuickBooks API error ${res.status}: ${text.slice(0, 300)}`, "upstream_error");
  }
  return res.json();
}

export const quickbooksConnector: MarketingConnector = {
  platform: "quickbooks",
  provider: "quickbooks",
  status: "beta",

  // Workspace-level connection — no per-client mapping. fetch() raises a clear
  // not_connected error when the workspace hasn't linked QuickBooks.
  isConfigured(): boolean {
    return true;
  },

  missingReason(): string {
    return "QuickBooks isn't connected for this workspace. Connect it on /connections (private beta).";
  },

  discover(): DiscoveryResult {
    return {
      platform: "quickbooks",
      status: "beta",
      metrics: [
        { name: "total_income", description: "Total income for the period (P&L)", type: "metric" },
        { name: "cogs", description: "Cost of goods sold (P&L)", type: "metric" },
        { name: "gross_profit", description: "Income minus COGS (P&L)", type: "metric" },
        { name: "total_expenses", description: "Total operating expenses (P&L)", type: "metric" },
        { name: "net_operating_income", description: "Gross profit minus expenses (P&L)", type: "metric" },
        { name: "net_income", description: "Bottom-line net income (P&L)", type: "metric" },
        { name: "invoice_count", description: "Invoices issued in the period", type: "metric" },
        { name: "invoice_total", description: "Total amount invoiced in the period", type: "metric" },
        { name: "open_invoice_count", description: "Invoices from the period with a balance due", type: "metric" },
        { name: "open_invoice_total", description: "Outstanding balance on invoices from the period", type: "metric" },
        { name: "overdue_invoice_count", description: "Open invoices past their due date", type: "metric" },
        { name: "overdue_invoice_total", description: "Balance on invoices past their due date", type: "metric" },
      ],
      dimensions: [
        { name: "month", description: "Calendar month (P&L metrics only)", type: "dimension" },
        { name: "account", description: "P&L line-item account (income/expense category)", type: "dimension" },
        { name: "customer", description: "Invoice customer name (invoice metrics only)", type: "dimension" },
      ],
    };
  },

  async fetch(ctx: ConnectorContext, query: MetricQuery): Promise<MetricResult> {
    const conn = await ctx.getConnection("quickbooks");
    if (!conn || conn.status !== "active") {
      throw new ConnectorError(this.missingReason(ctx), "not_connected");
    }
    const realmId = conn.accountId;
    if (!realmId) {
      throw new ConnectorError("QuickBooks connection has no company (realm) id — reconnect on /connections.", "missing_id");
    }
    const accessToken = await ctx.getAccessToken("quickbooks");

    const pnlWanted = query.metrics.filter((m) => m in PNL_METRICS);
    const invWanted = query.metrics.filter((m) => INVOICE_METRICS.has(m));
    const unknown = query.metrics.filter((m) => !(m in PNL_METRICS) && !INVOICE_METRICS.has(m));
    if (unknown.length) {
      throw new ConnectorError(
        `Unknown QuickBooks metric(s): ${unknown.join(", ")}. Run marketing_discover for the list.`,
        "invalid_metric"
      );
    }

    const dimension = query.dimensions?.[0];
    const totals: Record<string, number> = {};
    const breakdown: MetricResultRow[] = [];
    const { start, end } = query.dateRange;

    // ── P&L metrics ──
    if (pnlWanted.length) {
      const byMonth = dimension === "month";
      const params = new URLSearchParams({
        start_date: start,
        end_date: end,
        accounting_method: "Accrual",
        minorversion: MINOR_VERSION,
      });
      if (byMonth) params.set("summarize_column_by", "Month");
      const report = await qboFetch(
        accessToken,
        `/v3/company/${realmId}/reports/ProfitAndLoss?${params.toString()}`
      );

      const summaries: Record<string, { value?: string }[]> = {};
      collectSummaries(report?.Rows?.Row, summaries);

      for (const m of pnlWanted) {
        const cols = summaries[PNL_METRICS[m]];
        totals[m] = cols ? num(cols[cols.length - 1]?.value) : 0;
      }

      if (byMonth) {
        // Columns: [label, month1..monthN, Total]
        const colTitles: string[] = (report?.Columns?.Column ?? [])
          .map((c: any) => c?.ColTitle ?? "")
          .slice(1, -1);
        const rowsByMonth: Record<string, Record<string, number>> = {};
        for (const m of pnlWanted) {
          const cols = summaries[PNL_METRICS[m]] ?? [];
          colTitles.forEach((title: string, i: number) => {
            if (!title) return;
            rowsByMonth[title] ??= {};
            rowsByMonth[title][m] = num(cols[i + 1]?.value);
          });
        }
        for (const [month, metrics] of Object.entries(rowsByMonth)) {
          breakdown.push({ dimensions: { month }, metrics });
        }
      } else if (dimension === "account") {
        const rows: { account: string; amount: number }[] = [];
        collectAccountRows(
          report?.Rows?.Row,
          false,
          new Set(["Income", "COGS", "Expenses", "OtherIncome", "OtherExpenses"]),
          rows
        );
        for (const r of rows) {
          breakdown.push({ dimensions: { account: r.account }, metrics: { amount: r.amount } });
        }
      }
    }

    // ── Invoice metrics ──
    if (invWanted.length) {
      const sql = `SELECT * FROM Invoice WHERE TxnDate >= '${start}' AND TxnDate <= '${end}' MAXRESULTS 1000`;
      const data = await qboFetch(
        accessToken,
        `/v3/company/${realmId}/query?query=${encodeURIComponent(sql)}&minorversion=${MINOR_VERSION}`
      );
      const invoices: any[] = data?.QueryResponse?.Invoice ?? [];
      const today = new Date().toISOString().slice(0, 10);

      const open = invoices.filter((i) => (i.Balance ?? 0) > 0);
      const overdue = open.filter((i) => i.DueDate && i.DueDate < today);
      const sum = (list: any[], f: (i: any) => number) => list.reduce((s, i) => s + f(i), 0);

      const invTotals: Record<string, number> = {
        invoice_count: invoices.length,
        invoice_total: sum(invoices, (i) => i.TotalAmt ?? 0),
        open_invoice_count: open.length,
        open_invoice_total: sum(open, (i) => i.Balance ?? 0),
        overdue_invoice_count: overdue.length,
        overdue_invoice_total: sum(overdue, (i) => i.Balance ?? 0),
      };
      for (const m of invWanted) totals[m] = Math.round(invTotals[m] * 100) / 100;

      if (dimension === "customer") {
        const byCustomer: Record<string, Record<string, number>> = {};
        for (const inv of invoices) {
          const name = inv.CustomerRef?.name ?? "(unknown)";
          byCustomer[name] ??= Object.fromEntries(invWanted.map((m) => [m, 0]));
          const isOpen = (inv.Balance ?? 0) > 0;
          const isOverdue = isOpen && inv.DueDate && inv.DueDate < today;
          for (const m of invWanted) {
            byCustomer[name][m] +=
              m === "invoice_count" ? 1
              : m === "invoice_total" ? inv.TotalAmt ?? 0
              : m === "open_invoice_count" ? (isOpen ? 1 : 0)
              : m === "open_invoice_total" ? (isOpen ? inv.Balance ?? 0 : 0)
              : m === "overdue_invoice_count" ? (isOverdue ? 1 : 0)
              : /* overdue_invoice_total */ isOverdue ? inv.Balance ?? 0 : 0;
          }
        }
        for (const [customer, metrics] of Object.entries(byCustomer)) {
          breakdown.push({ dimensions: { customer }, metrics });
        }
      }
    }

    if (query.sort) {
      const { metric, direction } = query.sort;
      breakdown.sort((a, b) => ((a.metrics[metric] ?? 0) - (b.metrics[metric] ?? 0)) * (direction === "asc" ? 1 : -1));
    }
    const limited = query.limit ? breakdown.slice(0, query.limit) : breakdown;

    return {
      platform: "quickbooks",
      client: { id: ctx.client._id, name: ctx.client.name, slug: ctx.client.slug ?? ctx.client.name },
      dateRange: query.dateRange,
      totals,
      breakdown: limited,
      meta: { company: conn.availableAccounts?.[0]?.name, realmId, environment: process.env.QUICKBOOKS_ENV ?? "production" },
    };
  },
};
