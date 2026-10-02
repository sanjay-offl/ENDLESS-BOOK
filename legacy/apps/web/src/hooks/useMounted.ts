"use client";

import { useEffect, useState } from "react";

/**
 * False during SSR and on the very first client render, true from the second
 * render onwards.
 *
 * Use it to guard anything that cannot be known on the server - the current
 * date, a random value, `navigator`, an auth avatar - so the first paint is
 * identical on both sides and React never reports a hydration mismatch.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
