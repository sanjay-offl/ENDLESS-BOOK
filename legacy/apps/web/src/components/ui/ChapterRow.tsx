"use client";

import React from "react";
import Link from "next/link";
import { Eyebrow } from "./Eyebrow";

export interface ChapterRowProps {
  id: string;
  chapterNumber: number;
  title: string;
  authorName: string;
  placeLabel?: string;
  excerpt?: string;
  readingTime?: string;
  className?: string;
}

export function ChapterRow({
  id,
  chapterNumber,
  title,
  authorName,
  placeLabel,
  excerpt,
  readingTime = "2 min",
  className = "",
}: ChapterRowProps) {
  return (
    <Link
      href={`/book/${id}`}
      className={`group block border-t border-hairline py-8 sm:py-10 transition-colors hover:border-ink/30 ${className}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline">
        {/* Chapter number & meta */}
        <div className="md:col-span-3 flex md:flex-col justify-between items-baseline gap-2">
          <Eyebrow>Chapter {chapterNumber}</Eyebrow>
          <span className="text-xs text-muted font-sans tracking-wide">
            {readingTime}
          </span>
        </div>

        {/* Title and optional excerpt */}
        <div className="md:col-span-6 space-y-2">
          <h3 className="font-serif italic text-2xl sm:text-3xl text-ink group-hover:text-ink/75 transition-colors">
            {title}
          </h3>
          {excerpt && (
            <p className="text-sm text-muted font-sans line-clamp-2 leading-relaxed">
              {excerpt}
            </p>
          )}
        </div>

        {/* Author & Place + subtle arrow */}
        <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3 text-sm text-muted">
          <span className="truncate">
            {authorName}
            {placeLabel ? ` · ${placeLabel}` : ""}
          </span>
          <span
            className="inline-block text-ink text-base transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
