"use client";

import React from "react";
import Image from "next/image";
import { Eyebrow, DisplayHeading, TextLink, PageTransition } from "@/components/ui";

export default function AboutPage() {
  return (
    <PageTransition>
      <article className="min-h-screen pt-32 pb-24 md:pt-40 md:pb-36">
        <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10 md:px-16">
          <div className="max-w-editorial mx-auto space-y-16 sm:space-y-20">
            {/* Header */}
            <div className="space-y-4">
              <Eyebrow>Origin & Philosophy</Eyebrow>
              <DisplayHeading as="h1" size="hero" italic>
                The story behind the book.
              </DisplayHeading>
            </div>

            {/* Painterly Artwork Slot */}
            <div className="space-y-3">
              <div className="relative aspect-[16/10] w-full overflow-hidden border border-hairline bg-surface">
                <Image
                  src="/media/hero.jpg"
                  alt="Neoclassical oil painting depiction of the wheel cart of bangles at golden hour"
                  fill
                  className="object-cover object-center filter saturate-[92%]"
                  priority
                />
              </div>
              <p className="text-xs text-muted font-sans tracking-wide">
                Oil study: The wheel cart at twilight, Coimbatore.
              </p>
            </div>

            {/* Editorial Body: Section 1 */}
            <div className="space-y-6 text-base sm:text-lg text-ink/85 font-sans leading-relaxed">
              <p>
                Childhood memories are the most universal possession we share. A squeaky wheel cart of glass bangles, a kite trapped in the highest branches of a banyan, the damp smell of red earth under the first monsoon rain—these moments connect us across languages, oceans, and generations.
              </p>

              <p>
                Yet most digital spaces treat memory as disposable currency: feeds that vanish in forty-eight hours, algorithmic ranking, and endless notifications designed to provoke rather than preserve.
              </p>
            </div>

            {/* Big Italic Pull Quote */}
            <blockquote className="border-y border-hairline py-10 sm:py-14 my-12">
              <p className="font-serif italic text-3xl sm:text-4xl lg:text-5xl text-ink font-normal leading-[1.1] tracking-tight">
                “This book is a place to keep them. Not in a feed, but in a volume that never ends.”
              </p>
            </blockquote>

            {/* Editorial Body: Section 2 */}
            <div className="space-y-6 text-base sm:text-lg text-ink/85 font-sans leading-relaxed">
              <p>
                The project began with a single story: Chapter One, titled <em>The Wheel Cart of Bangles</em>. It documented an ordinary evening standing beside my mother on the pavement, watching rows of coloured glass glint under sodium streetlights.
              </p>

              <p>
                Once chapter one was placed, the binding was left deliberately open. Anyone who was once a child can sign in, write the next entry, and weave their own voice into the unbroken thread.
              </p>
            </div>

            {/* Why Three Pages Note */}
            <div className="border-t border-hairline pt-12 space-y-4">
              <Eyebrow>The Measure</Eyebrow>
              <h2 className="font-serif italic text-3xl text-ink font-normal">
                Why three pages?
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-muted font-sans leading-relaxed">
                <p>
                  Every chapter is strictly three pages. That constraint is intentional. It prevents memories from dissolving into sprawling memoirs, yet offers enough space for sensory pacing: the arrival, the core observation, and the stillness that followed.
                </p>
                <p>
                  Whether assisted by our AI Page Weaver or composed sentence by sentence by the author, every memory shares the identical geometry.
                </p>
              </div>
            </div>

            {/* Privacy and Care */}
            <div className="border-t border-hairline pt-12 space-y-4">
              <Eyebrow>Care and Provenance</Eyebrow>
              <h2 className="font-serif italic text-3xl text-ink font-normal">
                Privacy as a foundation.
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-muted font-sans leading-relaxed">
                <p>
                  We never record exact street addresses; map locations are intentionally rounded to district borders. We never catalog telephone numbers or the identities of children. Every submission undergoes safety review before appearing in the public anthology.
                </p>
                <p>
                  Writers retain full copyright over their memories and may export or remove their chapter at any time.
                </p>
              </div>
            </div>

            {/* Founder Sign-off */}
            <div className="border-t border-hairline pt-12 space-y-2">
              <p className="font-serif italic text-2xl sm:text-3xl text-ink font-normal">
                Sanjay
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted font-sans">
                Founder · Coimbatore, Tamil Nadu
              </p>
            </div>

            {/* Back to book link */}
            <div className="pt-6">
              <TextLink href="/book" className="text-base">
                Read the anthology
              </TextLink>
            </div>
          </div>
        </div>
      </article>
    </PageTransition>
  );
}
