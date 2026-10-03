import { Link, useNavigate } from "react-router-dom";
import TagChip from "./TagChip";

interface MemoryCardProps {
  memoryId: string;
  chapterId: string;
  pageNum: number;
  title: string;
  excerpt?: string;
  body?: string;
  authorName: string;
  authorCity?: string;
  createdAt: number;
  imageUrl?: string | null;
  tags?: string[];
  className?: string;
}

export default function MemoryCard({
  memoryId,
  chapterId,
  pageNum,
  title,
  excerpt,
  body,
  authorName,
  authorCity,
  createdAt,
  imageUrl,
  tags = [],
  className = "",
}: MemoryCardProps) {
  const navigate = useNavigate();

  const formattedDate = new Date(createdAt || Date.now()).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const displayExcerpt = excerpt || body || "";

  // Prefers the memory id so the route stays correct even if page numbering shifts.
  const target = memoryId ? `/memories/${memoryId}` : `/chapters/${chapterId}/${pageNum}`;

  const handleClick = () => {
    navigate(target);
  };

  return (
    <div
      onClick={handleClick}
      className={`memory-card ${className}`}
      style={{
        borderBottom: "var(--border-dashed)",
        padding: "var(--content-margin) 0",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "2.5rem",
        alignItems: "start",
        cursor: "pointer",
        transition: "background-color 0.25s ease, transform 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--color-cream)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {/* Left: Big Page Number */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: "4.5rem",
        }}
      >
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
          PAGE
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-4xl)",
            lineHeight: 0.85,
            color: "var(--color-ink)",
            opacity: 0.25,
            userSelect: "none",
          }}
        >
          0{pageNum}
        </span>
      </div>

      {/* Right: Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {tags.map((t, idx) => (
              <TagChip key={idx} label={t} />
            ))}
          </div>
        )}

        <Link
          to={target}
          onClick={(e) => e.stopPropagation()}
          className="link-draw"
          style={{
            fontFamily: "var(--font-editorial)",
            fontSize: "var(--text-xl)",
            fontStyle: "italic",
            fontWeight: 600,
            lineHeight: 1.2,
            color: "var(--color-ink)",
          }}
        >
          {title}
        </Link>

        {imageUrl && (
          <div
            style={{
              maxHeight: "180px",
              overflow: "hidden",
              border: "var(--border-thin) solid var(--color-rule)",
              margin: "0.25rem 0",
            }}
          >
            <img
              src={imageUrl}
              alt={title}
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover",
                filter: "sepia(0.2) contrast(1.05)",
                display: "block",
              }}
            />
          </div>
        )}

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            lineHeight: 1.6,
            color: "var(--color-ink)",
            opacity: 0.9,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {displayExcerpt}
        </p>

        {/* Footer: author + city + date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-xxs)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--color-ink)",
            opacity: 0.75,
            paddingTop: "0.5rem",
          }}
        >
          <span>BY {authorName}</span>
          {authorCity && <span>• {authorCity}</span>}
          <span>• {formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
