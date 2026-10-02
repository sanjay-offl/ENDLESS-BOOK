"use client";

import React, { forwardRef } from "react";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  href?: string;
  arrow?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      href,
      arrow = true,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: "px-5 py-2 text-xs",
      md: "px-6 py-2.5 text-sm",
      lg: "px-8 py-3.5 text-base",
    }[size];

    if (variant === "secondary") {
      const content = (
        <span className={`editorial-link group inline-flex items-center gap-2 ${className}`}>
          <span>{children}</span>
          {arrow && (
            <span
              className="inline-block transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          )}
        </span>
      );

      if (href) {
        return (
          <Link href={href} className="inline-block" ref={ref as React.Ref<HTMLAnchorElement>}>
            {content}
          </Link>
        );
      }
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          disabled={disabled}
          className="bg-transparent border-0 p-0 text-left"
          {...props}
        >
          {content}
        </button>
      );
    }

    const baseStyles =
      "group relative inline-flex items-center justify-center gap-3 rounded-full font-medium transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2";

    const variantStyles = {
      primary: "bg-ink text-canvas hover:bg-ink/90",
      outline: "border border-hairline bg-transparent text-ink hover:border-ink/40",
      danger: "border border-red-500/20 bg-transparent text-red-600 hover:bg-red-50",
    }[variant];

    const inner = (
      <>
        {/* Rolling label mechanism */}
        <span className="roll-label-container" aria-label={typeof children === "string" ? children : undefined}>
          <span className="roll-label-item" aria-hidden="true">
            {children}
          </span>
          <span className="roll-label-item" aria-hidden="true">
            {children}
          </span>
        </span>

        {arrow && (
          <span
            className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1"
            aria-hidden="true"
          >
            →
          </span>
        )}
      </>
    );

    if (href) {
      return (
        <Link
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        >
          {inner}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {inner}
      </button>
    );
  }
);

Button.displayName = "Button";
