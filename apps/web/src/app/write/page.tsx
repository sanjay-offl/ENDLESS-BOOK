"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  Button,
  Field,
  TextArea,
  Eyebrow,
  DisplayHeading,
  Modal,
  PageTransition,
} from "@/components/ui";
import type { AnimationState } from "@/components/ui/CharacterAnimation";
import { MemoryIcon } from "@/components/scenes/MemoryIcon";
import { Mic, MicOff, Sparkles } from "lucide-react";
import { MEMORY_ICONS, type MemoryIcon as MemoryIconType } from "@/lib/utils";

// The character is decorative and depends on window + GSAP, so it never runs
// during SSR and never blocks the rest of the page from hydrating.
const CharacterAnimation = dynamic(
  () =>
    import("@/components/ui/CharacterAnimation").then((m) => ({
      default: m.CharacterAnimation,
    })),
  { ssr: false, loading: () => null }
);

type Step = "title" | "pages" | "place" | "icon" | "review";

export default function WritePage() {
  const { user, loading: authLoading, token } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("title");
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState(["", "", ""]);
  const [place, setPlace] = useState("");
  const [icon, setIcon] = useState<MemoryIconType>("bangles");
  const [recording, setRecording] = useState(false);
  const [weaving, setWeaving] = useState(false);
  const [weaveResult, setWeaveResult] = useState<{
    title: string;
    pages: [string, string, string];
  } | null>(null);
  const [showWeaveModal, setShowWeaveModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  // Character animation state
  const [charState, setCharState] = useState<AnimationState>("idle");
  const [isFocused, setIsFocused] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  // The character reacts to where the writer is in the form.
  useEffect(() => {
    if (weaving) return setCharState("thinking");
    if (isSubmitted) return setCharState("celebrating");
    if (step === "review") return setCharState("encouraging");
    if (step === "pages" && isFocused) return setCharState("walk");
    setCharState("idle");
  }, [step, weaving, isFocused, isSubmitted]);

  const onFieldFocus = useCallback(() => setIsFocused(true), []);
  const onFieldBlur = useCallback(() => setIsFocused(false), []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        if (!token) return;
        try {
          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");
          const result = await api.transcribe(formData, token);
          setPages((prev) => {
            const next = [...prev];
            next[0] = (next[0] + " " + result.transcript).trim();
            return next;
          });
        } catch {
          setError("Transcription failed. Please try again.");
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 180000);
    } catch {
      setError("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const runWeaver = async () => {
    const text = pages.join(" ").trim();
    if (!text || !token) return;
    setWeaving(true);
    setShowWeaveModal(true);
    try {
      const result = await api.weave(text, token);
      setWeaveResult(result);
    } catch {
      setError("Page Weaver could not complete. Please refine your draft.");
    } finally {
      setWeaving(false);
    }
  };

  const acceptWeave = () => {
    if (!weaveResult) return;
    setTitle(weaveResult.title);
    setPages(weaveResult.pages);
    setShowWeaveModal(false);
  };

  const submit = async () => {
    if (!token || !consent) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.createChapter(
        {
          title,
          pages: pages as [string, string, string],
          language: "en",
          place: place ? { label: place, lat: 0, lng: 0 } : null,
          icon,
        },
        token
      );
      setIsSubmitted(true);
      // Hold on the celebrating pose briefly before navigating away.
      setTimeout(() => router.push("/me"), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to publish");
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="font-serif italic text-2xl text-muted animate-pulse">
          Opening writing room...
        </p>
      </div>
    );
  }

  const steps: { key: Step; label: string }[] = [
    { key: "title", label: "Title" },
    { key: "pages", label: "Pages" },
    { key: "place", label: "Place" },
    { key: "icon", label: "Icon" },
    { key: "review", label: "Review" },
  ];
  const currentIdx = steps.findIndex((s) => s.key === step);

  return (
    <PageTransition>
      {/* Slim progress line at the very top */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-hairline z-50">
        <div
          className="h-full bg-ink transition-all duration-500 ease-out"
          style={{ width: `${((currentIdx + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="min-h-screen pt-32 pb-24 md:pt-40 md:pb-36">
        <div className="mx-auto w-full max-w-editorial lg:max-w-[1120px] px-6 sm:px-8">
          {/* Form on the left, reactive character pinned on the right. */}
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16 lg:items-start">
            <div className="min-w-0">
          {/* Step indicator */}
          <div className="mb-12 flex items-center justify-between text-xs text-muted font-sans uppercase tracking-[0.18em]">
            <span>
              Step {currentIdx + 1} of {steps.length} · {steps[currentIdx].label}
            </span>
            {currentIdx > 0 && (
              <button
                type="button"
                onClick={() => setStep(steps[currentIdx - 1].key)}
                className="hover:text-ink transition-colors flex items-center gap-1 font-serif italic text-sm capitalize tracking-normal"
              >
                ← Back
              </button>
            )}
          </div>

          {/* STEP 1: TITLE */}
          {step === "title" && (
            <div className="space-y-10">
              <div className="space-y-4">
                <Eyebrow>The Beginning</Eyebrow>
                <DisplayHeading as="h1" size="title" italic>
                  What is your memory called?
                </DisplayHeading>
                <p className="text-muted text-sm sm:text-base font-sans">
                  A short, sensory title. Like the chapter of a beloved volume.
                </p>
              </div>

              <div className="pt-4">
                <Field
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={onFieldFocus}
                  onBlur={onFieldBlur}
                  placeholder="e.g. The Wheel Cart of Bangles"
                  maxLength={80}
                  autoFocus
                />
              </div>

              <div className="pt-8 flex justify-end">
                <Button
                  onClick={() => setStep("pages")}
                  disabled={!title.trim()}
                  variant="primary"
                  arrow
                >
                  Continue to pages
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: PAGES */}
          {step === "pages" && (
            <div className="space-y-12">
              <div className="space-y-4">
                <Eyebrow>The Three Pages</Eyebrow>
                <DisplayHeading as="h1" size="title" italic>
                  Tell it in three pages.
                </DisplayHeading>
                <p className="text-muted text-sm sm:text-base font-sans leading-relaxed">
                  Each page holds one moment of your story. Speak it aloud, write it plainly, or let the AI Page Weaver arrange your draft.
                </p>
              </div>

              {/* Voice & AI tools row */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-hairline">
                {/* Voice button: round outlined with accent dot */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={recording ? stopRecording : startRecording}
                    aria-label={recording ? "Stop speaking" : "Speak your memory"}
                    className="relative flex h-11 w-11 items-center justify-center rounded-full border border-hairline text-ink hover:border-ink transition-colors"
                  >
                    {recording && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-accent animate-ping" />
                    )}
                    {recording ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>

                  <span className="text-xs text-muted font-sans">
                    {recording ? "Listening... click to end" : "Speak memory"}
                  </span>
                </div>

                {/* AI Page Weaver button */}
                <button
                  type="button"
                  onClick={runWeaver}
                  disabled={weaving || !pages.some((p) => p.trim())}
                  className="editorial-link text-sm text-ink disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Sparkles size={14} className="inline mr-1 text-muted" />
                  <span>{weaving ? "Weaving draft..." : "Weave with AI"}</span>
                </button>
              </div>

              {/* Three page textareas (underline style, no boxes) */}
              <div className="space-y-10">
                {pages.map((pageContent, idx) => (
                  <div key={idx} className="space-y-2">
                    <TextArea
                      label={`Page ${idx + 1}`}
                      value={pageContent}
                      onFocus={onFieldFocus}
                      onBlur={onFieldBlur}
                      onChange={(e) => {
                        const next = [...pages];
                        next[idx] = e.target.value;
                        setPages(next);
                      }}
                      placeholder={
                        idx === 0
                          ? "The arrival. Where did you stand? What did you hear?"
                          : idx === 1
                          ? "The center of the memory. What did you touch, see, or bargain for?"
                          : "The parting observation. How did the day close?"
                      }
                      rows={5}
                      maxLength={1500}
                    />
                    <div className="flex justify-end text-[11px] text-muted/60 font-sans">
                      {pageContent.length}/1500
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 flex items-center justify-between">
                <Button
                  variant="secondary"
                  onClick={() => setStep("title")}
                  arrow={false}
                >
                  ← Back
                </Button>

                <Button
                  onClick={() => setStep("place")}
                  disabled={pages.some((p) => !p.trim())}
                  variant="primary"
                  arrow
                >
                  Location
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: PLACE */}
          {step === "place" && (
            <div className="space-y-10">
              <div className="space-y-4">
                <Eyebrow>Geography</Eyebrow>
                <DisplayHeading as="h1" size="title" italic>
                  Where did this happen?
                </DisplayHeading>
                <p className="text-muted text-sm sm:text-base font-sans">
                  A city, village, or district. For privacy, exact addresses are never recorded or mapped.
                </p>
              </div>

              <div className="pt-4">
                <Field
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  onFocus={onFieldFocus}
                  onBlur={onFieldBlur}
                  placeholder="e.g. Madurai, Tamil Nadu"
                  helperText="Rounded to city level for the global memory map."
                  autoFocus
                />
              </div>

              <div className="pt-8 flex items-center justify-between">
                <Button
                  variant="secondary"
                  onClick={() => setStep("pages")}
                  arrow={false}
                >
                  ← Back
                </Button>

                <Button onClick={() => setStep("icon")} variant="primary" arrow>
                  Choose relic
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: ICON */}
          {step === "icon" && (
            <div className="space-y-10">
              <div className="space-y-4">
                <Eyebrow>Visual Anchor</Eyebrow>
                <DisplayHeading as="h1" size="title" italic>
                  Choose a childhood relic.
                </DisplayHeading>
                <p className="text-muted text-sm sm:text-base font-sans">
                  Select the token that marks your chapter in the book.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {MEMORY_ICONS.map((ic) => {
                  const isSelected = icon === ic;
                  return (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`p-6 border text-center transition-colors flex flex-col items-center gap-3 ${
                        isSelected
                          ? "border-ink bg-surface"
                          : "border-hairline bg-transparent hover:border-ink/40"
                      }`}
                    >
                      <MemoryIcon icon={ic} size={32} className="text-ink" />
                      <span className="text-xs uppercase tracking-wider text-muted capitalize font-sans">
                        {ic.replace("-", " ")}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-8 flex items-center justify-between">
                <Button
                  variant="secondary"
                  onClick={() => setStep("place")}
                  arrow={false}
                >
                  ← Back
                </Button>

                <Button onClick={() => setStep("review")} variant="primary" arrow>
                  Review chapter
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {step === "review" && (
            <div className="space-y-10">
              <div className="space-y-4">
                <Eyebrow>The Proof</Eyebrow>
                <DisplayHeading as="h1" size="title" italic>
                  Review your chapter.
                </DisplayHeading>
                <p className="text-muted text-sm sm:text-base font-sans">
                  Read it through once before giving it to the endless book.
                </p>
              </div>

              <div className="border-t border-hairline pt-8 space-y-8">
                <div>
                  <Eyebrow>Title</Eyebrow>
                  <p className="font-serif italic text-3xl text-ink pt-1 font-normal">
                    {title}
                  </p>
                </div>

                <div className="space-y-6">
                  {pages.map((p, idx) => (
                    <div key={idx} className="space-y-1">
                      <Eyebrow>Page {idx + 1}</Eyebrow>
                      <p className="font-serif text-lg text-ink/90 leading-relaxed max-w-reader">
                        {p}
                      </p>
                    </div>
                  ))}
                </div>

                {place && (
                  <div>
                    <Eyebrow>Place</Eyebrow>
                    <p className="text-sm font-sans text-muted pt-1">{place}</p>
                  </div>
                )}
              </div>

              {/* Consent checkbox: simple square outline with clear text */}
              <div className="p-6 border border-hairline bg-surface/60 space-y-2">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded-none border border-hairline text-ink focus:ring-0 focus:outline-none"
                  />
                  <span className="text-xs sm:text-sm text-muted font-sans leading-relaxed">
                    I understand that publishing this story makes it part of a public, permanent community book. I confirm this is a truthful memory of my own and contains no private details of living children.
                  </span>
                </label>
              </div>

              {error && (
                <p className="text-sm text-red-600 font-sans">{error}</p>
              )}

              <div className="pt-4 flex items-center justify-between">
                <Button
                  variant="secondary"
                  onClick={() => setStep("icon")}
                  arrow={false}
                >
                  ← Back
                </Button>

                <Button
                  onClick={submit}
                  disabled={!consent || submitting}
                  variant="primary"
                >
                  {submitting ? "Publishing..." : "Publish Chapter"}
                </Button>
              </div>
            </div>
          )}
            </div>

            {/* Character panel: decorative, desktop only, follows form state. */}
            <aside className="hidden lg:flex lg:justify-center lg:sticky lg:top-28">
              <div className="flex flex-col items-center gap-4">
                <CharacterAnimation
                  state={charState}
                  size={280}
                  onComplete={() => {
                    // celebrating plays once; fall back to idle afterwards.
                    if (charState === "celebrating") {
                      setTimeout(() => setCharState("idle"), 500);
                    }
                  }}
                />
                <p
                  aria-hidden="true"
                  className="font-serif italic text-sm text-muted/70"
                >
                  {charState === "thinking" && "Weaving your pages..."}
                  {charState === "celebrating" && "Into the book it goes."}
                  {charState === "encouraging" && "One last read-through."}
                  {charState === "walk" && "Keep going."}
                  {charState === "idle" && "Take your time."}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* AI Page Weaver Modal: Two plain columns with hairline separation, accepted text underlined in accent */}
      <Modal
        isOpen={showWeaveModal}
        onClose={() => setShowWeaveModal(false)}
        title="Page Weaver Diff"
        eyebrow="AI COLLABORATOR"
      >
        {weaving ? (
          <div className="py-12 text-center space-y-3">
            <p className="font-serif italic text-2xl text-ink">Weaving draft...</p>
            <p className="text-xs uppercase tracking-widest text-muted">
              Distributing sensory flow into three balanced pages
            </p>
          </div>
        ) : weaveResult ? (
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-wider text-muted">
              Suggested: <span className="font-serif italic text-base text-ink capitalize">{weaveResult.title}</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-b border-hairline py-4 text-xs font-sans">
              <div className="space-y-3">
                <p className="font-semibold uppercase tracking-wider text-muted">Your Draft</p>
                <div className="space-y-2 text-muted leading-relaxed">
                  {pages.map((p, i) => (
                    <p key={i}>
                      <span className="font-mono text-[10px] text-muted/50 mr-1">p.{i + 1}</span>
                      {p || "—"}
                    </p>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t md:border-t-0 md:border-l border-hairline md:pl-6 pt-4 md:pt-0">
                <p className="font-semibold uppercase tracking-wider text-muted">Weaver Recommendation</p>
                <div className="space-y-2 text-ink leading-relaxed">
                  {weaveResult.pages.map((p, i) => (
                    <p key={i}>
                      <span className="font-mono text-[10px] text-muted/50 mr-1">p.{i + 1}</span>
                      <span className="border-b border-accent/60 bg-accent-soft/30 px-0.5">
                        {p}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <button
                type="button"
                onClick={() => setShowWeaveModal(false)}
                className="text-xs uppercase tracking-wider text-muted hover:text-ink"
              >
                Keep my draft
              </button>

              <Button size="sm" variant="primary" onClick={acceptWeave} arrow={false}>
                Accept Weaver draft
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </PageTransition>
  );
}
