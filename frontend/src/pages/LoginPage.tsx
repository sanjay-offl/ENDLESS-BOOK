import PageWrapper from "../components/layout/PageWrapper";
import LoginForm from "../components/forms/LoginForm";

export default function LoginPage() {
  return (
    <PageWrapper>
      <div
        className="container"
        style={{
          padding: "var(--section-pad) var(--site-margin)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - var(--header-height) - 120px)",
        }}
      >
        <LoginForm />
      </div>
    </PageWrapper>
  );
}
