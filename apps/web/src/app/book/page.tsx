"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { api, type Chapter } from "@/lib/api";
import { Eyebrow, DisplayHeading, PageTransition, TextLink } from "@/components/ui";

type FilterType = "newest" | "featured" | "place";

export default function BookIndexPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("newest");

  useEffect(() => {
    api
      .getChapters()
      .then((data) => {
        setChapters(data.filter((c) => c.status === "published"));
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const filteredChapters = useMemo(() => {
    let list = [...chapters];
    if (filter === "featured") {
      list = list.filter((c) => c.featured);
    } else if (filter === "place") {
      list.sort((a, b) =>
        (a.place?.label || "").localeCompare(b.place?.label || "")
      );
    } else {
      // newest
      list.sort((a, b) => b.chapterNumber - a.chapterNumber);
    }
    return list;
  }, [chapters, filter]);

  return (
    <PageTransition>
      <div className="pt-32 pb-24 md:pt-40 md:pb-36 min-h-screen">
        <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10 md:px-16">
          {/* Header */}
          <div className="space-y-4 max-w-2xl">
            <Eyebrow>The Endless Anthology</Eyebrow>
            <DisplayHeading as="h1" size="hero">
              The Book
            </DisplayHeading>
            <p className="text-base sm:text-lg text-muted font-sans leading-relaxed pt-2">
              Every chapter is a childhood memory. Every memory is three pages.
              Written by hand, preserved forever.
            </p>
          </div>

          {/* Filter row: plain italic text toggles with underline */}
          <div className="mt-16 pb-6 border-b border-hairline flex items-center gap-8 text-lg font-serif italic">
            <button
              type="button"
              onClick={() => setFilter("newest")}
              className={`transition-colors relative pb-1 ${
                filter === "newest"
                  ? "text-ink underline underline-offset-8 decoration-1 decoration-ink font-normal"
                  : "text-muted hover:text-ink"
              }`}
            >
              Newest
            </button>

            <button
              type="button"
              onClick={() => setFilter("featured")}
              className={`transition-colors relative pb-1 ${
                filter === "featured"
                  ? "text-ink underline underline-offset-8 decoration-1 decoration-ink font-normal"
                  : "text-muted hover:text-ink"
              }`}
            >
              Featured
            </button>

            <button
              type="button"
              onClick={() => setFilter("place")}
              className={`transition-colors relative pb-1 ${
                filter === "place"
                  ? "text-ink underline underline-offset-8 decoration-1 decoration-ink font-normal"
                  : "text-muted hover:text-ink"
              }`}
            >
              By place
            </button>

            <span className="ml-auto text-xs font-sans not-italic uppercase tracking-widest text-muted">
              {filteredChapters.length} {filteredChapters.length === 1 ? "chapter" : "chapters"}
            </span>
          </div>

          {/* Content state */}
          {loading && (
            <div className="py-24 text-center">
              <p className="font-serif italic text-2xl text-muted">Opening the pages...</p>
            </div>
          )}

          {error && (
            <div className="py-24 max-w-editorial">
              <p className="text-sm text-red-600 font-sans">Unable to retrieve chapters: {error}</p>
            </div>
          )}

          {!loading && !error && filteredChapters.length === 0 && (
            <div className="py-24 space-y-4 max-w-editorial">
              <p className="font-serif italic text-2xl text-ink">No chapters found for this selection.</p>
              <TextLink href="/write">Be the one to write it</TextLink>
            </div>
          )}

          {/* Chapters editorial grid: 2 columns on desktop, 1 on mobile, hairline dividers */}
          {!loading && !error && filteredChapters.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 divide-hairline">
              {filteredChapters.map((chapter, idx) => (
                <Link
                  key={chapter.id}
                  href={`/book/${chapter.id}`}
                  className={`group block py-10 transition-colors border-t border-hairline hover:border-ink/40 ${
                    idx % 2 === 0 ? "lg:pr-12" : "lg:pl-12 lg:border-l lg:border-hairline"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between text-xs text-muted font-sans">
                      <Eyebrow as="span">Chapter {chapter.chapterNumber}</Eyebrow>
                      <span>2 min read</span>
                    </div>

                    <h2 className="font-serif italic text-2xl sm:text-3xl text-ink group-hover:text-ink/70 transition-colors font-normal leading-snug">
                      {chapter.title}
                    </h2>

                    <p className="text-sm text-muted font-sans line-clamp-2 leading-relaxed">
                      {chapter.pages[0]}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs text-muted font-sans">
                      <span>
                        {chapter.authorName}
                        {chapter.place?.label ? ` · ${chapter.place.label}` : ""}
                      </span>

                      <span
                        className="text-ink text-sm transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
