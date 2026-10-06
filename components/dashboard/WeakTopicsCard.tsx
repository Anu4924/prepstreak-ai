import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { WeakTopicItem } from "@/lib/types/analytics";
import { AlertCircle, PenTool } from "lucide-react";

interface WeakTopicsCardProps {
  topics: WeakTopicItem[];
}

export function WeakTopicsCard({ topics }: WeakTopicsCardProps) {
  return (
    <Card variant="default" padding="lg" className="border border-charcoal-200/80">
      <CardHeader className="mb-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <CardTitle>Topics That Need Practice</CardTitle>
          </div>
          <CardDescription>
            AI-detected areas where accuracy is below your competitive cut-off target.
          </CardDescription>
        </div>
      </CardHeader>

      <div className="space-y-4">
        {topics.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-charcoal-50/60 border border-charcoal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-bold text-charcoal-900">{item.topicName}</span>
                <span className="text-xs font-bold text-amber-700">
                  Accuracy: {item.accuracyPercentage}%
                </span>
              </div>
              <p className="text-xs text-charcoal-500 mb-2">{item.recommendedFocus}</p>
              <ProgressBar
                value={item.accuracyPercentage}
                height="xs"
                variant={item.accuracyPercentage < 60 ? "rose" : "amber"}
              />
            </div>

            <div className="shrink-0">
              <Button
                href={`/practice?topic=${item.topicId}`}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs"
                leftIcon={<PenTool className="w-3 h-3 mr-1" />}
              >
                Practice
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
