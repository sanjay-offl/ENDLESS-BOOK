"use client";

import React from "react";
import Link from "next/link";
import { VideoBackdrop } from "./VideoBackdrop";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-hairline bg-canvas text-ink py-24 sm:py-32">
      {/* Looping film slot behind footer */}
      <VideoBackdrop
        src="/media/footer-loop.mp4"
        overlayClassName="bg-canvas/85"
        fallbackGradient="from-transparent via-canvas/40 to-canvas"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 sm:px-10 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-end">
          {/* Large italic sign-off */}
          <div className="md:col-span-8 space-y-4">
            <p className="font-serif italic text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-ink font-normal leading-[0.95]">
              The book never ends.
            </p>
            <p className="text-muted text-sm sm:text-base font-sans max-w-editorial pt-2">
              An endless book of childhood memories. One chapter at a time, one voice at a time.
            </p>
          </div>

          {/* Quick links & contact */}
          <div className="md:col-span-4 space-y-6 text-sm">
            <div className="flex flex-col space-y-2">
              <Link href="/book" className="editorial-link text-base">
                Read the book
              </Link>
              <Link href="/map" className="editorial-link text-base">
                Memory map
              </Link>
              <Link href="/write" className="editorial-link text-base">
                Write a chapter
              </Link>
              <Link href="/about" className="editorial-link text-base">
                About the project
              </Link>
            </div>

            <div className="pt-4 border-t border-hairline">
              <a
                href="mailto:sanjay@endlessbook.org"
                className="text-muted hover:text-ink transition-colors font-sans text-xs uppercase tracking-wider"
              >
                sanjay@endlessbook.org
              </a>
            </div>
          </div>
        </div>

        {/* Small caps legal line */}
        <div className="mt-16 sm:mt-24 pt-8 border-t border-hairline flex flex-col sm:flex-row justify-between items-baseline gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          <p>A COMMUNITY BOOK · BY SANJAY · COIMBATORE</p>
          <p className="font-sans normal-case tracking-normal text-muted/70 text-xs">
            Preserving memories across languages and generations
          </p>
        </div>
      </div>
    </footer>
  );
}
