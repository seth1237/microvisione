import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "mv_admin";
const MEDTRACK_COOKIE = "mt_session";

const LIVE_PREFIXES = [
  "/products",
  "/product",
  "/offers",
  "/events",
  "/quote",
  "/category",
  "/legal",
  "/about",
  "/cart",
  "/careers",
  "/contact",
  "/services",
  "/wishlist",
  "/account",
  "/checkout",
  "/brands",
  "/gallery",
  "/compare",
  "/admin",
  "/api",
  "/installations",
  "/medtrack",
  "/q",
];

function isLive(pathname: string) {
  if (pathname === "/") return true;
  return LIVE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const headers = new Headers(request.headers);
  headers.set("x-mv-path", pathname);

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!request.cookies.get(ADMIN_COOKIE)?.value) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname.startsWith("/api/admin") && !request.cookies.get(ADMIN_COOKIE)?.value) {
    return NextResponse.json({ success: false, message: "Sign in required" }, { status: 401 });
  }

  const medtrackProtected =
    pathname.startsWith("/medtrack") &&
    pathname !== "/medtrack/login" &&
    !pathname.startsWith("/medtrack/login/");
  if (medtrackProtected && !request.cookies.get(MEDTRACK_COOKIE)?.value) {
    return NextResponse.redirect(new URL("/medtrack/login", request.url));
  }

  if (!isLive(pathname) && !pathname.startsWith("/_next") && !pathname.includes(".")) {
    try {
      const lookup = new URL("/api/redirects/lookup", request.url);
      lookup.searchParams.set("from", pathname);
      const response = await fetch(lookup, { cache: "no-store", signal: AbortSignal.timeout(800) });
      if (response.ok) {
        const payload = (await response.json()) as { to?: string; status?: number };
        if (payload.to) {
          const destination = payload.to.startsWith("http") ? payload.to : new URL(payload.to, request.url);
          return NextResponse.redirect(destination, payload.status === 302 ? 302 : 301);
        }
      }
    } catch {
      // Keep the original path when the lookup cannot run.
    }
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
