"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { api, HEALTH_URL, type Chapter } from "@/lib/api";
import {
  Button,
  TextLink,
  Section,
  Eyebrow,
  DisplayHeading,
  Figure,
  ChapterRow,
  FAQ,
  VideoBackdrop,
  PageTransition,
} from "@/components/ui";
import type { AnimationState } from "@/components/ui/CharacterAnimation";
import { animateHeroParallax, animateLineReveal } from "@/lib/motion";

// Decorative character. Client-only because it drives GSAP against the DOM.
const CharacterAnimation = dynamic(
  () =>
    import("@/components/ui/CharacterAnimation").then((m) => ({
      default: m.CharacterAnimation,
    })),
  { ssr: false, loading: () => null }
);

export default function HomePage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [heroCharState, setHeroCharState] = useState<AnimationState>("wave");
  const heroImageRef = useRef<HTMLDivElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const statementsRef = useRef<HTMLDivElement>(null);

  // Development-only: warn when the API is not reachable.
  const checkApi = useCallback(() => {
    if (process.env.NODE_ENV !== "development") return;
    fetch(HEALTH_URL, { method: "GET" })
      .then((res) => {
        if (!res.ok) setShowOfflineBanner(true);
      })
      .catch(() => setShowOfflineBanner(true));
  }, []);

  useEffect(() => {
    checkApi();
  }, [checkApi]);

  useEffect(() => {
    // Fetch chapters for 'The Work' section
    api
      .getChapters()
      .then((data) => {
        setChapters(data.filter((c) => c.status === "published"));
      })
      .catch(() => {
        // Fallback or offline state handled gracefully
      });
  }, []);

  useEffect(() => {
    if (heroImageRef.current && heroContainerRef.current) {
      animateHeroParallax(heroImageRef.current, heroContainerRef.current);
    }
  }, []);

  useEffect(() => {
    if (statementsRef.current) {
      const items = statementsRef.current.querySelectorAll(".statement-item");
      animateLineReveal(items, { delay: 0.2, stagger: 0.15 });
    }
  }, []);

  // A single wave on arrival in the hero, then settle into the idle loop.
  useEffect(() => {
    const t = setTimeout(() => setHeroCharState("idle"), 3200);
    return () => clearTimeout(t);
  }, []);

  // Three latest chapters (fallback data if DB is empty or still seeding)
  const displayChapters =
    chapters.length > 0
      ? chapters.slice(0, 3)
      : [
          {
            id: "chapter-1",
            chapterNumber: 1,
            title: "The Wheel Cart of Bangles",
            authorName: "Sanjay",
            pages: [
              "A squeaky wheel cart rolls down the street every evening. Rows of bangles, bindis, hair clips, and small mirrors shine under the last light of the day.",
              "Mom cannot walk past it. She bargains like it is a game. Sanjay stands beside her, bored until he spots the corner with stickers.",
              "He was not collecting stickers. He was collecting the sound of that cart and his mom laughing while she paid.",
            ],
            place: { label: "Coimbatore, India" },
          },
          {
            id: "sample-2",
            chapterNumber: 2,
            title: "The Kite Caught in the Banyan",
            authorName: "Priya",
            pages: [
              "Every January, the rooftop belonged to the wind. Red, green, and silver paper diamonds soared over the terrace.",
              "Then the string snapped. The kite drifted slowly into the ancient banyan branches, out of reach forever.",
              "We stood watching it flutter like a trapped bird until the streetlights flickered on.",
            ],
            place: { label: "Madurai, India" },
          },
          {
            id: "sample-3",
            chapterNumber: 3,
            title: "Monsoon Paper Boats",
            authorName: "Arun",
            pages: [
              "The first rain transformed the storm drain into an unruly Amazon river. Old notebooks surrendered their pages.",
              "We creased the paper into tight triangles, naming each vessel with blue ballpoint ink before launch.",
              "Most capsized within yards. The one that cleared the culvert was remembered all summer.",
            ],
            place: { label: "Kochi, India" },
          },
        ];

  const faqItems = [
    {
      question: "Who can write a chapter?",
      answer:
        "Anyone who was once a child. You do not need to be a published writer or write with ornate vocabulary. Simply sign in with Google, write about a true moment from your childhood, and share it with the world.",
    },
    {
      question: "Why exactly three pages?",
      answer:
        "Three pages is short enough to read in one quiet sitting, yet spacious enough to capture a sensory arc: an arrival, a moment of stillness, and a parting observation. The constraint gives every writer the exact same canvas.",
    },
    {
      question: "Can I write in Tamil or Hindi?",
      answer:
        "Yes. You can compose in your native language, and readers can also experience any chapter translated into English, Tamil, Hindi, Telugu, Malayalam, and Kannada.",
    },
    {
      question: "Can I speak instead of typing?",
      answer:
        "Yes. Our writing room includes a voice recorder powered by speech recognition. You can simply recount your memory out loud, and our Page Weaver will help transcribe and shape it into three pages for your approval.",
    },
    {
      question: "What is removed by moderation?",
      answer:
        "Every chapter is checked by an automated safety agent before public display. Explicit content, harassment, hate speech, phone numbers, and full names of living children are strictly omitted. We preserve innocence and privacy.",
    },
    {
      question: "Can I edit or delete my chapter later?",
      answer:
        "Yes. You retain complete ownership of your work. You can view, export, or withdraw your memory at any moment from your personal dashboard.",
    },
  ];

  return (
    <PageTransition>
      {/* Development-only offline warning. */}
      {showOfflineBanner && process.env.NODE_ENV === "development" && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-ink text-canvas text-sm px-4 py-2 flex justify-between items-center">
          <span>
            API offline — run:{" "}
            <code className="font-mono text-xs">npm run dev:api</code> (or{" "}
            <code className="font-mono text-xs">uv run uvicorn app.main:app --reload --port 8000</code>)
          </span>
          <button
            onClick={() => setShowOfflineBanner(false)}
            className="ml-4 opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* a) HERO */}
      <section
        ref={heroContainerRef}
        className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28"
      >
        <div ref={heroImageRef} className="absolute inset-0 z-0">
          <VideoBackdrop
            src="/media/hero-loop.mp4"
            poster="/media/hero.jpg"
            overlayClassName="bg-canvas/50"
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 sm:px-10 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-0">
            {/* LEFT: Headline + CTAs */}
            <div className="lg:col-span-7 space-y-8 max-w-4xl">
              <DisplayHeading
                as="h1"
                size="hero"
                lines={["Every childhood", "is a chapter."]}
                className="text-ink"
              />

              <p className="max-w-xl text-base sm:text-lg md:text-xl text-muted font-sans leading-relaxed">
                Three pages each, written by a real person.
                <br className="hidden sm:inline" /> The book never ends.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-6 sm:gap-8">
                <Button href="/write" size="lg" variant="primary" arrow>
                  Write a chapter
                </Button>

                <TextLink href="/book" className="text-lg">
                  Start reading
                </TextLink>
              </div>
            </div>

            {/* RIGHT: self-hosted character (replaces the old lottie.host iframe) */}
            <div className="lg:col-span-5 flex items-end justify-center lg:justify-end">
              <CharacterAnimation
                state={heroCharState}
                size={460}
                className="!w-full !h-auto aspect-[150/256] max-w-[340px] sm:max-w-[400px] lg:max-w-[460px]"
              />
            </div>
          </div>
        </div>
      </section>


      {/* b) THE BOOK (Formerly The Model) */}
      <Section className="border-t border-hairline">
        <div className="max-w-editorial mb-10">
          <Eyebrow>The Book</Eyebrow>
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16 lg:items-center">
          <div className="min-w-0">
            <div ref={statementsRef} className="space-y-6 sm:space-y-8 max-w-4xl">
              <div className="overflow-hidden">
                <h2 className="statement-item font-serif italic text-3xl sm:text-5xl md:text-6xl text-ink font-normal leading-tight">
                  You remember it.
                </h2>
              </div>
              <div className="overflow-hidden">
                <h2 className="statement-item font-serif italic text-3xl sm:text-5xl md:text-6xl text-ink font-normal leading-tight">
                  You write it in three pages.
                </h2>
              </div>
              <div className="overflow-hidden">
                <h2 className="statement-item font-serif italic text-3xl sm:text-5xl md:text-6xl text-ink font-normal leading-tight">
                  The world reads it.
                </h2>
              </div>
            </div>

            <p className="mt-12 text-sm sm:text-base text-muted max-w-editorial font-sans leading-relaxed">
              An unhurried archive of everyday wonder. No algorithmic feeds, no vanity metrics. Just chapters joined end to end into one collective volume.
            </p>
          </div>

          <div className="hidden lg:flex lg:justify-center mt-12 lg:mt-0">
            {/* The hero already had the wave; this one just keeps company. */}
            <CharacterAnimation state="idle" size={240} />
          </div>
        </div>
      </Section>

      {/* c) FIGURE 3 */}
      <Section className="border-t border-hairline bg-surface/40">
        <Figure
          figure="3"
          label="Pages, always."
          description={
            <>
              <p>
                Every story in this book is bound to the exact same measure: three pages. Not two, not four.
              </p>
              <p className="pt-2">
                This constraint keeps memories concise enough to read before sleeping, and spacious enough to feel honest and complete. The writer always controls the turn of the page.
              </p>
            </>
          }
        />
      </Section>

      {/* d) THE WORK */}
      <Section className="border-t border-hairline">
        <div className="flex flex-col sm:flex-row justify-between items-baseline gap-4 mb-12 sm:mb-16">
          <div className="space-y-2">
            <Eyebrow>The Work</Eyebrow>
            <h2 className="font-serif italic text-3xl sm:text-4xl text-ink">
              Recent memories
            </h2>
          </div>

          <TextLink href="/book">See every chapter</TextLink>
        </div>

        <div>
          {displayChapters.map((chapter) => (
            <ChapterRow
              key={chapter.id}
              id={chapter.id}
              chapterNumber={chapter.chapterNumber}
              title={chapter.title}
              authorName={chapter.authorName}
              placeLabel={chapter.place?.label}
              excerpt={chapter.pages?.[0]}
            />
          ))}
        </div>
      </Section>

      {/* e) CHAPTER ONE FEATURE BLOCK */}
      <Section className="border-t border-hairline bg-canvas">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
          <div className="md:col-span-4 space-y-3">
            <Eyebrow>Chapter one, by Sanjay</Eyebrow>
            <span className="text-xs uppercase tracking-widest text-muted">
              Coimbatore · 1998
            </span>
          </div>

          <div className="md:col-span-8 space-y-6 max-w-2xl">
            <h2 className="font-serif italic text-4xl sm:text-5xl md:text-6xl text-ink font-normal leading-[1.05]">
              The Wheel Cart of Bangles
            </h2>

            <p className="font-serif text-lg sm:text-xl text-ink/80 leading-relaxed max-w-editorial">
              A squeaky wheel cart rolls down the street every evening. Rows of bangles, bindis, hair clips, and cosmetics shine under the last light of the day.
            </p>

            <p className="text-sm sm:text-base text-muted font-sans leading-relaxed max-w-editorial">
              He was not collecting Ben 10 stickers or toy trains. He was collecting the sound of that cart on the stones and his mom laughing while she paid.
            </p>

            <div className="pt-4">
              <Button href="/book/chapter-1" variant="primary" size="md">
                Read it
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* f) FULL DISCLOSURE BLOCK */}
      <Section className="border-t border-hairline bg-surface/50">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
          <div className="md:col-span-4">
            <Eyebrow>Full disclosure</Eyebrow>
          </div>

          <div className="md:col-span-8 max-w-editorial space-y-4 text-sm sm:text-base text-muted font-sans leading-relaxed">
            <p>
              Every submitted chapter is reviewed by a moderation agent before public listing to prevent abuse and protect privacy. Locations are intentionally rounded to the city or district level—we never store or display home addresses.
            </p>
            <p>
              Authors maintain perpetual ownership of their words. Consent is explicitly verified before publishing, and you may withdraw or edit your chapter at any time.
            </p>
          </div>
        </div>
      </Section>

      {/* g) ASKED BEFORE (FAQ) */}
      <Section className="border-t border-hairline">
        <div className="max-w-editorial mb-12 sm:mb-16 space-y-2">
          <Eyebrow>Asked before</Eyebrow>
          <h2 className="font-serif italic text-3xl sm:text-5xl text-ink font-normal">
            Common questions
          </h2>
        </div>

        <div className="max-w-4xl">
          <FAQ items={faqItems} />
        </div>
      </Section>
    </PageTransition>
  );
}
