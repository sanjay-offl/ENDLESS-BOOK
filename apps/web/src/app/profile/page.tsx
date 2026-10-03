import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function ProfilePage() {
  return (
    <PageShell>
      <section className="auth-page section-shell">
        <p className="eyebrow">Your profile</p>
        <h1>Your pages, kept together.</h1>
        <p className="section-note">Sign in to see the memories you have shared with the book.</p>
        <Link className="button" href="/login">Sign in <span aria-hidden="true">→</span></Link>
      </section>
    </PageShell>
  );
}
