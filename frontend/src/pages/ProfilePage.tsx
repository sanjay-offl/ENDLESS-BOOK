import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import PageWrapper from "../components/layout/PageWrapper";
import SplitHeadline from "../components/ui/SplitHeadline";
import MemoryCard from "../components/ui/MemoryCard";
import ChapterCard from "../components/ui/ChapterCard";
import Button from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { useChapters } from "../hooks/useChapter";
import { useUserMemories } from "../hooks/useMemory";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { chapters } = useChapters();

  const demoUserStr = localStorage.getItem("endless_book_demo_user");
  const demoUser = demoUserStr ? JSON.parse(demoUserStr) : null;

  const effectiveUid = user?.uid || (demoUser ? "user-1" : undefined);
  const effectiveDisplayName = user?.displayName || demoUser?.displayName || "Elena Vance";
  const effectiveEmail = user?.email || demoUser?.email || "contributor@endlessbook.org";

  const { memories: userMemories, loading: memoriesLoading } = useUserMemories(effectiveUid);

  // Critical Rule 7: Redirect to /login?returnTo=/profile if not authenticated
  useEffect(() => {
    if (!authLoading && !user && !demoUser) {
      navigate("/login?returnTo=/profile");
    }
  }, [user, authLoading, demoUser, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignored
    }
    localStorage.removeItem("endless_book_demo_user");
    navigate("/");
  };

  const userChapters = chapters.filter(
    (c) => c.founderId === effectiveUid || c.founderName === effectiveDisplayName
  );

  const initials = (effectiveDisplayName || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (authLoading) {
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
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={effectiveDisplayName}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                border: "var(--border-width) solid var(--color-ink)",
                objectFit: "cover",
              }}
            />
          ) : (
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
          )}

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
              text={effectiveDisplayName.toUpperCase()}
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
              {effectiveEmail}
            </span>
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
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
