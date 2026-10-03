import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { chapters } from "@/lib/content";

export default async function MemoryDetailPage({
  params,
}: {
  params: Promise<{ chapterId: string; pageNum: string }>;
}) {
  const { chapterId, pageNum } = await params;
  const chapter = chapters.find((item) => item.id === chapterId);
  const memory = chapter?.memories.find((item) => item.pageNumber === Number(pageNum));
  if (!chapter || !memory) notFound();

  const previous = chapter.memories.find((item) => item.pageNumber === memory.pageNumber - 1);
  const next = chapter.memories.find((item) => item.pageNumber === memory.pageNumber + 1);

  return (
    <PageShell>
      <article className="memory-detail section-shell">
        <p className="eyebrow">Chapter {String(chapter.number).padStart(3, "0")} · Page {memory.pageNumber} of 3</p>
        <h1>{memory.title}</h1>
        <p className="memory-body">{memory.body}</p>
        <p className="memory-byline">{memory.authorName} · {memory.authorCity}</p>
        <div className="memory-navigation">
          {previous ? <Link href={`/chapters/${chapter.id}/${previous.pageNumber}`}>← Previous page</Link> : <span />}
          {next ? <Link href={`/chapters/${chapter.id}/${next.pageNumber}`}>Next page →</Link> : <Link href={`/chapters/${chapter.id}`}>Back to chapter →</Link>}
        </div>
      </article>
    </PageShell>
  );
}
