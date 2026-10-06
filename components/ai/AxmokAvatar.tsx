import React from "react";
import { Sparkles, Bot } from "lucide-react";

interface AxmokAvatarProps {
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
  className?: string;
}

export function AxmokAvatar({
  size = "md",
  showStatus = false,
  className = "",
}: AxmokAvatarProps) {
  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4.5 h-4.5",
    lg: "w-5 h-5",
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950 text-almond-200 border border-forest-700/80 shadow-xs flex items-center justify-center`}
      >
        <Bot className={iconSizes[size]} />
        <Sparkles className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-amber-400 animate-pulse" />
      </div>

      {showStatus && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
          title="Axmok AI is active"
        />
      )}
    </div>
  );
}
