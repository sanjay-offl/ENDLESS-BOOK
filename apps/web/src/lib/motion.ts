"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Check if the user has requested reduced motion.
 */
export function isReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Line reveal animation:
 * Each line slides up from behind an overflow-hidden mask with soft ease.
 */
export function animateLineReveal(
  elements: string | Element | Element[] | NodeListOf<Element>,
  options: {
    delay?: number;
    stagger?: number;
    duration?: number;
  } = {}
) {
  if (typeof window === "undefined") return;

  const { delay = 0.1, stagger = 0.08, duration = 1.0 } = options;

  if (isReducedMotion()) {
    gsap.set(elements, { opacity: 1, y: 0 });
    return;
  }

  return gsap.fromTo(
    elements,
    { y: "108%", opacity: 0 },
    {
      y: "0%",
      opacity: 1,
      duration,
      stagger,
      delay,
      ease: "power3.out",
    }
  );
}

/**
 * Section entrance animation:
 * Fades and rises 24px as it enters viewport via ScrollTrigger.
 */
export function animateSectionReveal(
  element: Element | string,
  options: {
    start?: string;
    y?: number;
    delay?: number;
    duration?: number;
  } = {}
) {
  if (typeof window === "undefined") return;

  const { start = "top 85%", y = 24, delay = 0, duration = 0.9 } = options;

  if (isReducedMotion()) {
    gsap.set(element, { opacity: 1, y: 0 });
    return;
  }

  return gsap.fromTo(
    element,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start,
        once: true,
      },
    }
  );
}

/**
 * Hero image slow scale and parallax scroll effect:
 * Scales from 1.06 to 1 and moves with subtle parallax.
 */
export function animateHeroParallax(
  imageElement: Element | string,
  triggerElement: Element | string
) {
  if (typeof window === "undefined" || isReducedMotion()) return;

  // Initial slow scale settling
  gsap.fromTo(
    imageElement,
    { scale: 1.06 },
    { scale: 1.0, duration: 2.2, ease: "power2.out" }
  );

  // Subtle parallax on scroll
  return gsap.to(imageElement, {
    y: 60,
    ease: "none",
    scrollTrigger: {
      trigger: triggerElement,
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
  });
}

/**
 * Reader page transition:
 * Calm crossfade + 12px horizontal slide over ~500ms.
 */
export function animateReaderPage(
  container: Element | string,
  direction: "next" | "prev" = "next",
  onComplete?: () => void
) {
  if (typeof window === "undefined") {
    onComplete?.();
    return;
  }

  if (isReducedMotion()) {
    gsap.set(container, { opacity: 1, x: 0 });
    onComplete?.();
    return;
  }

  const offset = direction === "next" ? 12 : -12;

  return gsap.fromTo(
    container,
    { opacity: 0, x: offset },
    {
      opacity: 1,
      x: 0,
      duration: 0.5,
      ease: "power2.out",
      onComplete,
    }
  );
}

/**
 * Route cleanup: kill all ScrollTrigger instances
 */
export function cleanupScrollTriggers() {
  if (typeof window === "undefined") return;
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}
