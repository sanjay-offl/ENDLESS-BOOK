import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "filled";
  children: React.ReactNode;
  asLink?: boolean;
}

export default function Button({
  variant = "filled",
  children,
  className = "",
  style,
  ...props
}: ButtonProps) {
  const isFilled = variant === "filled";

  const baseStyle: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontSize: "var(--text-xs)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
    borderRadius: 0,
    padding: "0.75rem 1.75rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "all 0.3s cubic-bezier(0.65, 0, 0.35, 1)",
    border: "var(--border-width) solid var(--color-ink)",
    backgroundColor: isFilled ? "var(--color-ink)" : "transparent",
    color: isFilled ? "var(--color-page)" : "var(--color-ink)",
    lineHeight: 1,
    ...style,
  };

  return (
    <button
      {...props}
      className={`btn-editorial ${isFilled ? "btn-filled" : "btn-outline"} ${className}`}
      style={baseStyle}
      onMouseEnter={(e) => {
        if (isFilled) {
          e.currentTarget.style.backgroundColor = "var(--color-accent)";
          e.currentTarget.style.borderColor = "var(--color-accent)";
        } else {
          e.currentTarget.style.backgroundColor = "var(--color-ink)";
          e.currentTarget.style.color = "var(--color-page)";
        }
      }}
      onMouseLeave={(e) => {
        if (isFilled) {
          e.currentTarget.style.backgroundColor = "var(--color-ink)";
          e.currentTarget.style.borderColor = "var(--color-ink)";
        } else {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "var(--color-ink)";
        }
      }}
    >
      {children}
    </button>
  );
}
