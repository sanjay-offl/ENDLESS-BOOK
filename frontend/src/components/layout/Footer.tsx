import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "var(--border-width) solid var(--color-ink)",
        backgroundColor: "var(--color-page)",
        padding: "var(--content-margin) var(--site-margin)",
        marginTop: "auto",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2.5rem",
            alignItems: "start",
          }}
        >
          {/* Col 1: Manifesto */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-lg)",
                textTransform: "uppercase",
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "var(--color-ink)",
              }}
            >
              WHAT I SAW WHEN I WAS A KID
            </span>
            <p
              style={{
                fontFamily: "var(--font-editorial)",
                fontStyle: "italic",
                fontSize: "var(--text-sm)",
                lineHeight: 1.5,
                color: "var(--color-ink)",
                opacity: 0.85,
              }}
            >
              “An endless, collaborative chronicle of childhood memories. Each chapter holds exactly three pages,
              written by three different strangers across the world.”
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xxs)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--color-gold)",
                fontWeight: 700,
              }}
            >
              DIRECTORY
            </span>
            <Link to="/" className="link-draw" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Home
            </Link>
            <Link to="/chapters" className="link-draw" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              All Chapters
            </Link>
            <Link to="/submit" className="link-draw" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Contribute A Page
            </Link>
          </div>

          {/* Col 3: Principles / Stack */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xxs)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--color-gold)",
                fontWeight: 700,
              }}
            >
              COLOPHON
            </span>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-xs)",
                color: "var(--color-ink)",
                opacity: 0.8,
                lineHeight: 1.5,
              }}
            >
              Typeset in Alumni Sans, Playfair Display & Source Serif 4. Designed with the editorial clarity of classical typography.
            </p>
          </div>
        </div>

        {/* Bottom Rule & Copyright */}
        <div
          style={{
            borderTop: "var(--border-thin) solid var(--color-ink)",
            paddingTop: "1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xxs)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--color-ink)",
            opacity: 0.75,
          }}
        >
          <span>THE ENDLESS BOOK ARCHIVE © {new Date().getFullYear()}</span>
          <span>A COMMUNITY MEMORY PROJECT</span>
        </div>
      </div>
    </footer>
  );
}
