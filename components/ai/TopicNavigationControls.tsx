import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  PenTool,
} from "lucide-react";

interface TopicNavigationControlsProps {
  examId: string;
  subjectId: string;
  currentTopicId: string;
  previousTopic?: { id: string; name: string } | null;
  nextTopic?: { id: string; name: string } | null;
  className?: string;
}

export function TopicNavigationControls({
  examId,
  subjectId,
  currentTopicId,
  previousTopic,
  nextTopic,
  className = "",
}: TopicNavigationControlsProps) {
  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl bg-white border border-charcoal-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* Left Action: Back to Topics syllabus */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Link
          href={`/exams/${examId}/${subjectId}`}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-charcoal-700 hover:text-forest-900 bg-charcoal-50 hover:bg-forest-50 border border-charcoal-200 transition-all w-full sm:w-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Topics</span>
        </Link>
      </div>

      {/* Center: Previous & Next Topic controls */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
        {previousTopic ? (
          <Link
            href={`/exams/${examId}/${subjectId}/${previousTopic.id}/learn`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-charcoal-800 bg-white hover:bg-charcoal-100 border border-charcoal-200 shadow-2xs transition-all max-w-[170px] truncate"
            title={`Go to previous topic: ${previousTopic.name}`}
          >
            <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Prev: {previousTopic.name}</span>
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-charcoal-300 bg-charcoal-50 border border-charcoal-100 cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous Topic</span>
          </button>
        )}

        {nextTopic ? (
          <Link
            href={`/exams/${examId}/${subjectId}/${nextTopic.id}/learn`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-forest-950 bg-almond-50 hover:bg-almond-100 border border-almond-200 shadow-2xs transition-all max-w-[170px] truncate"
            title={`Go to next topic: ${nextTopic.name}`}
          >
            <span className="truncate">Next: {nextTopic.name}</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-forest-800" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-charcoal-300 bg-charcoal-50 border border-charcoal-100 cursor-not-allowed"
          >
            <span>Next Topic</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right Action: Launch Practice questions */}
      <div className="w-full sm:w-auto flex justify-end">
        <Button
          href={`/exams/${examId}/${subjectId}/${currentTopicId}/practice`}
          variant="primary"
          size="sm"
          className="w-full sm:w-auto justify-center"
          leftIcon={<PenTool className="w-3.5 h-3.5 mr-1" />}
        >
          Start Practice
        </Button>
      </div>
    </div>
  );
}
