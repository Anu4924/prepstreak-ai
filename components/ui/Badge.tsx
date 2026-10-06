import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "forest" | "almond" | "neutral" | "success" | "warning" | "danger" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium rounded-md",
    md: "px-2.5 py-1 text-xs font-medium rounded-full",
  };

  const variantStyles = {
    forest: "bg-forest-50 text-forest-800 border border-forest-200/80",
    almond: "bg-almond-100 text-charcoal-800 border border-almond-300",
    neutral: "bg-charcoal-100 text-charcoal-700 border border-charcoal-200",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border border-amber-200",
    danger: "bg-red-50 text-red-800 border border-red-200",
    outline: "bg-white text-charcoal-700 border border-charcoal-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({
  difficulty,
  className = "",
}: {
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed" | string;
  className?: string;
}) {
  const styles: Record<string, string> = {
    Easy: "bg-emerald-50 text-emerald-800 border-emerald-200",
    Medium: "bg-amber-50 text-amber-800 border-amber-200",
    Hard: "bg-rose-50 text-rose-800 border-rose-200",
    Mixed: "bg-purple-50 text-purple-800 border-purple-200",
  };

  const dotColors: Record<string, string> = {
    Easy: "bg-emerald-500",
    Medium: "bg-amber-500",
    Hard: "bg-rose-500",
    Mixed: "bg-purple-500",
  };

  const resolvedStyle = styles[difficulty] || styles.Medium;
  const resolvedDot = dotColors[difficulty] || dotColors.Medium;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${resolvedStyle} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${resolvedDot}`} />
      {difficulty}
    </span>
  );
}
