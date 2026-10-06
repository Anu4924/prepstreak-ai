import { NextRequest, NextResponse } from "next/server";
import { AuthStore, verifyOtp } from "@/lib/auth/store";
import { signSessionToken, PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";
import { mapStoredProfileToUserProfile } from "@/lib/types/user";

// TODO: Email verification / OTP can be added later when a verified domain and email provider are configured.
// Registration currently creates accounts directly without requiring OTP.

const SESSION_EXPIRY_SECONDS = 30 * 24 * 60 * 60; // 30 days
const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    const trimmedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedOtp = typeof otp === "string" ? otp.trim() : "";

    if (!trimmedEmail) {
      return NextResponse.json(
        { success: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    if (!trimmedOtp || trimmedOtp.length !== 6 || !/^\d{6}$/.test(trimmedOtp)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid verification code. Please enter the 6-digit code sent to your email.",
        },
        { status: 400 }
      );
    }

    // 1. Retrieve pending registration
    const pending = AuthStore.getPendingRegistration(trimmedEmail);
    if (!pending) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No pending verification found for this email address. Please register again.",
        },
        { status: 400 }
      );
    }

    // 2. Check expiration (5-10 minutes)
    if (new Date(pending.expiresAt).getTime() < Date.now()) {
      AuthStore.deletePendingRegistration(trimmedEmail);
      return NextResponse.json(
        {
          success: false,
          error: "This verification code has expired. Please request a new code.",
          isExpired: true,
        },
        { status: 400 }
      );
    }

    // 3. Check attempt limit to prevent brute-forcing
    if (pending.attempts >= MAX_ATTEMPTS) {
      AuthStore.deletePendingRegistration(trimmedEmail);
      return NextResponse.json(
        {
          success: false,
          error:
            "Too many incorrect attempts. This verification code has been invalidated. Please register or request a new code.",
          isLocked: true,
        },
        { status: 429 }
      );
    }

    // 4. Cryptographic timing-safe verification
    const isValid = verifyOtp(trimmedOtp, pending.otpSalt, pending.otpHash);
    if (!isValid) {
      const attempts = AuthStore.incrementPendingAttempts(trimmedEmail);
      const remainingAttempts = Math.max(0, MAX_ATTEMPTS - attempts);
      return NextResponse.json(
        {
          success: false,
          error: `Invalid verification code. Please try again. (${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining)`,
        },
        { status: 400 }
      );
    }

    // 5. Single-use: Invalidate and remove pending record immediately
    AuthStore.deletePendingRegistration(trimmedEmail);

    // 6. Create verified account strictly from zero
    const { user, profile } = AuthStore.createUser(
      pending.fullName,
      pending.email,
      pending.passwordHash,
      pending.targetExamId || "",
      true // pre-hashed
    );

    // 7. Create signed persistent session token
    const exp = Math.floor(Date.now() / 1000) + SESSION_EXPIRY_SECONDS;
    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      exp,
    });

    AuthStore.createSession(token, user.id, SESSION_EXPIRY_SECONDS);

    const userProfile = mapStoredProfileToUserProfile(profile);

    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully.",
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        targetExamId: user.targetExamId,
        createdAt: new Date(user.createdAt),
        user_metadata: {
          full_name: user.fullName,
          selected_exam: user.targetExamId,
          avatar_url: profile.avatarUrl,
        },
      },
      profile: userProfile,
    });

    // 8. Set HTTP-only, secure session cookie
    response.cookies.set({
      name: PREPSTREAK_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: SESSION_EXPIRY_SECONDS,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err: unknown) {
    console.error("Verify OTP error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Verification failed due to a server error. Please try again.",
      },
      { status: 500 }
    );
  }
}
