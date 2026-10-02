import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F6F3EC",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#0B0A09",
          muted: "#6B675F",
        },
        muted: "#6B675F",
        hairline: "rgba(11, 10, 9, 0.12)",
        accent: {
          DEFAULT: "#E8B93C",
          soft: "rgba(232, 185, 60, 0.18)",
        },
        cerulean: {
          DEFAULT: "#5B8DB8",
          tint: "rgba(91, 141, 184, 0.08)",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Fraunces", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        tamil: ["var(--font-tamil)", "serif"],
        devanagari: ["var(--font-devanagari)", "serif"],
        telugu: ["var(--font-telugu)", "serif"],
        malayalam: ["var(--font-malayalam)", "serif"],
        kannada: ["var(--font-kannada)", "serif"],
      },
      fontSize: {
        "display-hero": ["clamp(4.5rem, 10vw, 10rem)", { lineHeight: "0.98", letterSpacing: "-0.03em" }],
        "display-section": ["clamp(2.5rem, 5.5vw, 5.5rem)", { lineHeight: "1.02", letterSpacing: "-0.025em" }],
        "display-title": ["clamp(2.25rem, 4vw, 4rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "reader-body": ["clamp(1.25rem, 1.6vw, 1.375rem)", { lineHeight: "1.75" }],
      },
      maxWidth: {
        editorial: "560px",
        reader: "62ch",
      },
      borderRadius: {
        editorial: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
