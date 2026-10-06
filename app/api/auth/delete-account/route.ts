import { NextRequest, NextResponse } from "next/server";
import { AuthStore, verifyPassword } from "@/lib/auth/store";
import { verifySessionToken, PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(PREPSTREAK_SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
    }

    const session = AuthStore.getSession(token);
    if (!session || session.userId !== payload.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = AuthStore.findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter your account password to confirm account deletion.",
        },
        { status: 400 }
      );
    }

    // Verify password for authentication confirmation
    const isPasswordValid = verifyPassword(password, user.salt, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Incorrect password. Account deletion aborted.",
        },
        { status: 401 }
      );
    }

    // Permanently remove all records associated with this authenticated user
    AuthStore.deleteUser(session.userId);

    const response = NextResponse.json({
      success: true,
      message: "Your account and all associated personal data have been permanently deleted.",
    });

    // Clear session cookie
    response.cookies.delete(PREPSTREAK_SESSION_COOKIE);

    return response;
  } catch (err) {
    console.error("Delete account error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete account. Please try again." },
      { status: 500 }
    );
  }
}
