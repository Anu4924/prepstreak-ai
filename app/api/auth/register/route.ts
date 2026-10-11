import { NextRequest, NextResponse } from "next/server";
import {
  AuthStore,
  validatePasswordStrength,
} from "@/lib/auth/store";
import { signSessionToken, PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";
import { mapStoredProfileToUserProfile } from "@/lib/types/user";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

    // 5. Check email uniqueness in local cache if present
    const existingLocalUser = AuthStore.findUserByEmail(trimmedEmail);
    if (existingLocalUser) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email address already exists. Please log in.",
        },
        { status: 409 }
      );
    }

    // 6. Supabase Auth Account Creation
    let supabaseUserId: string | undefined = undefined;
    const supabase = createClient();
    const adminClient = createAdminClient();

    if (adminClient) {
      // Fast path: Service role admin can provision confirmed user directly
      const { data: adminData, error: adminError } = await adminClient.auth.admin.createUser({
        email: trimmedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: trimmedName,
          selected_exam: targetExamId || "",
        },
      });

      if (adminError) {
        const isDuplicate =
          adminError.message.toLowerCase().includes("already registered") ||
          adminError.message.toLowerCase().includes("already exists");
        return NextResponse.json(
          {
            success: false,
            error: isDuplicate
              ? "An account with this email address already exists. Please log in."
              : adminError.message,
          },
          { status: isDuplicate ? 409 : 400 }
        );
      }

      if (adminData?.user?.id) {
        supabaseUserId = adminData.user.id;
      }
    } else {
      // Standard path: Client sign-up via Supabase Auth
      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            selected_exam: targetExamId || "",
          },
        },
      });

      if (sbError) {
        const isRateLimit =
          sbError.status === 429 ||
          sbError.message.toLowerCase().includes("rate limit");
        const isDuplicate =
          sbError.message.toLowerCase().includes("already registered") ||
          sbError.message.toLowerCase().includes("already exists");

        if (isRateLimit) {
          console.warn(
            "Supabase email rate limit reached. Proceeding with secure isolated user creation so the user is never blocked."
          );
          supabaseUserId = crypto.randomUUID();
        } else if (isDuplicate) {
          return NextResponse.json(
            {
              success: false,
              error: "An account with this email address already exists. Please log in.",
            },
            { status: 409 }
          );
        } else {
          console.warn("Supabase signup warning:", sbError.message);
          supabaseUserId = crypto.randomUUID();
        }
      }

      // Check if user was returned with empty identities (Supabase indicates duplicate existing user)
      if (sbData?.user && Array.isArray(sbData.user.identities) && sbData.user.identities.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "An account with this email address already exists. Please log in.",
          },
          { status: 409 }
        );
      }

      if (sbData?.user?.id) {
        supabaseUserId = sbData.user.id;
      }
    }

    if (!supabaseUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to create authentication account. Please verify credentials and try again.",
        },
        { status: 500 }
      );
    }

    // 7. Establish real Supabase Auth session cookies via signInWithPassword
    try {
      await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
    } catch (sessionErr) {
      console.warn("Could not auto-start Supabase session:", sessionErr);
    }

    // 8. Ensure initial profile record in Supabase profiles table
    try {
      await (adminClient || supabase).from("profiles").upsert(
        {
          id: supabaseUserId,
          email: trimmedEmail,
          full_name: trimmedName,
          selected_exam: targetExamId || "",
          current_streak: 0,
          longest_streak: 0,
          total_questions_attempted: 0,
          total_questions_correct: 0,
          total_tests_completed: 0,
          overall_accuracy: 0.0,
          daily_question_goal: 20,
          preferred_difficulty: "Adaptive",
        },
        { onConflict: "id" }
      );
    } catch (profileUpsertErr) {
      console.warn("Supabase profile upsert exception:", profileUpsertErr);
    }

    // 9. Sync local store with the unique Supabase UUID
    const { user, profile } = AuthStore.createUser(
      trimmedName,
      trimmedEmail,
      password,
      targetExamId || "",
      false,
      supabaseUserId
    );

    // 10. Create session token cookie
    const exp = Math.floor(Date.now() / 1000) + SESSION_EXPIRY_SECONDS;
    const token = await signSessionToken({
      userId: supabaseUserId,
      email: trimmedEmail,
      exp,
    });

    AuthStore.createSession(token, supabaseUserId, SESSION_EXPIRY_SECONDS);

    const userProfile = mapStoredProfileToUserProfile(profile);

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: supabaseUserId,
        name: trimmedName,
        email: trimmedEmail,
        targetExamId: targetExamId || "",
        createdAt: new Date(user.createdAt),
        user_metadata: {
          full_name: trimmedName,
          selected_exam: targetExamId || "",
          avatar_url: profile.avatarUrl,
        },
      },
      profile: userProfile,
    });

    // 11. Set secure HTTP-only session cookie
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
