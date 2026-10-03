import React from "react";

interface TagChipProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

export default function TagChip({ label, onClick, className = "" }: TagChipProps) {
  const chipStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "var(--color-cream)",
    border: "var(--border-thin) solid var(--color-rule)",
    borderRadius: "2px",
    padding: "0.25rem 0.6rem",
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-xxs)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "var(--color-ink)",
    lineHeight: 1,
    cursor: onClick ? "pointer" : "default",
    transition: "border-color 0.2s ease, background-color 0.2s ease",
  };

  return (
    <span
      className={`tag-chip ${className}`}
      style={chipStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = "var(--color-accent)";
          e.currentTarget.style.backgroundColor = "var(--color-page)";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = "var(--color-rule)";
          e.currentTarget.style.backgroundColor = "var(--color-cream)";
        }
      }}
    >
      #{label}
    </span>
  );
}
