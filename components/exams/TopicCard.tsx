import React from "react";
import { Topic } from "@/lib/types/exam";
import { Card } from "@/components/ui/Card";
import { DifficultyBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Sparkles, PenTool, CheckSquare, Clock } from "lucide-react";

interface TopicCardProps {
  topic: Topic;
}

export function TopicCard({ topic }: TopicCardProps) {
  return (
    <Card
      variant="default"
      padding="md"
      className="flex flex-col justify-between h-full border border-charcoal-200/80 hover:border-forest-300 hover:shadow-subtle transition-all"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <DifficultyBadge difficulty={topic.difficulty} />
          <span className="text-[11px] font-medium text-charcoal-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-charcoal-400" />
            Practiced: {topic.lastPracticed}
          </span>
        </div>

        <h4 className="text-base font-bold text-charcoal-900 mb-1.5 line-clamp-1">
          {topic.name}
        </h4>

        <p className="text-xs text-charcoal-600 line-clamp-2 mb-4 leading-relaxed">
          {topic.description}
        </p>

        {/* Progress & count metrics */}
        <div className="mb-4 bg-charcoal-50/70 p-2.5 rounded-xl border border-charcoal-100">
          <div className="flex justify-between items-center text-xs text-charcoal-600 mb-1.5">
            <span>Mastery Score</span>
            <span className="font-bold text-charcoal-900">{topic.progress}%</span>
          </div>
          <ProgressBar
            value={topic.progress}
            height="xs"
            variant={
              topic.progress < 60
                ? "amber"
                : topic.progress < 80
                ? "forest"
                : "emerald"
            }
          />
          <div className="mt-1.5 flex justify-between items-center text-[11px] text-charcoal-500">
            <span>
              {topic.completedQuestions} of {topic.totalQuestions} solved
            </span>
            <span className="font-medium text-forest-800">{topic.importance} Importance</span>
          </div>
        </div>
      </div>

      {/* 3 Actions: Learn, Practice, Test */}
      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-charcoal-100">
        <Button
          href={`/exams/${topic.examId}/${topic.subjectId}/${topic.id}/learn`}
          variant="secondary"
          size="sm"
          className="text-xs px-2 py-1.5 justify-center"
          title="Learn concept with Axmok AI"
        >
          <Sparkles className="w-3 h-3 mr-1 text-forest-700" />
          Learn
        </Button>
        <Button
          href={`/exams/${topic.examId}/${topic.subjectId}/${topic.id}/practice`}
          variant="outline"
          size="sm"
          className="text-xs px-2 py-1.5 justify-center"
          title="Practice questions with Axmok AI"
        >
          <PenTool className="w-3 h-3 mr-1" />
          Practice
        </Button>
        <Button
          href={`/tests?topic=${topic.id}&examId=${topic.examId}&subjectId=${topic.subjectId}`}
          variant="ghost"
          size="sm"
          className="text-xs px-2 py-1.5 justify-center border border-charcoal-200"
          title="Take timed topic test"
        >
          <CheckSquare className="w-3 h-3 mr-1" />
          Test
        </Button>
      </div>
    </Card>
  );
}
