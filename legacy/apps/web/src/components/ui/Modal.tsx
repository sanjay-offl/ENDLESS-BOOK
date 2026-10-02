"use client";

import React, { useEffect } from "react";
import { Eyebrow } from "./Eyebrow";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  eyebrow,
  children,
  className = "",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Crisp flat scrim, no blur */}
      <div
        className="fixed inset-0 bg-ink/25 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Pure white surface with hairline border */}
      <div
        className={`relative z-10 w-full max-w-lg bg-surface border border-hairline rounded-editorial p-6 sm:p-8 text-ink ${className}`}
      >
        <div className="flex items-start justify-between gap-4 pb-4">
          <div className="space-y-1">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {title && (
              <h3 className="font-serif italic text-2xl text-ink font-normal">
                {title}
              </h3>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-muted hover:text-ink transition-colors font-serif text-2xl leading-none focus-visible:outline-2 focus-visible:outline-ink"
          >
            ×
          </button>
        </div>

        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}
