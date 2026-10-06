import { NextRequest, NextResponse } from "next/server";
import { AuthStore, verifyPassword } from "@/lib/auth/store";
import { signSessionToken, PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";
import { mapStoredProfileToUserProfile } from "@/lib/types/user";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_EXPIRY_SECONDS = 30 * 24 * 60 * 60; // 30 days

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!trimmedEmail) {
      return NextResponse.json(
        { success: false, error: "Please enter your registered email address." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address (e.g., student@example.com)." },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Please enter your account password." },
        { status: 400 }
      );
    }

    // Lookup user
    const user = AuthStore.findUserByEmail(trimmedEmail);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, user.salt, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Issue signed session token
    const exp = Math.floor(Date.now() / 1000) + SESSION_EXPIRY_SECONDS;
    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      exp,
    });

    AuthStore.createSession(token, user.id, SESSION_EXPIRY_SECONDS);

    let profile = AuthStore.getProfileByUserId(user.id);
    if (!profile) {
      profile = AuthStore.updateUserProfile(user.id, {})!;
    }

    const userProfile = mapStoredProfileToUserProfile(profile);

    const response = NextResponse.json({
      success: true,
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
    console.error("Login API error:", err);
    const msg = err instanceof Error ? err.message : "Authentication failed.";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
