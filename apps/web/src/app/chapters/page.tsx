import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { chapters } from "@/lib/content";

export default function ChaptersPage() {
  return (
    <PageShell>
      <section className="page-intro section-shell">
        <p className="eyebrow">The endless book</p>
        <h1>Every chapter holds a world.</h1>
        <p className="section-note">Read three small pages from people remembering what stayed.</p>
      </section>
      <section className="chapter-directory section-shell">
        {chapters.map((chapter) => (
          <Link className="directory-row" href={`/chapters/${chapter.id}`} key={chapter.id}>
            <span className="chapter-number">{String(chapter.number).padStart(3, "0")}</span>
            <span className="directory-title">{chapter.title}</span>
            <span className="chapter-meta">{chapter.city}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </section>
    </PageShell>
  );
}
