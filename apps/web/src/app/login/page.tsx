import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function LoginPage() {
  return (
    <PageShell>
      <section className="auth-page section-shell">
        <p className="eyebrow">Join the book</p>
        <h1>Bring one memory with you.</h1>
        <p className="section-note">Sign in to submit a page, keep track of your memories, and return whenever you like.</p>
        <button className="button" type="button">Continue with Google <span aria-hidden="true">→</span></button>
        <Link className="text-link" href="/chapters">Read without signing in →</Link>
      </section>
    </PageShell>
  );
}
