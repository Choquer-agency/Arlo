/**
 * Server-side credential encryption for the wizard. The raw webhook URL / API key
 * must never land in Convex plaintext — the wizard POSTs the credentials here,
 * the server encrypts with CREDENTIALS_ENCRYPTION_KEY (same key used by
 * platformConnections), and returns {ciphertext, iv} for the mutation to store.
 *
 * Why a separate route: the encryption key is a server-only secret. We can't put
 * it in the browser bundle.
 */
import { NextResponse } from "next/server";
import { encryptCredentials } from "@/lib/crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { plaintext?: unknown };
  try {
    body = (await req.json()) as { plaintext?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (body.plaintext === undefined || body.plaintext === null) {
    return NextResponse.json({ error: "plaintext required" }, { status: 400 });
  }
  const str = typeof body.plaintext === "string" ? body.plaintext : JSON.stringify(body.plaintext);
  try {
    const { ciphertext, iv } = encryptCredentials(str);
    return NextResponse.json({ ciphertext, iv });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Encryption failed" },
      { status: 500 }
    );
  }
}
