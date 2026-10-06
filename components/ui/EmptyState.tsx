import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-charcoal-300 bg-charcoal-50/50 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-almond-100 border border-almond-200 flex items-center justify-center text-forest-800 mb-4">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-charcoal-900 mb-1">{title}</h3>
      <p className="text-sm text-charcoal-500 max-w-xs mb-6">{description}</p>
      {actionText && (
        <Button
          size="sm"
          variant="primary"
          href={actionHref}
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
