import React from "react";
import { Exam } from "@/lib/types/exam";
import { Card } from "@/components/ui/Card";
import { Badge, DifficultyBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BookOpen, Clock, ArrowRight, Building2, GraduationCap, CheckCircle2 } from "lucide-react";

interface ExamCardProps {
  exam: Exam;
}

export function ExamCard({ exam }: ExamCardProps) {
  const subjectCount = exam.subjectCount || exam.subjects?.length || 4;

  return (
    <Card
      variant="interactive"
      padding="lg"
      className="flex flex-col justify-between h-full border border-forest-200/90 ring-1 ring-forest-100 hover:border-forest-300 hover:shadow-hover transition-all bg-white"
    >
      <div>
        {/* Top Badges: Category & Difficulty */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="forest" size="sm">
              {exam.category}
            </Badge>
            {exam.subCategory && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-almond-100 text-charcoal-700 border border-almond-200/70">
                {exam.subCategory}
              </span>
            )}
          </div>
          <DifficultyBadge difficulty={exam.difficulty || "Medium"} />
        </div>

        {/* Exam Title & Organization */}
        <h3 className="text-xl font-bold text-charcoal-900 tracking-tight mb-1 group-hover:text-forest-900 transition-colors">
          {exam.name}
        </h3>
        
        <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mb-2">
          <Building2 className="w-3.5 h-3.5 text-forest-700 shrink-0" />
          <span className="font-medium line-clamp-1">{exam.organization}</span>
        </div>

        <p className="text-xs font-semibold text-forest-800 uppercase tracking-wide mb-3">
          {exam.tagline || `${exam.category} • Official Pattern`}
        </p>

        <p className="text-xs text-charcoal-600 line-clamp-2 mb-4 leading-relaxed">
          {exam.description}
        </p>

        {/* Eligibility Pill */}
        {exam.eligibility && (
          <div className="flex items-start gap-1.5 p-2 rounded-xl bg-charcoal-50 border border-charcoal-100 mb-4 text-[11px] text-charcoal-600">
            <GraduationCap className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
            <span className="line-clamp-1 font-medium">{exam.eligibility}</span>
          </div>
        )}

        {/* Exam metadata */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-charcoal-100 mb-4 text-xs text-charcoal-600">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-forest-700 shrink-0" />
            <span>
              <strong>{subjectCount}</strong> Subjects
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest-700 shrink-0" />
            <span>
              <strong>{exam.durationMinutes || 60}</strong> mins test
            </span>
          </div>
        </div>

        {/* Key Highlights */}
        {exam.highlights && exam.highlights.length > 0 && (
          <ul className="space-y-1.5 mb-5">
            {exam.highlights.slice(0, 2).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-charcoal-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <Button
          href={`/exams/${exam.id}`}
          variant="primary"
          size="md"
          className="w-full justify-center group-hover:shadow-subtle"
          rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
        >
          Select Exam & Syllabus
        </Button>
      </div>
    </Card>
  );
}
