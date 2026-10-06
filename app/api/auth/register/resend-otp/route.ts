import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { AuthStore, hashOtp } from "@/lib/auth/store";
import { EmailService } from "@/lib/email/email-service";

// TODO: Email verification / OTP can be added later when a verified domain and email provider are configured.
// Registration currently creates accounts directly without requiring OTP.

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    const trimmedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!trimmedEmail) {
      return NextResponse.json(
        { success: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    const pending = AuthStore.getPendingRegistration(trimmedEmail);
    if (!pending) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No pending registration found for this email address. Please start registration again.",
        },
        { status: 400 }
      );
    }

    // Check resend cooldown
    const cooldownRemaining =
      new Date(pending.resendCooldownUntil).getTime() - Date.now();
    if (cooldownRemaining > 0) {
      const waitSeconds = Math.ceil(cooldownRemaining / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${waitSeconds} second${waitSeconds === 1 ? "" : "s"} before requesting a new code.`,
          cooldownRemainingSeconds: waitSeconds,
        },
        { status: 429 }
      );
    }

    // Generate fresh OTP
    const newOtp = crypto.randomInt(100000, 1000000).toString();
    const newOtpSalt = crypto.randomBytes(16).toString("hex");
    const newOtpHash = hashOtp(newOtp, newOtpSalt);

    const now = Date.now();
    pending.otpHash = newOtpHash;
    pending.otpSalt = newOtpSalt;
    pending.expiresAt = new Date(now + OTP_EXPIRY_MS).toISOString();
    pending.attempts = 0; // reset attempts for the new code
    pending.resendCooldownUntil = new Date(now + RESEND_COOLDOWN_MS).toISOString();

    AuthStore.savePendingRegistration(pending);

    // Send real email via configured provider
    const emailResult = await EmailService.sendOtpEmail({
      to: trimmedEmail,
      fullName: pending.fullName,
      otp: newOtp,
    });

    if (!emailResult.success) {
      console.error(
        `[Resend OTP Error] Failed to deliver fresh OTP to ${trimmedEmail}:`,
        emailResult.error
      );
      return NextResponse.json(
        {
          success: false,
          error:
            emailResult.error ||
            "Failed to deliver verification code. Please check email provider configuration.",
          isConfigurationError: emailResult.isConfigurationError,
        },
        { status: emailResult.isConfigurationError ? 503 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A new verification code has been dispatched to ${trimmedEmail}.`,
      resendCooldownSeconds: 60,
    });
  } catch (err: unknown) {
    console.error("Resend OTP error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to resend verification code. Please try again.",
      },
      { status: 500 }
    );
  }
}
