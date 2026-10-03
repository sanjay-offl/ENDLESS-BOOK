import { useParams, Link, useNavigate } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import RuledDivider from "../components/ui/RuledDivider";
import TagChip from "../components/ui/TagChip";
import { useChapter } from "../hooks/useChapter";
import { useMemory } from "../hooks/useMemory";

export default function MemoryDetailPage() {
  // A memory can be reached by id or by its position inside a chapter.
  const { chapterId, pageNum, memoryId } = useParams<{
    chapterId?: string;
    pageNum?: string;
    memoryId?: string;
  }>();
  const navigate = useNavigate();

  const { memory: directMemory, loading: memoryLoading, error: memoryError } = useMemory(memoryId);

  const needsChapter = !memoryId;
  const { chapterDetail, loading: chapterLoading, error: chapterError } = useChapter(
    needsChapter ? chapterId : undefined
  );

  const pageNumber = pageNum ? parseInt(pageNum, 10) : 1;
  const memories = chapterDetail?.memories || [];
  // Falling back to the first memory would show page 1's prose under a "page 03"
  // heading, so an out-of-range page is reported instead.
  const currentMemory = memoryId
    ? directMemory
    : memories.find((m) => m.pageNum === pageNumber) ?? null;

  const loading = memoryId ? memoryLoading : chapterLoading;
  const error = memoryId ? memoryError : chapterError;

  // For the /memories/:id route the chapter is not known until the memory loads, so the
  // surrounding chapter is resolved from it.
  const resolvedChapterId = memoryId ? directMemory?.chapterId : chapterId;
  const chapter = chapterDetail?.chapter ?? null;
  const pageTotal = chapter?.pageCount ?? 0;

  const prevPage = !memoryId && pageNumber > 1 ? pageNumber - 1 : null;
  const nextPage = !memoryId && pageTotal > 0 && pageNumber < pageTotal ? pageNumber + 1 : null;

  const formattedDate = currentMemory
    ? new Date(currentMemory.createdAt || Date.now()).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

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
        {/* Breadcrumb Navigation */}
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
          {resolvedChapterId && (
            <>
              <span>/</span>
              <Link to={`/chapters/${resolvedChapterId}`} className="link-draw">
                {chapter?.title || `CHAPTER ${resolvedChapterId.replace("chapter-", "")}`}
              </Link>
              <span>/</span>
            </>
          )}
          <span style={{ color: "var(--color-gold)", fontWeight: 700 }}>
            PAGE 0{currentMemory?.pageNum ?? pageNumber}
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
          <div
            style={{
              maxWidth: "680px",
              margin: "0 auto",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            <div className="skeleton" style={{ height: "40px", width: "40%" }} />
            <div className="skeleton" style={{ height: "80px", width: "100%" }} />
            <div className="skeleton" style={{ height: "240px", width: "100%" }} />
          </div>
        )}

        {/* Missing Page */}
        {!loading && !error && !currentMemory && (
          <div
            style={{
              maxWidth: "680px",
              margin: "0 auto",
              width: "100%",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
              paddingBottom: "4rem",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-editorial)",
                fontStyle: "italic",
                fontSize: "var(--text-xl)",
                color: "var(--color-ink)",
                lineHeight: 1.4,
              }}
            >
              Page {pageNumber} of this chapter has not been written yet.{" "}
              {chapter && pageTotal < 3
                ? "The next contributor gets to fill it."
                : "Every page in this chapter is bound."}
            </p>
            {resolvedChapterId && (
              <Link
                to={`/chapters/${resolvedChapterId}`}
                className="link-draw"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                  color: "var(--color-accent)",
                }}
              >
                ← BACK TO CHAPTER
              </Link>
            )}
          </div>
        )}

        {/* Full Memory Reading Spread */}
        {!loading && currentMemory && (
          <article
            style={{
              maxWidth: "680px",
              margin: "0 auto",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              paddingBottom: "4rem",
            }}
          >
            {/* Header: Page gold label & title */}
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-sm)",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--color-gold)",
                  fontWeight: 700,
                }}
              >
                PAGE 0{currentMemory.pageNum}
              </span>

              <h1
                style={{
                  fontFamily: "var(--font-editorial)",
                  fontStyle: "italic",
                  fontSize: "var(--text-3xl)",
                  lineHeight: 1.1,
                  fontWeight: 600,
                  color: "var(--color-ink)",
                }}
              >
                {currentMemory.title}
              </h1>

              {currentMemory.tags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    marginTop: "0.5rem",
                  }}
                >
                  {currentMemory.tags.map((t, idx) => (
                    <TagChip key={idx} label={t} />
                  ))}
                </div>
              )}
            </div>

            {/* Optional Image */}
            {currentMemory.imageUrl && (
              <div
                style={{
                  width: "100%",
                  maxHeight: "440px",
                  overflow: "hidden",
                  border: "var(--border-width) solid var(--color-ink)",
                  boxShadow: "0 8px 24px rgba(15,14,13,0.06)",
                }}
              >
                <img
                  src={currentMemory.imageUrl}
                  alt={currentMemory.title}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    maxHeight: "440px",
                    objectFit: "cover",
                    filter: "sepia(0.25) contrast(1.05)",
                    display: "block",
                  }}
                />
              </div>
            )}

            {/* Prose Body */}
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-lg)",
                lineHeight: 1.85,
                color: "var(--color-ink)",
                whiteSpace: "pre-wrap",
                textAlign: "justify",
                letterSpacing: "0.01em",
              }}
            >
              {currentMemory.body}
            </div>

            {/* Author Byline */}
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
                opacity: 0.8,
              }}
            >
              <span>CONTRIBUTED BY {currentMemory.authorName}</span>
              {currentMemory.authorCity && <span>ORIGIN: {currentMemory.authorCity}</span>}
              <span>RECORDED: {formattedDate}</span>
            </div>

            {/* Sibling Page Turn Navigation */}
            <RuledDivider />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {prevPage ? (
                <button
                  onClick={() => navigate(`/chapters/${resolvedChapterId}/${prevPage}`)}
                  className="link-draw"
                  style={{
                    background: "none",
                    border: "none",
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-xs)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ← PAGE 0{prevPage}
                </button>
              ) : (
                <div />
              )}

              {nextPage ? (
                <button
                  onClick={() => navigate(`/chapters/${resolvedChapterId}/${nextPage}`)}
                  className="link-draw"
                  style={{
                    background: "none",
                    border: "none",
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-xs)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  PAGE 0{nextPage} →
                </button>
              ) : (
                <Link
                  to={`/chapters/${resolvedChapterId}`}
                  className="link-draw"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-xs)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 700,
                  }}
                >
                  VIEW CHAPTER SUMMARY →
                </Link>
              )}
            </div>
          </article>
        )}
      </div>
    </PageWrapper>
  );
}
