import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ActivityTimelineItem } from "@/lib/types/analytics";
import { CheckCircle2, History, Clock } from "lucide-react";

interface RecentActivityCardProps {
  activities: ActivityTimelineItem[];
}

export function RecentActivityCard({ activities }: RecentActivityCardProps) {
  return (
    <Card variant="default" padding="lg" className="border border-charcoal-200/80">
      <CardHeader className="mb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-forest-700" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
          <CardDescription>
            Your chronological study log and completed sessions.
          </CardDescription>
        </div>
      </CardHeader>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-charcoal-200">
        {activities.map((act) => (
          <div key={act.id} className="relative flex items-start justify-between gap-4">
            {/* Timeline node */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-forest-900 border-2 border-white flex items-center justify-center text-white">
              <CheckCircle2 className="w-3 h-3" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-forest-800">
                {act.timeframe}
              </span>
              <h4 className="text-sm font-semibold text-charcoal-900 mt-0.5">
                {act.actionTitle}
              </h4>
              <p className="text-xs text-charcoal-400 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {act.timestamp}
              </p>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest-50 text-forest-900 border border-forest-100 shrink-0">
              {act.resultBadge}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
