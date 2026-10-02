"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  HAS_SEPARATE_POSES,
  POSE_FILES,
  POSE_VIEW_BOX,
  SHEET_VIEW_BOX,
  SPRITE_FILE,
  SPRITE_FOCUS_POSE,
} from "./character-poses.generated";

export type AnimationState =
  | "idle"
  | "wave"
  | "thinking"
  | "celebrating"
  | "encouraging"
  | "walk";

type StateConfig = {
  /** Relative duration hint, used for the accessible label and a11y title. */
  duration: number;
  /** When false the timeline plays once and reports back via onComplete. */
  loop: boolean;
  /** Builds the micro-animation for a container. */
  animation: (el: HTMLDivElement) => gsap.core.Timeline;
};

const STATE_CONFIG: Record<AnimationState, StateConfig> = {
  idle: {
    duration: 3,
    loop: true,
    animation: (el) =>
      gsap
        .timeline({ repeat: -1, yoyo: true })
        .to(el, { y: -6, duration: 1.5, ease: "sine.inOut" }),
  },
  wave: {
    duration: 2,
    loop: true,
    animation: (el) =>
      gsap
        .timeline({ repeat: -1 })
        .to(el, { rotation: 4, duration: 0.4, ease: "sine.inOut" })
        .to(el, { rotation: -4, duration: 0.4, ease: "sine.inOut" })
        .to(el, { rotation: 0, duration: 0.2, ease: "sine.out" }),
  },
  thinking: {
    duration: 2.5,
    loop: true,
    animation: (el) =>
      gsap
        .timeline({ repeat: -1, yoyo: true })
        .to(el, { rotation: -3, y: -4, duration: 1.2, ease: "sine.inOut" }),
  },
  celebrating: {
    duration: 2,
    loop: false,
    animation: (el) =>
      gsap
        .timeline()
        .to(el, { y: -24, duration: 0.3, ease: "power2.out" })
        .to(el, { y: 0, duration: 0.4, ease: "bounce.out" })
        .to(el, { rotation: 8, duration: 0.15, ease: "power1.inOut" })
        .to(el, { rotation: -8, duration: 0.15, ease: "power1.inOut" })
        .to(el, { rotation: 8, duration: 0.15, ease: "power1.inOut" })
        .to(el, { rotation: 0, duration: 0.2, ease: "power1.out" }),
  },
  encouraging: {
    duration: 1.5,
    loop: true,
    animation: (el) =>
      gsap
        .timeline({ repeat: -1, yoyo: true })
        .to(el, { y: -8, scale: 1.02, duration: 0.75, ease: "sine.inOut" }),
  },
  walk: {
    duration: 1,
    loop: true,
    animation: (el) =>
      gsap
        .timeline({ repeat: -1 })
        .to(el, { x: 6, duration: 0.5, ease: "sine.inOut" })
        .to(el, { x: -6, duration: 0.5, ease: "sine.inOut" }),
  },
};

/**
 * Which assets actually exist on this deployment.
 *
 * `poses`  - the six per-pose SVGs were extracted and are being served.
 * `sprite` - only the whole sheet exists; we crop it to the idle region.
 * `none`   - neither, so nothing should be rendered.
 *
 * The probe is memoised at module scope: it runs at most once per page load no
 * matter how many <CharacterAnimation> instances mount.
 */
type Mode = "poses" | "sprite" | "none";

let modePromise: Promise<Mode> | null = null;

function head(url: string): Promise<"ok" | "missing" | "unknown"> {
  return fetch(url, { method: "HEAD" })
    .then((res) => (res.ok ? "ok" : "missing"))
    .catch(() => "unknown");
}

function probeMode(): Promise<Mode> {
  if (modePromise) return modePromise;
  if (typeof window === "undefined") return Promise.resolve("none");

  modePromise = head(POSE_FILES.idle).then(async (poses) => {
    if (poses === "ok") return "poses" as Mode;
    if (poses === "missing") {
      // Per-pose files are genuinely absent - fall back to the whole sheet.
      return (await head(SPRITE_FILE)) === "ok" ? ("sprite" as Mode) : ("none" as Mode);
    }
    // The probe itself failed (offline, CORS, dev-server hiccup). That tells us
    // nothing about whether the files exist, so trust the build-time manifest
    // and let <img onError> degrade if it turns out to be wrong.
    return HAS_SEPARATE_POSES ? ("poses" as Mode) : ("none" as Mode);
  });

  return modePromise;
}

/**
 * CSS box that frames one region of the full sheet inside an arbitrary
 * container, expressed purely as percentages.
 *
 * `background-size` is the sheet size relative to the window we want to show;
 * `background-position` slides the sheet so that window lands at 0,0. Doing it
 * with percentages rather than hand-tuned pixels means the crop stays correct
 * at any container size and needs no re-tuning after re-running the pipeline.
 */
function spriteCrop(state: string) {
  const box = POSE_VIEW_BOX[state] ?? POSE_VIEW_BOX[SPRITE_FOCUS_POSE];
  const sheet = SHEET_VIEW_BOX;
  const freeW = Math.max(sheet.width - box.width, 1);
  const freeH = Math.max(sheet.height - box.height, 1);
  return {
    backgroundImage: `url(${SPRITE_FILE})`,
    backgroundSize: `${(sheet.width / box.width) * 100}% ${(sheet.height / box.height) * 100}%`,
    backgroundPosition: `${-(box.x / freeW) * 100}% ${-(box.y / freeH) * 100}%`,
    backgroundRepeat: "no-repeat",
    aspectRatio: `${box.width} / ${box.height}`,
  } as const;
}

export interface CharacterAnimationProps {
  state?: AnimationState;
  onComplete?: () => void;
  className?: string;
  size?: number;
}

export function CharacterAnimation({
  state = "idle",
  onComplete,
  className = "",
  size = 300,
}: CharacterAnimationProps) {
  const reduced = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const onCompleteRef = useRef(onComplete);
  const [mode, setMode] = useState<Mode>("none");
  const [failed, setFailed] = useState(false);

  const config = STATE_CONFIG[state] ?? STATE_CONFIG.idle;

  // Keep the callback in a ref so an inline arrow function in the parent does
  // not restart the timeline on every re-render.
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let live = true;
    probeMode().then((m) => {
      if (live) setMode(m);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (reduced || !el || mode === "none" || failed) return;

    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
      gsap.set(el, { clearProps: "all" });
    }

    const tl = config.animation(el);
    timelineRef.current = tl;

    if (!config.loop) {
      tl.eventCallback("onComplete", () => onCompleteRef.current?.());
    }

    return () => {
      tl.kill();
      if (timelineRef.current === tl) timelineRef.current = null;
    };
  }, [state, mode, failed, reduced, config]);

  // Reduced motion: no GSAP, but still show the character, just static.
  if (mode === "none" || failed) {
    return (
      <div
        aria-hidden="true"
        role="presentation"
        style={{ width: size, height: size }}
        className={className}
      />
    );
  }

  const usingSprite = mode === "sprite";
  const box = POSE_VIEW_BOX[state] ?? POSE_VIEW_BOX[SPRITE_FOCUS_POSE];
  const aspect = box.width / box.height;

  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{ width: size, height: size }}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center"
      >
        {usingSprite ? (
          // Single-sprite fallback: the whole sheet is painted into a box
          // sized exactly to the focus pose's frame, so the same crop maths
          // works for every state.
          <div
            style={{
              height: "100%",
              ...spriteCrop(state),
            }}
          />
        ) : (
          // next/image is deliberately not used: these are already-optimised
          // 7 KB SVGs served from /public, and the image optimizer would only
          // add a rewrite hop (it cannot optimise SVG anyway).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={POSE_FILES[state] ?? POSE_FILES.idle}
            alt=""
            width={size}
            height={Math.round(size / aspect)}
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-auto max-w-full object-contain"
          />
        )}
      </div>
    </div>
  );
}

export default CharacterAnimation;
