import React from "react";
import { Card } from "./Card";

export interface StatCardProps {
  label: string;
  value: string | number;
  supportingText?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({
  label,
  value,
  supportingText,
  icon,
  className = "",
}: StatCardProps) {
  return (
    <Card padding="md" className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-800 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900 mb-1">
          {value}
        </div>
        {supportingText && (
          <div className="text-xs text-charcoal-500 flex items-center gap-1 font-medium">
            {supportingText}
          </div>
        )}
      </div>
    </Card>
  );
}
