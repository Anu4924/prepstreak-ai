import React from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { ContinueLearningItem } from "@/lib/types/analytics";
import { BookOpen, PenTool } from "lucide-react";

interface ContinueLearningCardProps {
  item: ContinueLearningItem;
}

export function ContinueLearningCard({ item }: ContinueLearningCardProps) {
  return (
    <Card
      variant="default"
      padding="lg"
      className="flex flex-col justify-between border border-charcoal-200/80"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-forest-50 text-forest-800 border border-forest-100 uppercase tracking-wide">
            {item.subjectName}
          </span>
          <span className="text-xs text-charcoal-500 font-medium">
            Last studied: {item.lastStudied}
          </span>
        </div>

        <h3 className="text-xl font-bold text-charcoal-900 tracking-tight mb-2">
          {item.topicName}
        </h3>

        <div className="mb-6 bg-charcoal-50/60 p-3 rounded-xl border border-charcoal-100">
          <div className="flex justify-between items-center text-xs font-medium text-charcoal-700 mb-1.5">
            <span>Topic Mastery</span>
            <span className="font-bold text-charcoal-900">{item.progressPercentage}%</span>
          </div>
          <ProgressBar value={item.progressPercentage} height="sm" variant="forest" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-charcoal-100">
        <Button
          href={`/learn?topic=${item.topicId}`}
          variant="primary"
          size="sm"
          className="justify-center"
          leftIcon={<BookOpen className="w-3.5 h-3.5 mr-1" />}
        >
          Continue Learning
        </Button>
        <Button
          href={`/practice?topic=${item.topicId}`}
          variant="outline"
          size="sm"
          className="justify-center"
          leftIcon={<PenTool className="w-3.5 h-3.5 mr-1" />}
        >
          Practice
        </Button>
      </div>
    </Card>
  );
}
