import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

// One inbox for every public contact form. Persists to Convex (admin console
// reads it) and forwards to Formspark for the email notification. Same-origin,
// so the browser never talks to Convex/Formspark directly.

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
const FORMSPARK_ID = process.env.NEXT_PUBLIC_FORMSPARK_ID;

const CATEGORIES = ["bug", "feature", "enterprise", "pricing", "general"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length ? t.slice(0, 5000) : undefined;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  // Honeypot: a filled _gotcha means a bot. Pretend success, store nothing.
  if (str(body._gotcha)) return NextResponse.json({ ok: true });

  const email = str(body.email);
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Valid email required" }, { status: 400 });
  }

  const rawCategory = (str(body.category) || str(body.topic) || "general").toLowerCase();
  const category = CATEGORIES.includes(rawCategory) ? rawCategory : "general";

  const record = {
    category,
    name: str(body.name),
    email,
    company: str(body.company),
    role: str(body.role),
    message: str(body.message) || str(body.question) || str(body.notes),
    needs: str(body.needs) || str(body.neededFeatures),
    companySize: str(body.companySize),
    clientCount: str(body.clientCount),
    referral: str(body.referral),
    selectedPackage: str(body.selectedPackage),
    source: str(body.source) || "contact",
    pageUrl: str(body.pageUrl),
  };

  // 1) Persist to Convex (the actual inbox). If this fails we still 500 so the
  //    client can surface an error and the user can retry.
  if (CONVEX_URL) {
    try {
      const convex = new ConvexHttpClient(CONVEX_URL);
      await convex.mutation(api.contactMessages.submit, record);
    } catch (err) {
      console.error("[contact] convex store failed", err);
      return NextResponse.json({ ok: false, error: "Store failed" }, { status: 500 });
    }
  }

  // 2) Forward to Formspark for the email notification (best-effort — a failed
  //    email must not lose a message that's already in the inbox).
  if (FORMSPARK_ID) {
    try {
      await fetch(`https://submit-form.com/${FORMSPARK_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...record,
          subject: `[ARLO ${category}] ${record.name || "New message"}`,
        }),
      });
    } catch (err) {
      console.error("[contact] formspark forward failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
