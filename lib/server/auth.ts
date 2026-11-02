import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Server-only. Session = "<base64url payload>.<HMAC>" in an httpOnly cookie.
const COOKIE = "rp_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET is missing or too short");
  return s;
}

function sign(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export async function startSession(therapistId: string) {
  const body = Buffer.from(JSON.stringify({ tid: therapistId, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  (await cookies()).set(COOKIE, `${body}.${sign(body)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** Signed-in therapist id, or null. */
export async function currentTherapist(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [body, mac] = raw.split(".");
  if (!body || !mac) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { tid, exp } = JSON.parse(Buffer.from(body, "base64url").toString()) as { tid: string; exp: number };
    return exp > Date.now() ? tid : null;
  } catch {
    return null;
  }
}

export function unauthorized() {
  return Response.json({ error: "Not signed in" }, { status: 401 });
}
