"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge, DifficultyBadge } from "@/components/ui/Badge";
import { AxmokAvatar } from "@/components/ai/AxmokAvatar";
import { useAuth } from "@/services/auth/auth-context";
import { PracticeService } from "@/services/practice/practice-service";
import {
  Question,
  PracticeDifficulty,
  PracticeMode,
  PracticeSessionResult,
  QuestionAttemptLog,
} from "@/lib/types/question";
import { getExamById, CENTRAL_EXAM_CATALOGUE } from "@/lib/data/examCatalogue";
import { getSubjectsForExam, getSubjectById } from "@/lib/data/subjectRegistry";
import { getTopicsForSubject, getTopicById } from "@/lib/data/topicRegistry";
import { getSubtopicsForTopic } from "@/lib/data/subtopicRegistry";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Zap,
  BookOpen,
  Trophy,
  AlertTriangle,
  Lightbulb,
  Check,
  ChevronRight,
  HelpCircle,
  Sliders,
  Flame,
} from "lucide-react";

type PracticeState = "config" | "loading" | "active" | "results";

export default function DynamicPracticePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const rawExamId = (params?.examId as string) || "sbi-po";
  const rawSubjectId = (params?.subjectId as string) || "reasoning-ability";
  const rawTopicId = (params?.topicId as string) || "coding-decoding";

  // 1. Resolve Exam, Subject, Topic & Subtopics
  const exam =
    getExamById(rawExamId) ||
    CENTRAL_EXAM_CATALOGUE.find((e) => e.id === rawExamId) ||
    CENTRAL_EXAM_CATALOGUE[0];

  const subjects = getSubjectsForExam(exam.id);
  const subject =
    subjects.find((s) => s.id === rawSubjectId) ||
    getSubjectById(rawSubjectId, exam.id) ||
    subjects[0];

  const allTopics = getTopicsForSubject(subject.id, exam.id);
  const currentTopic =
    allTopics.find((t) => t.id === rawTopicId) ||
    getTopicById(rawTopicId, subject.id, exam.id) ||
    allTopics[0];

  const subtopics = getSubtopicsForTopic(exam.id, subject.id, currentTopic.id);
  const initialSubtopicQuery = searchParams?.get("subtopic") || "all";

  // 2. Practice Configuration State
  const [practiceState, setPracticeState] = useState<PracticeState>("config");
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>(initialSubtopicQuery);
  const [selectedDifficulty, setSelectedDifficulty] = useState<PracticeDifficulty>("Exam Level");
  const [selectedCount, setSelectedCount] = useState<number>(5);
  const [selectedMode, setSelectedMode] = useState<PracticeMode>("topic");

  // 3. User Topic Performance State
  const [prevPerformance, setPrevPerformance] = useState<{
    accuracy: number;
    attempts: number;
    sessions: number;
  } | null>(null);

  // 4. Active Session State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [seenQuestionTexts, setSeenQuestionTexts] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [attemptsLog, setAttemptsLog] = useState<QuestionAttemptLog[]>([]);
  const [loadingStep, setLoadingStep] = useState("Analyzing syllabus requirements...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 5. Timer & Analytics State
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 6. "Ask Axmok AI" Result Explanations Modal/Drawer
  const [mistakesExplanation, setMistakesExplanation] = useState<string | null>(null);
  const [isExplainingMistakes, setIsExplainingMistakes] = useState(false);

  // Fetch previous performance on mount
  useEffect(() => {
    async function loadStats() {
      if (user?.id) {
        const perf = await PracticeService.getTopicPerformance(
          user.id,
          exam.id,
          subject.id,
          currentTopic.id
        );
        if (perf && perf.questionsAttempted > 0) {
          setPrevPerformance({
            accuracy: perf.accuracy,
            attempts: perf.questionsAttempted,
            sessions: perf.practiceSessions,
          });
        }
      }
    }
    loadStats();
  }, [user?.id, exam.id, subject.id, currentTopic.id]);

  // Timer runner during active practice
  useEffect(() => {
    if (practiceState === "active") {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [practiceState]);

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Start Practice: Call API
  const handleStartPractice = async () => {
    setPracticeState("loading");
    setErrorMessage(null);
    setElapsedSeconds(0);
    setCurrentIndex(0);
    setAttemptsLog([]);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);

    // Subtle loading progression steps
    const stepTimer1 = setTimeout(() => {
      setLoadingStep("Calibrating difficulty for " + exam.name + "...");
    }, 900);
    const stepTimer2 = setTimeout(() => {
      setLoadingStep("Awaiting Axmok AI curated question set...");
    }, 1800);

    try {
      // Gather recently solved questions to prevent repetition
      const recentHistory = await PracticeService.getPracticeHistory(user?.id);
      const previousQuestions: string[] = [...seenQuestionTexts];

      // Add questions currently rendered in this session
      questions.forEach((q) => {
        if (q.questionText && !previousQuestions.includes(q.questionText)) {
          previousQuestions.push(q.questionText);
        }
      });

      // Add recent database history
      recentHistory.slice(0, 5).forEach((s) => {
        s.questions?.forEach((q) => {
          if (q.questionText && !previousQuestions.includes(q.questionText)) {
            previousQuestions.push(q.questionText);
          }
        });
      });

      const targetSubtopic =
        selectedSubtopicId !== "all"
          ? subtopics.find((s) => s.id === selectedSubtopicId)
          : undefined;

      const res = await fetch("/api/ai/practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.id,
          examName: exam.name,
          subjectId: subject.id,
          subjectName: subject.name,
          topicId: currentTopic.id,
          topicName: currentTopic.name,
          subtopicId: targetSubtopic?.id,
          subtopicName: targetSubtopic?.name,
          questionType: targetSubtopic?.questionPatterns?.[0] || undefined,
          difficulty: selectedDifficulty,
          count: selectedCount,
          practiceMode: selectedMode,
          previousQuestions,
          userAccuracy: prevPerformance?.accuracy,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to generate practice questions.");
      }

      const data = await res.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions were generated. Please try again.");
      }

      // Record newly generated questions to prevent repetition across subsequent runs
      const newTexts = data.questions.map((q: Question) => q.questionText).filter(Boolean);
      setSeenQuestionTexts((prev) => Array.from(new Set([...prev, ...newTexts])));

      setQuestions(data.questions);
      setPracticeState("active");
    } catch (err: unknown) {
      console.error("Practice start error:", err);
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setErrorMessage(msg);
      setPracticeState("config");
    }
  };

  // Select option before submission
  const handleSelectOption = (optId: string) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(optId);
    }
  };

  // Submit Answer
  const currentQuestion = questions[currentIndex];
  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQuestion) return;

    const isCorrect = selectedOption.toUpperCase() === currentQuestion.correctAnswer.toUpperCase();
    setIsAnswerSubmitted(true);

    const logEntry: QuestionAttemptLog = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.questionText,
      options: currentQuestion.options,
      selectedAnswer: selectedOption,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      explanation: currentQuestion.explanation,
      shortcut: currentQuestion.shortcut,
      commonMistake: currentQuestion.commonMistake,
      learningTip: currentQuestion.learningTip,
    };

    setAttemptsLog((prev) => [...prev, logEntry]);
  };

  // Next Question or Complete Session
  const handleNextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Complete Session: Save practice results
      await handleFinishPractice();
    }
  };

  // Save session & transition to Results state
  const handleFinishPractice = useCallback(async () => {
    setPracticeState("results");

    const totalQuestions = questions.length;
    const correctAnswers = attemptsLog.filter((a) => a.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const accuracy = totalQuestions > 0 ? Number(((correctAnswers / totalQuestions) * 100).toFixed(1)) : 0;

    const resultPayload: PracticeSessionResult = {
      userId: user?.id,
      examId: exam.id,
      examName: exam.name,
      subjectId: subject.id,
      subjectName: subject.name,
      topicId: currentTopic.id,
      topicName: currentTopic.name,
      difficulty: selectedDifficulty,
      practiceMode: selectedMode,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unanswered: 0,
      accuracy,
      timeTakenSeconds: elapsedSeconds,
      createdAt: new Date().toISOString(),
      questions: attemptsLog,
    };

    await PracticeService.savePracticeSession(resultPayload);
  }, [
    attemptsLog,
    currentTopic.id,
    currentTopic.name,
    elapsedSeconds,
    exam.id,
    exam.name,
    questions.length,
    selectedDifficulty,
    selectedMode,
    subject.id,
    subject.name,
    user?.id,
  ]);

  // "Ask Axmok AI: Explain my mistakes"
  const handleExplainMistakes = async () => {
    const wrongQuestions = attemptsLog.filter((a) => !a.isCorrect);
    if (wrongQuestions.length === 0) {
      setMistakesExplanation(
        "🎉 Remarkable job! You achieved 100% accuracy on this set with zero mistakes. You are ready to tackle higher difficulty questions!"
      );
      return;
    }

    setIsExplainingMistakes(true);
    try {
      const prompt = `I just completed a practice session on ${currentTopic.name} (${exam.name}). I got ${wrongQuestions.length} questions wrong:\n\n${wrongQuestions
        .map(
          (q, idx) =>
            `Mistake ${idx + 1}: "${q.questionText}"\nMy Answer: ${q.selectedAnswer}, Correct Answer: ${q.correctAnswer}\nTopic Explanation: ${q.explanation}`
        )
        .join(
          "\n---\n"
        )}\n\nPlease analyze why I made these errors, point out the core concept I missed, and provide 2 actionable exam-day rules to never make these mistakes again.`;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          examName: exam.name,
          subjectName: subject.name,
          topicName: currentTopic.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMistakesExplanation(data.text);
      } else {
        setMistakesExplanation(
          "Review your errors carefully: prioritize understanding the operative rule and avoid rushing through option elimination."
        );
      }
    } catch {
      setMistakesExplanation(
        "Review each wrong question above. Check the 'Why' step and 'Common Mistake' trap to reinforce your understanding."
      );
    } finally {
      setIsExplainingMistakes(false);
    }
  };

  // Calculate live score
  const correctCount = attemptsLog.filter((a) => a.isCorrect).length;

  return (
    <AppShell>
      {/* Breadcrumb & Header */}
      <PageHeader
        title={`Practice: ${currentTopic.name}`}
        subtitle={`${subject.name} • ${exam.name}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Exams", href: "/exams" },
          { label: exam.name, href: `/exams/${exam.id}` },
          { label: subject.name, href: `/exams/${exam.id}/${subject.id}` },
          { label: currentTopic.name, href: `/exams/${exam.id}/${subject.id}/${currentTopic.id}/learn` },
          { label: "Practice" },
        ]}
        badge={
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900 text-almond-100 text-xs font-bold border border-forest-700 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Axmok AI Practice Engine</span>
          </div>
        }
      />

      {/* ================================================================= */}
      {/* 1. CONFIGURATION VIEW                                             */}
      {/* ================================================================= */}
      {practiceState === "config" && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Notice:</span> {errorMessage}
              </div>
            </div>
          )}

          {/* Setup Card */}
          <Card variant="default" padding="lg" className="border border-charcoal-200/90 shadow-card">
            <div className="flex items-center gap-3 pb-5 border-b border-charcoal-100">
              <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-800 shrink-0">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-charcoal-900">Configure Practice Session</h2>
                <p className="text-xs text-charcoal-500">
                  Axmok AI will generate custom, exam-level questions for your selected parameters.
                </p>
              </div>
            </div>

            {/* Performance Context Banner if available */}
            {prevPerformance && (
              <div className="mt-5 p-4 rounded-2xl bg-almond-50/80 border border-almond-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <div>
                    <div className="text-xs font-bold text-charcoal-900">
                      Personalized Adaptive Context Active
                    </div>
                    <div className="text-[11px] text-charcoal-600">
                      Previous Accuracy:{" "}
                      <span className="font-bold text-forest-900">{prevPerformance.accuracy}%</span> across{" "}
                      {prevPerformance.attempts} questions solved
                    </div>
                  </div>
                </div>
                <Badge variant={prevPerformance.accuracy >= 70 ? "success" : "warning"} size="sm">
                  {prevPerformance.accuracy >= 70 ? "Mastery Building" : "Needs Practice"}
                </Badge>
              </div>
            )}

            <div className="space-y-6 mt-6">
              {/* Practice Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-2.5">
                  1. Practice Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: "topic" as PracticeMode,
                      title: "Topic Practice",
                      desc: `Only questions from ${currentTopic.name}`,
                    },
                    {
                      id: "subject" as PracticeMode,
                      title: "Subject Practice",
                      desc: `Mix of topics in ${subject.name}`,
                    },
                    {
                      id: "exam" as PracticeMode,
                      title: "Exam Practice",
                      desc: `Complete ${exam.name} syllabus scope`,
                    },
                    {
                      id: "personalized" as PracticeMode,
                      title: "Personalized Practice",
                      desc: "Axmok adapts to your weak areas",
                    },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSelectedMode(mode.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        selectedMode === mode.id
                          ? "border-forest-900 bg-forest-50/60 ring-1 ring-forest-900"
                          : "border-charcoal-200 bg-white hover:border-charcoal-300"
                      }`}
                    >
                      <div className="text-xs font-bold text-charcoal-900">{mode.title}</div>
                      <div className="text-[11px] text-charcoal-500 mt-0.5">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Focus Subtopic Selector */}
              {subtopics && subtopics.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                      2. Focus Subtopic
                    </label>
                    <span className="text-[11px] text-charcoal-500 font-medium">
                      {subtopics.length} official subtopics
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => setSelectedSubtopicId("all")}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedSubtopicId === "all"
                          ? "border-forest-900 bg-forest-50/70 ring-1 ring-forest-900 shadow-2xs"
                          : "border-charcoal-200 bg-white hover:border-charcoal-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-charcoal-900">
                          All Subtopics (Full Topic Scope)
                        </span>
                        <Badge variant={selectedSubtopicId === "all" ? "forest" : "neutral"} size="sm">
                          Comprehensive
                        </Badge>
                      </div>
                      <div className="text-[11px] text-charcoal-500 mt-1 line-clamp-1">
                        Covers all core subtopic patterns for {exam.name}
                      </div>
                    </button>

                    {subtopics.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedSubtopicId(st.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedSubtopicId === st.id
                            ? "border-forest-900 bg-forest-50/70 ring-1 ring-forest-900 shadow-2xs"
                            : "border-charcoal-200 bg-white hover:border-charcoal-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-charcoal-900 line-clamp-1">
                            {st.name}
                          </span>
                          <Badge variant={selectedSubtopicId === st.id ? "forest" : "outline"} size="sm">
                            {st.importance || "Core"}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-charcoal-500 mt-1 line-clamp-1">
                          {st.questionPatterns?.join(", ") || st.description || "Exam standard pattern"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Difficulty Level (5-level scale) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                    3. Difficulty Level
                  </label>
                  <span className="text-[11px] text-charcoal-500 font-medium">
                    Calibrated specifically for {exam.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { level: "Beginner" as PracticeDifficulty, label: "Beginner", sub: "Core Rules" },
                    { level: "Easy" as PracticeDifficulty, label: "Easy", sub: "1-2 Steps" },
                    { level: "Moderate" as PracticeDifficulty, label: "Moderate", sub: "Speed & Acc." },
                    { level: "Exam Level" as PracticeDifficulty, label: "Exam Level", sub: "Official Pattern" },
                    { level: "Hard" as PracticeDifficulty, label: "Hard", sub: "Multi-condition" },
                  ].map((diff) => (
                    <button
                      key={diff.level}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff.level)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedDifficulty === diff.level
                          ? "border-forest-900 bg-forest-900 text-white font-bold shadow-xs ring-1 ring-forest-900"
                          : "border-charcoal-200 bg-white text-charcoal-800 hover:border-forest-300"
                      }`}
                    >
                      <div className="text-xs">{diff.label}</div>
                      <div
                        className={`text-[9px] mt-0.5 ${
                          selectedDifficulty === diff.level ? "text-almond-200" : "text-charcoal-500"
                        }`}
                      >
                        {diff.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions (5, 10, 20) */}
              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-2.5">
                  4. Number of Questions
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[5, 10, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSelectedCount(num)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedCount === num
                          ? "border-forest-900 bg-forest-50 text-forest-950 font-bold ring-1 ring-forest-900"
                          : "border-charcoal-200 bg-white text-charcoal-800 hover:border-charcoal-300"
                      }`}
                    >
                      <div className="text-sm font-bold">{num}</div>
                      <div className="text-[10px] text-charcoal-500">Questions</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8 pt-5 border-t border-charcoal-100 flex items-center justify-between gap-4">
              <Button
                href={`/exams/${exam.id}/${subject.id}/${currentTopic.id}/learn`}
                variant="outline"
                size="md"
              >
                Back to Learn
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleStartPractice}
                leftIcon={<Sparkles className="w-4 h-4 mr-1 text-amber-300" />}
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Start Practice with Axmok AI
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. LOADING STATE                                                  */}
      {/* ================================================================= */}
      {practiceState === "loading" && (
        <div className="max-w-xl mx-auto py-16 text-center space-y-6 animate-in fade-in duration-300">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-3xl bg-forest-900 text-white flex items-center justify-center mx-auto shadow-xl ring-4 ring-forest-100 animate-pulse">
              <AxmokAvatar size="lg" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-charcoal-900 flex items-center justify-center shadow">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-charcoal-900 mb-1">
              Axmok AI is preparing your questions...
            </h2>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto leading-relaxed">
              Synthesizing syllabus requirements for {exam.name} ({currentTopic.name}) at{" "}
              {selectedDifficulty} difficulty.
            </p>
          </div>

          <div className="max-w-xs mx-auto p-3.5 rounded-2xl bg-white border border-charcoal-200/80 shadow-xs text-xs font-medium text-forest-800 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-forest-700 animate-ping" />
            <span>{loadingStep}</span>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. ACTIVE QUESTION INTERACTION                                    */}
      {/* ================================================================= */}
      {practiceState === "active" && currentQuestion && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
          {/* Top Status & Progress Bar */}
          <div className="p-4 rounded-2xl bg-white border border-charcoal-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <DifficultyBadge difficulty={currentQuestion.difficulty as PracticeDifficulty} />
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-charcoal-900">{currentTopic.name}</span>
                  {(currentQuestion.subtopicName || (selectedSubtopicId !== "all" && subtopics.find((s) => s.id === selectedSubtopicId)?.name)) && (
                    <Badge variant="forest" size="sm">
                      {currentQuestion.subtopicName || subtopics.find((s) => s.id === selectedSubtopicId)?.name}
                    </Badge>
                  )}
                  {currentQuestion.questionPattern && (
                    <Badge variant="outline" size="sm">
                      {currentQuestion.questionPattern}
                    </Badge>
                  )}
                </div>
                <div className="text-[11px] text-charcoal-500 mt-0.5">
                  {exam.name} • {subject.name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-charcoal-600 font-mono bg-charcoal-50 px-2.5 py-1 rounded-lg border border-charcoal-200">
                <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>

              <div className="sm:w-48">
                <div className="flex justify-between items-center text-xs font-semibold text-charcoal-800 mb-1">
                  <span>Progress</span>
                  <span className="text-forest-900 font-bold">
                    {currentIndex + 1} of {questions.length}
                  </span>
                </div>
                <ProgressBar
                  value={((currentIndex + 1) / questions.length) * 100}
                  height="xs"
                  variant="forest"
                />
              </div>
            </div>
          </div>

          {/* Question Card */}
          <Card variant="default" padding="lg" className="border border-charcoal-200/80 shadow-card">
            <div className="flex items-center justify-between text-xs text-charcoal-500 mb-4 pb-3 border-b border-charcoal-100">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-forest-900 uppercase tracking-wider text-xs">
                  Question {currentIndex + 1}
                </span>
                <span className="text-charcoal-300">•</span>
                <span className="text-charcoal-600">Single Choice</span>
              </div>
              <div className="text-xs font-medium text-charcoal-500">
                Score: <span className="font-bold text-forest-800">{correctCount}</span>/{currentIndex}
              </div>
            </div>

            {/* Question Stem */}
            <h2 className="text-base sm:text-lg font-semibold text-charcoal-900 mb-6 leading-relaxed whitespace-pre-line">
              {currentQuestion.questionText}
            </h2>

            {/* Options (A, B, C, D) */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option) => {
                const isChosen = selectedOption === option.id;
                const isCorrectOption =
                  option.id.toUpperCase() === currentQuestion.correctAnswer.toUpperCase();

                let style =
                  "border-charcoal-200 bg-white hover:border-forest-400 hover:bg-forest-50/20 text-charcoal-800";

                if (isAnswerSubmitted) {
                  if (isCorrectOption) {
                    style =
                      "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                  } else if (isChosen && !isCorrectOption) {
                    style =
                      "border-rose-400 bg-rose-50 text-rose-950 font-medium ring-1 ring-rose-300";
                  } else {
                    style = "border-charcoal-200/60 bg-charcoal-50/50 text-charcoal-400 opacity-70";
                  }
                } else if (isChosen) {
                  style =
                    "border-forest-900 bg-forest-50 text-forest-950 font-bold ring-2 ring-forest-900/20";
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-150 ${style}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                          isAnswerSubmitted && isCorrectOption
                            ? "bg-emerald-600 text-white"
                            : isAnswerSubmitted && isChosen && !isCorrectOption
                            ? "bg-rose-500 text-white"
                            : isChosen
                            ? "bg-forest-900 text-white"
                            : "bg-charcoal-100 text-charcoal-700"
                        }`}
                      >
                        {option.id}
                      </span>
                      <span className="text-sm">{option.text}</span>
                    </div>

                    {isAnswerSubmitted && isCorrectOption && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <Check className="w-4 h-4 stroke-[3]" /> Correct
                      </span>
                    )}

                    {isAnswerSubmitted && isChosen && !isCorrectOption && (
                      <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Incorrect
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Feedback & Axmok Explanation Breakdown (Revealed after submission) */}
            {isAnswerSubmitted && (
              <div className="space-y-4 mb-6 animate-in fade-in-50 duration-200">
                {/* Result Feedback Banner */}
                {selectedOption?.toUpperCase() === currentQuestion.correctAnswer.toUpperCase() ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">Correct! Well deduced.</span> You nailed the core logic
                      for this {currentTopic.name} problem.
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs flex items-start gap-2.5">
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Incorrect answer.</span> The correct answer is Option{" "}
                      <span className="font-extrabold">{currentQuestion.correctAnswer}</span>. Read the
                      step-by-step logic below to cement the concept.
                    </div>
                  </div>
                )}

                {/* Structured Axmok Explanation Card */}
                <div className="p-5 rounded-2xl bg-almond-50/70 border border-almond-200/90 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-forest-900 text-xs">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Axmok AI Step-by-Step Breakdown</span>
                    </div>
                    <Badge variant="neutral" size="sm">
                      Correct: Option {currentQuestion.correctAnswer}
                    </Badge>
                  </div>

                  {/* Why / Step-by-Step */}
                  <div className="text-xs text-charcoal-800 leading-relaxed space-y-1">
                    <div className="font-bold text-charcoal-900">Why it&apos;s correct:</div>
                    <p className="whitespace-pre-line">{currentQuestion.explanation}</p>
                  </div>

                  {/* Axmok Shortcut */}
                  {currentQuestion.shortcut && (
                    <div className="pt-2.5 border-t border-almond-200/60 flex items-start gap-2 text-xs">
                      <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-900">Axmok Shortcut: </span>
                        <span className="text-charcoal-700">{currentQuestion.shortcut}</span>
                      </div>
                    </div>
                  )}

                  {/* Common Mistake / Examiner Trap */}
                  {currentQuestion.commonMistake && (
                    <div className="pt-2 border-t border-almond-200/60 flex items-start gap-2 text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-rose-900">Examiner Trap: </span>
                        <span className="text-charcoal-700">{currentQuestion.commonMistake}</span>
                      </div>
                    </div>
                  )}

                  {/* Short Learning Tip */}
                  {currentQuestion.learningTip && (
                    <div className="pt-2 border-t border-almond-200/60 flex items-start gap-2 text-xs">
                      <Lightbulb className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-forest-900">Learning Tip: </span>
                        <span className="text-charcoal-700">{currentQuestion.learningTip}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="pt-4 border-t border-charcoal-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPracticeState("config")}
                  leftIcon={<ArrowLeft className="w-4 h-4 mr-1" />}
                >
                  Quit Session
                </Button>

                <button
                  type="button"
                  onClick={handleStartPractice}
                  title="Generate a completely new set of questions"
                  className="px-3 py-1.5 rounded-xl border border-charcoal-200 hover:border-forest-500 hover:bg-forest-50 text-charcoal-700 hover:text-forest-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-forest-700" />
                  <span>Regenerate Different Questions</span>
                </button>
              </div>

              {!isAnswerSubmitted ? (
                <Button
                  variant="primary"
                  size="md"
                  disabled={!selectedOption}
                  onClick={handleSubmitAnswer}
                  leftIcon={<Check className="w-4 h-4 mr-1" />}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNextQuestion}
                  rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                >
                  {currentIndex < questions.length - 1 ? "Next Question" : "Complete & View Results"}
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. PRACTICE RESULTS VIEW                                          */}
      {/* ================================================================= */}
      {practiceState === "results" && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
          {/* Result Card */}
          <Card variant="default" padding="lg" className="border border-charcoal-200/90 shadow-card">
            {/* Header with Axmok Mascot */}
            <div className="text-center pb-6 border-b border-charcoal-100 space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-forest-900 text-white flex items-center justify-center mx-auto shadow-lg mb-3">
                <Trophy className="w-8 h-8 text-amber-300" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal-900">
                Practice Session Completed!
              </h2>
              <p className="text-xs text-charcoal-500">
                {currentTopic.name} • {subject.name} • {exam.name}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Practice attempt securely recorded</span>
              </div>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 text-center">
              <div className="p-3.5 rounded-2xl bg-charcoal-50 border border-charcoal-100">
                <div className="text-xs text-charcoal-500">Total Questions</div>
                <div className="text-xl font-extrabold text-charcoal-900 mt-0.5">
                  {questions.length}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs text-emerald-700 font-medium">Correct</div>
                <div className="text-xl font-extrabold text-emerald-900 mt-0.5">
                  {attemptsLog.filter((a) => a.isCorrect).length}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                <div className="text-xs text-rose-700 font-medium">Incorrect</div>
                <div className="text-xl font-extrabold text-rose-900 mt-0.5">
                  {attemptsLog.filter((a) => !a.isCorrect).length}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-forest-50 border border-forest-200">
                <div className="text-xs text-forest-800 font-medium">Accuracy</div>
                <div className="text-xl font-extrabold text-forest-950 mt-0.5">
                  {questions.length > 0
                    ? Math.round(
                        (attemptsLog.filter((a) => a.isCorrect).length / questions.length) * 100
                      )
                    : 0}
                  %
                </div>
              </div>
            </div>

            {/* Details Strip */}
            <div className="p-3.5 rounded-2xl bg-white border border-charcoal-200/80 text-xs text-charcoal-600 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center mb-6">
              <div>
                <span className="text-charcoal-400">Time Taken:</span>{" "}
                <span className="font-semibold text-charcoal-900">{formatTime(elapsedSeconds)}</span>
              </div>
              <div>
                <span className="text-charcoal-400">Difficulty:</span>{" "}
                <span className="font-semibold text-charcoal-900">{selectedDifficulty}</span>
              </div>
              <div>
                <span className="text-charcoal-400">Mode:</span>{" "}
                <span className="font-semibold text-charcoal-900 capitalize">{selectedMode}</span>
              </div>
              <div>
                <span className="text-charcoal-400">Avg Pace:</span>{" "}
                <span className="font-semibold text-charcoal-900">
                  {questions.length > 0 ? Math.round(elapsedSeconds / questions.length) : 0}s/q
                </span>
              </div>
            </div>

            {/* "Ask Axmok AI" Interactive Section */}
            <div className="p-5 rounded-3xl bg-forest-900 text-white shadow-md border border-forest-800 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold text-white">Ask Axmok AI: Post-Session Coaching</h3>
              </div>
              <p className="text-xs text-almond-100">
                Axmok AI has evaluated your performance on this set. Choose an intelligent next step:
              </p>

              {/* Action Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExplainMistakes}
                  disabled={isExplainingMistakes}
                  className="px-3 py-1.5 rounded-full bg-forest-800 hover:bg-forest-700 text-xs font-medium text-almond-100 border border-forest-700 flex items-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
                  {isExplainingMistakes ? "Analyzing mistakes..." : "Explain my mistakes"}
                </button>

                <button
                  type="button"
                  onClick={handleStartPractice}
                  className="px-3 py-1.5 rounded-full bg-forest-800 hover:bg-forest-700 text-xs font-medium text-almond-100 border border-forest-700 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-300" />
                  Give me similar questions
                </button>

                <Link
                  href={`/exams/${exam.id}/${subject.id}/${currentTopic.id}/learn`}
                  className="px-3 py-1.5 rounded-full bg-forest-800 hover:bg-forest-700 text-xs font-medium text-almond-100 border border-forest-700 flex items-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-300" />
                  Teach my weak areas
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDifficulty("Hard");
                    handleStartPractice();
                  }}
                  className="px-3 py-1.5 rounded-full bg-forest-800 hover:bg-forest-700 text-xs font-medium text-almond-100 border border-forest-700 flex items-center gap-1.5 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Increase difficulty
                </button>
              </div>

              {/* AI Coaching Output Drawer */}
              {mistakesExplanation && (
                <div className="p-4 rounded-2xl bg-forest-950/90 border border-forest-700 text-xs text-almond-100 space-y-2 mt-3 animate-in fade-in">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Axmok Diagnostic Analysis
                  </div>
                  <div className="leading-relaxed whitespace-pre-line text-xs font-normal">
                    {mistakesExplanation}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="mt-8 pt-5 border-t border-charcoal-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setPracticeState("config")}
                leftIcon={<RotateCcw className="w-4 h-4 mr-1" />}
              >
                Practice Again
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  href={`/exams/${exam.id}/${subject.id}/${currentTopic.id}/learn`}
                  variant="secondary"
                  size="md"
                  leftIcon={<BookOpen className="w-4 h-4 mr-1" />}
                >
                  Go to Topic Syllabus
                </Button>

                <Button
                  href={`/exams/${exam.id}/${subject.id}`}
                  variant="primary"
                  size="md"
                  rightIcon={<ChevronRight className="w-4 h-4 ml-1" />}
                >
                  Next Subject Topic
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
