import React, { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SplitHeadlineProps {
  text: string;
  as?: "h1" | "h2";
  scrollTrigger?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function SplitHeadline({
  text,
  as = "h1",
  scrollTrigger = false,
  className = "",
  style,
}: SplitHeadlineProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chars = el.querySelectorAll(".char");
    if (!chars.length) return;

    // Reset initial state
    gsap.set(chars, { yPercent: 110 });

    if (scrollTrigger) {
      const anim = gsap.to(chars, {
        yPercent: 0,
        stagger: 0.025,
        duration: 0.7,
        ease: "expo.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
      return () => {
        anim.scrollTrigger?.kill();
        anim.kill();
      };
    } else {
      const anim = gsap.to(chars, {
        yPercent: 0,
        stagger: 0.025,
        duration: 0.7,
        ease: "expo.out",
      });
      return () => {
        anim.kill();
      };
    }
  }, [text, scrollTrigger]);

  const Tag = as;

  // Split into words, then characters, preserving space wrapping
  const words = text.split(" ");

  return (
    <Tag
      ref={containerRef}
      // The visual gap between words used to come from a margin alone, which left the
      // accessible text as one unbroken string ("WHATISAWWHENIWASAKID") for screen
      // readers, search indexing and copy-paste. Real space characters are emitted
      // between the word spans so the rendered text matches `text`.
      aria-label={text}
      className={`headline-wrap ${className}`}
      style={{
        display: "inline-block",
        lineHeight: "0.85em",
        ...style,
      }}
    >
      {words.map((word, wIdx) => (
        <Fragment key={wIdx}>
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              whiteSpace: "nowrap",
            }}
          >
            {Array.from(word).map((char, cIdx) => (
              <span key={cIdx} className="char-wrap">
                <span className="char">{char}</span>
              </span>
            ))}
          </span>
          {/* A real space keeps the words separated in the rendered text; the split
              spans alone collapse to "WHATISAWWHENIWASAKID" when copied or read out. */}
          {wIdx < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
