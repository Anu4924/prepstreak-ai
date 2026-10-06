import { NextRequest, NextResponse } from "next/server";
import { AuthStore } from "@/lib/auth/store";
import { PREPSTREAK_SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(PREPSTREAK_SESSION_COOKIE)?.value;

    if (token) {
      AuthStore.deleteSession(token);
      // Optional: verify token to ensure any corresponding session records are wiped
      const payload = await verifySessionToken(token).catch(() => null);
      if (payload?.userId) {
        AuthStore.deleteSession(token);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });

    // Invalidate cookie with immediate expiry across all browsers & protocols
    response.cookies.set({
      name: PREPSTREAK_SESSION_COOKIE,
      value: "",
      httpOnly: true,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    response.cookies.delete(PREPSTREAK_SESSION_COOKIE);

    // Prevent caching of logout response
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (err) {
    console.error("Logout API error:", err);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
