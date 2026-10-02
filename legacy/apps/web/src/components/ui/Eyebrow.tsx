import React from "react";

export interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span" | "div" | "h2" | "h3";
}

export function Eyebrow({
  children,
  className = "",
  as: Component = "p",
}: EyebrowProps) {
  return (
    <Component
      className={`text-xs font-semibold uppercase tracking-[0.18em] text-muted ${className}`}
    >
      {children}
    </Component>
  );
}
