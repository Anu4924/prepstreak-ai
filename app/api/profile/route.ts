import { NextRequest, NextResponse } from "next/server";
import { AuthStore } from "@/lib/auth/store";
import { verifySessionToken, PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";
import {
  mapStoredProfileToUserProfile,
  mapDbProfileToUserProfile,
  DbProfile,
} from "@/lib/types/user";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const {
        data: { user: sbUser },
      } = await supabase.auth.getUser();
      if (sbUser?.id) {
        return sbUser.id;
      }
    } catch {
      // Fall through to cookie check
    }
  }

  const token = req.cookies.get(PREPSTREAK_SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload?.userId) return null;

  // Rehydrate session in AuthStore if needed
  const nowSec = Math.floor(Date.now() / 1000);
  const remaining = (payload.exp || nowSec + 86400) - nowSec;
  let session = AuthStore.getSession(token);
  if (!session && remaining > 0) {
    session = AuthStore.createSession(token, payload.userId, remaining);
  }

  return payload.userId;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try Supabase profiles table first
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: sbProfile, error: sbErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (!sbErr && sbProfile) {
          const dbProf: DbProfile = {
            id: userId,
            full_name: sbProfile.full_name || "Student",
            email: sbProfile.email || "",
            avatar_url: sbProfile.avatar_url,
            selected_exam: sbProfile.selected_exam || "",
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
            onboarding_completed: sbProfile.onboarding_completed === true || Boolean(sbProfile.selected_exam && sbProfile.selected_exam !== "None"),
            created_at: sbProfile.created_at || new Date().toISOString(),
            updated_at: sbProfile.updated_at || new Date().toISOString(),
          };

          // Keep local store synchronized
          AuthStore.updateUserProfile(userId, {
            fullName: dbProf.full_name,
            selectedExam: dbProf.selected_exam,
            selectedSubject: dbProf.selected_subject,
            selectedTopics: dbProf.selected_topics,
            dailyQuestionGoal: dbProf.daily_question_goal,
            preferredDifficulty: dbProf.preferred_difficulty,
            currentStreak: dbProf.current_streak,
            longestStreak: dbProf.longest_streak,
            totalQuestionsAttempted: dbProf.total_questions_attempted,
            totalQuestionsCorrect: dbProf.total_questions_correct,
            totalTestsCompleted: dbProf.total_tests_completed,
            overallAccuracy: dbProf.overall_accuracy,
            studyTimeMinutes: dbProf.study_time_minutes,
            onboardingCompleted: dbProf.onboarding_completed,
          });

          const userProfile = mapDbProfileToUserProfile(dbProf);
          if (Boolean(userProfile.examId && userProfile.examId !== "None")) {
            userProfile.onboardingCompleted = true;
          }

          return NextResponse.json({
            success: true,
            profile: userProfile,
          });
        }
      } catch (sbQueryErr) {
        console.warn("Supabase profile GET query warning:", sbQueryErr);
      }
    }

    // Fallback to local profile store
    let profile = AuthStore.getProfileByUserId(userId);
    if (!profile) {
      profile = AuthStore.updateUserProfile(userId, {});
    }

    const userProfile = mapStoredProfileToUserProfile(profile);
    if (Boolean(userProfile.examId && userProfile.examId !== "None")) {
      userProfile.onboardingCompleted = true;
    }

    return NextResponse.json({
      success: true,
      profile: userProfile,
    });
  } catch (err) {
    console.error("Profile GET error:", err);
    return NextResponse.json({ error: "Failed to get profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const fullNameVal = body.full_name ?? body.fullName;
    const selectedExamVal = body.selected_exam ?? body.selectedExam;
    const selectedSubjectVal = body.selected_subject ?? body.selectedSubject;
    const selectedTopicsVal = body.selected_topics ?? body.selectedTopics;
    const avatarUrlVal = body.avatar_url ?? body.avatarUrl;
    const dailyGoalVal = body.daily_question_goal ?? body.dailyQuestionGoal;
    const preferredDifficultyVal = body.preferred_difficulty ?? body.preferredDifficulty;
    const currentStreakVal = body.current_streak ?? body.currentStreak;
    const longestStreakVal = body.longest_streak ?? body.longestStreak;
    const totalQuestionsAttemptedVal = body.total_questions_attempted ?? body.totalQuestionsAttempted;
    const totalQuestionsCorrectVal = body.total_questions_correct ?? body.totalQuestionsCorrect;
    const totalTestsCompletedVal = body.total_tests_completed ?? body.totalTestsCompleted;
    const overallAccuracyVal = body.overall_accuracy ?? body.overallAccuracy;
    const studyTimeMinutesVal = body.study_time_minutes ?? body.studyTimeMinutes;
    const onboardingCompletedVal = body.onboarding_completed ?? body.onboardingCompleted;

    const updates: Parameters<typeof AuthStore.updateUserProfile>[1] = {};
    const sbUpdates: Record<string, unknown> = {
      id: userId,
      updated_at: new Date().toISOString(),
    };

    if (fullNameVal !== undefined) {
      updates.fullName = String(fullNameVal).trim();
      sbUpdates.full_name = updates.fullName;
    }
    if (selectedExamVal !== undefined) {
      updates.selectedExam = String(selectedExamVal);
      sbUpdates.selected_exam = updates.selectedExam;
    }
    if (selectedSubjectVal !== undefined) {
      updates.selectedSubject = String(selectedSubjectVal);
      sbUpdates.selected_subject = updates.selectedSubject;
    }
    if (selectedTopicsVal !== undefined && Array.isArray(selectedTopicsVal)) {
      updates.selectedTopics = selectedTopicsVal;
      sbUpdates.selected_topics = updates.selectedTopics;
    }
    if (avatarUrlVal !== undefined) {
      updates.avatarUrl = String(avatarUrlVal);
      sbUpdates.avatar_url = updates.avatarUrl;
    }
    if (dailyGoalVal !== undefined) {
      updates.dailyQuestionGoal = Number(dailyGoalVal);
      sbUpdates.daily_question_goal = updates.dailyQuestionGoal;
    }
    if (preferredDifficultyVal !== undefined) {
      updates.preferredDifficulty = preferredDifficultyVal;
      sbUpdates.preferred_difficulty = updates.preferredDifficulty;
    }
    if (currentStreakVal !== undefined) {
      updates.currentStreak = Number(currentStreakVal);
      sbUpdates.current_streak = updates.currentStreak;
    }
    if (longestStreakVal !== undefined) {
      updates.longestStreak = Number(longestStreakVal);
      sbUpdates.longest_streak = updates.longestStreak;
    }
    if (totalQuestionsAttemptedVal !== undefined) {
      updates.totalQuestionsAttempted = Number(totalQuestionsAttemptedVal);
      sbUpdates.total_questions_attempted = updates.totalQuestionsAttempted;
    }
    if (totalQuestionsCorrectVal !== undefined) {
      updates.totalQuestionsCorrect = Number(totalQuestionsCorrectVal);
      sbUpdates.total_questions_correct = updates.totalQuestionsCorrect;
    }
    if (totalTestsCompletedVal !== undefined) {
      updates.totalTestsCompleted = Number(totalTestsCompletedVal);
      sbUpdates.total_tests_completed = updates.totalTestsCompleted;
    }
    if (overallAccuracyVal !== undefined) {
      updates.overallAccuracy = Number(overallAccuracyVal);
      sbUpdates.overall_accuracy = updates.overallAccuracy;
    }
    if (studyTimeMinutesVal !== undefined) {
      updates.studyTimeMinutes = Number(studyTimeMinutesVal);
    }
    if (onboardingCompletedVal !== undefined) {
      updates.onboardingCompleted = Boolean(onboardingCompletedVal);
    } else if (selectedExamVal && selectedExamVal !== "None") {
      updates.onboardingCompleted = true;
    }

    // Persist to Supabase profiles table
    if (isSupabaseConfigured()) {
      try {
        const adminClient = createAdminClient();
        const supabase = createClient();
        await (adminClient || supabase).from("profiles").upsert(sbUpdates, { onConflict: "id" });
      } catch (sbUpsertErr) {
        console.warn("Supabase profile upsert warning:", sbUpsertErr);
      }
    }

    // Persist to local cache
    const updatedProfile = AuthStore.updateUserProfile(userId, updates);
    if (!updatedProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: mapStoredProfileToUserProfile(updatedProfile),
    });
  } catch (err) {
    console.error("Profile PUT error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
