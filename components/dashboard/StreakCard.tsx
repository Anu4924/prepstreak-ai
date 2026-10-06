import React from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { TodayGoal } from "@/lib/types/analytics";
import { Target, ArrowRight } from "lucide-react";

interface TodayGoalCardProps {
  goal: TodayGoal;
}

export function TodayGoalCard({ goal }: TodayGoalCardProps) {
  return (
    <Card
      variant="almond"
      padding="lg"
      className="flex flex-col justify-between border border-almond-300"
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-forest-900 text-white flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-charcoal-900">Today&apos;s Goal</h3>
              <p className="text-xs text-charcoal-600">Daily target: {goal.targetQuestions} questions</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-forest-100 text-forest-900 border border-forest-200">
            {goal.progressPercentage}%
          </span>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-2xl font-extrabold text-charcoal-900">
              {goal.completedQuestions}{" "}
              <span className="text-sm font-normal text-charcoal-500">
                / {goal.targetQuestions} Questions
              </span>
            </div>
            <span className="text-xs font-medium text-charcoal-600">
              Remaining:{" "}
              <strong className="text-forest-900">{goal.remainingQuestions} questions</strong>
            </span>
          </div>

          <ProgressBar value={goal.progressPercentage} height="md" variant="forest" />
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
          Continue Practice
        </Button>
      </div>
    </Card>
  );
}
