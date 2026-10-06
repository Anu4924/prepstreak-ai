"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/services/auth/auth-context";
import {
  Flame,
  CheckCircle2,
  Calendar,
  Award,
  Target,
  ArrowRight,
  Lock,
} from "lucide-react";

export default function StreakPage() {
  const { profile } = useAuth();
  const currentStreak = profile?.currentStreak ?? 0;
  const longestStreak = profile?.longestStreak ?? 0;
  const dailyGoal = profile?.preferences?.dailyQuestionGoal ?? 20;
  const rawQuestionsSolved = profile?.questionsSolved ?? 0;

  const currentSolved = Math.min(rawQuestionsSolved, dailyGoal);
  const currentPercent = Math.min(
    Math.round((currentSolved / dailyGoal) * 100),
    100
  );
  const isGoalCompleted = currentSolved >= dailyGoal;

  // Build calendar for current week
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
  // Convert so Monday is index 0:
  const currentDayIndex = (dayOfWeek + 6) % 7;

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDayIndex);

  const weeklyCalendar = daysOfWeek.map((dayName, idx) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + idx);
    const isToday = idx === currentDayIndex;
    const isPast = idx < currentDayIndex;

    return {
      dayShort: dayName,
      dateNumber: d.getDate(),
      isToday,
      isPast,
      completed: isToday ? isGoalCompleted : false,
      questionsSolved: isToday ? currentSolved : 0,
    };
  });

  const milestones = [
    {
      days: 7,
      title: "7-Day Foundation",
      description: "Complete 7 consecutive daily practice sessions.",
      reward: "Bronze Habit Badge",
      status: currentStreak >= 7 ? "unlocked" : currentStreak < 7 ? "current" : "locked",
    },
    {
      days: 14,
      title: "14-Day Consistency",
      description: "Build unstoppable 2-week momentum across all subjects.",
      reward: "Silver Habit Badge",
      status: currentStreak >= 14 ? "unlocked" : currentStreak >= 7 ? "current" : "locked",
    },
    {
      days: 30,
      title: "30-Day Master",
      description: "A full month of non-negotiable preparation discipline.",
      reward: "Gold Habit Badge",
      status: currentStreak >= 30 ? "unlocked" : currentStreak >= 14 ? "current" : "locked",
    },
    {
      days: 60,
      title: "60-Day Unstoppable",
      description: "Deep syllabus coverage and reinforced exam temperament.",
      reward: "Platinum Habit Badge",
      status: currentStreak >= 60 ? "unlocked" : currentStreak >= 30 ? "current" : "locked",
    },
    {
      days: 100,
      title: "Centurion Aspirant",
      description: "Top 1% elite consistency percentile among all aspirants.",
      reward: "Diamond Habit Badge",
      status: currentStreak >= 100 ? "unlocked" : currentStreak >= 60 ? "current" : "locked",
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Keep Your Streak Alive 🔥"
        subtitle="Consistent daily preparation builds unshakeable exam temperament and speed."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Streak" },
        ]}
      />

      {/* Top 2 Streak Stat Cards — strictly derived from user's live profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card
          variant="default"
          padding="lg"
          className="border-2 border-forest-900 bg-linear-to-br from-white via-almond-50/40 to-forest-50/20"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
              Active Habit
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold text-charcoal-900 mb-1">
            {currentStreak} {currentStreak === 1 ? "Day" : "Days"}
          </div>
          <p className="text-xs text-charcoal-600">
            {currentStreak === 0
              ? "Start studying today to begin your streak."
              : `Study today before midnight to secure Day ${currentStreak + 1}!`}
          </p>
        </Card>

        <Card variant="default" padding="lg" className="border border-charcoal-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
              Personal Record
            </span>
            <div className="p-2 rounded-xl bg-forest-50 text-forest-800">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold text-charcoal-900 mb-1">
            {longestStreak} {longestStreak === 1 ? "Day" : "Days"}
          </div>
          <p className="text-xs text-charcoal-600">
            {longestStreak === 0
              ? "Your personal best streak will be tracked here as you build consistency."
              : "Best consecutive study run achieved."}
          </p>
        </Card>
      </div>

      {/* Weekly Activity Calendar (Mon - Sun) */}
      <Card variant="default" padding="lg" className="border border-charcoal-200 mb-8">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-charcoal-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-forest-700" />
            <h3 className="text-base font-bold text-charcoal-900">Weekly Activity Calendar</h3>
          </div>
          <span className="text-xs font-semibold text-charcoal-500">
            {today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center">
          {weeklyCalendar.map((item, idx) => {
            const isFinished = item.completed;
            return (
              <div
                key={idx}
                className={`p-3 sm:p-4 rounded-2xl border transition-all ${
                  isFinished
                    ? "bg-forest-900 text-white border-forest-900 shadow-xs"
                    : item.isToday
                    ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/40 text-charcoal-900"
                    : "bg-charcoal-50 border-charcoal-200 text-charcoal-700"
                }`}
              >
                <div className="text-[11px] sm:text-xs font-semibold opacity-80 uppercase">
                  {item.dayShort}
                </div>
                <div className="text-base sm:text-lg font-bold my-1">
                  {item.dateNumber}
                </div>
                <div className="mt-2 flex justify-center">
                  {isFinished ? (
                    <CheckCircle2 className="w-4 h-4 text-almond-200" />
                  ) : item.isToday ? (
                    <Flame className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-charcoal-300" />
                  )}
                </div>
                <div className="text-[10px] mt-1.5 opacity-80">
                  {isFinished ? `${item.questionsSolved} Qs` : item.isToday ? `${currentSolved} Qs` : "Pending"}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Today's Goal Card */}
      <Card variant="almond" padding="lg" className="border border-almond-300 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest-900 text-white flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-charcoal-900">Today&apos;s Goal</h3>
              <p className="text-xs text-charcoal-600">Daily syllabus requirement: {dailyGoal} Questions</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-extrabold text-charcoal-900">
              {currentSolved} / {dailyGoal} <span className="text-xs font-normal text-charcoal-500">Solved</span>
            </div>
          </div>
        </div>

        <ProgressBar value={currentPercent} height="md" variant="forest" className="mb-4" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <span className="text-xs text-charcoal-600 font-medium">
            {isGoalCompleted
              ? "Goal achieved! Your streak for today is officially registered."
              : currentStreak === 0
              ? `Solve ${dailyGoal - currentSolved} questions today to launch your 1-day study streak!`
              : `Solve ${dailyGoal - currentSolved} more questions to extend your streak to Day ${currentStreak + 1}!`}
          </span>
          <div className="flex items-center gap-2">
            <Button
              href="/practice"
              variant="outline"
              size="sm"
            >
              Practice Drills
            </Button>
            <Button
              href="/practice"
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              {isGoalCompleted ? "Goal Completed 🎉" : "Start Daily Goal Practice"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Milestone Section: 7, 14, 30, 60, 100 Days */}
      <div>
        <h3 className="text-base font-bold text-charcoal-900 mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-forest-700" />
          Streak Milestones
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {milestones.map((m, i) => {
            const isUnlocked = m.status === "unlocked";
            const isCurrent = m.status === "current";

            return (
              <div
                key={i}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  isUnlocked
                    ? "bg-forest-50/60 border-forest-200 text-charcoal-900"
                    : isCurrent
                    ? "bg-white border-2 border-forest-800 shadow-xs"
                    : "bg-charcoal-50/50 border-charcoal-200 opacity-60"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-extrabold text-forest-900 font-mono">
                      {m.days} Days
                    </span>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-forest-700" />
                    ) : isCurrent ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-forest-800 text-white">
                        Next
                      </span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-charcoal-400" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-charcoal-900 mb-1">{m.title}</h4>
                  <p className="text-[11px] text-charcoal-500 mb-3">{m.description}</p>
                </div>
                <div className="pt-2 border-t border-charcoal-100 text-[10px] font-semibold text-forest-800">
                  {m.reward}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
