"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, type Chapter, type Translation } from "@/lib/api";
import { Eyebrow, TextLink, PageTransition } from "@/components/ui";
import { animateReaderPage } from "@/lib/motion";
import { LANGUAGES } from "@/lib/utils";

export default function ChapterReaderPage() {
  const params = useParams();
  const chapterId = params.chapterId as string;
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState("en");
  const [similar, setSimilar] = useState<Chapter[]>([]);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getChapter(chapterId)
      .then((data) => {
        setChapter(data);
        setLoading(false);
        api.trackEvent("chapter_read", { chapter_id: chapterId });
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
    api.similar(chapterId).then(setSimilar).catch(() => {});
  }, [chapterId]);

  const switchLanguage = async (newLang: string) => {
    setLang(newLang);
    if (newLang === "en") {
      setTranslation(null);
      return;
    }
    try {
      const t = await api.translate(chapterId, newLang);
      setTranslation(t);
      api.trackEvent("language_switched", {
        chapter_id: chapterId,
        language: newLang,
      });
    } catch {
      setLang("en");
    }
  };

  const goToPage = useCallback(
    (page: number, direction: "next" | "prev" = "next") => {
      if (!chapter || page < 0 || page > 2 || page === currentPage) return;
      if (pageContainerRef.current) {
        animateReaderPage(pageContainerRef.current, direction, () => {
          setCurrentPage(page);
        });
      } else {
        setCurrentPage(page);
      }
    },
    [chapter, currentPage]
  );

  const nextPage = useCallback(
    () => goToPage(currentPage + 1, "next"),
    [currentPage, goToPage]
  );
  const prevPage = useCallback(
    () => goToPage(currentPage - 1, "prev"),
    [currentPage, goToPage]
  );

  // Keyboard navigation: arrow keys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [nextPage, prevPage]);

  // Touch swipe navigation for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextPage();
      else prevPage();
    }
    touchStartXRef.current = null;
  };

  useEffect(() => {
    if (currentPage === 2 && chapter) {
      api.trackEvent("chapter_finished", { chapter_id: chapterId });
    }
  }, [currentPage, chapter, chapterId]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="font-serif italic text-2xl text-muted animate-pulse">
          Opening reading room...
        </p>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-32 text-center space-y-4">
        <p className="font-serif italic text-2xl text-ink">
          {error || "Chapter not found"}
        </p>
        <TextLink href="/book">Return to the book</TextLink>
      </div>
    );
  }

  const title = translation?.title || chapter.title;
  const pages = translation?.pages || chapter.pages;

  // Indian language font mapping
  const isIndianLang = ["ta", "hi", "te", "ml", "kn"].includes(lang);
  const fontClass = {
    ta: "font-tamil",
    hi: "font-devanagari",
    te: "font-telugu",
    ml: "font-malayalam",
    kn: "font-kannada",
    en: "font-serif",
  }[lang] || "font-serif";

  return (
    <PageTransition>
      <div
        className="min-h-screen pt-32 pb-24 md:pt-40 md:pb-36"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10 md:px-16">
          {/* Top reader controls */}
          <div className="pb-8 border-b border-hairline flex items-baseline justify-between text-xs text-muted">
            <Link
              href="/book"
              className="text-muted hover:text-ink transition-colors flex items-center gap-1 font-sans uppercase tracking-widest"
            >
              ← The Book
            </Link>

            {/* Language dropdown styled as simple underline dropdown */}
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-widest text-[11px] text-muted">
                Language:
              </span>
              <select
                value={lang}
                onChange={(e) => switchLanguage(e.target.value)}
                className="bg-transparent border-0 border-b border-hairline text-ink font-sans text-xs uppercase tracking-wider py-1 px-1 focus:border-ink focus:outline-none cursor-pointer"
                aria-label="Select translation language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-canvas text-ink">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reading room central column */}
          <div className="mx-auto max-w-reader pt-16 sm:pt-24 space-y-12">
            {/* Chapter Header */}
            <div className="space-y-4">
              <Eyebrow>Chapter {chapter.chapterNumber}</Eyebrow>

              <h1
                className={`${fontClass} ${
                  isIndianLang ? "font-semibold not-italic" : "font-normal italic"
                } text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem] text-ink leading-[1.05] tracking-tight`}
              >
                {title}
              </h1>

              <p className="text-xs sm:text-sm text-muted font-sans uppercase tracking-widest pt-2">
                Written by {chapter.authorName}
                {chapter.place?.label ? ` · ${chapter.place.label}` : ""}
              </p>
            </div>

            {/* Reading Page Content (Serif at 20-22px, 62ch max width, calm slide) */}
            <div
              ref={pageContainerRef}
              className="min-h-[280px] sm:min-h-[340px] pt-4 cursor-pointer select-text"
              onClick={() => {
                if (currentPage < 2) nextPage();
              }}
            >
              <p
                className={`${fontClass} text-xl sm:text-[22px] text-ink/90 leading-[1.8] font-normal`}
              >
                {pages[currentPage]}
              </p>
            </div>

            {/* Bottom Bar: Page counter & text links */}
            <div className="pt-12 border-t border-hairline flex items-center justify-between text-sm font-sans">
              <button
                type="button"
                onClick={prevPage}
                disabled={currentPage === 0}
                className="text-muted hover:text-ink disabled:opacity-20 disabled:pointer-events-none transition-colors flex items-center gap-2 group font-serif italic text-base"
              >
                <span className="transition-transform group-hover:-translate-x-1">←</span>
                <span>Previous page</span>
              </button>

              <span className="text-xs uppercase tracking-widest text-muted font-sans">
                Page {currentPage + 1} of 3
              </span>

              <button
                type="button"
                onClick={nextPage}
                disabled={currentPage === 2}
                className="text-muted hover:text-ink disabled:opacity-20 disabled:pointer-events-none transition-colors flex items-center gap-2 group font-serif italic text-base"
              >
                <span>Next page</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>

          {/* 'Others who remember too' (Vector search results) */}
          {similar.length > 0 && (
            <div className="mt-28 sm:mt-36 pt-16 border-t border-hairline max-w-4xl mx-auto">
              <div className="mb-10 space-y-2">
                <Eyebrow>Vector echoes</Eyebrow>
                <h2 className="font-serif italic text-2xl sm:text-3xl text-ink font-normal">
                  Others who remember too
                </h2>
              </div>

              <div className="divide-y divide-hairline">
                {similar.slice(0, 3).map((s) => (
                  <Link
                    key={s.id}
                    href={`/book/${s.id}`}
                    className="group block py-6 transition-colors hover:border-ink/40"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-baseline">
                      <div className="sm:col-span-3">
                        <Eyebrow as="span">Chapter {s.chapterNumber}</Eyebrow>
                      </div>

                      <div className="sm:col-span-6">
                        <h3 className="font-serif italic text-xl text-ink group-hover:text-ink/75 transition-colors">
                          {s.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted font-sans line-clamp-1 mt-1">
                          {s.pages[0]}
                        </p>
                      </div>

                      <div className="sm:col-span-3 flex justify-between sm:justify-end items-center gap-2 text-xs text-muted">
                        <span>{s.authorName}</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
