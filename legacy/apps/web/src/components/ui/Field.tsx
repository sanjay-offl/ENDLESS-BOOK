"use client";

import React, { forwardRef } from "react";
import { Eyebrow } from "./Eyebrow";

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-2">
        {label && (
          <label htmlFor={inputId} className="block">
            <Eyebrow>{label}</Eyebrow>
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-transparent border-0 border-b border-hairline py-3 text-base sm:text-lg text-ink placeholder:text-muted/50 focus:border-ink focus:ring-0 focus:outline-none transition-colors duration-200 ${
              error ? "border-red-500" : ""
            } ${className}`}
            {...props}
          />
        </div>

        {error && <p className="text-xs text-red-600 font-sans">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-muted font-sans">{helperText}</p>
        )}
      </div>
    );
  }
);

Field.displayName = "Field";
