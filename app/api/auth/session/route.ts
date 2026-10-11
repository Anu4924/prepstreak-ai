import { NextRequest, NextResponse } from "next/server";
import { AuthStore } from "@/lib/auth/store";
import { verifySessionToken, PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";
import {
  mapStoredProfileToUserProfile,
  mapDbProfileToUserProfile,
  UserProfile,
  DbProfile,
} from "@/lib/types/user";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const adminClient = createAdminClient();

    // 1. Try Supabase Auth session first
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { user: sbUser },
          error: sbError,
        } = await supabase.auth.getUser();

        if (!sbError && sbUser) {
          const userId = sbUser.id;
          const userEmail = sbUser.email || "";
          let userFullName =
            sbUser.user_metadata?.full_name ||
            sbUser.user_metadata?.name ||
            userEmail.split("@")[0] ||
            "Student";
          let userExamId =
            sbUser.user_metadata?.selected_exam ||
            sbUser.user_metadata?.target_exam ||
            "";

          // Fetch profile from Supabase public.profiles table
          let userProfile: UserProfile | null = null;
          try {
            const { data: sbProfile } = await (adminClient || supabase)
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .single();

            if (sbProfile) {
              if (sbProfile.full_name) userFullName = sbProfile.full_name;
              if (sbProfile.selected_exam) userExamId = sbProfile.selected_exam;

              const hasExam = Boolean(userExamId && userExamId !== "None");
              const dbProf: DbProfile = {
                id: userId,
                full_name: userFullName,
                email: userEmail,
                avatar_url: sbProfile.avatar_url,
                selected_exam: userExamId,
                selected_subject: sbProfile.selected_subject,
                selected_topics: sbProfile.selected_topics || [],
                daily_question_goal: sbProfile.daily_question_goal ?? 20,
                preferred_difficulty: (sbProfile.preferred_difficulty as "Easy" | "Medium" | "Hard" | "Adaptive") || "Adaptive",
                current_streak: sbProfile.current_streak ?? 0,
                longest_streak: sbProfile.longest_streak ?? 0,
                total_questions_attempted: sbProfile.total_questions_attempted ?? 0,
                total_questions_correct: sbProfile.total_questions_correct ?? 0,
                total_tests_completed: sbProfile.total_tests_completed ?? 0,
                overall_accuracy: sbProfile.overall_accuracy ?? 0,
                study_time_minutes: sbProfile.study_time_minutes ?? 0,
                onboarding_completed: sbProfile.onboarding_completed === true || hasExam,
                created_at: sbProfile.created_at || new Date().toISOString(),
                updated_at: sbProfile.updated_at || new Date().toISOString(),
              };
              userProfile = mapDbProfileToUserProfile(dbProf);
            }
          } catch (profileFetchErr) {
            console.warn("Could not query Supabase profile in session route:", profileFetchErr);
          }

          // Fallback to local profile cache if Supabase table row isn't ready
          if (!userProfile) {
            let localProfile = AuthStore.getProfileByUserId(userId);
            if (!localProfile) {
              localProfile = AuthStore.updateUserProfile(userId, {
                fullName: userFullName,
                selectedExam: userExamId,
                email: userEmail,
              });
            }
            userProfile = mapStoredProfileToUserProfile(localProfile);
          }

          const hasExam = Boolean(userExamId && userExamId !== "None");
          if (hasExam && userProfile) {
            userProfile.onboardingCompleted = true;
          }

          return NextResponse.json({
            isAuthenticated: true,
            user: {
              id: userId,
              name: userFullName,
              email: userEmail,
              targetExamId: userExamId,
              createdAt: new Date(sbUser.created_at || Date.now()),
              user_metadata: {
                full_name: userFullName,
                selected_exam: userExamId,
                avatar_url: userProfile.avatarUrl,
              },
            },
            profile: userProfile,
          });
        }
      } catch (sbErr) {
        console.warn("Supabase session check error:", sbErr);
      }
    }

    // 2. Fallback to PREPSTREAK_SESSION_COOKIE
    const token = req.cookies.get(PREPSTREAK_SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
        profile: null,
      });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      // Signature invalid or token expired -> delete stale cookie
      const res = NextResponse.json({
        isAuthenticated: false,
        user: null,
        profile: null,
      });
      res.cookies.delete(PREPSTREAK_SESSION_COOKIE);
      return res;
    }

    // Rehydrate session in AuthStore if needed
    const nowSec = Math.floor(Date.now() / 1000);
    const remaining = (payload.exp || nowSec + 86400) - nowSec;
    let dbSession = AuthStore.getSession(token);
    if (!dbSession && remaining > 0) {
      dbSession = AuthStore.createSession(token, payload.userId, remaining);
    }

    // Resolve user by ID or by email
    let user = AuthStore.findUserById(payload.userId);
    if (!user && payload.email) {
      user = AuthStore.findUserByEmail(payload.email);
    }

    // If user not in local store, check Supabase Auth via adminClient
    if (!user && adminClient && payload.userId) {
      try {
        const { data: adminSbData } = await adminClient.auth.admin.getUserById(payload.userId);
        if (adminSbData?.user) {
          const sbU = adminSbData.user;
          const created = AuthStore.createUser(
            sbU.user_metadata?.full_name || sbU.user_metadata?.name || payload.email.split("@")[0] || "Student",
            payload.email,
            "",
            sbU.user_metadata?.selected_exam || "",
            false,
            payload.userId
          );
          user = created.user;
        }
      } catch {
        // Non-blocking
      }
    }

    if (!user) {
      // User truly does not exist
      const res = NextResponse.json({
        isAuthenticated: false,
        user: null,
        profile: null,
      });
      res.cookies.delete(PREPSTREAK_SESSION_COOKIE);
      return res;
    }

    let profile = AuthStore.getProfileByUserId(user.id);
    if (!profile) {
      profile = AuthStore.updateUserProfile(user.id, {
        fullName: user.fullName,
        email: user.email,
        selectedExam: user.targetExamId,
      });
    }

    // Also check Supabase profiles table for any updated exam/stats
    if (adminClient) {
      try {
        const { data: sbProfile } = await adminClient
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (sbProfile) {
          if (sbProfile.selected_exam && (!profile.selectedExam || profile.selectedExam === "None")) {
            profile = AuthStore.updateUserProfile(user.id, {
              selectedExam: sbProfile.selected_exam,
              onboardingCompleted: true,
            });
          }
        }
      } catch {
        // Non-blocking
      }
    }

    const userProfile = mapStoredProfileToUserProfile(profile);
    const hasExam = Boolean(userProfile.examId && userProfile.examId !== "None") ||
                    Boolean(userProfile.currentExam && userProfile.currentExam !== "None") ||
                    Boolean(user.targetExamId && user.targetExamId !== "None");
    if (hasExam) {
      userProfile.onboardingCompleted = true;
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        targetExamId: userProfile.examId || user.targetExamId,
        createdAt: new Date(user.createdAt),
        user_metadata: {
          full_name: user.fullName,
          selected_exam: userProfile.examId || user.targetExamId,
          avatar_url: profile.avatarUrl,
        },
      },
      profile: userProfile,
    });
  } catch (err) {
    console.error("Session API error:", err);
    return NextResponse.json({
      isAuthenticated: false,
      user: null,
      profile: null,
    });
  }
}
