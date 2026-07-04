#!/usr/bin/env node
/**
 * SEO report emailer — runs in GitHub Actions (which has outbound internet;
 * the Claude cloud-routine sandbox does NOT, so the routine only WRITES a
 * report file to reports/outbox/ and commits it; this Action sends it).
 *
 * Reads reports/outbox/*.json  ({ "subject", "html", "to"? }),
 * sends each via Resend, then moves it to reports/sent/ so it isn't re-sent.
 *
 * Env (GitHub Actions repository secrets):
 *   RESEND_API_KEY   — Resend API key
 *   REPORTS_FROM     — e.g. "ARLO SEO <reports@askarlo.app>" (domain verified in Resend)
 *   REPORTS_TO       — default recipient, e.g. "bryce@choquer.agency"
 */
import { readdir, readFile, rename, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resend } from "resend";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTBOX = join(ROOT, "reports", "outbox");
const SENT = join(ROOT, "reports", "sent");

const { RESEND_API_KEY, REPORTS_FROM, REPORTS_TO } = process.env;

function requireEnv() {
  const missing = ["RESEND_API_KEY", "REPORTS_FROM", "REPORTS_TO"].filter(
    (k) => !process.env[k]
  );
  if (missing.length) {
    console.error(`Missing required env: ${missing.join(", ")}`);
    process.exit(1);
  }
}

async function main() {
  requireEnv();
  await mkdir(SENT, { recursive: true });

  let files;
  try {
    files = (await readdir(OUTBOX)).filter((f) => f.endsWith(".json"));
  } catch {
    console.log("No outbox directory — nothing to send.");
    return;
  }
  if (files.length === 0) {
    console.log("Outbox empty — nothing to send.");
    return;
  }

  const resend = new Resend(RESEND_API_KEY);
  let sent = 0;
  let failed = 0;

  for (const file of files.sort()) {
    const path = join(OUTBOX, file);
    let report;
    try {
      report = JSON.parse(await readFile(path, "utf8"));
    } catch (e) {
      console.error(`SKIP ${file}: invalid JSON — ${e.message}`);
      failed++;
      continue;
    }
    if (!report.subject || !report.html) {
      console.error(`SKIP ${file}: missing "subject" or "html"`);
      failed++;
      continue;
    }
    try {
      const { error } = await resend.emails.send({
        from: REPORTS_FROM,
        to: report.to || REPORTS_TO,
        subject: report.subject,
        html: report.html,
      });
      if (error) throw new Error(JSON.stringify(error));
      await rename(path, join(SENT, file));
      console.log(`SENT ${file} → ${report.to || REPORTS_TO}`);
      sent++;
    } catch (e) {
      console.error(`FAIL ${file}: ${e.message}`);
      failed++;
    }
  }

  console.log(`Done. sent=${sent} failed=${failed}`);
  if (failed > 0 && sent === 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
