"use client";

import React, { useRef, useEffect } from "react";
import { Eyebrow } from "./Eyebrow";
import { animateSectionReveal } from "@/lib/motion";

export interface FigureProps {
  figure: string | number;
  label: string;
  description: React.ReactNode;
  className?: string;
}

export function Figure({
  figure,
  label,
  description,
  className = "",
}: FigureProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    animateSectionReveal(containerRef.current, { y: 24 });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-baseline ${className}`}
    >
      <div className="md:col-span-5 lg:col-span-4">
        <span
          className="block font-serif italic text-[8rem] sm:text-[11rem] lg:text-[14rem] leading-[0.85] text-ink select-none tracking-tighter"
          aria-hidden="true"
        >
          {figure}
        </span>
      </div>

      <div className="md:col-span-7 lg:col-span-8 max-w-editorial space-y-4">
        <Eyebrow>{label}</Eyebrow>
        <div className="text-ink/80 text-base sm:text-lg leading-relaxed font-sans">
          {description}
        </div>
      </div>
    </div>
  );
}
