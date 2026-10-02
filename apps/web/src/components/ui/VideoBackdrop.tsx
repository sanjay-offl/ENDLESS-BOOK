"use client";

import { useEffect, useRef, useState } from "react";

export interface VideoBackdropProps {
  /** Path to the looping video. Probed with HEAD before anything renders. */
  src?: string;
  /** Still image shown underneath / instead of the video. */
  poster?: string;
  className?: string;
  /** Class applied to the still layer. */
  posterClassName?: string;
  /** Class applied to the editorial contrast overlay. */
  overlayClassName?: string;
  /** Tailwind gradient classes for the base layer. */
  fallbackGradient?: string;
  /** Applied to the gradient placeholder. */
  fallbackClassName?: string;
  ariaLabel?: string;
}

const DEFAULT_GRADIENT =
  "from-[#5B8DB8]/20 via-[#E8B93C]/15 to-[#F6F3EC]";

/**
 * A decorative, muted, looping video that degrades cleanly.
 *
 * The repository ships without any video assets, so this component never
 * assumes the file exists:
 *   1. a HEAD probe decides whether the file is there at all,
 *   2. if it is not, only the gradient / poster still is painted - the network
 *      tab stays clean instead of logging a 404,
 *   3. playback is paused whenever the element scrolls out of view.
 */
export function VideoBackdrop({
  src,
  poster,
  className = "",
  posterClassName = "",
  overlayClassName = "bg-canvas/20",
  fallbackGradient = DEFAULT_GRADIENT,
  fallbackClassName = "",
  ariaLabel = "Atmospheric visual backdrop",
}: VideoBackdropProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoAvailable, setVideoAvailable] = useState(false);

  // Probe before rendering <video> so a missing file never reaches the network
  // layer (and never 404s in the console).
  useEffect(() => {
    if (!src) {
      setVideoAvailable(false);
      return;
    }
    let live = true;
    fetch(src, { method: "HEAD" })
      .then((res) => {
        if (live) setVideoAvailable(res.ok);
      })
      .catch(() => {
        if (live) setVideoAvailable(false);
      });
    return () => {
      live = false;
    };
  }, [src]);

  // Only play while on screen.
  useEffect(() => {
    const node = containerRef.current;
    if (!videoAvailable || !node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video) return;
        if (entry.isIntersecting) {
          video.play().catch(() => {
            /* autoplay blocked, or not enough data yet */
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [videoAvailable]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
      aria-label={ariaLabel}
    >
      {/* Gradient base - always present, so nothing is ever blank. */}
      <div
        className={`absolute inset-0 bg-gradient-to-b transition-opacity duration-1000 ${fallbackGradient} ${fallbackClassName}`}
        style={{
          backgroundImage:
            "linear-gradient(to bottom, var(--tw-gradient-stops)), radial-gradient(ellipse at 50% 60%, rgba(11,10,9,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Poster still. */}
      {poster && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${posterClassName}`}
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}

      {/* Video slot - only mounted once the file is known to exist. */}
      {videoAvailable && src && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          onError={() => setVideoAvailable(false)}
          className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000"
        />
      )}

      {/* Editorial overlay to guarantee text contrast. */}
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </div>
  );
}

export default VideoBackdrop;
