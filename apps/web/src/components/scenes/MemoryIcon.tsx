import { cn } from "@/lib/utils";
import type { ReactElement } from "react";

const iconPaths: Record<string, ReactElement> = {
  bangles: (
    <>
      <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="24" cy="24" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  sticker: (
    <>
      <polygon points="24,4 44,24 24,44 4,24" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="6" fill="currentColor" opacity="0.3" />
    </>
  ),
  train: (
    <>
      <rect x="6" y="16" width="24" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <rect x="30" y="20" width="10" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="14" cy="38" r="4" fill="currentColor" />
      <circle cx="26" cy="38" r="4" fill="currentColor" />
    </>
  ),
  kite: (
    <>
      <polygon points="24,4 44,24 24,44 4,24" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="currentColor" strokeWidth="1.5" />
      <line x1="4" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  marble: (
    <>
      <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="18" cy="18" r="5" fill="currentColor" opacity="0.3" />
    </>
  ),
  "paper-boat": (
    <>
      <polygon points="24,6 42,36 6,36" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <polygon points="24,6 34,36 14,36" fill="currentColor" opacity="0.2" />
    </>
  ),
  pencil: (
    <>
      <rect x="20" y="4" width="8" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <polygon points="20,26 28,26 24,38" fill="none" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  "school-bag": (
    <>
      <rect x="8" y="14" width="32" height="26" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M16 14 Q16,6 24,6 Q32,6 32,14" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </>
  ),
};

interface MemoryIconProps {
  icon: string;
  className?: string;
  size?: number;
}

export function MemoryIcon({ icon, className, size = 48 }: MemoryIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("text-current", className)}
      aria-hidden="true"
    >
      {iconPaths[icon] || iconPaths.bangles}
    </svg>
  );
}
