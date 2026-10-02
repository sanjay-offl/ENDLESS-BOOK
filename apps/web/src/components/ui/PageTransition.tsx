"use client";

import React, { useEffect, useRef } from "react";
import { cleanupScrollTriggers, isReducedMotion } from "@/lib/motion";
import gsap from "gsap";

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Kill previous route ScrollTriggers on mount
    cleanupScrollTriggers();

    if (!containerRef.current || isReducedMotion()) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.45, ease: "power2.out" }
    );

    return () => {
      cleanupScrollTriggers();
    };
  }, []);

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {children}
    </div>
  );
}
