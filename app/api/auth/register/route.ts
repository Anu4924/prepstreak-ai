import { NextRequest, NextResponse } from "next/server";
import {
  AuthStore,
  validatePasswordStrength,
} from "@/lib/auth/store";
import { signSessionToken, PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";
import { mapStoredProfileToUserProfile } from "@/lib/types/user";

// TODO: Email verification / OTP can be added later when a verified domain
// and email delivery provider (e.g. Resend, SendGrid, SMTP) are configured.
// For now, registration creates the account directly and logs the user in immediately.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_EXPIRY_SECONDS = 30 * 24 * 60 * 60; // 30 days

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, password, confirmPassword, targetExamId } = body;

    const trimmedName = typeof fullName === "string" ? fullName.trim() : "";
    const trimmedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    // 1. Validate required fields
    if (!trimmedName) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (trimmedName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Full name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    if (!trimmedEmail) {
      return NextResponse.json(
        { success: false, error: "Please enter your email address." },
        { status: 400 }
      );
    }

    // 2. Validate email format
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid email address (e.g., student@example.com).",
        },
        { status: 400 }
      );
    }

    // 3. Validate password strength
    if (!password) {
      return NextResponse.json(
        { success: false, error: "Please enter a password." },
        { status: 400 }
      );
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error },
        { status: 400 }
      );
    }

    // 4. Validate password and confirm password match
    if (!confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Please confirm your password." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match." },
        { status: 400 }
      );
    }

    // 5. Validate email uniqueness
    const existingUser = AuthStore.findUserByEmail(trimmedEmail);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email address already exists. Please log in.",
        },
        { status: 409 }
      );
    }

    // 6. Create account immediately (no OTP / email verification required)
    // Server-side password hashing with bcrypt ensures plain-text passwords are never stored.
    // Telemetry starts strictly at ZERO (0 questions, 0 accuracy, 0 streak, 0 study time, 0 tests).
    const { user, profile } = AuthStore.createUser(
      trimmedName,
      trimmedEmail,
      password,
      targetExamId || ""
    );

    // 7. Create secure session token and log the user in
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
      message: "Account created successfully.",
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

    // 8. Set secure HTTP-only session cookie
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
    console.error("Register error:", err);
    const msg =
      err instanceof Error
        ? err.message
        : "Unable to process registration at this time. Please try again.";
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 500 }
    );
  }
}
