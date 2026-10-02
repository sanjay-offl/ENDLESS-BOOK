"use client";

import React, { useRef, useEffect } from "react";
import { animateSectionReveal } from "@/lib/motion";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "footer" | "article";
  animate?: boolean;
  fullWidth?: boolean;
  spacing?: "hero" | "default" | "tight" | "none";
  children: React.ReactNode;
}

export function Section({
  as: Component = "section",
  animate = true,
  fullWidth = false,
  spacing = "default",
  className = "",
  children,
  ...props
}: SectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate || !sectionRef.current) return;
    animateSectionReveal(sectionRef.current);
  }, [animate]);

  const spacingStyles = {
    hero: "min-h-screen py-24 md:py-32",
    default: "py-20 sm:py-28 md:py-36 lg:py-44",
    tight: "py-12 sm:py-16 md:py-20",
    none: "",
  }[spacing];

  if (fullWidth) {
    return (
      <Component
        ref={sectionRef as unknown as React.Ref<HTMLDivElement>}
        className={`${spacingStyles} ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      ref={sectionRef as unknown as React.Ref<HTMLDivElement>}
      className={`w-full ${spacingStyles} ${className}`}
      {...props}
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10 md:px-16">
        {children}
      </div>
    </Component>
  );
}
