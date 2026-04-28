import { NextResponse } from "next/server";
import { COOKIE_NAME, COOKIE_OPTIONS, checkPassword, makeToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { password?: string };
  const password = body.password ?? "";
  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }
  const token = await makeToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
  return res;
}
