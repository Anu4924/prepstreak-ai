import { NextRequest, NextResponse } from "next/server";
import { AuthStore, validatePasswordStrength } from "@/lib/auth/store";
import { verifySessionToken, PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(PREPSTREAK_SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid or expired session" }, { status: 401 });
    }

    const session = AuthStore.getSession(token);
    if (!session || session.userId !== payload.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { newPassword } = body;

    const pwdValidation = validatePasswordStrength(newPassword);
    if (!pwdValidation.valid) {
      return NextResponse.json(
        { success: false, error: pwdValidation.error || "Password does not meet security requirements." },
        { status: 400 }
      );
    }

    const updated = AuthStore.updateUserPassword(session.userId, newPassword);
    if (!updated) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("Password update error:", err);
    return NextResponse.json({ success: false, error: "Failed to update password." }, { status: 500 });
  }
}
