import { NextRequest, NextResponse } from "next/server";
import { AuthStore } from "@/lib/auth/store";
import { verifySessionToken, PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";
import { mapStoredProfileToUserProfile } from "@/lib/types/user";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(PREPSTREAK_SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const session = AuthStore.getSession(token);
    if (!session || session.userId !== payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let profile = AuthStore.getProfileByUserId(session.userId);
    if (!profile) {
      profile = AuthStore.updateUserProfile(session.userId, {})!;
    }

    return NextResponse.json({
      success: true,
      profile: mapStoredProfileToUserProfile(profile),
    });
  } catch (err) {
    console.error("Profile GET error:", err);
    return NextResponse.json({ error: "Failed to get profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get(PREPSTREAK_SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const session = AuthStore.getSession(token);
    if (!session || session.userId !== payload.userId) {
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
    if (fullNameVal !== undefined) updates.fullName = String(fullNameVal).trim();
    if (selectedExamVal !== undefined) updates.selectedExam = String(selectedExamVal);
    if (selectedSubjectVal !== undefined) updates.selectedSubject = String(selectedSubjectVal);
    if (selectedTopicsVal !== undefined && Array.isArray(selectedTopicsVal)) updates.selectedTopics = selectedTopicsVal;
    if (avatarUrlVal !== undefined) updates.avatarUrl = String(avatarUrlVal);
    if (dailyGoalVal !== undefined) updates.dailyQuestionGoal = Number(dailyGoalVal);
    if (preferredDifficultyVal !== undefined) updates.preferredDifficulty = preferredDifficultyVal;
    if (currentStreakVal !== undefined) updates.currentStreak = Number(currentStreakVal);
    if (longestStreakVal !== undefined) updates.longestStreak = Number(longestStreakVal);
    if (totalQuestionsAttemptedVal !== undefined) updates.totalQuestionsAttempted = Number(totalQuestionsAttemptedVal);
    if (totalQuestionsCorrectVal !== undefined) updates.totalQuestionsCorrect = Number(totalQuestionsCorrectVal);
    if (totalTestsCompletedVal !== undefined) updates.totalTestsCompleted = Number(totalTestsCompletedVal);
    if (overallAccuracyVal !== undefined) updates.overallAccuracy = Number(overallAccuracyVal);
    if (studyTimeMinutesVal !== undefined) updates.studyTimeMinutes = Number(studyTimeMinutesVal);
    if (onboardingCompletedVal !== undefined) updates.onboardingCompleted = Boolean(onboardingCompletedVal);

    const updatedProfile = AuthStore.updateUserProfile(session.userId, updates);
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
