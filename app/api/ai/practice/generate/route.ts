import { NextRequest, NextResponse } from "next/server";
import { AxmokQuestionService } from "@/services/ai/axmok-question-service";
import { verifySessionToken, PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";

// ---------------------------------------------------------------------------
// In-Memory Rate Limiting (Sliding Window per IP / Client)
// Limits generation requests to 20 calls per minute
// ---------------------------------------------------------------------------
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count += 1;
  return false;
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((record, key) => {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  });
}, 5 * 60 * 1000);

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "anonymous-client";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          error:
            "You are generating practice sets very quickly. Please pause a moment before generating again.",
        },
        { status: 429 }
      );
    }

    // 2. Parse & Validate Payload
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON request payload." }, { status: 400 });
    }

    const {
      examId = "sbi-po",
      examName = "SBI PO",
      subjectId = "reasoning-ability",
      subjectName = "Reasoning Ability",
      topicId = "blood-relations",
      topicName = "Blood Relations",
      subtopicId,
      subtopicName,
      questionType,
      difficulty = "Medium",
      count = 5,
      practiceMode = "topic",
      previousQuestions = [],
      userAccuracy,
    } = body;

    // Validate count (allowed 5, 10, 15, 20)
    const validCount = Math.min(Math.max(Number(count) || 5, 5), 20);

    // Validate difficulty
    const validDifficulties = ["Beginner", "Easy", "Medium", "Moderate", "Exam Level", "Hard", "Mixed"];
    const normalizedDifficulty = validDifficulties.includes(difficulty) ? difficulty : "Medium";

    // 3. Optional: Verify authenticated session from session cookie
    try {
      const token = req.cookies.get(PREPSTREAK_SESSION_COOKIE)?.value;
      if (token) {
        const session = await verifySessionToken(token);
        if (session?.userId) {
          // User is authenticated
        }
      }
    } catch {
      // Continue gracefully
    }

    // 4. Generate Questions via AxmokQuestionService
    const questions = await AxmokQuestionService.generateQuestions({
      examId: String(examId),
      examName: String(examName),
      subjectId: String(subjectId),
      subjectName: String(subjectName),
      topicId: String(topicId),
      topicName: String(topicName),
      subtopicId: subtopicId ? String(subtopicId) : undefined,
      subtopicName: subtopicName ? String(subtopicName) : undefined,
      questionType: questionType ? String(questionType) : undefined,
      difficulty: normalizedDifficulty,
      count: validCount,
      practiceMode,
      previousQuestions: Array.isArray(previousQuestions) ? previousQuestions : [],
      userAccuracy: typeof userAccuracy === "number" ? userAccuracy : undefined,
    });

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Axmok AI was unable to generate questions. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      questions,
      metadata: {
        examName,
        subjectName,
        topicName,
        subtopicName,
        questionType,
        difficulty: normalizedDifficulty,
        count: questions.length,
        practiceMode,
      },
    });
  } catch (error) {
    console.error("API /api/ai/practice/generate error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while preparing questions." },
      { status: 500 }
    );
  }
}
