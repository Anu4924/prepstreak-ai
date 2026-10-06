"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/services/auth/auth-context";
import { TestAnalysisResult } from "@/lib/types/question";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Award,
  Layers,
  TrendingUp,
} from "lucide-react";

function TestResultContent() {
  const searchParams = useSearchParams();
  const { profile } = useAuth();

  const [analysis, setAnalysis] = useState<TestAnalysisResult | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem("last_test_analysis");
        if (stored) {
          const parsed = JSON.parse(stored) as TestAnalysisResult;
          setAnalysis(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not read test analysis from sessionStorage:", e);
    }
  }, []);

  const rawScore = searchParams.get("score");
  const rawTotal = searchParams.get("total");
  const rawCorrect = searchParams.get("correct");
  const rawWrong = searchParams.get("wrong");
  const rawTime = searchParams.get("time");
  const rawAnswered = searchParams.get("answered");

  const hasResult = analysis !== null || rawScore !== null || rawCorrect !== null;

  if (!hasResult) {
    return (
      <AppShell>
        <PageHeader
          title="Test Results"
          subtitle="View score reports, time analytics, and topic diagnostics from your completed tests."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Tests", href: "/tests" },
            { label: "Results" },
          ]}
        />

        <div className="max-w-xl mx-auto py-12 text-center">
          <Card variant="default" padding="lg" className="border border-charcoal-200 text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-800 mx-auto">
              <Award className="w-8 h-8 text-forest-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-charcoal-900 mb-1">No tests completed yet</h2>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto leading-relaxed">
                Take your first timed mock test with negative marking and realistic exam timing to benchmark your preparation.
              </p>
            </div>
            <div className="pt-2">
              <Button href="/tests" variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}>
                Start Your First Test
              </Button>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  // Derive score metrics from analysis or fallback searchParams
  const score = analysis?.rawMarks ?? parseFloat(rawScore || "0");
  const totalMarks = analysis?.totalMarks ?? parseInt(rawTotal || "20", 10);
  const correct = analysis?.correct ?? parseInt(rawCorrect || "0", 10);
  const wrong = analysis?.incorrect ?? parseInt(rawWrong || "0", 10);
  const answered = analysis?.attempted ?? parseInt(rawAnswered || `${correct + wrong}`, 10);
  const totalQ = analysis?.totalQuestions ?? 20;
  const skipped = analysis?.skipped ?? Math.max(totalQ - answered, 0);
  const timeSeconds = analysis?.timeTakenSeconds ?? parseInt(rawTime || "0", 10);
  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;
  const timeTakenFormatted = `${minutes}m ${seconds}s`;
  const accuracy = analysis?.accuracy ?? (answered > 0 ? Math.round((correct / answered) * 100) : 0);
  const targetExam = analysis?.examName || (profile?.currentExam && profile.currentExam !== "None" ? profile.currentExam : "Target Exam");
  const testTitle = analysis?.testTitle || `${targetExam} Mock Test`;

  const weakTopics = analysis?.weakTopics || [];

  return (
    <AppShell>
      <PageHeader
        title="Test Completed"
        subtitle={`Diagnostic Performance Report for ${testTitle}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tests", href: "/tests" },
          { label: "Results" },
        ]}
        badge={
          <Badge variant="forest" size="md">
            Exam Blueprint Evaluated
          </Badge>
        }
      />

      {/* Hero Score Banner */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-forest-900 text-white shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-almond-200 bg-forest-800 px-3 py-1 rounded-full">
            {testTitle}
          </span>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-5xl sm:text-6xl font-extrabold tracking-tight">
              {score.toFixed(1)}
            </span>
            <span className="text-xl sm:text-2xl text-almond-200 font-semibold">
              / {totalMarks} Marks
            </span>
          </div>
          <p className="text-xs text-almond-100 mt-2">
            Target Exam: <strong>{targetExam}</strong> • Standard negative marking applied
          </p>
        </div>

        {/* Overview Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-5 py-3 rounded-2xl bg-forest-800/80 text-center border border-forest-700 min-w-[100px]">
            <div className="text-[11px] text-almond-200">Accuracy</div>
            <div className="text-2xl font-extrabold text-amber-300">
              {accuracy}%
            </div>
          </div>
          <div className="px-5 py-3 rounded-2xl bg-forest-800/80 text-center border border-forest-700 min-w-[100px]">
            <div className="text-[11px] text-almond-200">Time Taken</div>
            <div className="text-2xl font-extrabold text-white">
              {timeTakenFormatted}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Detail Metric Cards (Correct, Wrong, Skipped, Speed) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card variant="default" padding="md" className="border border-charcoal-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-500 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Correct Answers</span>
          </div>
          <div className="text-2xl font-bold text-charcoal-900">{correct}</div>
          <div className="text-[11px] text-emerald-700 font-medium">
            Positive Impact
          </div>
        </Card>

        <Card variant="default" padding="md" className="border border-charcoal-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-500 mb-1">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Wrong Answers</span>
          </div>
          <div className="text-2xl font-bold text-charcoal-900">{wrong}</div>
          <div className="text-[11px] text-rose-700 font-medium">
            Negative Deductions Applied
          </div>
        </Card>

        <Card variant="default" padding="md" className="border border-charcoal-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-500 mb-1">
            <MinusCircle className="w-4 h-4 text-amber-500" />
            <span>Skipped</span>
          </div>
          <div className="text-2xl font-bold text-charcoal-900">{skipped}</div>
          <div className="text-[11px] text-charcoal-500 font-medium">0 Marks Impact</div>
        </Card>

        <Card variant="default" padding="md" className="border border-charcoal-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-500 mb-1">
            <Clock className="w-4 h-4 text-forest-700" />
            <span>Average Speed</span>
          </div>
          <div className="text-2xl font-bold text-charcoal-900">
            {answered > 0 ? `${Math.round(timeSeconds / answered)}s` : "0s"}
          </div>
          <div className="text-[11px] text-charcoal-500 font-medium">per attempted question</div>
        </Card>
      </div>

      {/* SECTION-WISE PERFORMANCE */}
      {analysis?.sections && analysis.sections.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-forest-700" />
              Section-Wise Performance
            </h3>
            <span className="text-xs text-charcoal-500">
              {analysis.sections.length} Tested Sections
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.sections.map((sec) => (
              <Card key={sec.sectionId} variant="default" padding="md" className="border border-charcoal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal-900">{sec.sectionName}</span>
                  <Badge variant={sec.accuracy >= 70 ? "success" : sec.accuracy >= 50 ? "forest" : "warning"} size="sm">
                    {sec.accuracy}% Accuracy
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-charcoal-600">
                    <span>Score</span>
                    <span className="font-bold text-charcoal-900">
                      {sec.marksObtained} / {sec.totalMarks} Marks
                    </span>
                  </div>
                  <ProgressBar value={sec.totalMarks > 0 ? Math.max(0, (sec.marksObtained / sec.totalMarks) * 100) : 0} height="xs" variant="forest" />
                </div>

                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-charcoal-100 text-center text-[11px]">
                  <div>
                    <span className="text-charcoal-500 block">Attempted</span>
                    <strong className="text-charcoal-900">{sec.attempted}/{sec.totalQuestions}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700 block">Correct</span>
                    <strong className="text-emerald-800">{sec.correct}</strong>
                  </div>
                  <div>
                    <span className="text-rose-700 block">Wrong</span>
                    <strong className="text-rose-800">{sec.incorrect}</strong>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TOPIC BREAKDOWN & DIAGNOSTICS */}
      {analysis?.topics && analysis.topics.length > 0 && (
        <Card variant="default" padding="lg" className="border border-charcoal-200 mb-8 space-y-4">
          <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
            <h3 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-forest-700" />
              Topic Diagnostics Breakdown
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600" /> Strong (&ge;80%)
              </span>
              <span className="flex items-center gap-1 text-amber-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate (60-79%)
              </span>
              <span className="flex items-center gap-1 text-rose-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-600" /> Weak (&lt;60%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {analysis.topics.map((t) => (
              <div
                key={t.topicId}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  t.status === "strong"
                    ? "bg-emerald-50/50 border-emerald-200"
                    : t.status === "weak"
                    ? "bg-rose-50/50 border-rose-200"
                    : "bg-charcoal-50/60 border-charcoal-200"
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-charcoal-900">{t.topicName}</div>
                  <div className="text-[11px] text-charcoal-500">
                    {t.correct} of {t.total} Correct
                  </div>
                </div>
                <Badge
                  variant={t.status === "strong" ? "success" : t.status === "weak" ? "danger" : "forest"}
                  size="sm"
                >
                  {t.accuracy}%
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AXMOK AI RECOMMENDATIONS & 4-STEP RECOVERY PLAN */}
      <Card variant="almond" padding="lg" className="border border-almond-300 mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-extrabold text-charcoal-900">
              Axmok AI Weak Topic Recovery Plan
            </h3>
          </div>
          <Badge variant="neutral" size="sm">
            AI Pedagogical Strategy
          </Badge>
        </div>

        <p className="text-xs text-charcoal-700 leading-relaxed">
          {analysis?.aiSummary || "Based on your test diagnostic, implement this 4-step targeted strategy to eliminate negative marks in weak areas:"}
        </p>

        {/* 4 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 bg-white rounded-xl border border-almond-300/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-forest-900">
              <span className="w-5 h-5 rounded-md bg-forest-100 text-forest-800 flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Concept Revision</span>
            </div>
            <p className="text-[11px] text-charcoal-600 leading-relaxed">
              Revisit foundational rules & operative qualifiers in {weakTopics[0] || "struggled topics"}.
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-almond-300/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-forest-900">
              <span className="w-5 h-5 rounded-md bg-forest-100 text-forest-800 flex items-center justify-center text-[11px] font-bold">2</span>
              <span>Slow Elimination Drills</span>
            </div>
            <p className="text-[11px] text-charcoal-600 leading-relaxed">
              Solve 10 un-timed questions focusing exclusively on boundary constraint checks.
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-almond-300/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-forest-900">
              <span className="w-5 h-5 rounded-md bg-forest-100 text-forest-800 flex items-center justify-center text-[11px] font-bold">3</span>
              <span>Shortcut Mastery</span>
            </div>
            <p className="text-[11px] text-charcoal-600 leading-relaxed">
              Memorize Axmok formula anchors to bypass calculation-heavy distractors.
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-almond-300/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-forest-900">
              <span className="w-5 h-5 rounded-md bg-forest-100 text-forest-800 flex items-center justify-center text-[11px] font-bold">4</span>
              <span>Mini-Mock Retest</span>
            </div>
            <p className="text-[11px] text-charcoal-600 leading-relaxed">
              Retake a 20-question sprint in 48 hours to benchmark sectional speed recovery.
            </p>
          </div>
        </div>
      </Card>

      {/* Recommended Topics Action Box */}
      <Card variant="default" padding="lg" className="border border-charcoal-200 mb-8">
        <h3 className="text-base font-bold text-charcoal-900 mb-3">
          Next Recommended Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-charcoal-50/60 rounded-xl border border-charcoal-200">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-charcoal-900">Targeted Topic Practice</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-forest-50 text-forest-800">
                Practice
              </span>
            </div>
            <p className="text-xs text-charcoal-600 mb-3">
              Strengthen weak areas identified during this test simulation with Axmok AI guidance.
            </p>
            <Button href="/practice" variant="primary" size="sm" className="w-full text-xs">
              Go to Practice Hub
            </Button>
          </div>

          <div className="p-4 bg-charcoal-50/60 rounded-xl border border-charcoal-200">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-charcoal-900">Review Full Syllabus</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-forest-50 text-forest-800">
                Learn
              </span>
            </div>
            <p className="text-xs text-charcoal-600 mb-3">
              Explore step-by-step topic lessons, shortcuts, and common examiner traps.
            </p>
            <Button href="/exams" variant="outline" size="sm" className="w-full text-xs">
              Browse Exam Topics
            </Button>
          </div>
        </div>
      </Card>

      {/* Bottom Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-charcoal-200">
        <Button href="/dashboard" variant="outline" size="sm">
          ← Back to Dashboard
        </Button>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button href="/practice" variant="outline" size="sm">
            Practice Drills
          </Button>
          <Button
            href="/tests"
            variant="primary"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5 mr-1" />}
          >
            Take Another Test
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

export default function TestResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-charcoal-50/50">
          <div className="text-xs text-charcoal-500 font-medium">Loading test results...</div>
        </div>
      }
    >
      <TestResultContent />
    </Suspense>
  );
}
