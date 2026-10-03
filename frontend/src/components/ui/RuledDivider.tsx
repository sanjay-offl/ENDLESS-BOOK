import React from "react";

interface RuledDividerProps {
  label?: string;
  className?: string;
  dashed?: boolean;
}

export default function RuledDivider({
  label,
  className = "",
  dashed = false,
}: RuledDividerProps) {
  const lineStyle: React.CSSProperties = {
    flex: 1,
    borderTop: dashed ? "var(--border-dashed)" : "var(--border-thin) solid var(--color-ink)",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-xxs)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "var(--color-ink)",
    padding: "0 0.5rem",
    whiteSpace: "nowrap",
  };

  return (
    <div
      className={`ruled-divider ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        width: "100%",
        margin: "1.5rem 0",
      }}
    >
      <div style={lineStyle} />
      {label && <span style={labelStyle}>{label}</span>}
      <div style={lineStyle} />
    </div>
  );
}
