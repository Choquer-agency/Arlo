import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  workspaces: defineTable({
    name: v.string(),
    slug: v.string(),
    // "solo" = single-business owner flow (one client, simplified UI).
    // "agency" = multi-client flow (the original ARLO experience).
    workspaceType: v.string(),
    plan: v.string(),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    trialEndsAt: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_stripeCustomer", ["stripeCustomerId"]),

  members: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: v.string(),
    // NDA scoping: null = all clients (default for owners/admins). Array = restricted
    // to these client ids only. Checked by requireClientAccess() on every destination
    // create/sync/list so partial-access members can't see siblings' clients.
    clientScope: v.optional(v.array(v.id("clients"))),
    invitedById: v.optional(v.id("users")),
    acceptedAt: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_workspace_user", ["workspaceId", "userId"]),

  clients: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    slug: v.string(),
    websiteUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    archivedAt: v.optional(v.string()),
    createdAt: v.string(),

    ga4PropertyId: v.optional(v.string()),
    gscSiteUrl: v.optional(v.string()),
    googleAdsCustomerId: v.optional(v.string()),
    googleAdsLoginCustomerId: v.optional(v.string()),
    youtubeChannelId: v.optional(v.string()),
    gbpLocationName: v.optional(v.string()),

    metaAdAccountId: v.optional(v.string()),
    metaPageId: v.optional(v.string()),
    linkedinAdAccountUrn: v.optional(v.string()),
    tiktokAdvertiserId: v.optional(v.string()),

    shopifyStoreDomain: v.optional(v.string()),
    stripeAccountId: v.optional(v.string()),
    hubspotPortalId: v.optional(v.string()),
    mailerliteAccountId: v.optional(v.string()),
    mailchimpAccountId: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_slug", ["workspaceId", "slug"])
    .index("by_workspace_archived", ["workspaceId", "archivedAt"]),

  platformConnections: defineTable({
    workspaceId: v.id("workspaces"),
    provider: v.string(),
    accountEmail: v.optional(v.string()),
    accountId: v.optional(v.string()),
    encryptedTokens: v.string(),
    tokensIv: v.string(),
    scopes: v.string(),
    tokenExpiresAt: v.optional(v.number()),
    availableAccounts: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          kind: v.string(),
        })
      )
    ),
    status: v.string(),
    lastVerifiedAt: v.optional(v.string()),
    lastError: v.optional(v.string()),
    addedByUserId: v.optional(v.id("users")),
    createdAt: v.string(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_provider", ["workspaceId", "provider"])
    .index("by_workspace_status", ["workspaceId", "status"]),

  mcpTokens: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    tokenHash: v.string(),
    encryptedToken: v.string(),
    tokenIv: v.string(),
    label: v.optional(v.string()),
    createdAt: v.string(),
    lastUsedAt: v.optional(v.string()),
    revokedAt: v.optional(v.string()),
  })
    .index("by_hash", ["tokenHash"])
    .index("by_workspace_user", ["workspaceId", "userId"])
    .index("by_user", ["userId"]),

  mcpAuditLog: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.optional(v.id("users")),
    tokenId: v.optional(v.id("mcpTokens")),
    tool: v.string(),
    args: v.any(),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
    durationMs: v.number(),
    clientId: v.optional(v.id("clients")),
    createdAt: v.string(),
  })
    .index("by_workspace_created", ["workspaceId", "createdAt"])
    .index("by_workspace_tool", ["workspaceId", "tool"])
    .index("by_workspace_user", ["workspaceId", "userId"])
    .index("by_client", ["clientId"]),

  usageCounters: defineTable({
    workspaceId: v.id("workspaces"),
    period: v.string(),
    toolCalls: v.number(),
    insightsCalls: v.number(),
    tokensIn: v.number(),
    tokensOut: v.number(),
    updatedAt: v.string(),
  })
    .index("by_workspace_period", ["workspaceId", "period"]),

  invites: defineTable({
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: v.string(),
    invitedByUserId: v.id("users"),
    tokenHash: v.string(),
    createdAt: v.string(),
    acceptedAt: v.optional(v.string()),
    revokedAt: v.optional(v.string()),
    expiresAt: v.string(),
  })
    .index("by_hash", ["tokenHash"])
    .index("by_workspace", ["workspaceId"])
    .index("by_email", ["email"]),

  /**
   * Custom REST connectors — agencies configure their own platform without us writing
   * per-platform code. Unlocks Plausible, Matomo, internal APIs, niche SaaS, etc.
   */
  customConnectors: defineTable({
    workspaceId: v.id("workspaces"),
    // null = workspace-wide (same config every client). Set when the config's auth /
    // URL varies per client (e.g. one Plausible site per client).
    clientId: v.optional(v.id("clients")),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    color: v.string(),

    // Auth — one of: "bearer" | "api_key_header" | "api_key_query" | "basic" | "none"
    authType: v.string(),
    authHeaderName: v.optional(v.string()),
    authQueryParam: v.optional(v.string()),
    encryptedCredentials: v.string(),
    credentialsIv: v.string(),

    // Request template. Supports {{variables}}: dateRange.start, dateRange.end,
    // metrics (comma-joined), dimensions, limit, client.<field>.
    baseUrl: v.string(),
    queryMethod: v.string(),
    queryPath: v.string(),
    queryParams: v.any(),
    queryBody: v.optional(v.any()),
    extraHeaders: v.optional(v.any()),

    // Response parsing
    totalsPath: v.string(),
    breakdownPath: v.optional(v.string()),
    metricsMap: v.optional(v.any()),

    // Catalog exposed to Claude via marketing_discover
    metrics: v.array(
      v.object({ name: v.string(), description: v.string() })
    ),
    dimensions: v.array(
      v.object({ name: v.string(), description: v.string() })
    ),

    status: v.string(), // "active" | "paused" | "error"
    createdByUserId: v.id("users"),
    createdAt: v.string(),
    lastTestedAt: v.optional(v.string()),
    lastTestError: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_client", ["workspaceId", "clientId"])
    .index("by_workspace_slug", ["workspaceId", "slug"]),

  /**
   * Destinations — outbound targets ARLO writes to (Slack digests, Google Sheets,
   * BigQuery, Looker Studio, etc). Counterpart to platformConnections (inbound).
   * clientId locks scope: a destination tied to client X can NEVER emit client Y's
   * data (enforced downstream by fetchDataset which takes a locked clientId).
   */
  destinations: defineTable({
    workspaceId: v.id("workspaces"),
    clientId: v.optional(v.id("clients")), // null = workspace-wide; set = client-locked
    kind: v.string(),      // "slack_digest" | "google_sheets" | "bigquery" | ...
    mode: v.string(),      // "live" | "push" | "digest"
    name: v.string(),
    status: v.string(),    // "active" | "paused" | "error" | "draft"

    // Auth — mirrors platformConnections pattern via src/lib/crypto.ts
    authType: v.string(),  // "oauth2" | "service_account" | "webhook_url" | "internal"
    encryptedCredentials: v.string(),
    credentialsIv: v.string(),
    tokenExpiresAt: v.optional(v.number()),

    // Destination-specific config (Slack channel name, Sheet id, BQ dataset.table, …)
    config: v.any(),

    // Live-connector surface — bearer the external BI tool presents to /api/destinations/live
    liveTokenHash: v.optional(v.string()),

    createdByUserId: v.optional(v.id("users")),
    createdAt: v.string(),
    lastRunAt: v.optional(v.string()),
    lastError: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_client", ["workspaceId", "clientId"])
    .index("by_live_token_hash", ["liveTokenHash"]),

  /**
   * destinationSyncs — "what to write" for push/digest destinations. Each row is a
   * schedule + a dataset spec. clientId is denormalized so the cron scheduler never
   * joins to destinations at tick time.
   */
  destinationSyncs: defineTable({
    destinationId: v.id("destinations"),
    workspaceId: v.id("workspaces"),
    clientId: v.optional(v.id("clients")),

    datasetKey: v.string(),      // "ga4.sessions_daily" | "platform:google_ads"
    params: v.any(),             // { metrics, dimensions, dateRange }
    targetRef: v.optional(v.string()), // sheet tab, BQ table, Slack channel override

    schedule: v.string(),        // human ("daily_8am"), cron, or "manual"
    enabled: v.boolean(),
    lastRunAt: v.optional(v.number()),
    nextRunAt: v.optional(v.number()),

    createdAt: v.string(),
  })
    .index("by_destination", ["destinationId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_due", ["workspaceId", "enabled", "nextRunAt"])
    .index("by_due", ["enabled", "nextRunAt"]),

  /**
   * destinationRuns — audit trail (parallels mcpAuditLog). One row per run attempt.
   */
  destinationRuns: defineTable({
    destinationId: v.id("destinations"),
    syncId: v.optional(v.id("destinationSyncs")),
    workspaceId: v.id("workspaces"),
    clientId: v.optional(v.id("clients")),

    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    status: v.string(),          // "running" | "success" | "error"
    rowsWritten: v.optional(v.number()),
    bytesWritten: v.optional(v.number()),
    errorMessage: v.optional(v.string()),

    createdAt: v.string(),
  })
    .index("by_destination_started", ["destinationId", "startedAt"])
    .index("by_workspace_started", ["workspaceId", "startedAt"]),
});
