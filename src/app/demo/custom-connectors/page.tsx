"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Check,
  ChevronDown,
  ChevronUp,
  Code,
  Plus,
  Trash2,
  X,
} from "lucide-react";

type AuthType = "bearer" | "api_key_header" | "api_key_query" | "basic" | "none";

interface CustomConnector {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  color: string;
  authType: AuthType;
  authHeaderName?: string;
  baseUrl: string;
  queryMethod: "GET" | "POST";
  queryPath: string;
  queryParams: Record<string, string>;
  totalsPath: string;
  breakdownPath?: string;
  metrics: Array<{ name: string; description: string }>;
  dimensions: Array<{ name: string; description: string }>;
  status: "active" | "paused" | "error";
  lastTested: string;
  createdBy: string;
}

const DEMO_CONNECTORS: CustomConnector[] = [
  {
    id: "plausible",
    name: "Plausible Analytics",
    slug: "plausible",
    description:
      "Privacy-friendly analytics. One API key, one site_id per client, full GA4-lite coverage.",
    category: "Analytics",
    color: "#5850EC",
    authType: "bearer",
    baseUrl: "https://plausible.io/api/v1/stats",
    queryMethod: "GET",
    queryPath: "/aggregate",
    queryParams: {
      site_id: "{{client.websiteUrl}}",
      period: "custom",
      date: "{{dateRange.start}},{{dateRange.end}}",
      metrics: "{{metrics}}",
    },
    totalsPath: "results",
    breakdownPath: undefined,
    metrics: [
      { name: "visitors", description: "Unique visitors" },
      { name: "pageviews", description: "Total page views" },
      { name: "bounce_rate", description: "Bounce rate (%)" },
      { name: "visit_duration", description: "Average visit duration (s)" },
    ],
    dimensions: [
      { name: "page", description: "Page URL" },
      { name: "source", description: "Referrer source" },
      { name: "device", description: "Device type" },
    ],
    status: "active",
    lastTested: "2h ago",
    createdBy: "marcus@northpoint.co",
  },
  {
    id: "klaviyo",
    name: "Klaviyo",
    slug: "klaviyo",
    description:
      "E-commerce email + SMS. API key per client. Campaign sends, opens, click rates, revenue attribution.",
    category: "Email Marketing",
    color: "#232B2B",
    authType: "api_key_header",
    authHeaderName: "Authorization",
    baseUrl: "https://a.klaviyo.com/api",
    queryMethod: "GET",
    queryPath: "/campaign-values-reports",
    queryParams: {
      timeframe: "{{dateRange.start}}..{{dateRange.end}}",
      statistics: "{{metrics}}",
    },
    totalsPath: "data.attributes.results",
    metrics: [
      { name: "opens_unique", description: "Unique opens" },
      { name: "clicks_unique", description: "Unique clicks" },
      { name: "click_rate", description: "Click-through rate" },
      { name: "conversion_value", description: "Attributed revenue" },
      { name: "unsubscribes", description: "Unsubscribes" },
    ],
    dimensions: [
      { name: "campaign_name", description: "Campaign" },
      { name: "send_time", description: "Send date" },
    ],
    status: "active",
    lastTested: "14m ago",
    createdBy: "priya@northpoint.co",
  },
  {
    id: "internal-metabase",
    name: "Internal Metabase",
    slug: "metabase",
    description:
      "Northpoint's internal reporting DB via Metabase saved questions. Card-based queries, results cached daily.",
    category: "Data",
    color: "#509EE3",
    authType: "api_key_header",
    authHeaderName: "X-Metabase-Session",
    baseUrl: "https://metabase.northpoint.co/api",
    queryMethod: "POST",
    queryPath: "/card/342/query",
    queryParams: {},
    totalsPath: "data.rows",
    breakdownPath: "data.rows",
    metrics: [
      { name: "mrr", description: "Monthly recurring revenue" },
      { name: "active_clients", description: "Active client count" },
      { name: "avg_project_hours", description: "Average hours per project this month" },
    ],
    dimensions: [
      { name: "team", description: "Team (SEO / Ads / Dev)" },
      { name: "month", description: "Calendar month" },
    ],
    status: "error",
    lastTested: "3d ago",
    createdBy: "marcus@northpoint.co",
  },
];

const CATEGORY_OPTIONS = [
  "Analytics",
  "Search Ads",
  "Social Ads",
  "E-commerce",
  "CRM",
  "Email Marketing",
  "Support",
  "Call Tracking",
  "SEO Tools",
  "Payments",
  "Subscriptions",
  "Finance",
  "Data",
  "Other",
];

export default function CustomConnectorsPage() {
  const [connectors, setConnectors] = useState<CustomConnector[]>(DEMO_CONNECTORS);
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="max-w-container mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
            Custom connectors · Build your own
          </p>
          <h1 className="font-sans text-fluid-h2 text-dark mb-3">
            Plug any REST API into Claude
          </h1>
          <p className="text-dark opacity-60 text-fluid-main max-w-2xl">
            Don&apos;t wait for us to build an integration. Configure any platform with a
            queryable HTTP API yourself — one config, and it&apos;s a first-class tool Claude
            can call like any built-in platform.
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="btn-secondary text-base px-6 py-3 flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={16} />
          New custom connector
        </button>
      </div>

      {/* How it works mini-explainer */}
      <div className="bg-mint border border-brand-neon/30 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <Code size={20} className="text-brand mt-1 flex-shrink-0" />
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-brand mb-2">
              How custom connectors work
            </p>
            <p className="text-dark text-fluid-main mb-3">
              You give us the API URL, auth, and a response-mapping template with variables
              like <code className="font-mono bg-white px-1.5 py-0.5 rounded text-sm">
                {`{{dateRange.start}}`}
              </code>{" "}
              or{" "}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded text-sm">
                {`{{client.gscSiteUrl}}`}
              </code>
              . Claude gets a new tool it can call as{" "}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded text-sm">
                marketing_query
              </code>{" "}
              with{" "}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded text-sm">
                platform: &quot;custom:your-slug&quot;
              </code>
              .
            </p>
            <p className="text-dark text-fluid-small opacity-70">
              Works for: Plausible, Matomo, internal APIs, Supabase, Retool, any platform with a
              REST endpoint. Oauth2-only platforms like Notion need a bit more setup — contact
              us for those.
            </p>
          </div>
        </div>
      </div>

      {adding && <AddForm onCancel={() => setAdding(false)} onCreate={(c) => {
        setConnectors([c, ...connectors]);
        setAdding(false);
      }} />}

      {/* List */}
      <div className="space-y-3">
        {connectors.map((c) => (
          <ConnectorCard
            key={c.id}
            c={c}
            expanded={expanded === c.id}
            onToggle={() => setExpanded(expanded === c.id ? null : c.id)}
            onDelete={() => setConnectors(connectors.filter((x) => x.id !== c.id))}
          />
        ))}
      </div>

      <div className="bg-white border border-dark-faded rounded-lg p-8 mt-10 text-center">
        <p className="font-sans text-fluid-h5 text-dark mb-2">Need help with a trickier API?</p>
        <p className="text-dark opacity-60 text-fluid-main mb-5 max-w-xl mx-auto">
          OAuth2-only platforms or paginated / chunked responses need a bit more setup. Our
          team can help configure it for you at no charge on the Agency and Scale plans.
        </p>
        <a
          href="mailto:support@askarlo.app?subject=Custom%20connector%20help"
          className="btn-secondary inline-flex px-6 py-3"
        >
          Get help from our team
        </a>
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────

function ConnectorCard({
  c,
  expanded,
  onToggle,
  onDelete,
}: {
  c: CustomConnector;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<null | { ok: boolean; data: unknown }>(null);

  async function runTest() {
    setTesting(true);
    setTestResult(null);
    // Simulated response
    await new Promise((r) => setTimeout(r, 900));
    if (c.id === "internal-metabase") {
      setTestResult({
        ok: false,
        data: {
          error: "401 Unauthorized",
          hint: "Metabase session token expired. Reconnect via Settings.",
        },
      });
    } else {
      const fakeData: Record<string, number> = {};
      c.metrics.forEach((m) => {
        fakeData[m.name] = Math.floor(Math.random() * 10000);
      });
      setTestResult({ ok: true, data: { results: fakeData } });
    }
    setTesting(false);
  }

  const statusStyles = {
    active: "bg-mint text-brand",
    paused: "bg-grey text-dark opacity-70",
    error: "bg-bg-red/20 text-bg-red",
  };

  return (
    <div className={`bg-white border rounded-lg overflow-hidden ${c.status === "error" ? "border-bg-red/40" : "border-dark-faded"}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-grey text-left"
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div
            className="w-10 h-10 rounded flex items-center justify-center font-display text-white text-lg flex-shrink-0"
            style={{ backgroundColor: c.color }}
          >
            {c.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-0.5">
              <h3 className="font-sans text-fluid-h5 text-dark">{c.name}</h3>
              <code className="font-mono text-[11px] text-dark opacity-60 bg-grey px-2 py-0.5 rounded">
                custom:{c.slug}
              </code>
            </div>
            <p className="font-mono text-xs text-dark opacity-60 truncate">{c.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded ${statusStyles[c.status]}`}>
            {c.status}
          </span>
          <span className="font-mono text-[10px] text-dark opacity-40 hidden md:inline">
            Tested {c.lastTested}
          </span>
          {expanded ? <ChevronUp size={16} className="text-dark opacity-60" /> : <ChevronDown size={16} className="text-dark opacity-60" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-dark-faded p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section title="Auth">
              <Field label="Type" value={c.authType} />
              {c.authHeaderName && <Field label="Header" value={c.authHeaderName} mono />}
              <Field label="Credential" value="••••••••••••••••" mono />
            </Section>

            <Section title="Request">
              <Field label="Method" value={c.queryMethod} mono />
              <Field label="URL" value={`${c.baseUrl}${c.queryPath}`} mono wrap />
            </Section>
          </div>

          <Section title="Query params (with template variables)">
            <div className="space-y-1">
              {Object.entries(c.queryParams).map(([k, v]) => (
                <div key={k} className="flex gap-3 font-mono text-sm">
                  <span className="text-dark opacity-60 w-32 flex-shrink-0">{k}</span>
                  <code className="text-dark bg-grey px-2 py-0.5 rounded flex-1">{v}</code>
                </div>
              ))}
              {Object.keys(c.queryParams).length === 0 && (
                <p className="font-mono text-sm text-dark opacity-40">No query params</p>
              )}
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section title="Response mapping">
              <Field label="Totals path" value={c.totalsPath} mono />
              {c.breakdownPath && <Field label="Breakdown path" value={c.breakdownPath} mono />}
            </Section>

            <Section title="Catalog">
              <Field label="Metrics" value={`${c.metrics.length}`} />
              <Field label="Dimensions" value={`${c.dimensions.length}`} />
            </Section>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-dark mb-2">
              Metrics exposed to Claude ({c.metrics.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {c.metrics.map((m) => (
                <span
                  key={m.name}
                  className="font-mono text-xs bg-grey text-dark px-2 py-1 rounded border border-dark-faded"
                  title={m.description}
                >
                  {m.name}
                </span>
              ))}
            </div>
          </div>

          {c.dimensions.length > 0 && (
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-dark mb-2">
                Dimensions ({c.dimensions.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {c.dimensions.map((d) => (
                  <span
                    key={d.name}
                    className="font-mono text-xs bg-mint text-brand px-2 py-1 rounded"
                    title={d.description}
                  >
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Test panel */}
          <div className="border-t border-dark-faded pt-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-sans text-dark">Test query</p>
                <p className="font-mono text-xs text-dark opacity-60 mt-0.5">
                  Runs last_7_days with all metrics against your configured endpoint.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={runTest}
                  disabled={testing}
                  className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {testing ? (
                    <>
                      <Activity size={14} className="animate-pulse" />
                      Running…
                    </>
                  ) : (
                    <>
                      <Activity size={14} />
                      Run test
                    </>
                  )}
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 text-bg-red hover:bg-bg-red/10 rounded"
                  title="Delete connector"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {testResult && (
              <div
                className={`rounded-md p-4 ${
                  testResult.ok ? "bg-mint border border-brand-neon/30" : "bg-bg-red/10 border border-bg-red/30"
                }`}
              >
                <p className="font-mono text-xs uppercase tracking-wider mb-2">
                  {testResult.ok ? (
                    <span className="text-brand flex items-center gap-1.5"><Check size={12} /> Success</span>
                  ) : (
                    <span className="text-bg-red flex items-center gap-1.5"><X size={12} /> Failed</span>
                  )}
                </p>
                <pre className="font-mono text-xs text-dark overflow-x-auto">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Field({ label, value, mono, wrap }: { label: string; value: string; mono?: boolean; wrap?: boolean }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-dark opacity-60 w-28 flex-shrink-0">{label}</span>
      <span className={`text-dark flex-1 ${mono ? "font-mono text-xs" : ""} ${wrap ? "break-all" : "truncate"}`}>
        {value}
      </span>
    </div>
  );
}

// ── Add new connector form ─────────────────────────

function AddForm({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (c: CustomConnector) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Analytics");
  const [baseUrl, setBaseUrl] = useState("");
  const [queryPath, setQueryPath] = useState("");
  const [queryMethod, setQueryMethod] = useState<"GET" | "POST">("GET");
  const [authType, setAuthType] = useState<AuthType>("bearer");
  const [authHeaderName, setAuthHeaderName] = useState("X-API-Key");
  const [credential, setCredential] = useState("");
  const [params, setParams] = useState<Array<{ k: string; v: string }>>([
    { k: "date_from", v: "{{dateRange.start}}" },
    { k: "date_to", v: "{{dateRange.end}}" },
  ]);
  const [totalsPath, setTotalsPath] = useState("data");
  const [metricsText, setMetricsText] = useState("visitors, pageviews, bounce_rate");
  const [dimensionsText, setDimensionsText] = useState("page, source");

  const slug = useMemo(() => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new-connector", [name]);

  function addParam() {
    setParams([...params, { k: "", v: "" }]);
  }
  function removeParam(i: number) {
    setParams(params.filter((_, idx) => idx !== i));
  }
  function updateParam(i: number, key: "k" | "v", value: string) {
    setParams(params.map((p, idx) => (idx === i ? { ...p, [key]: value } : p)));
  }

  function save() {
    if (!name.trim() || !baseUrl.trim() || !queryPath.trim()) return;
    const metrics = metricsText.split(",").map((s) => s.trim()).filter(Boolean).map((n) => ({
      name: n,
      description: n.replace(/_/g, " "),
    }));
    const dimensions = dimensionsText.split(",").map((s) => s.trim()).filter(Boolean).map((n) => ({
      name: n,
      description: n.replace(/_/g, " "),
    }));
    const queryParams: Record<string, string> = {};
    params.forEach((p) => {
      if (p.k.trim()) queryParams[p.k.trim()] = p.v;
    });

    onCreate({
      id: slug,
      slug,
      name: name.trim(),
      description: description.trim() || "Custom connector",
      category,
      color: "#8F93FF",
      authType,
      authHeaderName: authType === "api_key_header" ? authHeaderName : undefined,
      baseUrl: baseUrl.trim(),
      queryMethod,
      queryPath: queryPath.trim(),
      queryParams,
      totalsPath: totalsPath.trim() || "data",
      metrics,
      dimensions,
      status: "active",
      lastTested: "never",
      createdBy: "you",
    });
  }

  return (
    <div className="bg-white border-2 border-brand rounded-lg p-8 mb-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-brand mb-1">
            New custom connector
          </p>
          <p className="text-dark opacity-60 text-fluid-small">
            Claude will expose this as{" "}
            <code className="font-mono bg-grey px-1.5 py-0.5 rounded">custom:{slug}</code>
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-dark opacity-60 hover:opacity-100 p-2 rounded"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Platform name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Plausible Analytics"
              className="w-full border border-dark-faded rounded px-3 py-2 font-sans text-sm focus:outline-none focus:border-brand"
              autoFocus
            />
          </FormField>
          <FormField label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-dark-faded rounded px-3 py-2 font-sans text-sm focus:outline-none focus:border-brand"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Description (one line)">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What your team uses this for"
            className="w-full border border-dark-faded rounded px-3 py-2 font-sans text-sm focus:outline-none focus:border-brand"
          />
        </FormField>

        {/* Auth */}
        <fieldset className="border border-dark-faded rounded-md p-4">
          <legend className="font-mono text-xs uppercase tracking-wider text-dark px-2">Auth</legend>
          <div className="space-y-3">
            <FormField label="Auth type">
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value as AuthType)}
                className="w-full border border-dark-faded rounded px-3 py-2 font-sans text-sm focus:outline-none focus:border-brand"
              >
                <option value="bearer">Bearer token (Authorization: Bearer …)</option>
                <option value="api_key_header">API key in custom header</option>
                <option value="api_key_query">API key in query param</option>
                <option value="basic">Basic auth (user:pass)</option>
                <option value="none">None (public API)</option>
              </select>
            </FormField>
            {authType === "api_key_header" && (
              <FormField label="Header name">
                <input
                  type="text"
                  value={authHeaderName}
                  onChange={(e) => setAuthHeaderName(e.target.value)}
                  className="w-full border border-dark-faded rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-brand"
                  placeholder="X-API-Key"
                />
              </FormField>
            )}
            {authType !== "none" && (
              <FormField label="Credential">
                <input
                  type="password"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder="Encrypted at rest with AES-256-GCM"
                  className="w-full border border-dark-faded rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-brand"
                />
              </FormField>
            )}
          </div>
        </fieldset>

        {/* Request */}
        <fieldset className="border border-dark-faded rounded-md p-4">
          <legend className="font-mono text-xs uppercase tracking-wider text-dark px-2">Request</legend>
          <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-3">
            <FormField label="Method">
              <select
                value={queryMethod}
                onChange={(e) => setQueryMethod(e.target.value as "GET" | "POST")}
                className="w-full border border-dark-faded rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-brand"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </FormField>
            <FormField label="Base URL">
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
                className="w-full border border-dark-faded rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-brand"
              />
            </FormField>
          </div>
          <div className="mt-3">
            <FormField label="Path">
              <input
                type="text"
                value={queryPath}
                onChange={(e) => setQueryPath(e.target.value)}
                placeholder="/stats/aggregate"
                className="w-full border border-dark-faded rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-brand"
              />
            </FormField>
          </div>
          <div className="mt-4">
            <p className="font-mono text-xs uppercase tracking-wider text-dark opacity-60 mb-2">
              Query params
            </p>
            <p className="text-xs text-dark opacity-60 mb-3">
              Use{" "}
              <code className="font-mono bg-grey px-1 py-0.5 rounded">{`{{dateRange.start}}`}</code>,{" "}
              <code className="font-mono bg-grey px-1 py-0.5 rounded">{`{{dateRange.end}}`}</code>,{" "}
              <code className="font-mono bg-grey px-1 py-0.5 rounded">{`{{metrics}}`}</code>,{" "}
              <code className="font-mono bg-grey px-1 py-0.5 rounded">{`{{client.<field>}}`}</code>
            </p>
            <div className="space-y-2">
              {params.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={p.k}
                    onChange={(e) => updateParam(i, "k", e.target.value)}
                    placeholder="key"
                    className="flex-1 border border-dark-faded rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-brand"
                  />
                  <input
                    type="text"
                    value={p.v}
                    onChange={(e) => updateParam(i, "v", e.target.value)}
                    placeholder="value or {{variable}}"
                    className="flex-[2] border border-dark-faded rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-brand"
                  />
                  <button
                    onClick={() => removeParam(i)}
                    className="text-bg-red opacity-60 hover:opacity-100 p-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={addParam}
                className="font-mono text-xs uppercase tracking-wider text-brand hover:underline flex items-center gap-1 mt-1"
              >
                <Plus size={12} /> Add param
              </button>
            </div>
          </div>
        </fieldset>

        {/* Response */}
        <fieldset className="border border-dark-faded rounded-md p-4">
          <legend className="font-mono text-xs uppercase tracking-wider text-dark px-2">Response</legend>
          <FormField label="Totals path">
            <input
              type="text"
              value={totalsPath}
              onChange={(e) => setTotalsPath(e.target.value)}
              placeholder="e.g. data or results.totals"
              className="w-full border border-dark-faded rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-brand"
            />
          </FormField>
          <p className="text-xs text-dark opacity-60 mt-2">
            Dot-notation path to the object containing metric values in the API response. For a
            response like <code className="font-mono bg-grey px-1 rounded">
              {'{"data": {"visitors": 100, "pageviews": 450}}'}
            </code>, use{" "}
            <code className="font-mono bg-grey px-1 rounded">data</code>.
          </p>
        </fieldset>

        {/* Catalog */}
        <fieldset className="border border-dark-faded rounded-md p-4">
          <legend className="font-mono text-xs uppercase tracking-wider text-dark px-2">Catalog</legend>
          <p className="text-xs text-dark opacity-60 mb-3">
            Comma-separated list of field names. These become available to Claude via{" "}
            <code className="font-mono bg-grey px-1 rounded">marketing_discover</code>.
          </p>
          <FormField label="Metrics">
            <input
              type="text"
              value={metricsText}
              onChange={(e) => setMetricsText(e.target.value)}
              placeholder="visitors, pageviews, bounce_rate"
              className="w-full border border-dark-faded rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-brand"
            />
          </FormField>
          <div className="mt-3">
            <FormField label="Dimensions">
              <input
                type="text"
                value={dimensionsText}
                onChange={(e) => setDimensionsText(e.target.value)}
                placeholder="page, source, device"
                className="w-full border border-dark-faded rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-brand"
              />
            </FormField>
          </div>
        </fieldset>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-5 py-2 font-mono text-xs uppercase tracking-wider text-dark opacity-60 hover:opacity-100"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!name.trim() || !baseUrl.trim() || !queryPath.trim()}
            className="btn-secondary px-6 py-2 text-sm disabled:opacity-40"
          >
            Create connector
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-xs uppercase tracking-wider text-dark block mb-1">{label}</span>
      {children}
    </label>
  );
}
