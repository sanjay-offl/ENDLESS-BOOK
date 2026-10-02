"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, type Chapter } from "@/lib/api";
import {
  Button,
  Eyebrow,
  DisplayHeading,
  Modal,
  TextLink,
  PageTransition,
} from "@/components/ui";

export default function MyChaptersPage() {
  const { user, loading: authLoading, token } = useAuth();
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!token) return;
    api
      .getChapters(token)
      .then((data) => {
        setChapters(data.filter((c) => c.authorUid === user?.uid));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, user]);

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setDeleting(true);
    try {
      await api.deleteChapter(deleteTarget.id, token);
      setChapters((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="font-serif italic text-2xl text-muted animate-pulse">
          Opening personal archive...
        </p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-32 pb-24 md:pt-40 md:pb-36">
        <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10 md:px-16 space-y-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-6">
            <div className="space-y-4">
              <Eyebrow>Author Archive</Eyebrow>
              <DisplayHeading as="h1" size="hero" italic>
                My Chapters
              </DisplayHeading>
              <p className="text-sm text-muted font-sans max-w-editorial">
                The memories you have offered to the endless book.
              </p>
            </div>

            <Button href="/write" variant="primary" size="md" arrow>
              Write new chapter
            </Button>
          </div>

          {loading ? (
            <div className="py-24 text-center">
              <p className="font-serif italic text-2xl text-muted">Retrieving your manuscripts...</p>
            </div>
          ) : chapters.length === 0 ? (
            <div className="py-24 border-t border-hairline space-y-4 max-w-editorial">
              <p className="font-serif italic text-2xl text-ink">
                You have not written any chapters yet.
              </p>
              <p className="text-sm text-muted font-sans leading-relaxed">
                Every story begins with a small recollection. When you are ready, the book has a page waiting.
              </p>
              <div className="pt-2">
                <TextLink href="/write">Write your first memory</TextLink>
              </div>
            </div>
          ) : (
            <div className="border-t border-hairline divide-y divide-hairline">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="py-8 flex flex-col sm:flex-row justify-between sm:items-baseline gap-6"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          chapter.status === "published"
                            ? "bg-ink"
                            : chapter.status === "pending" || chapter.status === "needs_review"
                            ? "bg-accent"
                            : "bg-muted/40"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-xs uppercase tracking-wider text-muted font-sans">
                        Chapter {chapter.chapterNumber} · {chapter.status}
                      </span>
                    </div>

                    <h2 className="font-serif italic text-2xl sm:text-3xl text-ink font-normal">
                      {chapter.title}
                    </h2>

                    <p className="text-sm text-muted font-sans line-clamp-2 leading-relaxed">
                      {chapter.pages[0]}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-sm font-serif italic shrink-0">
                    {chapter.status === "published" && (
                      <Link
                        href={`/book/${chapter.id}`}
                        className="text-ink hover:underline"
                      >
                        Read →
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(chapter)}
                      className="text-muted hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete this chapter?"
        eyebrow="PERMANENT REMOVAL"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted font-sans leading-relaxed">
            This will permanently withdraw &ldquo;{deleteTarget?.title}&rdquo; from the endless book, including all translations, vector embeddings, and media.
          </p>

          <div className="pt-4 flex justify-end gap-4 text-sm font-serif italic">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="text-muted hover:text-ink px-4 py-2"
            >
              Keep chapter
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 hover:text-red-800 disabled:opacity-30 px-4 py-2 font-medium"
            >
              {deleting ? "Removing..." : "Delete permanently"}
            </button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}
