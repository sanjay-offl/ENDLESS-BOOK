"use client";

import { useEffect, useState } from "react";

/**
 * True when the user has asked the OS to reduce motion.
 *
 * Starts as `false` so the server and the first client render agree, then
 * updates in an effect. Callers that render motion-dependent markup should
 * pair this with `useMounted` to avoid a hydration mismatch.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
