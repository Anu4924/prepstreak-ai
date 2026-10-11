"use client";

import React, { useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/services/auth/auth-context";
import { getExamBlueprint, getTestBlueprint } from "@/lib/data/examBlueprints";
import { Flame, ArrowRight, ShieldCheck, CheckCircle2, Layers } from "lucide-react";

export default function DailyChallengePage() {
  const { profile } = useAuth();
  const examId = profile?.examId || (profile?.currentExam && profile.currentExam !== "None" ? profile.currentExam : "sbi-po");

  const bp = useMemo(() => getExamBlueprint(examId), [examId]);
  const testBp = useMemo(() => getTestBlueprint(examId, "mini_mock"), [examId]);

  const markingText = bp.negativeMarking
    ? `+${bp.markingScheme.positiveMarks} / -${bp.markingScheme.negativeMarks}`
    : `+${bp.markingScheme.positiveMarks} / No Penalty`;

  const subjectsSummary = bp.subjects.slice(0, 3).map((s) => s.name).join(", ");

  const rules = [
    `Sprint questions are specifically aligned with the official ${bp.examName} syllabus.`,
    `Complete all ${testBp.totalQuestions} questions within ${testBp.totalDurationMinutes} minutes to lock in your daily streak.`,
    "Diagnostic results immediately update your Weak Topic radar and Axmok recommendations.",
    "Full step-by-step solutions, shortcuts, and common examiner traps are revealed upon completion.",
  ];

  return (
    <AppShell>
      <PageHeader
        title="Daily Challenge"
        subtitle={`Personalized high-yield daily sprint for ${bp.examName} (${bp.organization})`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Daily Challenge" },
        ]}
        badge={
          <Badge variant="warning" size="md">
            Streak Mandatory
          </Badge>
        }
      />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Main Challenge Banner Card */}
        <Card
          variant="default"
          padding="lg"
          className="border-2 border-forest-900 bg-linear-to-br from-white via-almond-50/50 to-white shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Flame className="w-5 h-5 fill-amber-500" />
              </span>
              <span className="text-xs font-bold text-forest-900 uppercase tracking-wider">
                {bp.category} • Sprint Challenge
              </span>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-forest-900 text-white">
              +100 XP
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 mb-2">
            {bp.examName} Daily Sprint
          </h2>
          <p className="text-sm text-charcoal-600 mb-6">
            A timed sprint featuring exam-standard questions curated from {subjectsSummary}.
          </p>

          {/* 4 Feature Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 px-4 rounded-xl bg-white border border-charcoal-200/80 mb-6 text-center">
            <div>
              <div className="text-[11px] text-charcoal-500 font-medium">Questions</div>
              <div className="text-base sm:text-lg font-bold text-charcoal-900">
                {testBp.totalQuestions} Qs
              </div>
            </div>
            <div className="border-l border-charcoal-100">
              <div className="text-[11px] text-charcoal-500 font-medium">Time Limit</div>
              <div className="text-base sm:text-lg font-bold text-charcoal-900">
                {testBp.totalDurationMinutes} Mins
              </div>
            </div>
            <div className="border-l border-charcoal-100">
              <div className="text-[11px] text-charcoal-500 font-medium">Marking</div>
              <div className={`text-sm sm:text-base font-bold ${bp.negativeMarking ? "text-rose-700" : "text-emerald-700"}`}>
                {markingText}
              </div>
            </div>
            <div className="border-l border-charcoal-100">
              <div className="text-[11px] text-charcoal-500 font-medium">Sections</div>
              <div className="text-xs font-bold text-forest-900 mt-1">
                {bp.sections.length} Sections
              </div>
            </div>
          </div>

          <Button
            href={`/tests?type=mini_mock&examId=${examId}`}
            variant="primary"
            size="lg"
            className="w-full justify-center text-base"
            rightIcon={<ArrowRight className="w-5 h-5 ml-1" />}
          >
            Start {bp.examName} Challenge
          </Button>
        </Card>

        {/* Section Structure Pill */}
        <Card variant="default" padding="md" className="border border-charcoal-200/80">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-charcoal-900">
            <Layers className="w-4 h-4 text-forest-700" />
            <span>Target Syllabus Sections Included:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {bp.sections.map((sec) => (
              <span
                key={sec.id}
                className="text-xs px-3 py-1.5 rounded-xl bg-charcoal-50 border border-charcoal-200 text-charcoal-800 font-medium"
              >
                {sec.name} ({sec.questionCount} Qs)
              </span>
            ))}
          </div>
        </Card>

        {/* Challenge Rules Section */}
        <Card variant="default" padding="lg" className="border border-charcoal-200/80">
          <h3 className="text-base font-bold text-charcoal-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-forest-700" />
            Challenge Rules & Scoring Policy
          </h3>

          <ul className="space-y-3">
            {rules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-charcoal-700">
                <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
