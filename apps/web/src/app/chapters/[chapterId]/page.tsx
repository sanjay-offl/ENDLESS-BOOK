import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { chapters } from "@/lib/content";

export default async function ChapterDetailPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const chapter = chapters.find((item) => item.id === chapterId);
  if (!chapter) notFound();

  return (
    <PageShell>
      <section className="chapter-hero section-shell">
        <p className="eyebrow">Chapter {String(chapter.number).padStart(3, "0")} · {chapter.city}</p>
        <h1>{chapter.title}</h1>
        <p className="chapter-summary">{chapter.summary}</p>
      </section>
      <section className="memory-grid section-shell">
        {chapter.memories.length ? (
          chapter.memories.map((memory) => (
            <Link className="memory-row" href={`/chapters/${chapter.id}/${memory.pageNumber}`} key={memory.id}>
              <span className="chapter-number">Page {memory.pageNumber}</span>
              <span>
                <strong>{memory.title}</strong>
                <small>{memory.authorName} · {memory.authorCity}</small>
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          ))
        ) : (
          <p className="empty-state">This chapter is waiting for its first page.</p>
        )}
      </section>
    </PageShell>
  );
}
