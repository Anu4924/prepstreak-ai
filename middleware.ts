import { type NextRequest, NextResponse } from "next/server";
import { verifySessionToken, PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";

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
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rawCookie = request.cookies.get(PREPSTREAK_SESSION_COOKIE)?.value;
  const token = rawCookie && rawCookie.trim() ? rawCookie.trim() : null;
  const session = token ? await verifySessionToken(token) : null;
  const isAuthenticated = Boolean(session);

  const isProtected =
    PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`)) ||
    pathname.includes("/learn") ||
    pathname.includes("/practice");

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If logged out and trying to access protected route -> redirect to /login
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

  // If logged in and trying to access /login or /register -> redirect to /dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();

  // For protected routes, prevent browser bfcache & disk caching
  if (isProtected) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
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
