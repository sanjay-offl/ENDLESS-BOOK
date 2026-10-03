import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import SplitHeadline from "../components/ui/SplitHeadline";
import ChapterCard from "../components/ui/ChapterCard";
import Button from "../components/ui/Button";
import { useChapters } from "../hooks/useChapter";

export default function ChaptersPage() {
  const navigate = useNavigate();
  const { chapters, loading, error } = useChapters();

  const totalPages = chapters.reduce((acc, c) => acc + (c.pageCount || 0), 0);

  return (
    <PageWrapper>
      <div
        className="container"
        style={{
          padding: "var(--content-margin) var(--site-margin)",
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
        }}
      >
        {/* Hero Title */}
        <div style={{ paddingTop: "1rem" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xxs)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "var(--color-gold)",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            THE COMMUNITY FOLIO
          </div>
          <SplitHeadline text="ALL CHAPTERS" as="h1" style={{ fontSize: "var(--text-4xl)" }} />
        </div>

        {/* Stats Bar */}
        <div
          style={{
            borderTop: "var(--border-thin) solid var(--color-ink)",
            borderBottom: "var(--border-thin) solid var(--color-ink)",
            padding: "1rem 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xs)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--color-ink)",
          }}
        >
          <div style={{ display: "flex", gap: "2rem" }}>
            <span>
              TOTAL CHAPTERS: <strong style={{ color: "var(--color-gold)" }}>{chapters.length}</strong>
            </span>
            <span>
              TOTAL MEMORIES: <strong style={{ color: "var(--color-accent)" }}>{totalPages}</strong>
            </span>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/submit")}
            style={{ padding: "0.4rem 1rem", fontSize: "var(--text-xxs)" }}
          >
            + START NEW CHAPTER
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div
            style={{
              padding: "1.5rem",
              backgroundColor: "var(--color-cream)",
              border: "var(--border-width) solid var(--color-ink)",
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-sm)",
              color: "var(--color-accent)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="skeleton"
                style={{
                  height: "120px",
                  width: "100%",
                  border: "var(--border-width) solid var(--color-rule)",
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && chapters.length === 0 && (
          <div
            style={{
              padding: "4rem 2rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-editorial)",
                fontStyle: "italic",
                fontSize: "var(--text-xl)",
                color: "var(--color-ink)",
              }}
            >
              The pages are currently blank. Be the first to start a chapter in this endless chronicle.
            </p>
            <Button variant="filled" onClick={() => navigate("/submit")}>
              START CHAPTER 01
            </Button>
          </div>
        )}

        {/* Chapter List */}
        {!loading && chapters.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {chapters.map((chap) => (
              <ChapterCard
                key={chap.id}
                chapterId={chap.id}
                number={chap.number}
                title={chap.title}
                founderName={chap.founderName}
                founderCity={chap.founderCity}
                pageCount={chap.pageCount}
                isOpen={chap.isOpen}
                tags={chap.tags}
              />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
