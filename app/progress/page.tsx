"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/services/auth/auth-context";
import { getExamById } from "@/lib/data/examCatalogue";
import {
  CheckCircle,
  BarChart3,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function ProgressPage() {
  const { profile } = useAuth();

  const questionsSolved = profile?.questionsSolved ?? 0;
  const accuracy = profile?.accuracy ?? 0;
  const studyTimeMinutes = profile?.studyTimeMinutes ?? 0;
  const testsCompleted = profile?.testsCompleted ?? 0;
  const isBrandNewUser = questionsSolved === 0;

  const targetExamId =
    profile?.examId ||
    (profile?.currentExam && profile.currentExam !== "None" ? profile.currentExam : "") ||
    "sbi-po";
  const currentExamObj = getExamById(targetExamId);
  const targetExamName = currentExamObj?.name || (profile?.currentExam && profile.currentExam !== "None" ? profile.currentExam : "Competitive Exam");

  const formatStudyTime = (mins: number) => {
    if (mins === 0) return "0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <AppShell>
      <PageHeader
        title="Your Progress"
        subtitle="Detailed analytics tracking accuracy, speed, and topic mastery trends over time."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Progress" },
        ]}
        badge={
          <Badge variant="forest" size="md">
            {isBrandNewUser ? "Initial State" : "Live Telemetry"}
          </Badge>
        }
      />

      {/* 4 Summary Stat Cards — strictly derived from user's live profile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          label="Questions Solved"
          value={questionsSolved}
          supportingText={questionsSolved > 0 ? "Lifetime questions" : "No questions solved yet"}
          icon={<CheckCircle className="w-4 h-4 text-forest-700" />}
        />
        <StatCard
          label="Average Accuracy"
          value={`${accuracy}%`}
          supportingText={questionsSolved > 0 ? "Overall accuracy" : "Accuracy baseline pending"}
          icon={<BarChart3 className="w-4 h-4 text-emerald-600" />}
        />
        <StatCard
          label="Tests Completed"
          value={testsCompleted}
          supportingText={testsCompleted > 0 ? "Full tests completed" : "Complete your first test"}
          icon={<Award className="w-4 h-4 text-amber-600" />}
        />
        <StatCard
          label="Total Study Time"
          value={formatStudyTime(studyTimeMinutes)}
          supportingText={studyTimeMinutes > 0 ? "Active study time" : "Start studying to track time"}
          icon={<Clock className="w-4 h-4 text-forest-800" />}
        />
      </div>

      {isBrandNewUser ? (
        /* Empty State for Brand New User */
        <div className="space-y-8 mb-8">
          <Card variant="default" padding="lg" className="border border-charcoal-200 text-center py-12">
            <div className="w-16 h-16 rounded-3xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-800 mx-auto mb-4">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-charcoal-900 mb-2">
              Performance Analytics Will Appear Here
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-500 max-w-md mx-auto mb-6 leading-relaxed">
              You haven&apos;t solved any questions yet. Start your first practice set or diagnostic test for{" "}
              <strong className="text-charcoal-900 font-semibold">{targetExamName}</strong> to begin tracking your accuracy trends, daily output, and topic mastery.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button href="/practice" variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}>
                Start Diagnostic Practice
              </Button>
              <Button href={`/exams/${targetExamId}`} variant="outline" size="md">
                Browse Syllabus Topics
              </Button>
            </div>
          </Card>

          {/* Recommended Next Steps for Brand New User */}
          <Card variant="almond" padding="lg" className="border border-almond-300">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-forest-800" />
              <h3 className="text-base font-bold text-charcoal-900">Recommended Next Steps</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-almond-300/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-forest-800 uppercase tracking-wide">
                    Step 1 • Diagnostics
                  </span>
                  <h4 className="text-xs font-bold text-charcoal-900 mt-1 mb-1">
                    Baseline Skill Assessment
                  </h4>
                  <p className="text-xs text-charcoal-500 mb-4">
                    Solve 10 mixed questions to help Axmok AI diagnose your starting proficiency level.
                  </p>
                </div>
                <Button href="/practice" variant="primary" size="sm" className="w-full text-xs">
                  Start Assessment
                </Button>
              </div>

              <div className="p-4 bg-white rounded-xl border border-almond-300/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-forest-800 uppercase tracking-wide">
                    Step 2 • Concept Study
                  </span>
                  <h4 className="text-xs font-bold text-charcoal-900 mt-1 mb-1">
                    Review Core Topics
                  </h4>
                  <p className="text-xs text-charcoal-500 mb-4">
                    Explore high-weightage topics in {targetExamName} with step-by-step explanations.
                  </p>
                </div>
                <Button href={`/exams/${targetExamId}`} variant="outline" size="sm" className="w-full text-xs">
                  View Syllabus
                </Button>
              </div>

              <div className="p-4 bg-white rounded-xl border border-almond-300/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-forest-800 uppercase tracking-wide">
                    Step 3 • Daily Streak
                  </span>
                  <h4 className="text-xs font-bold text-charcoal-900 mt-1 mb-1">
                    Build Daily Consistency
                  </h4>
                  <p className="text-xs text-charcoal-500 mb-4">
                    Commit to 15-20 questions daily to secure your preparation momentum.
                  </p>
                </div>
                <Button href="/streak" variant="outline" size="sm" className="w-full text-xs">
                  Streak Tracker
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Analytics for users with practice history */
        <>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card variant="default" padding="lg" className="border border-charcoal-200">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-base font-bold text-charcoal-900">Accuracy Trend Over Time</h3>
                  <p className="text-xs text-charcoal-500">Live performance evaluation</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {accuracy}% Current Average
                </span>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-charcoal-700">
                    <span>Overall Accuracy Benchmark</span>
                    <span className="text-forest-900 font-bold">{accuracy}%</span>
                  </div>
                  <ProgressBar
                    value={accuracy}
                    height="sm"
                    variant={accuracy >= 75 ? "forest" : "amber"}
                  />
                </div>
              </div>
            </Card>

            <Card variant="default" padding="lg" className="border border-charcoal-200">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-base font-bold text-charcoal-900">Questions Solved Summary</h3>
                  <p className="text-xs text-charcoal-500">Total volume logged in active sessions</p>
                </div>
                <span className="text-xs font-bold text-forest-900 bg-almond-100 px-2.5 py-1 rounded-full border border-almond-200">
                  {questionsSolved} Total Solved
                </span>
              </div>
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-charcoal-900">{questionsSolved}</div>
                  <div className="text-xs text-charcoal-500 mt-1">Questions completed across all sections</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recommended Practice */}
          <Card variant="almond" padding="lg" className="border border-almond-300 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-forest-800" />
              <h3 className="text-base font-bold text-charcoal-900">Recommended Practice Plan</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-almond-300/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-forest-800 uppercase tracking-wide">
                    {targetExamName}
                  </span>
                  <h4 className="text-xs font-bold text-charcoal-900 mt-1 mb-1">Sectional Practice Drills</h4>
                  <p className="text-xs text-charcoal-500 mb-4">
                    Continue solving topic drills to build sectional speed and accuracy.
                  </p>
                </div>
                <Button href="/practice" variant="primary" size="sm" className="w-full text-xs">
                  Continue Practice Set
                </Button>
              </div>

              <div className="p-4 bg-white rounded-xl border border-almond-300/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-forest-800 uppercase tracking-wide">
                    Mock Exam
                  </span>
                  <h4 className="text-xs font-bold text-charcoal-900 mt-1 mb-1">Full Timed Simulation</h4>
                  <p className="text-xs text-charcoal-500 mb-4">
                    Take a full exam simulation with negative marking and real exam timing.
                  </p>
                </div>
                <Button href="/tests" variant="outline" size="sm" className="w-full text-xs">
                  Start Mock Test
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </AppShell>
  );
}
