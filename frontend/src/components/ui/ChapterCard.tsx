import React from "react";
import { Link, useNavigate } from "react-router-dom";
import TagChip from "./TagChip";
import Button from "./Button";

interface ChapterCardProps {
  chapterId: string;
  number: number;
  title: string;
  author?: string;
  founderName?: string;
  founderCity?: string;
  pageCount: number;
  isOpen: boolean;
  tags?: string[];
  className?: string;
}

export default function ChapterCard({
  chapterId,
  number,
  title,
  author,
  founderName,
  founderCity,
  pageCount,
  isOpen,
  tags = [],
  className = "",
}: ChapterCardProps) {
  const navigate = useNavigate();
  const authorDisplay = author || founderName || "Community Voice";

  const handleCardClick = () => {
    navigate(`/chapters/${chapterId}`);
  };

  const handleContributeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/submit?chapterId=${chapterId}&pageNum=${pageCount + 1}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`chapter-card ${className}`}
      style={{
        border: "var(--border-width) solid var(--color-ink)",
        backgroundColor: "var(--color-page)",
        padding: "var(--content-margin)",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: "2rem",
        cursor: "pointer",
        position: "relative",
        transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "var(--color-accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--color-ink)";
      }}
    >
      {/* Left: Chapter Number */}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-5xl)",
          color: "var(--color-gold)",
          lineHeight: 0.8,
          minWidth: "4rem",
          userSelect: "none",
          textAlign: "center",
        }}
      >
        {String(number).padStart(2, "0")}
      </div>

      {/* Center: Title, Author, Tags */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
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
            CHAPTER {number}
          </span>
          {tags.map((t, idx) => (
            <TagChip key={idx} label={t} />
          ))}
        </div>

        <Link
          to={`/chapters/${chapterId}`}
          onClick={(e) => e.stopPropagation()}
          className="link-draw"
          style={{
            fontFamily: "var(--font-editorial)",
            fontSize: "var(--text-xl)",
            fontStyle: "italic",
            fontWeight: 600,
            lineHeight: 1.15,
            color: "var(--color-ink)",
          }}
        >
          {title}
        </Link>

        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xxs)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--color-ink)",
            opacity: 0.8,
          }}
        >
          FOUNDED BY {authorDisplay} {founderCity ? `— ${founderCity}` : ""}
        </div>
      </div>

      {/* Right: Progress and Action */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "0.75rem",
          minWidth: "8rem",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-sm)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: isOpen ? "var(--color-accent)" : "var(--color-ink)",
          }}
        >
          {pageCount}/3 PAGES
        </div>

        <div
          style={{
            width: "100%",
            height: "4px",
            backgroundColor: "var(--color-cream)",
            border: "var(--border-thin) solid var(--color-ink)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(pageCount / 3) * 100}%`,
              height: "100%",
              backgroundColor: isOpen ? "var(--color-accent)" : "var(--color-gold)",
              transition: "width 0.4s ease",
            }}
          />
        </div>

        {isOpen && (
          <Button
            variant="outline"
            onClick={handleContributeClick}
            style={{
              padding: "0.4rem 0.9rem",
              fontSize: "var(--text-xxs)",
            }}
          >
            CONTRIBUTE
          </Button>
        )}
      </div>
    </div>
  );
}
