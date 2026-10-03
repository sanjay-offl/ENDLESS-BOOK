import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useContributor } from "../../hooks/useContributor";

export default function Header() {
  const { contributor } = useContributor();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 100,
        backgroundColor: "var(--color-page)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "var(--border-width) solid var(--color-ink)",
        height: "var(--header-height)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        className="container"
        style={{
          padding: "0 var(--site-margin)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Left: Book Title */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-sm)",
            textTransform: "uppercase",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "var(--color-ink)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <img
            src="/logo.png"
            alt="The Endless Book logo"
            style={{
              width: "3.5rem",
              height: "2.25rem",
              objectFit: "cover",
              objectPosition: "center",
              flexShrink: 0,
            }}
          />
          <span>THE ENDLESS BOOK</span>
          <span
            style={{
              fontFamily: "var(--font-editorial)",
              fontSize: "var(--text-xs)",
              textTransform: "none",
              fontStyle: "italic",
              fontWeight: 400,
              opacity: 0.7,
              display: "none",
            }}
            className="header-subtitle"
          >
            — What I Saw When I Was a Kid
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2.5rem",
          }}
          className="desktop-nav"
        >
          <Link
            to="/chapters"
            className={`link-draw ${location.pathname.startsWith("/chapters") ? "link-draw--accent" : ""}`}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xs)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
              color: location.pathname.startsWith("/chapters") ? "var(--color-accent)" : "var(--color-ink)",
            }}
          >
            Chapters
          </Link>

          <Link
            to="/submit"
            className={`link-draw ${location.pathname === "/submit" ? "link-draw--accent" : ""}`}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xs)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
              color: location.pathname === "/submit" ? "var(--color-accent)" : "var(--color-ink)",
            }}
          >
            Submit
          </Link>

          {contributor ? (
            <Link
              to="/profile"
              className={`link-draw ${location.pathname === "/profile" ? "link-draw--accent" : ""}`}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xs)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
                color: location.pathname === "/profile" ? "var(--color-accent)" : "var(--color-ink)",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <span>Profile</span>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-accent)",
                  display: "inline-block",
                }}
              />
            </Link>
          ) : (
            <Link
              to="/login"
              className={`link-draw ${location.pathname === "/login" ? "link-draw--accent" : ""}`}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xs)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
                color: location.pathname === "/login" ? "var(--color-accent)" : "var(--color-ink)",
              }}
            >
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          className="mobile-hamburger"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "none",
            flexDirection: "column",
            gap: "5px",
            padding: "0.5rem",
          }}
        >
          <span
            style={{
              width: "24px",
              height: "2px",
              backgroundColor: "var(--color-ink)",
              transition: "transform 0.3s ease",
              transform: mobileMenuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
            }}
          />
          <span
            style={{
              width: "24px",
              height: "2px",
              backgroundColor: "var(--color-ink)",
              opacity: mobileMenuOpen ? 0 : 1,
              transition: "opacity 0.2s ease",
            }}
          />
          <span
            style={{
              width: "24px",
              height: "2px",
              backgroundColor: "var(--color-ink)",
              transition: "transform 0.3s ease",
              transform: mobileMenuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
            }}
          />
        </button>
      </div>

      {/* Mobile Slide-Down Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              top: "var(--header-height)",
              left: 0,
              width: "100%",
              backgroundColor: "var(--color-page)",
              borderBottom: "var(--border-width) solid var(--color-ink)",
              padding: "1.5rem var(--site-margin)",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              zIndex: 99,
            }}
          >
            <Link
              to="/chapters"
              onClick={closeMobileMenu}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-lg)",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "var(--color-ink)",
              }}
            >
              Chapters
            </Link>
            <Link
              to="/submit"
              onClick={closeMobileMenu}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-lg)",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "var(--color-ink)",
              }}
            >
              Submit
            </Link>
            {contributor ? (
              <Link
                to="/profile"
                onClick={closeMobileMenu}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-lg)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "var(--color-accent)",
                }}
              >
                Profile ({contributor.displayName})
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-lg)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "var(--color-ink)",
                }}
              >
                Login
              </Link>
            )}
          </motion.nav>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: flex !important; }
        }
        @media (min-width: 900px) {
          .header-subtitle { display: inline !important; }
        }
      `}</style>
    </header>
  );
}
