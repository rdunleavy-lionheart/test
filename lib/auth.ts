// Web-Crypto-based auth so the same module works in middleware (Edge) and in
// route handlers (Node).
export const COOKIE_NAME = "lionheart_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const TOKEN_PURPOSE = "lionheart-auth-v1";

function password(): string {
  return process.env.DASHBOARD_PASSWORD ?? "";
}

const enc = new TextEncoder();

function bytesToHex(buf: ArrayBuffer): string {
  const arr = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < arr.length; i++) s += arr[i].toString(16).padStart(2, "0");
  return s;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function makeToken(): Promise<string> {
  const pw = password();
  if (!pw) return "";
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(pw),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(TOKEN_PURPOSE));
  return bytesToHex(sig);
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await makeToken();
  if (!expected) return false;
  return timingSafeEqual(token, expected);
}

export function checkPassword(input: string): boolean {
  const pw = password();
  if (!pw) return false;
  return timingSafeEqual(input, pw);
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: COOKIE_MAX_AGE,
};
