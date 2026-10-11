"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { FirstTimeOnboardingModal } from "@/components/dashboard/FirstTimeOnboardingModal";
import { ChangeTargetExamModal } from "@/components/exams/ChangeTargetExamModal";
import { useAuth } from "@/services/auth/auth-context";
import { getExamById } from "@/lib/data/examCatalogue";
import { getTimeGreetingInfo } from "@/lib/utils/greeting";
import {
  Flame,
  CheckCircle,
  BarChart,
  Clock,
  Sparkles,
  Target,
  ArrowRight,
  BookOpen,
  AlertCircle,
  History,
  PenTool,
} from "lucide-react";

export default function DashboardPage() {
  const { profile, user, updateProfile, updatePreferences } = useAuth();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isChangeTargetModalOpen, setIsChangeTargetModalOpen] = useState(false);

  const studentName = profile?.name || user?.name || "Student";
  const targetExamId = profile?.examId || "";
  const currentExamObj = targetExamId ? getExamById(targetExamId) : null;
  const targetExamName =
    currentExamObj?.name ||
    (profile?.currentExam && profile.currentExam !== "None"
      ? profile.currentExam
      : "Select Target Exam");

  // Check if brand new account with 0 questions solved
  const isBrandNewUser = (profile?.questionsSolved ?? 0) === 0;
  const currentStreak = profile?.currentStreak ?? 0;
  const questionsSolved = profile?.questionsSolved ?? 0;
  const accuracy = profile?.accuracy ?? 0;
  const studyTimeMinutes = profile?.studyTimeMinutes ?? 0;
  const dailyGoal = profile?.preferences?.dailyQuestionGoal ?? 20;

  // Time-based greeting and contextual motivation
  const [greetingInfo, setGreetingInfo] = useState(() =>
    getTimeGreetingInfo(new Date(), isBrandNewUser)
  );

  useEffect(() => {
    setGreetingInfo(getTimeGreetingInfo(new Date(), isBrandNewUser));
    const interval = setInterval(() => {
      setGreetingInfo(getTimeGreetingInfo(new Date(), isBrandNewUser));
    }, 60000);
    return () => clearInterval(interval);
  }, [isBrandNewUser]);

  // Onboarding trigger: only if user has never selected an exam AND onboarding is not marked complete
  const hasSelectedExam =
    Boolean(targetExamId && targetExamId !== "None") ||
    Boolean(profile?.currentExam && profile.currentExam !== "None") ||
    Boolean(user?.targetExamId && user.targetExamId !== "None");

  const needsOnboarding = Boolean(profile) && !profile?.onboardingCompleted && !hasSelectedExam;

  const handleOnboardingComplete = async (
    examId: string,
    subjectId?: string,
    goal: number = 20,
    difficulty: "Easy" | "Medium" | "Hard" | "Adaptive" = "Adaptive"
  ) => {
    setIsOnboardingOpen(false);
    await updateProfile({
      selected_exam: examId,
      selected_subject: subjectId || "",
      onboarding_completed: true,
      daily_question_goal: goal,
      preferred_difficulty: difficulty,
    });
    await updatePreferences({
      defaultExam: examId,
      dailyQuestionGoal: goal,
      preferredDifficulty: difficulty,
    });
  };

  const handleSelectTargetExam = async (examId: string) => {
    await updatePreferences({ defaultExam: examId });
    await updateProfile({ selected_exam: examId });
  };

  return (
    <AppShell>
      {/* First-Time User Onboarding Modal */}
      <FirstTimeOnboardingModal
        isOpen={needsOnboarding || isOnboardingOpen}
        userName={studentName}
        onComplete={handleOnboardingComplete}
      />

      {/* Change Target Exam Modal */}
      <ChangeTargetExamModal
        isOpen={isChangeTargetModalOpen}
        currentExamId={targetExamId}
        onClose={() => setIsChangeTargetModalOpen(false)}
        onSelectExam={handleSelectTargetExam}
      />

      {/* Top Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal-900 flex items-center gap-2">
            <span suppressHydrationWarning>{greetingInfo.greeting}</span>, {studentName.split(" ")[0]}{" "}
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-charcoal-600 mt-1" suppressHydrationWarning>
            {greetingInfo.motivationalMessage}
          </p>
        </div>

        {/* Current Exam Banner with Clickable Target Switcher */}
        <button
          type="button"
          onClick={() => setIsChangeTargetModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-forest-50 hover:bg-forest-100 border border-forest-200 text-xs font-semibold text-forest-900 self-start sm:self-auto transition-colors group shadow-2xs text-left"
          title="Click to change your target exam"
        >
          <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" />
          <span>Active Goal: {targetExamName}</span>
          <span className="text-[10px] text-forest-700 bg-forest-200/60 px-2 py-0.5 rounded-lg font-bold group-hover:bg-forest-900 group-hover:text-white transition-colors flex items-center gap-0.5">
            Switch Target →
          </span>
        </button>
      </div>

      {/* 4 Primary Statistic Cards — strictly derived from authenticated user data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          label="Current Streak"
          value={`${currentStreak} Days`}
          supportingText={currentStreak > 0 ? "+1 day streak" : "Start your streak today"}
          icon={<Flame className="w-4 h-4 text-amber-600 fill-amber-500" />}
        />
        <StatCard
          label="Questions Solved"
          value={questionsSolved}
          supportingText={questionsSolved > 0 ? "Lifetime questions" : "No questions solved yet"}
          icon={<CheckCircle className="w-4 h-4 text-forest-700" />}
        />
        <StatCard
          label="Accuracy"
          value={`${accuracy}%`}
          supportingText={questionsSolved > 0 ? "Overall accuracy" : "Accuracy baseline pending"}
          icon={<BarChart className="w-4 h-4 text-emerald-600" />}
        />
        <StatCard
          label="Study Time"
          value={
            studyTimeMinutes > 0
              ? `${Math.floor(studyTimeMinutes / 60)}h ${studyTimeMinutes % 60}m`
              : "0m"
          }
          supportingText={studyTimeMinutes > 0 ? "Active study time" : "Start studying to track time"}
          icon={<Clock className="w-4 h-4 text-forest-800" />}
        />
      </div>

      {/* Main Grid: Left Column (Goals & Learning) | Right Column (Daily Challenge & Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column (7 cols): Today's Goal + Continue Learning */}
        <div className="lg:col-span-7 space-y-6">
          {/* Today's Goal Card */}
          <Card
            variant="almond"
            padding="lg"
            className="flex flex-col justify-between border border-almond-300"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-forest-900 text-white flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-charcoal-900">Today&apos;s Goal</h3>
                    <p className="text-xs text-charcoal-600">Daily syllabus quota: {dailyGoal} questions</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-forest-100 text-forest-900 border border-forest-200">
                  {questionsSolved > 0 ? `${Math.min(Math.round((questionsSolved / dailyGoal) * 100), 100)}%` : "0%"}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-2xl font-extrabold text-charcoal-900">
                    {Math.min(questionsSolved, dailyGoal)}{" "}
                    <span className="text-sm font-normal text-charcoal-500">
                      / {dailyGoal} Questions
                    </span>
                  </div>
                  <span className="text-xs font-medium text-charcoal-600">
                    {isBrandNewUser
                      ? "Start your first practice session"
                      : questionsSolved >= dailyGoal
                      ? "Daily goal achieved! 🎉"
                      : `Remaining: ${Math.max(dailyGoal - questionsSolved, 0)} questions`}
                  </span>
                </div>

                <ProgressBar
                  value={Math.min(Math.round((questionsSolved / dailyGoal) * 100), 100)}
                  height="md"
                  variant="forest"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                href="/practice"
                variant="primary"
                size="md"
                className="w-full justify-center"
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                {isBrandNewUser ? "Start Your First Practice Session" : "Continue Practice"}
              </Button>
            </div>
          </Card>

          {/* Continue Learning */}
          <div>
            <h2 className="text-base font-bold text-charcoal-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-forest-800" />
              Continue Learning
            </h2>

            {isBrandNewUser ? (
              <Card variant="default" padding="lg" className="border border-charcoal-200/80 text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-800 mx-auto mb-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-charcoal-900 mb-1">
                  Start Your Learning Journey
                </h3>
                <p className="text-xs text-charcoal-500 max-w-sm mx-auto mb-4 leading-relaxed">
                  Select a topic from your {targetExamName} syllabus to begin concept learning with Axmok AI.
                </p>
                <Button
                  href={targetExamId ? `/exams/${targetExamId}` : "/exams"}
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5 ml-1" />}
                >
                  Browse Syllabus Topics
                </Button>
              </Card>
            ) : (
              <Card variant="default" padding="lg" className="border border-charcoal-200/80">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-forest-50 text-forest-800 border border-forest-100 uppercase tracking-wide">
                    {targetExamName}
                  </span>
                  <span className="text-xs text-charcoal-500 font-medium">In Progress</span>
                </div>
                <h3 className="text-lg font-bold text-charcoal-900 tracking-tight mb-2">
                  Topic Practice in Progress
                </h3>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-charcoal-100">
                  <Button
                    href={targetExamId ? `/exams/${targetExamId}` : "/exams"}
                    variant="primary"
                    size="sm"
                    className="justify-center"
                    leftIcon={<BookOpen className="w-3.5 h-3.5 mr-1" />}
                  >
                    Learn Concept
                  </Button>
                  <Button
                    href="/practice"
                    variant="outline"
                    size="sm"
                    className="justify-center"
                    leftIcon={<PenTool className="w-3.5 h-3.5 mr-1" />}
                  >
                    Practice Drills
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Daily Challenge Card */}
        <div className="lg:col-span-5">
          <Card variant="default" padding="lg" className="border border-charcoal-200/80 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  <span>Daily Challenge</span>
                </div>
                <span className="text-xs font-medium text-charcoal-500">October 2026</span>
              </div>

              <h3 className="text-lg font-bold text-charcoal-900 mb-2">
                Today&apos;s Mini Challenge
              </h3>
              <p className="text-xs text-charcoal-600 leading-relaxed mb-6">
                Take on 5 curated questions tailored for {targetExamName} to lock in today&apos;s streak and benchmark your reasoning speed.
              </p>

              <div className="p-3.5 rounded-2xl bg-charcoal-50/70 border border-charcoal-100 space-y-2 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="text-charcoal-600">Reward:</span>
                  <span className="font-bold text-forest-900">+1 Streak Day</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-charcoal-600">Question Format:</span>
                  <span className="font-medium text-charcoal-800">5 Mixed Questions</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-charcoal-600">Estimated Duration:</span>
                  <span className="font-medium text-charcoal-800">5 - 7 Minutes</span>
                </div>
              </div>
            </div>

            <Button
              href="/daily-challenge"
              variant="primary"
              size="md"
              className="w-full justify-center"
              rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              Start Today&apos;s Challenge
            </Button>
          </Card>
        </div>
      </div>

      {/* Lower Section: Weak Topics & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weak Topics */}
        <div className="lg:col-span-7">
          <Card variant="default" padding="lg" className="border border-charcoal-200/80">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-base font-bold text-charcoal-900">Topics That Need Practice</h3>
            </div>
            <p className="text-xs text-charcoal-500 mb-4">
              AI-detected areas where accuracy is below your competitive cut-off target.
            </p>

            {isBrandNewUser ? (
              <div className="p-6 rounded-2xl bg-charcoal-50/60 border border-dashed border-charcoal-200 text-center space-y-2">
                <div className="text-xs font-semibold text-charcoal-700">
                  No weak topics identified yet.
                </div>
                <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
                  Complete your first 10 practice questions so Axmok AI can diagnose your sectional performance.
                </p>
                <div className="pt-2">
                  <Button href="/practice" variant="outline" size="sm">
                    Start Practice Set
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-charcoal-50/60 border border-charcoal-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-charcoal-900">Foundational Diagnostic Set</div>
                  <div className="text-[11px] text-charcoal-500">Complete additional drills for AI diagnosis</div>
                </div>
                <Button href="/practice" variant="outline" size="sm" className="text-xs">
                  Practice
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-5">
          <Card variant="default" padding="lg" className="border border-charcoal-200/80">
            <div className="flex items-center gap-2 mb-1">
              <History className="w-4 h-4 text-forest-700" />
              <h3 className="text-base font-bold text-charcoal-900">Recent Activity</h3>
            </div>
            <p className="text-xs text-charcoal-500 mb-4">
              Your chronological study log and completed sessions.
            </p>

            {isBrandNewUser ? (
              <div className="p-6 rounded-2xl bg-charcoal-50/60 border border-dashed border-charcoal-200 text-center space-y-1.5">
                <div className="text-xs font-semibold text-charcoal-700">
                  Start your first practice session to build your progress.
                </div>
                <p className="text-xs text-charcoal-500">
                  Your completed practice sets and tests will be logged here.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-charcoal-50/60 border border-charcoal-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-charcoal-800">Account Initialized</div>
                  <div className="text-[11px] text-charcoal-400">Preparation began</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-forest-100 text-forest-900 font-bold text-[10px]">
                  Active
                </span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
