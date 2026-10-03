import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { clearDemoUser } from "../demoSession";
import PageWrapper from "../components/layout/PageWrapper";
import SplitHeadline from "../components/ui/SplitHeadline";
import MemoryCard from "../components/ui/MemoryCard";
import ChapterCard from "../components/ui/ChapterCard";
import Button from "../components/ui/Button";
import { useContributor } from "../hooks/useContributor";
import { useChapters } from "../hooks/useChapter";
import { useUserMemories } from "../hooks/useMemory";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { contributor, loading: authLoading } = useContributor();
  const { chapters } = useChapters();

  const { memories: userMemories, loading: memoriesLoading, error: memoriesError } =
    useUserMemories(contributor?.uid);

  // Sign-in is required to view a profile.
  useEffect(() => {
    if (!authLoading && !contributor) {
      navigate("/login?returnTo=%2Fprofile", { replace: true });
    }
  }, [authLoading, contributor, navigate]);

  const handleSignOut = async () => {
    clearDemoUser();
    if (contributor && !contributor.isDemo) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn("Firebase sign-out failed:", err);
      }
    }
    navigate("/");
  };

  const userChapters =
    contributor && chapters.length > 0
      ? chapters.filter(
          (c) => c.founderId === contributor.uid || c.founderName === contributor.displayName
        )
      : [];

  const initials = (contributor?.displayName || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (authLoading || !contributor) {
    return (
      <PageWrapper>
        <div className="container" style={{ padding: "var(--section-pad) var(--site-margin)" }}>
          <div className="skeleton" style={{ height: "300px", width: "100%" }} />
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
          gap: "3rem",
        }}
      >
        {/* Profile Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            borderBottom: "var(--border-width) solid var(--color-ink)",
            paddingBottom: "2rem",
            paddingTop: "1rem",
            flexWrap: "wrap",
          }}
        >
          {/* Avatar Circle */}
          {contributor.isDemo ? (
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "var(--color-cream)",
                border: "var(--border-width) solid var(--color-ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-2xl)",
                color: "var(--color-gold)",
                fontWeight: 700,
                userSelect: "none",
              }}
            >
              {initials}
            </div>
          ) : null}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xxs)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "var(--color-gold)",
                fontWeight: 700,
              }}
            >
              AUTHOR DOSSIER
            </span>
            <SplitHeadline
              text={contributor.displayName.toUpperCase()}
              as="h1"
              style={{ fontSize: "var(--text-3xl)" }}
            />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                color: "var(--color-ink)",
                opacity: 0.75,
              }}
            >
              {contributor.email}
            </span>
            {contributor.isDemo && (
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-xxs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--color-accent)",
                  fontWeight: 700,
                }}
              >
                DEMO CONTRIBUTOR — PAGES ARE NOT PERSISTED
              </span>
            )}
          </div>
        </div>

        {/* Section: YOUR PAGES */}
        <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "var(--border-thin) solid var(--color-ink)",
              paddingBottom: "0.75rem",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-2xl)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              YOUR PAGES ({userMemories.length})
            </h2>
            <Button
              variant="outline"
              onClick={() => navigate("/submit")}
              style={{ padding: "0.4rem 1rem", fontSize: "var(--text-xxs)" }}
            >
              + WRITE ANOTHER PAGE
            </Button>
          </div>

          {memoriesError && (
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-xs)",
                color: "var(--color-accent)",
                textTransform: "uppercase",
              }}
            >
              ⚠ {memoriesError}
            </p>
          )}

          {memoriesLoading && (
            <div className="skeleton" style={{ height: "140px", width: "100%" }} />
          )}

          {!memoriesLoading && userMemories.length === 0 && (
            <p
              style={{
                fontFamily: "var(--font-editorial)",
                fontStyle: "italic",
                fontSize: "var(--text-base)",
                color: "var(--color-ink)",
                opacity: 0.8,
                padding: "2rem 0",
              }}
            >
              You haven't bound any memories to the book yet.
            </p>
          )}

          {!memoriesLoading &&
            userMemories.map((mem) => (
              <MemoryCard
                key={mem.id}
                memoryId={mem.id}
                chapterId={mem.chapterId}
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
        </section>

        {/* Section: CHAPTERS YOU STARTED */}
        <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div
            style={{
              borderBottom: "var(--border-thin) solid var(--color-ink)",
              paddingBottom: "0.75rem",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-2xl)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              CHAPTERS YOU STARTED ({userChapters.length})
            </h2>
          </div>

          {userChapters.length === 0 ? (
            <p
              style={{
                fontFamily: "var(--font-editorial)",
                fontStyle: "italic",
                fontSize: "var(--text-base)",
                color: "var(--color-ink)",
                opacity: 0.8,
                padding: "2rem 0",
              }}
            >
              You haven't founded any new chapters yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {userChapters.map((chap) => (
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
        </section>

        {/* Sign Out Button */}
        <div style={{ paddingTop: "2rem", borderTop: "var(--border-thin) solid var(--color-rule)" }}>
          <Button
            variant="outline"
            onClick={handleSignOut}
            style={{
              padding: "0.9rem 2rem",
              fontSize: "var(--text-xs)",
              color: "var(--color-ink)",
            }}
          >
            SIGN OUT OF THIS DEVICE
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
