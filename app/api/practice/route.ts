import { NextRequest, NextResponse } from "next/server";
import { AuthStore } from "@/lib/auth/store";
import { verifySessionToken, PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";
import { mapStoredProfileToUserProfile } from "@/lib/types/user";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface PracticeHistoryItem {
  id: string;
  examId: string;
  subjectId: string;
  topicId: string;
  topicName: string;
  totalQuestions: number;
  score: number;
  accuracy: number;
  timeSpentSeconds: number;
  date?: string;
  createdAt?: string;
}

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
      // Fall through to cookie
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

    let history: PracticeHistoryItem[] = [];

    // Query Supabase practice_history if available
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: sbHistory, error: sbErr } = await supabase
          .from("practice_history")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!sbErr && Array.isArray(sbHistory) && sbHistory.length > 0) {
          history = sbHistory.map((row) => ({
            id: row.id,
            examId: row.exam_id,
            subjectId: row.subject_id,
            topicId: row.topic_id,
            topicName: row.topic_name,
            totalQuestions: row.total_questions,
            score: row.score,
            accuracy: row.accuracy,
            timeSpentSeconds: row.time_spent_seconds,
            date: row.created_at,
            createdAt: row.created_at,
          }));
        }
      } catch (sbQueryErr) {
        console.warn("Supabase practice_history query warning:", sbQueryErr);
      }
    }

    // Fall back to local store if Supabase returned empty or was unavailable
    if (history.length === 0) {
      const localRecords = AuthStore.getUserPracticeHistory(userId);
      history = localRecords.map((r) => ({
        id: r.id,
        examId: r.examId,
        subjectId: r.subjectId,
        topicId: r.topicId,
        topicName: r.topicName,
        totalQuestions: r.totalQuestions,
        score: r.score,
        accuracy: r.accuracy,
        timeSpentSeconds: r.timeSpentSeconds,
        date: r.date,
        createdAt: r.date,
      }));
    }

    // Compute weak topics from user's actual practice history
    const topicStats: Record<
      string,
      {
        topicId: string;
        topicName: string;
        examId: string;
        subjectId: string;
        attempts: number;
        correct: number;
      }
    > = {};

    for (const item of history) {
      if (!topicStats[item.topicId]) {
        topicStats[item.topicId] = {
          topicId: item.topicId,
          topicName: item.topicName,
          examId: item.examId,
          subjectId: item.subjectId,
          attempts: 0,
          correct: 0,
        };
      }
      topicStats[item.topicId].attempts += item.totalQuestions;
      topicStats[item.topicId].correct += item.score;
    }

    const weakTopics = Object.values(topicStats)
      .map((t) => ({
        id: `wt-${t.topicId}`,
        topicId: t.topicId,
        topicName: t.topicName,
        examId: t.examId,
        subjectId: t.subjectId,
        questionsAttempted: t.attempts,
        accuracyPercentage:
          t.attempts > 0 ? Math.round((t.correct / t.attempts) * 100) : 0,
      }))
      .filter((t) => t.accuracyPercentage < 70)
      .sort((a, b) => a.accuracyPercentage - b.accuracyPercentage);

    return NextResponse.json({
      success: true,
      history,
      weakTopics,
    });
  } catch (err) {
    console.error("Practice GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch practice history" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      examId = "",
      subjectId = "",
      topicId = "",
      topicName = "General Practice",
      totalQuestions = 0,
      score,
      correctAnswers,
      timeSpentSeconds = 0,
    } = body;

    const actualScore =
      typeof correctAnswers === "number"
        ? correctAnswers
        : typeof score === "number"
        ? score
        : 0;
    const questionsCount = Number(totalQuestions) || 0;
    const accuracy =
      questionsCount > 0 ? Math.round((actualScore / questionsCount) * 100) : 0;
    const timeSpent = Number(timeSpentSeconds) || 0;

    // Persist to Supabase practice_history table
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from("practice_history").insert({
          user_id: userId,
          exam_id: String(examId),
          subject_id: String(subjectId),
          topic_id: String(topicId),
          topic_name: String(topicName),
          total_questions: questionsCount,
          score: actualScore,
          accuracy,
          time_spent_seconds: timeSpent,
        });

        // Update Supabase profiles table aggregates
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (currentProfile) {
          const newAttempted =
            (currentProfile.total_questions_attempted || 0) + questionsCount;
          const newCorrect =
            (currentProfile.total_questions_correct || 0) + actualScore;
          const newAccuracy =
            newAttempted > 0 ? Math.round((newCorrect / newAttempted) * 100) : 0;
          const newStreak = Math.max(1, (currentProfile.current_streak || 0) + 1);
          const newLongestStreak = Math.max(
            newStreak,
            currentProfile.longest_streak || 0
          );
          const newStudyTime =
            (currentProfile.study_time_minutes || 0) + Math.round(timeSpent / 60);

          await supabase
            .from("profiles")
            .update({
              total_questions_attempted: newAttempted,
              total_questions_correct: newCorrect,
              overall_accuracy: newAccuracy,
              current_streak: newStreak,
              longest_streak: newLongestStreak,
              study_time_minutes: newStudyTime,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        }
      } catch (sbInsertErr) {
        console.warn("Supabase practice_history insert warning:", sbInsertErr);
      }
    }

    // Also record in local store for seamless local state synchronization
    const { profile, record } = AuthStore.recordUserPractice(userId, {
      examId: String(examId),
      subjectId: String(subjectId),
      topicId: String(topicId),
      topicName: String(topicName),
      totalQuestions: questionsCount,
      score: actualScore,
      accuracy,
      timeSpentSeconds: timeSpent,
    });

    return NextResponse.json({
      success: true,
      record,
      profile: mapStoredProfileToUserProfile(profile),
    });
  } catch (err) {
    console.error("Practice POST error:", err);
    return NextResponse.json(
      { error: "Failed to record practice session" },
      { status: 500 }
    );
  }
}
