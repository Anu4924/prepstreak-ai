import { NextRequest, NextResponse } from "next/server";
import {
  AuthStore,
  verifyOtp,
  validatePasswordStrength,
} from "@/lib/auth/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, resetCode, newPassword, confirmPassword } = body;

    const trimmedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedCode = typeof resetCode === "string" ? resetCode.trim() : "";

    if (!trimmedEmail) {
      return NextResponse.json(
        { success: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    if (!trimmedCode || trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter the valid 6-digit reset code sent to your email.",
        },
        { status: 400 }
      );
    }

    // Validate new password rules
    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { success: false, error: passwordCheck.error },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match." },
        { status: 400 }
      );
    }

    // Retrieve reset record
    const resetRecord = AuthStore.getPasswordReset(trimmedEmail);
    if (!resetRecord) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No active password reset request found for this email. Please request a new code.",
        },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date(resetRecord.expiresAt).getTime() < Date.now()) {
      AuthStore.deletePasswordReset(trimmedEmail);
      return NextResponse.json(
        {
          success: false,
          error:
            "This reset code has expired. Please request a new password reset.",
        },
        { status: 400 }
      );
    }

    // Check attempt limits
    if (resetRecord.attempts >= 5) {
      AuthStore.deletePasswordReset(trimmedEmail);
      return NextResponse.json(
        {
          success: false,
          error:
            "Too many incorrect attempts. This reset code is no longer valid. Please request a new one.",
        },
        { status: 429 }
      );
    }

    // Verify reset code timing-safe
    const isValid = verifyOtp(
      trimmedCode,
      resetRecord.salt,
      resetRecord.resetCodeHash
    );

    if (!isValid) {
      const attempts = AuthStore.incrementPasswordResetAttempts(trimmedEmail);
      const remaining = Math.max(0, 5 - attempts);
      return NextResponse.json(
        {
          success: false,
          error: `Invalid reset code. Please try again. (${remaining} attempt${remaining === 1 ? "" : "s"} remaining)`,
        },
        { status: 400 }
      );
    }

    // Lookup user to update
    const user = AuthStore.findUserByEmail(trimmedEmail);
    if (!user) {
      AuthStore.deletePasswordReset(trimmedEmail);
      return NextResponse.json(
        { success: false, error: "User account not found." },
        { status: 404 }
      );
    }

    // Update password
    AuthStore.updateUserPassword(user.id, newPassword);

    // Invalidate reset code and active sessions to force re-login
    AuthStore.deletePasswordReset(trimmedEmail);
    AuthStore.clearUserSessions(user.id);

    return NextResponse.json({
      success: true,
      message:
        "Your password has been successfully reset. You can now log in with your new password.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to reset password. Please try again later.",
      },
      { status: 500 }
    );
  }
}
