import { createHmac, randomBytes, timingSafeEqual } from "crypto";

interface StatePayload {
  workspaceId: string;
  userId: string;
  provider: string;
  nonce: string;
  iat: number;
}

function sign(data: string): string {
  const secret = process.env.OAUTH_STATE_SECRET;
  if (!secret) throw new Error("OAUTH_STATE_SECRET is not set");
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function signState(p: Omit<StatePayload, "nonce" | "iat">): string {
  const payload: StatePayload = {
    ...p,
    nonce: randomBytes(16).toString("hex"),
    iat: Date.now(),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyState(token: string, maxAgeMs = 10 * 60 * 1000): StatePayload {
  const [body, sig] = token.split(".");
  if (!body || !sig) throw new Error("invalid state");
  const expected = sign(body);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error("state signature mismatch");
  }
  const payload: StatePayload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (Date.now() - payload.iat > maxAgeMs) throw new Error("state expired");
  return payload;
}
