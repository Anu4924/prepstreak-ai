import React from "react";

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  height?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  labelPrefix?: string;
  variant?: "forest" | "emerald" | "amber" | "rose";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  height = "sm",
  showLabel = false,
  labelPrefix = "",
  variant = "forest",
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const heightStyles = {
    xs: "h-1.5",
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const fillVariants = {
    forest: "bg-forest-900",
    emerald: "bg-emerald-600",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-charcoal-700 mb-1.5">
          <span>{labelPrefix}</span>
          <span className="font-semibold text-charcoal-900">{percentage}%</span>
        </div>
      )}
      <div
        className={`w-full bg-charcoal-100 rounded-full overflow-hidden ${heightStyles[height]}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${fillVariants[variant]} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
