import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageWrapper from "../components/layout/PageWrapper";
import SplitHeadline from "../components/ui/SplitHeadline";
import Button from "../components/ui/Button";
import RuledDivider from "../components/ui/RuledDivider";
import { useChapters } from "../hooks/useChapter";

export default function HomePage() {
  const navigate = useNavigate();
  const { chapters } = useChapters();

  const latestChapter = chapters[0] || {
    id: "chapter-1",
    number: 1,
    title: "The Summer The Streetlights Never Came On",
    founderName: "Elena Vance",
    founderCity: "Port Townsend, WA",
    pageCount: 3,
  };

  return (
    <PageWrapper>
      {/* SECTION 1: HERO (100lvh) */}
      <section
        className="ruled-bg"
        style={{
          minHeight: "calc(100vh - var(--header-height))",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "var(--section-pad) var(--site-margin)",
          position: "relative",
          borderBottom: "var(--border-width) solid var(--color-ink)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xxs)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "var(--color-gold)",
              fontWeight: 700,
            }}
          >
            VOL. I — THE CONTINUOUS EDITION
          </div>

          <SplitHeadline
            text="WHAT I SAW WHEN I WAS A KID"
            as="h1"
            scrollTrigger={false}
            style={{
              fontSize: "var(--text-6xl)",
              color: "var(--color-ink)",
              lineHeight: 0.85,
            }}
          />

          <h3
            style={{
              fontFamily: "var(--font-editorial)",
              fontStyle: "italic",
              fontSize: "var(--text-2xl)",
              fontWeight: 400,
              maxWidth: "800px",
              color: "var(--color-ink)",
              opacity: 0.9,
            }}
          >
            A community book of childhood memories
          </h3>

          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "1.5rem",
            }}
          >
            <Button
              variant="filled"
              onClick={() => navigate("/chapters")}
              style={{ fontSize: "var(--text-sm)", padding: "1.1rem 2.25rem" }}
            >
              READ THE BOOK
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/submit")}
              style={{ fontSize: "var(--text-sm)", padding: "1.1rem 2.25rem" }}
            >
              SHARE YOUR MEMORY
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "2rem",
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-lg)",
            color: "var(--color-ink)",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight - 80,
              behavior: "smooth",
            });
          }}
        >
          ↓
        </motion.div>
      </section>

      {/* SECTION 2: LATEST CHAPTER */}
      <section
        className="section"
        style={{
          backgroundColor: "var(--color-page)",
        }}
      >
        <div className="container">
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xxs)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "var(--color-gold)",
              fontWeight: 700,
              marginBottom: "1.5rem",
            }}
          >
            CURRENTLY READING
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60% 40%",
              gap: "4rem",
              alignItems: "center",
            }}
            className="latest-chapter-grid"
          >
            {/* Left 60% */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-sm)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--color-ink)",
                  opacity: 0.7,
                }}
              >
                CHAPTER {latestChapter.number} — IN PROGRESS
              </div>

              <h2
                style={{
                  fontFamily: "var(--font-editorial)",
                  fontSize: "var(--text-3xl)",
                  fontStyle: "italic",
                  lineHeight: 1.05,
                  fontWeight: 600,
                  color: "var(--color-ink)",
                }}
              >
                {latestChapter.title}
              </h2>

              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-base)",
                  lineHeight: 1.7,
                  color: "var(--color-ink)",
                  opacity: 0.85,
                  maxWidth: "600px",
                }}
              >
                Founded by {latestChapter.founderName || "Elena Vance"}{" "}
                {latestChapter.founderCity ? `in ${latestChapter.founderCity}` : ""}.
                Every chapter in this book is limited to exactly three pages, each contributed
                by a different voice remembering a different corner of youth.
              </p>

              <div>
                <Link
                  to={`/chapters/${latestChapter.id}`}
                  className="link-draw"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-sm)",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: "var(--color-accent)",
                  }}
                >
                  READ CHAPTER {latestChapter.number} →
                </Link>
              </div>
            </div>

            {/* Right 40%: Gold Rotated Number */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-6xl)",
                  color: "var(--color-gold)",
                  transform: "rotate(-90deg)",
                  lineHeight: 0.75,
                  userSelect: "none",
                  fontWeight: 800,
                }}
              >
                #{String(latestChapter.number).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ABOUT THE BOOK */}
      <section
        className="section"
        style={{
          backgroundColor: "var(--color-cream)",
        }}
      >
        <div className="container">
          <RuledDivider label="THE EDITORIAL CONSTITUTION" />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "3rem",
              marginTop: "3rem",
            }}
          >
            {/* Col 1 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-4xl)",
                  color: "var(--color-gold)",
                  lineHeight: 0.8,
                }}
              >
                01
              </span>
              <h4
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-xl)",
                  textTransform: "uppercase",
                  letterSpacing: "-0.01em",
                }}
              >
                HOW IT WORKS
              </h4>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  lineHeight: 1.6,
                  color: "var(--color-ink)",
                  opacity: 0.85,
                }}
              >
                Anyone can propose a new chapter theme or contribute the next page to an existing chapter.
                There are no advertisements, algorithms, or popularity metrics. Just pure memory.
              </p>
            </div>

            {/* Col 2 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-4xl)",
                  color: "var(--color-gold)",
                  lineHeight: 0.8,
                }}
              >
                02
              </span>
              <h4
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-xl)",
                  textTransform: "uppercase",
                  letterSpacing: "-0.01em",
                }}
              >
                3 PAGES PER CHAPTER
              </h4>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  lineHeight: 1.6,
                  color: "var(--color-ink)",
                  opacity: 0.85,
                }}
              >
                Each chapter is complete when three distinct contributors have written their pages.
                Once closed, the chapter is preserved forever in the community bindings.
              </p>
            </div>

            {/* Col 3 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-4xl)",
                  color: "var(--color-gold)",
                  lineHeight: 0.8,
                }}
              >
                03
              </span>
              <h4
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-xl)",
                  textTransform: "uppercase",
                  letterSpacing: "-0.01em",
                }}
              >
                EVERY VOICE MATTERS
              </h4>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  lineHeight: 1.6,
                  color: "var(--color-ink)",
                  opacity: 0.85,
                }}
              >
                Whether you grew up in a coastal harbor, a mountain village, or a metropolis high-rise,
                your earliest glimpse of the world is a vital thread in the collective story.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: OPEN CHAPTERS CTA (INVERTED) */}
      <section
        style={{
          width: "100%",
          padding: "var(--section-pad) var(--site-margin)",
          backgroundColor: "var(--color-ink)",
          color: "var(--color-page)",
          textAlign: "center",
          borderBottom: "var(--border-width) solid var(--color-ink)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xxs)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "var(--color-gold)",
              fontWeight: 700,
            }}
          >
            THE SHELF IS EXPANDING
          </div>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-4xl)",
              lineHeight: 0.85,
              color: "var(--color-page)",
            }}
          >
            YOUR CHAPTER IS WAITING
          </h2>

          <p
            style={{
              fontFamily: "var(--font-editorial)",
              fontStyle: "italic",
              fontSize: "var(--text-base)",
              maxWidth: "640px",
              color: "var(--color-page)",
              opacity: 0.9,
            }}
          >
            Write the memories only you remember: the flavor of rain on hot asphalt, the house key
            on a shoelace around your neck, or the tree you were certain was watching you.
          </p>

          <Button
            variant="outline"
            onClick={() => navigate("/submit")}
            style={{
              borderColor: "var(--color-page)",
              color: "var(--color-page)",
              padding: "1.1rem 2.5rem",
              fontSize: "var(--text-sm)",
            }}
          >
            CONTRIBUTE
          </Button>
        </div>
      </section>

      <style>{`
        @media (max-width: 800px) {
          .latest-chapter-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </PageWrapper>
  );
}
