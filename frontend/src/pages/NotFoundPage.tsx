import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div
        className="container"
        style={{
          minHeight: "calc(100vh - var(--header-height) - 140px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "1.5rem",
          padding: "var(--section-pad) var(--site-margin)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-6xl)",
            color: "var(--color-gold)",
            lineHeight: 0.8,
            fontWeight: 800,
            userSelect: "none",
          }}
        >
          404
        </span>

        <p
          style={{
            fontFamily: "var(--font-editorial)",
            fontStyle: "italic",
            fontSize: "var(--text-xl)",
            color: "var(--color-ink)",
            maxWidth: "500px",
            lineHeight: 1.4,
          }}
        >
          This page doesn't exist yet — but maybe you should write it.
        </p>

        <div style={{ marginTop: "1rem" }}>
          <Button variant="filled" onClick={() => navigate("/")}>
            GO HOME
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
