"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, type Chapter } from "@/lib/api";
import { Eyebrow, DisplayHeading, PageTransition } from "@/components/ui";

export default function FounderPage() {
  const { user, loading: authLoading, token, role } = useAuth();
  const router = useRouter();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"moderation" | "analytics" | "all">("moderation");

  useEffect(() => {
    if (!authLoading && (!user || role !== "founder")) {
      router.push("/");
    }
  }, [authLoading, user, role, router]);

  useEffect(() => {
    if (!token || role !== "founder") return;
    Promise.all([api.getAdminChapters(token), api.getAnalytics(token)])
      .then(([ch, an]) => {
        setChapters(ch);
        setAnalytics(an);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, role]);

  const moderate = async (id: string, action: "publish" | "reject") => {
    if (!token) return;
    try {
      await api.moderateChapter(id, action, token);
      setChapters((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, status: action === "publish" ? "published" : "rejected" }
            : c
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFeature = async (id: string, featured: boolean) => {
    if (!token) return;
    try {
      await api.featureChapter(id, featured, token);
      setChapters((prev) =>
        prev.map((c) => (c.id === id ? { ...c, featured } : c))
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (authLoading || !user || role !== "founder") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="font-serif italic text-2xl text-muted animate-pulse">
          Verifying credentials...
        </p>
      </div>
    );
  }

  const pending = chapters.filter(
    (c) => c.status === "pending" || c.status === "needs_review"
  );

  return (
    <PageTransition>
      <div className="min-h-screen pt-32 pb-24 md:pt-40 md:pb-36">
        <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10 md:px-16 space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <Eyebrow>Editorial Desk</Eyebrow>
            <DisplayHeading as="h1" size="hero" italic>
              Founder Dashboard
            </DisplayHeading>
            <p className="text-sm text-muted font-sans max-w-editorial">
              Oversight, manuscript moderation, and community reading metrics.
            </p>
          </div>

          {/* Quiet text navigation tabs */}
          <div className="flex gap-8 border-b border-hairline pb-4 font-serif italic text-lg">
            {(["moderation", "analytics", "all"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`transition-colors capitalize ${
                  tab === t
                    ? "text-ink underline underline-offset-8 decoration-1 decoration-ink font-normal"
                    : "text-muted hover:text-ink"
                }`}
              >
                {t === "moderation"
                  ? `Moderation (${pending.length})`
                  : t === "analytics"
                  ? "Analytics"
                  : "All chapters"}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-24 text-center">
              <p className="font-serif italic text-2xl text-muted">Retrieving entries...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: MODERATION */}
              {tab === "moderation" && (
                <div className="space-y-6">
                  {pending.length === 0 ? (
                    <div className="py-16 text-center border-t border-hairline">
                      <p className="font-serif italic text-xl text-muted">
                        No submissions awaiting review.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-hairline border-t border-b border-hairline">
                      {pending.map((chapter) => (
                        <div key={chapter.id} className="py-8 space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                <span className="text-xs uppercase tracking-wider text-muted font-sans">
                                  {chapter.status} · by {chapter.authorName}
                                </span>
                              </div>
                              <h2 className="font-serif italic text-2xl text-ink font-normal">
                                {chapter.title}
                              </h2>
                            </div>

                            <div className="flex items-center gap-6 text-sm font-serif italic">
                              <button
                                type="button"
                                onClick={() => moderate(chapter.id, "publish")}
                                className="text-ink hover:underline"
                              >
                                Approve →
                              </button>
                              <button
                                type="button"
                                onClick={() => moderate(chapter.id, "reject")}
                                className="text-muted hover:text-red-700 hover:underline"
                              >
                                Decline
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2 max-w-reader text-sm font-sans text-muted leading-relaxed">
                            {chapter.pages.map((p, i) => (
                              <p key={i}>
                                <span className="font-mono text-xs text-muted/60 mr-2">p.{i + 1}</span>
                                {p}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ANALYTICS */}
              {tab === "analytics" && (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.entries(analytics).map(([key, value]) => (
                      <div key={key} className="border-t border-hairline pt-6 space-y-2">
                        <Eyebrow>{key.replace(/_/g, " ")}</Eyebrow>
                        <p className="font-serif italic text-5xl text-ink font-normal">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Clean ink line chart representation */}
                  <div className="border-t border-hairline pt-8 space-y-4">
                    <Eyebrow>Reading Trajectory</Eyebrow>
                    <div className="h-44 w-full flex items-end gap-2 pt-8 pb-2 border-b border-hairline">
                      {[32, 45, 58, 52, 68, 74, 82, 90, 84, 102, 115, 128].map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <div
                            className={`w-full ${
                              i === 11 ? "bg-accent" : "bg-ink"
                            } transition-all`}
                            style={{ height: `${(val / 130) * 100}%` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[11px] uppercase tracking-wider text-muted font-sans">
                      <span>Past 12 weeks</span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-accent" /> Active momentum
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ALL CHAPTERS TABLE */}
              {tab === "all" && (
                <div className="border-t border-hairline">
                  {/* Table header */}
                  <div className="grid grid-cols-12 py-3 border-b border-hairline text-xs font-semibold uppercase tracking-widest text-muted">
                    <div className="col-span-1">No.</div>
                    <div className="col-span-5">Title</div>
                    <div className="col-span-3">Author</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1 text-right">Feature</div>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-hairline">
                    {chapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="grid grid-cols-12 py-4 items-baseline text-sm font-sans"
                      >
                        <div className="col-span-1 font-mono text-xs text-muted">
                          #{chapter.chapterNumber}
                        </div>
                        <div className="col-span-5 font-serif italic text-base text-ink truncate pr-4">
                          {chapter.title}
                        </div>
                        <div className="col-span-3 text-muted truncate pr-2">
                          {chapter.authorName}
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              chapter.status === "published"
                                ? "bg-ink"
                                : chapter.status === "pending" || chapter.status === "needs_review"
                                ? "bg-accent"
                                : "bg-muted/40"
                            }`}
                          />
                          <span className="text-xs uppercase tracking-wider text-muted">
                            {chapter.status}
                          </span>
                        </div>
                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => toggleFeature(chapter.id, !chapter.featured)}
                            className={`text-xs uppercase tracking-wider ${
                              chapter.featured ? "text-ink font-semibold" : "text-muted hover:text-ink"
                            }`}
                          >
                            {chapter.featured ? "★ Yes" : "No"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
