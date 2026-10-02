"use client";

import React, { useEffect, useRef } from "react";
import { animateLineReveal } from "@/lib/motion";

export interface DisplayHeadingProps {
  as?: "h1" | "h2" | "h3" | "h4";
  size?: "hero" | "section" | "title";
  lines?: string[];
  children?: React.ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
  italic?: boolean;
}

export function DisplayHeading({
  as: Component = "h2",
  size = "section",
  lines,
  children,
  className = "",
  animate = true,
  delay = 0.1,
  italic = true,
}: DisplayHeadingProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!animate || !containerRef.current) return;
    const lineElements = containerRef.current.querySelectorAll(".line-reveal-inner");
    if (lineElements.length > 0) {
      animateLineReveal(lineElements, { delay, stagger: 0.08 });
    }
  }, [animate, delay]);

  const sizeClasses = {
    hero: "text-display-hero",
    section: "text-display-section",
    title: "text-display-title",
  }[size];

  const fontStyle = italic ? "font-serif italic" : "font-serif";

  // If explicit lines array provided for line-by-line reveal
  if (lines && lines.length > 0) {
    return (
      <Component
        ref={containerRef}
        className={`${fontStyle} ${sizeClasses} text-ink font-normal ${className}`}
      >
        {lines.map((line, idx) => (
          <span key={idx} className="block overflow-hidden pb-1">
            <span className="line-reveal-inner block translate-y-0 opacity-100 will-change-transform">
              {line}
            </span>
          </span>
        ))}
      </Component>
    );
  }

  // Otherwise, single block
  return (
    <Component
      ref={containerRef}
      className={`${fontStyle} ${sizeClasses} text-ink font-normal ${className}`}
    >
      <span className="block overflow-hidden pb-1">
        <span className="line-reveal-inner block translate-y-0 opacity-100 will-change-transform">
          {children}
        </span>
      </span>
    </Component>
  );
}
