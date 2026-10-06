"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubjectCard } from "@/components/exams/SubjectCard";
import { Badge, DifficultyBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getExamById, CENTRAL_EXAM_CATALOGUE } from "@/lib/data/examCatalogue";
import { getSubjectsForExam } from "@/lib/data/subjectRegistry";
import {
  Building2,
  GraduationCap,
  FileText,
  Clock,
  ArrowLeft,
} from "lucide-react";

export default function SubjectSelectionPage() {
  const params = useParams();
  const rawExamId = params?.examId as string;
  const examId = rawExamId || "sbi-po";

  const exam = getExamById(examId) || CENTRAL_EXAM_CATALOGUE.find((e) => e.id === examId);
  const subjects = exam ? getSubjectsForExam(exam.id) : [];

  // If exam ID is invalid or not found in catalogue
  if (!exam) {
    return (
      <AppShell>
        <PageHeader
          title="Exam Not Found"
          subtitle="The requested examination could not be found in the catalogue."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Exams", href: "/exams" },
            { label: "Not Found" },
          ]}
        />
        <EmptyState
          title="Unknown Exam"
          description="Please select an exam from our comprehensive central catalogue."
          actionText="Browse All Exams"
          actionHref="/exams"
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={`${exam.name} Preparation`}
        subtitle={`${exam.officialName} • Comprehensive syllabus modules & adaptive question banks.`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Exams", href: "/exams" },
          { label: exam.name },
        ]}
        badge={
          <Badge variant="forest" size="md">
            {subjects.length} Subjects Active
          </Badge>
        }
      />

      {/* Comprehensive Exam Overview Hero Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white mb-8 shadow-card border border-forest-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 rounded-full bg-forest-700/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-forest-800/90 text-almond-200 border border-forest-700 text-xs font-semibold">
                {exam.category}
              </span>
              {exam.subCategory && (
                <span className="px-2.5 py-0.5 rounded-full bg-almond-50/15 text-almond-100 text-xs font-medium">
                  {exam.subCategory}
                </span>
              )}
              <DifficultyBadge difficulty={exam.difficulty || "Medium"} />
            </div>

            <Link
              href="/exams"
              className="inline-flex items-center gap-1 text-xs text-almond-200 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Switch Exam
            </Link>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            {exam.officialName}
          </h2>

          <div className="flex items-center gap-2 text-xs text-almond-200/90 mb-4">
            <Building2 className="w-4 h-4 text-almond-300" />
            <span>Conducting Body: <strong>{exam.organization}</strong></span>
          </div>

          <p className="text-xs sm:text-sm text-almond-100/80 leading-relaxed max-w-3xl mb-6">
            {exam.description}
          </p>

          {/* Quick Specification Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-forest-800/60 text-xs">
            <div className="flex items-start gap-2 bg-forest-950/40 p-3 rounded-2xl border border-forest-800/50">
              <GraduationCap className="w-4 h-4 text-almond-300 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] text-almond-300 font-semibold uppercase">Eligibility</div>
                <div className="text-white font-medium line-clamp-2">{exam.eligibility}</div>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-forest-950/40 p-3 rounded-2xl border border-forest-800/50">
              <FileText className="w-4 h-4 text-almond-300 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] text-almond-300 font-semibold uppercase">Exam Pattern</div>
                <div className="text-white font-medium line-clamp-2">{exam.examPattern}</div>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-forest-950/40 p-3 rounded-2xl border border-forest-800/50">
              <Clock className="w-4 h-4 text-almond-300 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] text-almond-300 font-semibold uppercase">Structure</div>
                <div className="text-white font-medium">
                  {subjects.length} Subjects • {exam.durationMinutes} Mins Pattern
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-charcoal-900">
            Syllabus Subjects ({subjects.length})
          </h3>
          <p className="text-xs text-charcoal-500">
            Select a subject below to explore chapter concepts, launch adaptive practice drills, or take timed tests.
          </p>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </AppShell>
  );
}
