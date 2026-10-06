import React from "react";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  href?: string;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-forest-800 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm rounded-xl gap-2",
    lg: "px-6 py-3 text-base rounded-xl gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-forest-900 text-white hover:bg-forest-800 active:bg-forest-950 shadow-xs hover:shadow-subtle border border-forest-900",
    secondary:
      "bg-almond-100 text-forest-900 hover:bg-almond-200 active:bg-almond-300 border border-almond-300 shadow-xs",
    outline:
      "border border-charcoal-200 bg-white text-charcoal-800 hover:bg-forest-50 hover:text-forest-900 hover:border-forest-300 active:bg-forest-100",
    ghost:
      "text-charcoal-700 hover:bg-charcoal-100/70 hover:text-charcoal-900 active:bg-charcoal-200/60",
    danger:
      "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 active:bg-red-200",
  };

  const combinedClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {rightIcon}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {rightIcon}
    </button>
  );
}
