"use client";

import React, { useEffect } from "react";

export interface ToastProps {
  message: string;
  type?: "info" | "success" | "error";
  onClose?: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "info",
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    if (!onClose || duration <= 0) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeDots = {
    info: "bg-ink",
    success: "bg-accent",
    error: "bg-red-600",
  }[type];

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-surface border border-hairline rounded-editorial px-4 py-3 text-sm text-ink font-sans transition-all animate-fade-in"
    >
      <span className={`h-2 w-2 rounded-full ${typeDots}`} aria-hidden="true" />
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss toast"
          className="ml-3 text-muted hover:text-ink text-base leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}
