import React from "react";
import { Subject } from "@/lib/types/exam";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import {
  BrainCircuit,
  Calculator,
  BookOpen,
  Globe,
  Landmark,
  ArrowRight,
  CheckSquare,
} from "lucide-react";

interface SubjectCardProps {
  subject: Subject;
}

const ICON_MAP: Record<string, React.ElementType> = {
  BrainCircuit,
  Calculator,
  BookOpen,
  Globe,
  Landmark,
};

export function SubjectCard({ subject }: SubjectCardProps) {
  const IconComponent = ICON_MAP[subject.iconName] || BookOpen;

  return (
    <Card
      variant="interactive"
      padding="lg"
      className="flex flex-col justify-between h-full border border-charcoal-200/80 group"
    >
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-800 shrink-0 group-hover:scale-105 transition-transform">
            <IconComponent className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-almond-100 text-charcoal-800 border border-almond-200">
            {subject.topicCount} Topics
          </span>
        </div>

        <h3 className="text-lg font-bold text-charcoal-900 group-hover:text-forest-900 transition-colors mb-1">
          {subject.name}
        </h3>

        <p className="text-xs text-charcoal-500 font-medium mb-3">
          Weightage: {subject.weightage}
        </p>

        <p className="text-sm text-charcoal-600 line-clamp-2 mb-6">
          {subject.shortDescription}
        </p>
      </div>

      <div className="pt-4 border-t border-charcoal-100 space-y-4">
        <div>
          <div className="flex justify-between items-center text-xs font-medium text-charcoal-700 mb-1.5">
            <span>Syllabus Coverage</span>
            <span className="font-bold text-charcoal-900">{subject.progress}%</span>
          </div>
          <ProgressBar value={subject.progress} height="sm" variant="forest" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            href={`/exams/${subject.examId}/${subject.id}`}
            variant="outline"
            size="sm"
            className="justify-center group-hover:border-forest-700 transition-all text-xs"
            rightIcon={<ArrowRight className="w-3 h-3 ml-1" />}
          >
            Topics
          </Button>
          <Button
            href={`/tests?examId=${subject.examId}&subjectId=${subject.id}`}
            variant="ghost"
            size="sm"
            className="justify-center border border-charcoal-200 hover:bg-forest-900 hover:text-white hover:border-forest-900 transition-all text-xs"
            leftIcon={<CheckSquare className="w-3 h-3 mr-1" />}
          >
            Take Test
          </Button>
        </div>
      </div>
    </Card>
  );
}
