"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/services/auth/auth-context";
import { getTestBlueprint, getExamBlueprint } from "@/lib/data/examBlueprints";
import { getTopicsForSubject, getTopicById } from "@/lib/data/topicRegistry";
import { getSubjectById } from "@/lib/data/subjectRegistry";
import { getExamById } from "@/lib/data/examCatalogue";
import { AxmokQuestionService } from "@/services/ai/axmok-question-service";
import {
  Question,
  TestAnalysisResult,
  SectionPerformance,
  TopicPerformanceAnalysis,
} from "@/lib/types/question";
import {
  Clock,
  Flag,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Layers,
  ShieldAlert,
} from "lucide-react";

type QuestionState = "not_visited" | "not_answered" | "answered" | "marked_review";

function TestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuth();

  const paramExamId = searchParams.get("examId");
  const paramSubjectId = searchParams.get("subjectId");
  const paramTopicId = searchParams.get("topic") || searchParams.get("topicId");
  const paramType = searchParams.get("type") as "full_mock" | "mini_mock" | "sectional" | null;

  // Resolve exam ID: URL query -> profile target exam -> profile current exam -> default sbi-po
  const examId = useMemo(() => {
    if (paramExamId) return paramExamId;
    if (profile?.examId) return profile.examId;
    if (profile?.currentExam && profile.currentExam !== "None") return profile.currentExam;
    return "sbi-po";
  }, [paramExamId, profile?.examId, profile?.currentExam]);

  const examBp = useMemo(() => getExamBlueprint(examId), [examId]);
  const examCatalogueItem = useMemo(() => getExamById(examId), [examId]);

  // Construct blueprint dynamically based on whether this is a topic drill, sectional test, or full/mini mock
  const blueprint = useMemo(() => {
    // 1. Topic Diagnostic Drill (if specific topic requested)
    if (paramTopicId) {
      const topicObj = getTopicById(paramTopicId, examId, paramSubjectId || undefined);
      const subId = paramSubjectId || topicObj?.subjectId || examBp.sections[0]?.subjectId || "general";
      const topicTitle = topicObj?.name || paramTopicId.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const examName = examBp.examName || examCatalogueItem?.name || "Exam";

      return {
        examId,
        examName,
        testTitle: `${topicTitle} • Topic Diagnostic Drill`,
        type: "sectional" as const,
        sections: [
          {
            id: paramTopicId,
            name: `${topicTitle} Drill`,
            subjectId: subId,
            questionCount: 15,
            durationMinutes: 15,
            marksPerQuestion: examBp.markingScheme.positiveMarks || 1,
            negativeMarks: examBp.markingScheme.negativeMarks || 0.25,
            cutoffExpected: 9,
          },
        ],
        totalDurationMinutes: 15,
        totalQuestions: 15,
        totalMarks: 15 * (examBp.markingScheme.positiveMarks || 1),
        markingScheme: examBp.markingScheme.penaltyDescription || "1 mark per question, 0.25 negative marks",
        negativeMarking: examBp.negativeMarking,
        difficultyDistribution: {
          easyPercent: 30,
          moderatePercent: 50,
          hardPercent: 20,
        },
      };
    }

    // 2. Subject Sectional Test (if specific subject requested)
    if (paramSubjectId) {
      const subObj = getSubjectById(paramSubjectId, examId);
      const subTitle = subObj?.name || paramSubjectId.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const examName = examBp.examName || examCatalogueItem?.name || "Exam";
      const subjectSec = examBp.sections.find((s) => s.subjectId === paramSubjectId || s.id === paramSubjectId);

      const qCount = subjectSec?.questionCount || 20;
      const dMinutes = subjectSec?.durationMinutes || 20;

      return {
        examId,
        examName,
        testTitle: `${examName} • ${subTitle} Sectional Test`,
        type: "sectional" as const,
        sections: [
          {
            id: paramSubjectId,
            name: subTitle,
            subjectId: paramSubjectId,
            questionCount: qCount,
            durationMinutes: dMinutes,
            marksPerQuestion: subjectSec?.marksPerQuestion || examBp.markingScheme.positiveMarks || 1,
            negativeMarks: subjectSec?.negativeMarks || examBp.markingScheme.negativeMarks || 0.25,
            cutoffExpected: Math.round(qCount * 0.5),
          },
        ],
        totalDurationMinutes: dMinutes,
        totalQuestions: qCount,
        totalMarks: qCount * (examBp.markingScheme.positiveMarks || 1),
        markingScheme: examBp.markingScheme.penaltyDescription || "Sectional negative marking applies",
        negativeMarking: examBp.negativeMarking,
        difficultyDistribution: {
          easyPercent: 25,
          moderatePercent: 55,
          hardPercent: 20,
        },
      };
    }

    // 3. Exam Mock Test (full_mock or mini_mock)
    const testType = paramType === "full_mock" ? "full_mock" : "mini_mock";
    return getTestBlueprint(examId, testType);
  }, [paramTopicId, paramSubjectId, paramType, examId, examBp, examCatalogueItem]);

  // Construct questions for each section dynamically from syllabus
  const testQuestions: Question[] = useMemo(() => {
    const list: Question[] = [];

    // If specific topic drill requested
    if (paramTopicId) {
      const topicObj = getTopicById(paramTopicId, examId, paramSubjectId || undefined);
      const sec = blueprint.sections[0];
      const topicName = topicObj?.name || paramTopicId.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const subId = sec?.subjectId || paramSubjectId || "general";
      const subObj = getSubjectById(subId, examId);
      const subjectName = subObj?.name || "Subject";

      const topicSubtopics = topicObj && "subtopics" in topicObj && Array.isArray((topicObj as unknown as { subtopics: { name: string }[] }).subtopics)
        ? (topicObj as unknown as { subtopics: { name: string }[] }).subtopics
        : [];

      for (let i = 0; i < blueprint.totalQuestions; i++) {
        const subtopicName = topicSubtopics[i % (topicSubtopics.length || 1)]?.name || `${topicName} Practice`;
        const diff = (["Easy", "Medium", "Exam Level"][i % 3]) as string;

        const fallbackBatch = AxmokQuestionService.generateCurriculumFallbackQuestions({
          examId,
          examName: blueprint.examName,
          subjectId: subId,
          subjectName: subjectName,
          topicId: paramTopicId,
          topicName: topicName,
          subtopicName,
          difficulty: diff,
          count: 1,
        });

        const baseQ = fallbackBatch[0];
        list.push({
          ...baseQ,
          id: `topic-drill-q-${i + 1}`,
          sectionId: sec?.id || paramTopicId,
          sectionName: sec?.name || topicName,
          topicId: paramTopicId,
          topicName: topicName,
          marks: sec?.marksPerQuestion || 1,
          negativeMarks: sec?.negativeMarks || 0.25,
          examTag: `${blueprint.examName} • ${topicName}`,
        });
      }
      return list;
    }

    // Exam or Subject Sectional Test
    for (const sec of blueprint.sections) {
      const topics = getTopicsForSubject(sec.subjectId, examId);
      const safeTopics = topics.length > 0 ? topics : [{ id: sec.subjectId, name: sec.name }];

      for (let i = 0; i < sec.questionCount; i++) {
        const topic = safeTopics[i % safeTopics.length];
        const topicSubtopics = "subtopics" in topic && Array.isArray((topic as unknown as { subtopics: { name: string }[] }).subtopics)
          ? (topic as unknown as { subtopics: { name: string }[] }).subtopics
          : [];
        const subtopicName = topicSubtopics[i % (topicSubtopics.length || 1)]?.name || `${topic.name} Core Practice`;

        const fallbackBatch = AxmokQuestionService.generateCurriculumFallbackQuestions({
          examId,
          examName: blueprint.examName,
          subjectId: sec.subjectId,
          subjectName: sec.name,
          topicId: topic.id,
          topicName: topic.name,
          subtopicName,
          difficulty: "Exam Level",
          count: 1,
        });

        const baseQ = fallbackBatch[0];
        list.push({
          ...baseQ,
          id: `test-q-${sec.id}-${i + 1}`,
          sectionId: sec.id,
          sectionName: sec.name,
          topicId: topic.id,
          topicName: topic.name,
          marks: sec.marksPerQuestion,
          negativeMarks: sec.negativeMarks,
          examTag: `${blueprint.examName} • ${sec.name}`,
        });
      }
    }

    return list;
  }, [blueprint, examId, paramTopicId, paramSubjectId]);

  const totalQuestions = testQuestions.length || 20;

  // State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState<string>(blueprint.sections[0]?.id || "");
  const [timeLeft, setTimeLeft] = useState(blueprint.totalDurationMinutes * 60);
  const [paletteMobileOpen, setPaletteMobileOpen] = useState(false);

  const [questionStates, setQuestionStates] = useState<Record<number, QuestionState>>({
    0: "not_answered",
  });
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});

  // Reset states whenever blueprint or test questions change
  useEffect(() => {
    setTimeLeft(blueprint.totalDurationMinutes * 60);
    setActiveSectionId(blueprint.sections[0]?.id || "");
    setCurrentQIndex(0);
    setQuestionStates({ 0: "not_answered" });
    setSelectedOptions({});
  }, [blueprint]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQuestion = testQuestions[currentQIndex] || testQuestions[0];

  // Sync active section with current question
  useEffect(() => {
    if (currentQuestion?.sectionId && currentQuestion.sectionId !== activeSectionId) {
      setActiveSectionId(currentQuestion.sectionId);
    }
  }, [currentQuestion, activeSectionId]);

  const handleSelect = (optId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [currentQIndex]: optId }));
    setQuestionStates((prev) => ({
      ...prev,
      [currentQIndex]: "answered",
    }));
  };

  const handleMarkReview = () => {
    setQuestionStates((prev) => ({
      ...prev,
      [currentQIndex]: "marked_review",
    }));
    handleNext();
  };

  const handleNext = () => {
    if (currentQIndex < totalQuestions - 1) {
      setCurrentQIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex((i) => i - 1);
    }
  };

  // Jump to first question of a section
  const handleSectionSwitch = (secId: string) => {
    setActiveSectionId(secId);
    const firstIdx = testQuestions.findIndex((q) => q.sectionId === secId);
    if (firstIdx >= 0) {
      setCurrentQIndex(firstIdx);
    }
  };

  // Finish and compute detailed section & topic report
  const handleSubmitTest = async () => {
    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    const answeredCount = Object.keys(selectedOptions).length;
    const timeTaken = blueprint.totalDurationMinutes * 60 - timeLeft;

    // 1. Calculate section breakdown
    const sectionStatsMap: Record<string, { total: number; attempted: number; correct: number; incorrect: number; marks: number }> = {};
    for (const sec of blueprint.sections) {
      sectionStatsMap[sec.id] = { total: 0, attempted: 0, correct: 0, incorrect: 0, marks: 0 };
    }

    // 2. Calculate topic breakdown
    const topicStatsMap: Record<string, { topicName: string; total: number; correct: number }> = {};

    testQuestions.forEach((q, idx) => {
      const secId = q.sectionId || "default";
      if (!sectionStatsMap[secId]) {
        sectionStatsMap[secId] = { total: 0, attempted: 0, correct: 0, incorrect: 0, marks: 0 };
      }
      sectionStatsMap[secId].total += 1;

      const tId = q.topicId || "general";
      if (!topicStatsMap[tId]) {
        topicStatsMap[tId] = { topicName: q.topicName || "General Topic", total: 0, correct: 0 };
      }
      topicStatsMap[tId].total += 1;

      const userChoice = selectedOptions[idx];
      const posMarks = q.marks || 1;
      const negMarks = q.negativeMarks || 0;

      if (userChoice !== undefined) {
        sectionStatsMap[secId].attempted += 1;
        if (userChoice.toUpperCase() === q.correctAnswer.toUpperCase()) {
          correctCount++;
          sectionStatsMap[secId].correct += 1;
          sectionStatsMap[secId].marks += posMarks;
          topicStatsMap[tId].correct += 1;
          totalScore += posMarks;
        } else {
          wrongCount++;
          sectionStatsMap[secId].incorrect += 1;
          sectionStatsMap[secId].marks -= negMarks;
          totalScore -= negMarks;
        }
      }
    });

    const finalRawScore = Math.max(0, Number(totalScore.toFixed(2)));

    // Sections array
    const sectionsPerformance: SectionPerformance[] = blueprint.sections.map((sec) => {
      const stats = sectionStatsMap[sec.id] || { total: sec.questionCount, attempted: 0, correct: 0, incorrect: 0, marks: 0 };
      const secAccuracy = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
      return {
        sectionId: sec.id,
        sectionName: sec.name,
        totalQuestions: stats.total,
        attempted: stats.attempted,
        correct: stats.correct,
        incorrect: stats.incorrect,
        skipped: stats.total - stats.attempted,
        marksObtained: Number(stats.marks.toFixed(2)),
        totalMarks: stats.total * sec.marksPerQuestion,
        accuracy: secAccuracy,
        timeSpentSeconds: Math.round(timeTaken / (blueprint.sections.length || 1)),
      };
    });

    // Topics array
    const topicsPerformance: TopicPerformanceAnalysis[] = Object.entries(topicStatsMap).map(([tId, val]) => {
      const acc = val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0;
      const status: "strong" | "moderate" | "weak" = acc >= 80 ? "strong" : acc < 60 ? "weak" : "moderate";
      return {
        topicId: tId,
        topicName: val.topicName,
        total: val.total,
        correct: val.correct,
        accuracy: acc,
        status,
      };
    });

    const weakTopics = topicsPerformance.filter((t) => t.status === "weak").map((t) => t.topicName);
    const strongTopics = topicsPerformance.filter((t) => t.status === "strong").map((t) => t.topicName);

    // Axmok 4-step recovery plan recommendations
    const recommendations: string[] = [
      `Review core definitions and operative constraints for ${weakTopics.length > 0 ? weakTopics.slice(0, 2).join(" & ") : "identified difficult questions"}.`,
      "Practice 10 targeted elimination drills before attempting full timed sections.",
      "Apply Axmok AI speed shortcuts to reduce per-question solving time by 25-35%.",
      "Retake an exam-calibrated mini mock in 48 hours to measure accuracy retention.",
    ];

    const analysisResult: TestAnalysisResult = {
      testId: `test-${Date.now()}`,
      testTitle: blueprint.testTitle,
      examId,
      examName: blueprint.examName,
      totalQuestions,
      attempted: answeredCount,
      correct: correctCount,
      incorrect: wrongCount,
      skipped: totalQuestions - answeredCount,
      rawMarks: finalRawScore,
      totalMarks: blueprint.totalMarks,
      accuracy: answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0,
      timeTakenSeconds: timeTaken,
      averageTimePerQuestion: answeredCount > 0 ? Math.round(timeTaken / answeredCount) : 0,
      sections: sectionsPerformance,
      topics: topicsPerformance,
      weakTopics,
      strongTopics,
      aiSummary: `You scored ${finalRawScore} out of ${blueprint.totalMarks} marks in ${blueprint.testTitle}. ${
        weakTopics.length > 0
          ? `Focus immediate attention on ${weakTopics.slice(0, 2).join(", ")} where accuracy fell below 60%.`
          : "Exceptional sectional balance! Proceed to exam-level full mocks."
      }`,
      recommendations,
    };

    // Store in sessionStorage for results page
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("last_test_analysis", JSON.stringify(analysisResult));
      }
    } catch (e) {
      console.warn("Could not save to sessionStorage:", e);
    }

    // Record progress in database
    try {
      await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          subjectId: paramSubjectId || blueprint.sections[0]?.subjectId || "all-sections",
          topicId: paramTopicId || "mock-test",
          topicName: blueprint.testTitle,
          totalQuestions: answeredCount,
          correctAnswers: correctCount,
          incorrectAnswers: wrongCount,
          timeSpentSeconds: timeTaken,
        }),
      });
    } catch (e) {
      console.warn("Could not record practice session:", e);
    }

    router.push(
      `/tests/result?score=${finalRawScore}&total=${blueprint.totalMarks}&correct=${correctCount}&wrong=${wrongCount}&time=${timeTaken}&answered=${answeredCount}`
    );
  };

  // Counts for legend
  const answeredCount = Object.values(questionStates).filter((s) => s === "answered").length;
  const markedCount = Object.values(questionStates).filter((s) => s === "marked_review").length;
  const notAnsweredCount = totalQuestions - answeredCount - markedCount;

  return (
    <div className="min-h-screen bg-charcoal-50 flex flex-col justify-between select-none">
      {/* ================= TEST TOP BAR ================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-charcoal-200 px-4 sm:px-6 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Logo size="sm" href="/dashboard" />
          <span className="hidden sm:inline-block h-4 w-px bg-charcoal-200" />
          <div>
            <span className="text-sm font-bold text-charcoal-900 block leading-tight">
              {blueprint.testTitle}
            </span>
            <span className="text-[10px] text-charcoal-500 hidden sm:inline-block">
              {examBp.organization} • Syllabus v{examBp.syllabusVersion}
            </span>
          </div>
          <span className="hidden md:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-md bg-forest-50 text-forest-800 border border-forest-100">
            {blueprint.type === "mini_mock" ? "Sprint Mock" : "Full Exam"}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          {/* Question Indicator */}
          <div className="text-xs sm:text-sm font-semibold text-charcoal-700">
            Q: <strong className="text-charcoal-900 font-bold">{currentQIndex + 1}</strong> / {totalQuestions}
          </div>

          {/* Timer Clock */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-900 text-white font-mono font-bold text-xs sm:text-sm shadow-xs">
            <Clock className="w-4 h-4 text-almond-200" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          {/* Mobile palette trigger */}
          <button
            type="button"
            onClick={() => setPaletteMobileOpen(!paletteMobileOpen)}
            className="lg:hidden p-2 rounded-lg text-charcoal-700 hover:bg-charcoal-100"
            aria-label="Toggle Question Palette"
          >
            {paletteMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ================= SECTION TABS NAVIGATION ================= */}
      <div className="bg-white border-b border-charcoal-200 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 hidden sm:inline-flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-forest-700" /> Sections:
            </span>
            {blueprint.sections.map((sec) => {
              const isActive = sec.id === activeSectionId;
              const secQuestions = testQuestions.filter((q) => q.sectionId === sec.id);
              const secAnswered = secQuestions.filter((q) => {
                const globalIdx = testQuestions.indexOf(q);
                return questionStates[globalIdx] === "answered";
              }).length;

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleSectionSwitch(sec.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-forest-900 text-white shadow-xs"
                      : "bg-charcoal-50 text-charcoal-700 hover:bg-charcoal-100 border border-charcoal-200"
                  }`}
                >
                  <span>{sec.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isActive ? "bg-forest-800 text-almond-200" : "bg-charcoal-200 text-charcoal-700"
                    }`}
                  >
                    {secAnswered}/{sec.questionCount}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-charcoal-500 hidden md:block">
            {blueprint.markingScheme}
          </div>
        </div>
      </div>

      {/* ================= MAIN TEST INTERFACE ================= */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center (8 cols): Question Canvas */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white rounded-2xl border border-charcoal-200 p-6 sm:p-8 shadow-subtle min-h-[520px]">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-charcoal-100 text-xs text-charcoal-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-forest-900 uppercase tracking-wide">
                  {currentQuestion?.sectionName || "Section"}
                </span>
                <span className="text-charcoal-300">•</span>
                <span className="text-charcoal-600 font-medium">
                  {currentQuestion?.topicName || "Syllabus Question"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-700 font-bold">+{currentQuestion?.marks || 1}.00 Mark</span>
                <span className="text-rose-700 font-bold">
                  -{currentQuestion?.negativeMarks ?? 0.25} Negative
                </span>
              </div>
            </div>

            {/* Question Text */}
            <h2 className="text-base sm:text-lg font-semibold text-charcoal-900 mb-6 leading-relaxed whitespace-pre-line">
              {currentQuestion?.questionText}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQuestion?.options.map((opt) => {
                const isSelected = selectedOptions[currentQIndex] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? "border-forest-900 bg-forest-50 text-forest-950 font-semibold ring-1 ring-forest-900"
                        : "border-charcoal-200 bg-white hover:bg-charcoal-50 text-charcoal-800"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                        isSelected
                          ? "bg-forest-900 text-white"
                          : "bg-charcoal-100 text-charcoal-700"
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="text-sm">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="pt-4 border-t border-charcoal-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentQIndex === 0}
                leftIcon={<ArrowLeft className="w-4 h-4 mr-1" />}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleMarkReview}
                leftIcon={<Flag className="w-3.5 h-3.5 mr-1 text-amber-700" />}
              >
                Mark for Review
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {currentQIndex < totalQuestions - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                >
                  Next Question
                </Button>
              ) : null}

              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitTest}
                className="bg-forest-800 hover:bg-forest-900 text-white"
              >
                Submit Test
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side (4 cols): Question Palette */}
        <div
          className={`lg:col-span-4 bg-white rounded-2xl border border-charcoal-200 p-6 shadow-subtle ${
            paletteMobileOpen ? "block" : "hidden lg:block"
          }`}
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-charcoal-100">
            <h3 className="text-sm font-bold text-charcoal-900">Question Palette</h3>
            <Badge variant="outline" size="sm">
              {blueprint.examName}
            </Badge>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-forest-900" />
              <span className="text-charcoal-600">Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-charcoal-600">Review ({markedCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-charcoal-200" />
              <span className="text-charcoal-600">Unanswered ({notAnsweredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-forest-900" />
              <span className="text-charcoal-600">Current</span>
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2.5 mb-6 max-h-[280px] overflow-y-auto p-1">
            {testQuestions.map((q, idx) => {
              const state = questionStates[idx] || "not_answered";
              const isCurrent = idx === currentQIndex;
              const isCurrentSection = q.sectionId === activeSectionId;

              let btnStyle = "bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200";
              if (state === "answered") {
                btnStyle = "bg-forest-900 text-white font-bold";
              } else if (state === "marked_review") {
                btnStyle = "bg-amber-500 text-white font-bold";
              }

              if (isCurrent) {
                btnStyle += " ring-2 ring-forest-900 ring-offset-2";
              } else if (!isCurrentSection) {
                btnStyle += " opacity-60";
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setCurrentQIndex(idx);
                    setPaletteMobileOpen(false);
                  }}
                  className={`h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${btnStyle}`}
                  title={`${q.sectionName} - Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Test Guidelines & Finish Trigger */}
          <div className="pt-4 border-t border-charcoal-100 space-y-3">
            <div className="text-[11px] text-charcoal-600 flex items-start gap-1.5 bg-almond-50/70 p-2.5 rounded-xl border border-almond-200/80">
              <ShieldAlert className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
              <span>
                {blueprint.negativeMarking
                  ? `Strict negative marking applies. Each wrong answer incurs a ${blueprint.sections[0]?.negativeMarks} mark penalty.`
                  : "No negative marking applies for this examination."}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSubmitTest}
              className="w-full justify-center text-forest-900 border-forest-700"
            >
              Submit & View Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-charcoal-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-forest-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-charcoal-700">Loading Exam & Questions...</p>
          </div>
        </div>
      }
    >
      <TestContent />
    </Suspense>
  );
}
