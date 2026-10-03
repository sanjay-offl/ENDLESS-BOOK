import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import SplitHeadline from "../components/ui/SplitHeadline";
import SubmitMemoryForm from "../components/forms/SubmitMemoryForm";
import { useAuth } from "../hooks/useAuth";
import { useChapters } from "../hooks/useChapter";

export default function SubmitPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { chapters, loading: chaptersLoading } = useChapters();

  const chapterId = searchParams.get("chapterId") || undefined;
  const pageNumStr = searchParams.get("pageNum");
  const pageNum = pageNumStr ? parseInt(pageNumStr, 10) : undefined;

  // Rule 7: Redirect to /login?returnTo=/submit if not authenticated
  useEffect(() => {
    const demoUser = localStorage.getItem("endless_book_demo_user");
    if (!authLoading && !user && !demoUser) {
      navigate("/login?returnTo=/submit");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || chaptersLoading) {
    return (
      <PageWrapper>
        <div className="container" style={{ padding: "var(--section-pad) var(--site-margin)" }}>
          <div className="skeleton" style={{ height: "400px", width: "100%" }} />
        </div>
      </PageWrapper>
    );
  }

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
            THE COMMUNITY PRINTING PRESS
          </div>
          <SplitHeadline text="CONTRIBUTE A MEMORY" as="h1" style={{ fontSize: "var(--text-4xl)" }} />
          <p
            style={{
              fontFamily: "var(--font-editorial)",
              fontStyle: "italic",
              fontSize: "var(--text-base)",
              color: "var(--color-ink)",
              opacity: 0.85,
              marginTop: "0.75rem",
            }}
          >
            Each chapter holds exactly three pages. Share the world as you witnessed it in your youth.
          </p>
        </div>

        <SubmitMemoryForm
          initialChapterId={chapterId}
          initialPageNum={pageNum}
          availableChapters={chapters}
        />
      </div>
    </PageWrapper>
  );
}
