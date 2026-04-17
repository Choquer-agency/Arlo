/**
 * Destination sync cron — runs every minute (vercel.json). Reads due syncs from
 * Convex, dispatches each to its adapter, writes a destinationRuns row.
 *
 * Auth: Vercel cron jobs hit this endpoint with `x-vercel-cron: 1` — we also
 * accept `Authorization: Bearer CRON_SECRET` for manual / local triggering.
 */
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { decryptCredentials } from "@/lib/crypto";
import { getAdapter, hasAdapter } from "@/lib/destinations/registry";
import type { DestinationContext } from "@/lib/destinations/adapter";
import { getServiceSecret } from "@/lib/serviceSecret";

export const runtime = "nodejs";
export const maxDuration = 60;

const BATCH = 25;

// Minimal cadence parser. Expand as schedule presets grow.
function computeNextRunAt(schedule: string, now: number): number {
  switch (schedule) {
    case "every_15_min":
      return now + 15 * 60 * 1000;
    case "hourly":
      return now + 60 * 60 * 1000;
    case "daily":
    case "daily_8am":
      return now + 24 * 60 * 60 * 1000;
    case "weekly":
      return now + 7 * 24 * 60 * 60 * 1000;
    case "manual":
      // Manual runs don't reschedule; disable after one-shot.
      return now + 365 * 24 * 60 * 60 * 1000;
    default:
      // Unknown schedule — back off 1 hour so a misconfigured sync can't hot-loop.
      return now + 60 * 60 * 1000;
  }
}

function isAuthorized(req: Request): boolean {
  if (req.headers.get("x-vercel-cron") === "1") return true;
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // Prevent accidental unauth in envs without the secret.
  return auth === `Bearer ${secret}`;
}

async function runOne(sync: Doc<"destinationSyncs">): Promise<{
  ok: boolean;
  error?: string;
  rowsWritten?: number;
  bytesWritten?: number;
}> {
  const dest = await fetchQuery(api.destinations.internalGet, {
    _serviceSecret: getServiceSecret(),
    destinationId: sync.destinationId,
  });
  if (!dest) return { ok: false, error: "Destination missing" };
  if (dest.status !== "active") return { ok: false, error: `Destination ${dest.status}` };
  if (!hasAdapter(dest.kind)) return { ok: false, error: `No adapter for ${dest.kind}` };

  const adapter = getAdapter(dest.kind);
  const credentialsPlain = decryptCredentials(dest.encryptedCredentials, dest.credentialsIv);
  const credentials = JSON.parse(credentialsPlain);

  const ctx: DestinationContext = {
    workspaceId: dest.workspaceId,
    clientId: sync.clientId as Id<"clients"> | undefined,
    destinationId: dest._id,
    syncId: sync._id,
    credentials,
    config: dest.config,
    params: sync.params,
    targetRef: sync.targetRef,
  };

  if (!adapter.runSync) {
    return { ok: false, error: `Adapter ${dest.kind} does not support scheduled sync` };
  }
  const result = await adapter.runSync(ctx);
  return { ok: true, rowsWritten: result.rowsWritten, bytesWritten: result.bytesWritten };
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const due = await fetchQuery(api.destinationSyncs.listDue, {
    _serviceSecret: getServiceSecret(),
    limit: BATCH,
  });
  const ran: Array<{ syncId: string; ok: boolean; error?: string }> = [];

  for (const sync of due) {
    const startedAt = Date.now();
    const runId = await fetchMutation(api.destinationRuns.recordStart, {
      _serviceSecret: getServiceSecret(),
      destinationId: sync.destinationId,
      syncId: sync._id,
      workspaceId: sync.workspaceId,
      clientId: sync.clientId,
      startedAt,
    });

    let ok = false;
    let error: string | undefined;
    let rowsWritten: number | undefined;
    let bytesWritten: number | undefined;
    try {
      const out = await runOne(sync);
      ok = out.ok;
      error = out.error;
      rowsWritten = out.rowsWritten;
      bytesWritten = out.bytesWritten;
    } catch (err) {
      ok = false;
      error = err instanceof Error ? err.message : String(err);
    }

    const finishedAt = Date.now();
    await fetchMutation(api.destinationRuns.recordFinish, {
      _serviceSecret: getServiceSecret(),
      runId,
      status: ok ? "success" : "error",
      finishedAt,
      durationMs: finishedAt - startedAt,
      rowsWritten,
      bytesWritten,
      errorMessage: error,
    });

    const nextRunAt = computeNextRunAt(sync.schedule, finishedAt);
    await fetchMutation(api.destinationSyncs.advance, {
      _serviceSecret: getServiceSecret(),
      syncId: sync._id,
      lastRunAt: finishedAt,
      nextRunAt,
    });

    if (!ok) {
      await fetchMutation(api.destinations.internalMarkRun, {
        _serviceSecret: getServiceSecret(),
        destinationId: sync.destinationId,
        status: "error",
        lastRunAt: new Date(finishedAt).toISOString(),
        lastError: error,
      });
    } else {
      await fetchMutation(api.destinations.internalMarkRun, {
        _serviceSecret: getServiceSecret(),
        destinationId: sync.destinationId,
        status: "active",
        lastRunAt: new Date(finishedAt).toISOString(),
        lastError: undefined,
      });
    }

    ran.push({ syncId: sync._id, ok, error });
  }

  return new Response(
    JSON.stringify({ ran: ran.length, results: ran }, null, 2),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function POST(req: Request) {
  return GET(req);
}
