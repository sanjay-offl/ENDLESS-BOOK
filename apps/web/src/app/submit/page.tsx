import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function SubmitPage() {
  return (
    <PageShell>
      <section className="submit-page section-shell">
        <p className="eyebrow">Submit a memory</p>
        <h1>What do you still remember?</h1>
        <p className="section-note">A page can be small. Start with the detail that never left you.</p>
        <Link className="button" href="/login">Sign in to begin <span aria-hidden="true">→</span></Link>
        <div className="submit-rules">
          <span>One memory per page</span>
          <span>Kindly reviewed before publishing</span>
          <span>You keep ownership</span>
        </div>
      </section>
    </PageShell>
  );
}
