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

    const history = AuthStore.getUserPracticeHistory(session.userId);

    // Compute weak topics from user's actual practice history
    const topicStats: Record<string, { topicId: string; topicName: string; examId: string; subjectId: string; attempts: number; correct: number }> = {};
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
        accuracyPercentage: t.attempts > 0 ? Math.round((t.correct / t.attempts) * 100) : 0,
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
    return NextResponse.json({ error: "Failed to fetch practice history" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const actualScore = typeof correctAnswers === "number" ? correctAnswers : typeof score === "number" ? score : 0;
    const questionsCount = Number(totalQuestions) || 0;
    const accuracy = questionsCount > 0 ? Math.round((actualScore / questionsCount) * 100) : 0;

    const { profile, record } = AuthStore.recordUserPractice(session.userId, {
      examId: String(examId),
      subjectId: String(subjectId),
      topicId: String(topicId),
      topicName: String(topicName),
      totalQuestions: questionsCount,
      score: actualScore,
      accuracy,
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
    });

    return NextResponse.json({
      success: true,
      record,
      profile: mapStoredProfileToUserProfile(profile),
    });
  } catch (err) {
    console.error("Practice POST error:", err);
    return NextResponse.json({ error: "Failed to record practice session" }, { status: 500 });
  }
}
