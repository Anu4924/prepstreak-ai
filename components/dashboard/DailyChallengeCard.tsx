import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DailyChallengeInfo } from "@/lib/types/analytics";
import { Flame, ArrowRight } from "lucide-react";

interface DailyChallengeCardProps {
  challenge: DailyChallengeInfo;
}

export function DailyChallengeCard({ challenge }: DailyChallengeCardProps) {
  return (
    <Card
      variant="default"
      padding="lg"
      className="border-2 border-forest-800 bg-linear-to-br from-white to-forest-50/30 flex flex-col justify-between shadow-card"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-100 text-amber-800">
              <Flame className="w-4 h-4 fill-amber-500" />
            </span>
            <span className="text-xs font-bold text-forest-900 uppercase tracking-wider">
              High-Yield Sprint
            </span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-forest-900 text-white">
            Today
          </span>
        </div>

        <h3 className="text-xl font-bold text-charcoal-900 tracking-tight mb-1">
          {challenge.title}
        </h3>
        <p className="text-xs text-charcoal-600 mb-5">{challenge.description}</p>

        {/* 3 Metric Pills: Questions, Time, XP */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-white border border-charcoal-200/80 mb-5 text-center">
          <div>
            <div className="text-[11px] text-charcoal-500 font-medium">Questions</div>
            <div className="text-base font-bold text-charcoal-900">{challenge.questionCount}</div>
          </div>
          <div className="border-x border-charcoal-100">
            <div className="text-[11px] text-charcoal-500 font-medium">Time Limit</div>
            <div className="text-base font-bold text-charcoal-900">{challenge.timeLimitMinutes} min</div>
          </div>
          <div>
            <div className="text-[11px] text-charcoal-500 font-medium">Reward</div>
            <div className="text-base font-bold text-amber-700">+{challenge.xpReward} XP</div>
          </div>
        </div>
      </div>

      <div>
        <Button
          href="/daily-challenge"
          variant="primary"
          size="md"
          className="w-full justify-center"
          rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
        >
          Start Challenge
        </Button>
      </div>
    </Card>
  );
}
