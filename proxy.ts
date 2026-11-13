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

function manufacturerDeleteId(pathname: string, method: string) {
  if (method !== "DELETE") return "";
  const prefix = "/api/admin/manufacturers/";
  if (!pathname.startsWith(prefix)) return "";
  const id = pathname.slice(prefix.length);
  if (!id || id.includes("/")) return "";
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}

function manufacturerDeleteUrl(request: NextRequest, id: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/api/admin/manufacturers";
  url.searchParams.set("id", id);
  return url;
}

function isLive(pathname: string) {
  if (pathname === "/") return true;
  return LIVE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function allowedSiteOrigin(origin: string) {
  if (!origin) return "";
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== "https:" && protocol !== "http:") return "";
    if (hostname === "localhost" || hostname === "127.0.0.1") return origin;
    if (hostname === "microvisione.com" || hostname === "www.microvisione.com") return origin;
    if (hostname === "microvision.codewithseth.co.ke") return origin;
    if (hostname === "microvisione-one.vercel.app" || hostname === "microvisione-nae5.vercel.app") return origin;
  } catch {
    return "";
  }
  return "";
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, HEAD, PUT, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Cookie, Authorization, Accept, X-Requested-With, x-import-key",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
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

  const siteOrigin = allowedSiteOrigin(request.headers.get("origin") || "");
  if (pathname.startsWith("/api") && request.method === "OPTIONS" && siteOrigin) {
    return new NextResponse(null, { status: 204, headers: corsHeaders(siteOrigin) });
  }

  if (pathname.startsWith("/api/admin") && !request.cookies.get(ADMIN_COOKIE)?.value) {
    const denied = NextResponse.json({ success: false, message: "Sign in required" }, { status: 401 });
    if (siteOrigin) {
      for (const [key, value] of Object.entries(corsHeaders(siteOrigin))) denied.headers.set(key, value);
    }
    return denied;
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

  const manufacturerId = manufacturerDeleteId(pathname, request.method);
  const response = manufacturerId
    ? NextResponse.rewrite(manufacturerDeleteUrl(request, manufacturerId), { request: { headers } })
    : NextResponse.next({ request: { headers } });
  if (pathname.startsWith("/api") && siteOrigin) {
    for (const [key, value] of Object.entries(corsHeaders(siteOrigin))) response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
