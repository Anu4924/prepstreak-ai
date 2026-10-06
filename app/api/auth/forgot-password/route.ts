import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { AuthStore, hashOtp } from "@/lib/auth/store";
import { EmailService } from "@/lib/email/email-service";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Lookup user in store
    const user = AuthStore.findUserByEmail(email);

    // If user does not exist, return generic success to prevent account enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account with this email exists, password reset instructions have been dispatched.",
      });
    }

    // Generate 6-digit reset code
    const resetCode = crypto.randomInt(100000, 1000000).toString();
    const salt = crypto.randomBytes(16).toString("hex");
    const resetCodeHash = hashOtp(resetCode, salt);

    const now = Date.now();
    const expiresAt = new Date(now + RESET_EXPIRY_MS).toISOString();

    AuthStore.savePasswordReset({
      email,
      resetCodeHash,
      salt,
      expiresAt,
      attempts: 0,
      createdAt: new Date(now).toISOString(),
    });

    // Send real email via configured provider
    const emailResult = await EmailService.sendPasswordResetEmail({
      to: email,
      fullName: user.fullName,
      resetCode,
    });

    if (!emailResult.success) {
      AuthStore.deletePasswordReset(email);
      console.error(
        `[Forgot Password Error] Failed to deliver reset code to ${email}:`,
        emailResult.error
      );
      return NextResponse.json(
        {
          success: false,
          error:
            emailResult.error ||
            "Failed to deliver password reset email. Please verify email provider settings.",
          isConfigurationError: emailResult.isConfigurationError,
        },
        { status: emailResult.isConfigurationError ? 503 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account with this email exists, password reset instructions have been dispatched.",
    });
  } catch (err) {
    console.error("Forgot password route error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to process password reset request at this time.",
      },
      { status: 500 }
    );
  }
}
