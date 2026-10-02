"use client";

import React, { forwardRef } from "react";
import { Eyebrow } from "./Eyebrow";

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className = "", id, rows = 4, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-2">
        {label && (
          <label htmlFor={inputId} className="block">
            <Eyebrow>{label}</Eyebrow>
          </label>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            id={inputId}
            rows={rows}
            className={`w-full bg-transparent border-0 border-b border-hairline py-3 text-base sm:text-lg text-ink placeholder:text-muted/50 focus:border-ink focus:ring-0 focus:outline-none transition-colors duration-200 resize-y leading-relaxed ${
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

TextArea.displayName = "TextArea";
