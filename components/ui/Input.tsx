import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      isPasswordToggle = false,
      type = "text",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const effectiveType = isPasswordToggle ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-charcoal-800 mb-1.5 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-charcoal-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            className={`w-full bg-white border ${
              error
                ? "border-red-400 focus:border-red-600 focus:ring-red-200"
                : "border-charcoal-200 focus:border-forest-800 focus:ring-forest-100"
            } rounded-xl text-charcoal-900 placeholder:text-charcoal-400 text-sm px-3.5 py-2.5 transition-all duration-150 focus:outline-hidden focus:ring-3 ${
              leftIcon ? "pl-10" : ""
            } ${isPasswordToggle ? "pr-10" : ""} ${className}`}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {isPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-charcoal-400 hover:text-charcoal-700 p-1 rounded-md focus:outline-hidden"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-red-600 mt-1 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-charcoal-500 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
