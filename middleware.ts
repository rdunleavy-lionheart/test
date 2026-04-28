import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken } from "./lib/auth";

const PUBLIC_PATHS = ["/", "/api/login", "/_next", "/favicon.ico"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (await verifyToken(token)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
