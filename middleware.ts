import { type NextRequest, NextResponse } from "next/server";
import { verifySessionToken, PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/progress",
  "/learn",
  "/practice",
  "/tests",
  "/streak",
  "/daily-challenge",
  "/settings",
];

// Routes for unauthenticated users only
const AUTH_ROUTES = ["/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Refresh Supabase cookies and check Supabase auth
  const { supabaseResponse, user: sbUser } = await updateSession(request);

  // 2. Check PrepStreak custom signed session token
  const rawCookie = request.cookies.get(PREPSTREAK_SESSION_COOKIE)?.value;
  const token = rawCookie && rawCookie.trim() ? rawCookie.trim() : null;
  const session = token ? await verifySessionToken(token) : null;

  const isAuthenticated = Boolean(sbUser) || Boolean(session);

  const isProtected =
    PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`)) ||
    pathname.includes("/learn") ||
    pathname.includes("/practice");

  // 3. If logged out and trying to access protected route -> redirect to /login
  if (!isAuthenticated && isProtected) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    const redirectResponse = NextResponse.redirect(redirectUrl);

    // Ensure stale cookie is purged
    redirectResponse.cookies.delete(PREPSTREAK_SESSION_COOKIE);

    // Prevent caching of protected redirects
    redirectResponse.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    redirectResponse.headers.set("Pragma", "no-cache");
    redirectResponse.headers.set("Expires", "0");

    return redirectResponse;
  }

  // 4. If logged in and trying to access /register -> redirect to /dashboard
  // Allow accessing /login so users can view credentials form, see active user, or switch accounts
  if (isAuthenticated && pathname === "/register") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // For protected routes, prevent browser bfcache & disk caching
  if (isProtected) {
    supabaseResponse.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    supabaseResponse.headers.set("Pragma", "no-cache");
    supabaseResponse.headers.set("Expires", "0");
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (api routes are handled directly)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons, fonts, svg, png, jpg, jpeg, etc.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)",
  ],
};
