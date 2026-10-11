import { NextRequest, NextResponse } from "next/server";
import { AuthStore, verifyPassword } from "@/lib/auth/store";
import { signSessionToken, PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";
import { mapStoredProfileToUserProfile } from "@/lib/types/user";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_EXPIRY_SECONDS = 30 * 24 * 60 * 60; // 30 days

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    // 1. Validate required fields & format
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

    let authenticatedUserId: string | null = null;
    let userFullName = "";
    let userTargetExam = "";
    let userCreatedAt = new Date();

    const supabase = createClient();
    const adminClient = createAdminClient();

    // 2. Primary: Authenticate with Supabase Auth if configured
    if (isSupabaseConfigured()) {
      try {
        const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (!sbError && sbData?.user?.id) {
          authenticatedUserId = sbData.user.id;
          userFullName =
            sbData.user.user_metadata?.full_name ||
            sbData.user.user_metadata?.name ||
            trimmedEmail.split("@")[0] ||
            "Student";
          userTargetExam =
            sbData.user.user_metadata?.selected_exam ||
            sbData.user.user_metadata?.target_exam ||
            "";
          userCreatedAt = new Date(sbData.user.created_at || Date.now());

          // Ensure email is confirmed via admin client
          if (adminClient) {
            try {
              await adminClient.auth.admin.updateUserById(authenticatedUserId, {
                email_confirm: true,
              });
            } catch {
              // Ignore if already confirmed
            }
          }

          // Fetch profile data from Supabase public.profiles table
          try {
            const { data: sbProfile } = await (adminClient || supabase)
              .from("profiles")
              .select("*")
              .eq("id", authenticatedUserId)
              .single();

            if (sbProfile) {
              if (sbProfile.full_name) userFullName = sbProfile.full_name;
              if (sbProfile.selected_exam) userTargetExam = sbProfile.selected_exam;
            }
          } catch (profileErr) {
            console.warn("Could not query Supabase profiles table on login:", profileErr);
          }
        }
      } catch (sbEx) {
        console.warn("Supabase auth signIn exception:", sbEx);
      }
    }

    // 3. Fallback: Check local AuthStore for accounts registered locally or before Supabase sync
    if (!authenticatedUserId) {
      const localUser = AuthStore.findUserByEmail(trimmedEmail);
      if (localUser) {
        const isPasswordValid = verifyPassword(password, localUser.salt, localUser.passwordHash);
        if (isPasswordValid) {
          // Auto-migrate or provision user into Supabase Auth with admin privileges
          if (adminClient) {
            try {
              const { data: adminUserData, error: adminUserErr } = await adminClient.auth.admin.createUser({
                email: trimmedEmail,
                password,
                email_confirm: true,
                user_metadata: {
                  full_name: localUser.fullName,
                  selected_exam: localUser.targetExamId || "",
                },
              });

              if (adminUserData?.user?.id) {
                authenticatedUserId = adminUserData.user.id;
              } else if (
                adminUserErr?.message.toLowerCase().includes("already registered") ||
                adminUserErr?.message.toLowerCase().includes("already exists")
              ) {
                // If user exists in Supabase, update password and confirm
                const { data: listData } = await adminClient.auth.admin.listUsers();
                const matchedUser = listData?.users?.find(
                  (u) => u.email?.toLowerCase() === trimmedEmail
                );
                if (matchedUser) {
                  authenticatedUserId = matchedUser.id;
                  await adminClient.auth.admin.updateUserById(matchedUser.id, {
                    password,
                    email_confirm: true,
                  });
                }
              }
            } catch (adminSyncErr) {
              console.warn("Admin sync error on login:", adminSyncErr);
            }
          } else if (isSupabaseConfigured()) {
            try {
              const { data: signUpData } = await supabase.auth.signUp({
                email: trimmedEmail,
                password,
                options: {
                  data: {
                    full_name: localUser.fullName,
                    selected_exam: localUser.targetExamId || "",
                  },
                },
              });

              if (signUpData?.user?.id) {
                authenticatedUserId = signUpData.user.id;
              }
            } catch (syncErr) {
              console.warn("Could not sync local user to Supabase on login:", syncErr);
            }
          }

          if (!authenticatedUserId) {
            authenticatedUserId = localUser.id;
          }
          userFullName = localUser.fullName;
          userTargetExam = localUser.targetExamId || "";
          userCreatedAt = new Date(localUser.createdAt);

          // Establish real Supabase session cookies
          try {
            await supabase.auth.signInWithPassword({
              email: trimmedEmail,
              password,
            });
          } catch {
            // Non-blocking
          }
        }
      }
    }

    // 4. If credentials failed on all providers -> 401 Unauthorized
    if (!authenticatedUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password. If you do not have an account, please click 'Create New Account' below.",
        },
        { status: 401 }
      );
    }

    // 5. Ensure local cache has user profile matching authenticatedUserId and re-key legacy IDs
    AuthStore.syncUserWithSupabaseId(trimmedEmail, authenticatedUserId);

    let localUser = AuthStore.findUserById(authenticatedUserId);
    if (!localUser) {
      localUser = AuthStore.findUserByEmail(trimmedEmail);
    }
    if (!localUser) {
      const created = AuthStore.createUser(
        userFullName || "Student",
        trimmedEmail,
        password,
        userTargetExam,
        false,
        authenticatedUserId
      );
      localUser = created.user;
    }

    let profile = AuthStore.getProfileByUserId(authenticatedUserId);
    if (!profile) {
      profile = AuthStore.updateUserProfile(authenticatedUserId, {
        fullName: userFullName || localUser.fullName,
        selectedExam: userTargetExam || localUser.targetExamId,
        email: trimmedEmail,
      });
    }

    // 6. Ensure profile is saved to Supabase public.profiles table
    if (adminClient) {
      try {
        await adminClient.from("profiles").upsert(
          {
            id: authenticatedUserId,
            email: trimmedEmail,
            full_name: profile.fullName || userFullName || localUser.fullName,
            selected_exam: profile.selectedExam || userTargetExam || localUser.targetExamId || "",
          },
          { onConflict: "id" }
        );
      } catch (profileUpsertErr) {
        console.warn("Supabase profiles upsert on login warning:", profileUpsertErr);
      }
    }

    const userProfile = mapStoredProfileToUserProfile(profile);
    const hasExam = Boolean(userProfile.examId && userProfile.examId !== "None") ||
                    Boolean(userProfile.currentExam && userProfile.currentExam !== "None") ||
                    Boolean(localUser.targetExamId && localUser.targetExamId !== "None");
    if (hasExam) {
      userProfile.onboardingCompleted = true;
    }

    // 7. Issue signed session token
    const exp = Math.floor(Date.now() / 1000) + SESSION_EXPIRY_SECONDS;
    const token = await signSessionToken({
      userId: authenticatedUserId,
      email: trimmedEmail,
      exp,
    });

    AuthStore.createSession(token, authenticatedUserId, SESSION_EXPIRY_SECONDS);

    const response = NextResponse.json({
      success: true,
      user: {
        id: authenticatedUserId,
        name: userFullName || localUser.fullName,
        email: trimmedEmail,
        targetExamId: userTargetExam || localUser.targetExamId,
        createdAt: userCreatedAt,
        user_metadata: {
          full_name: userFullName || localUser.fullName,
          selected_exam: userTargetExam || localUser.targetExamId,
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
