import { PageShell } from "@/components/PageShell";

export default function AboutPage() {
  return (
    <PageShell>
      <article className="about-page section-shell">
        <p className="eyebrow">About the book</p>
        <h1>A place for the ordinary things that made us.</h1>
        <p className="memory-body">The Endless Book began with a simple question: what is the smallest moment from childhood that you can still feel? Each answer becomes three pages, and each page makes the book a little wider.</p>
        <p className="memory-byline">Built with care by Sanjay.</p>
      </article>
    </PageShell>
  );
}
