import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({ className = "", size = "md", href = "/" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const markSize = {
    sm: "w-5 h-5 text-xs",
    md: "w-6 h-6 text-sm",
    lg: "w-8 h-8 text-base",
  };

  const content = (
    <div className={`inline-flex items-center gap-2 font-semibold tracking-tight text-forest-900 ${className}`}>
      {/* Minimal academic emblem mark */}
      <span
        className={`${markSize[size]} rounded-lg bg-forest-900 text-white flex items-center justify-center font-bold font-mono shadow-xs`}
        aria-hidden="true"
      >
        P
      </span>
      <span className={`${sizeClasses[size]} font-bold`}>
        PrepStreak <span className="font-medium text-forest-700">AI</span>
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-800 rounded-md">
        {content}
      </Link>
    );
  }

  return content;
}
