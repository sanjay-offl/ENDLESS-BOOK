import { useParams, Link, useNavigate } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import MemoryCard from "../components/ui/MemoryCard";
import ChapterCard from "../components/ui/ChapterCard";
import RuledDivider from "../components/ui/RuledDivider";
import Button from "../components/ui/Button";
import { useChapter, useChapters } from "../hooks/useChapter";

export default function ChapterDetailPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { chapterDetail, loading, error } = useChapter(chapterId);
  const { chapters } = useChapters();

  const chapter = chapterDetail?.chapter;
  const memories = chapterDetail?.memories || [];

  const nextPageNum = (chapter?.pageCount || 0) + 1;
  const isChapterOpen = (chapter?.pageCount || 0) < 3;

  // More chapters for the bottom section
  const relatedChapters = chapters
    .filter((c) => c.id !== chapterId)
    .slice(0, 3);

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
        {/* Breadcrumb */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xxs)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--color-ink)",
            opacity: 0.8,
            paddingTop: "1rem",
          }}
        >
          <Link to="/chapters" className="link-draw">
            CHAPTERS
          </Link>
          <span>/</span>
          <span style={{ color: "var(--color-gold)", fontWeight: 700 }}>
            {chapter?.title ? chapter.title.toUpperCase() : "LOADING..."}
          </span>
        </nav>

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
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="skeleton" style={{ height: "160px", width: "100%" }} />
            <div className="skeleton" style={{ height: "120px", width: "100%" }} />
            <div className="skeleton" style={{ height: "120px", width: "100%" }} />
          </div>
        )}

        {/* Chapter Header */}
        {!loading && chapter && (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                borderBottom: "var(--border-width) solid var(--color-ink)",
                paddingBottom: "2rem",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-sm)",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "var(--color-gold)",
                  fontWeight: 700,
                }}
              >
                CHAPTER {String(chapter.number).padStart(2, "0")} • {chapter.pageCount}/3 PAGES
                COMPLETED
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-editorial)",
                  fontStyle: "italic",
                  fontSize: "var(--text-4xl)",
                  lineHeight: 1.05,
                  fontWeight: 600,
                  color: "var(--color-ink)",
                }}
              >
                {chapter.title}
              </h1>

              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-ink)",
                  opacity: 0.75,
                }}
              >
                FOUNDED BY {chapter.founderName}{" "}
                {chapter.founderCity ? `(${chapter.founderCity})` : ""}
              </div>
            </div>

            {/* List of 3 Memory Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {memories.map((mem) => (
                <MemoryCard
                  key={mem.id}
                  memoryId={mem.id}
                  chapterId={chapter.id}
                  pageNum={mem.pageNum}
                  title={mem.title}
                  body={mem.body}
                  authorName={mem.authorName}
                  authorCity={mem.authorCity}
                  createdAt={mem.createdAt}
                  imageUrl={mem.imageUrl}
                  tags={mem.tags}
                />
              ))}
            </div>

            {/* If Chapter has Open Pages: Inverted Banner */}
            {isChapterOpen && (
              <div
                style={{
                  backgroundColor: "var(--color-ink)",
                  color: "var(--color-page)",
                  padding: "var(--content-margin)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1.5rem",
                  marginTop: "1.5rem",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-lg)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--color-gold)",
                      fontWeight: 700,
                    }}
                  >
                    PAGE 0{nextPageNum} IS OPEN
                  </span>
                  <p
                    style={{
                      fontFamily: "var(--font-editorial)",
                      fontStyle: "italic",
                      fontSize: "var(--text-sm)",
                      color: "var(--color-page)",
                      opacity: 0.9,
                    }}
                  >
                    Add your childhood memory to complete this tri-part chapter.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(`/submit?chapterId=${chapter.id}&pageNum=${nextPageNum}`)
                  }
                  style={{
                    borderColor: "var(--color-page)",
                    color: "var(--color-page)",
                  }}
                >
                  WRITE THIS PAGE
                </Button>
              </div>
            )}

            {/* Bottom: Related Chapters */}
            <div style={{ marginTop: "3rem" }}>
              <RuledDivider label="MORE CHAPTERS IN THE ARCHIVE" />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                  marginTop: "2rem",
                }}
              >
                {relatedChapters.map((rc) => (
                  <ChapterCard
                    key={rc.id}
                    chapterId={rc.id}
                    number={rc.number}
                    title={rc.title}
                    founderName={rc.founderName}
                    founderCity={rc.founderCity}
                    pageCount={rc.pageCount}
                    isOpen={rc.isOpen}
                    tags={rc.tags}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
