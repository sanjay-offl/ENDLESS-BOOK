"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { api, type Chapter } from "@/lib/api";
import { Eyebrow, TextLink, PageTransition } from "@/components/ui";

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selected, setSelected] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getChapters()
      .then((data) => {
        const withPlace = data.filter((c) => c.place && c.status === "published");
        setChapters(withPlace);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || chapters.length === 0) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style:
        process.env.NEXT_PUBLIC_MAP_STYLE ||
        "https://tiles.openfreemap.org/styles/positron",
      center: [78.9629, 20.5937],
      zoom: 4.5,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    chapters.forEach((chapter) => {
      if (!chapter.place) return;

      // Pin: small ink dot with thin accent ring
      const el = document.createElement("div");
      el.className = "memory-pin";
      el.style.cssText = `
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: #0B0A09;
        border: 2px solid #E8B93C;
        box-shadow: 0 0 0 2px rgba(246, 243, 236, 0.9);
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      `;

      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.4)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
      });
      el.addEventListener("click", () => {
        setSelected(chapter);
        api.trackEvent("map_pin_opened", { chapter_id: chapter.id });
      });

      new maplibregl.Marker({ element: el })
        .setLngLat([chapter.place.lng, chapter.place.lat])
        .addTo(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [chapters]);

  return (
    <PageTransition>
      <div className="relative w-full h-[calc(100vh-64px)] mt-16 overflow-hidden bg-canvas">
        {/* Full-bleed MapLibre map with desaturation filter */}
        <div
          ref={mapContainerRef}
          className="absolute inset-0 w-full h-full filter grayscale-[88%] contrast-[96%] brightness-[102%]"
          role="application"
          aria-label="Interactive memory map"
        />

        {/* Floating title top left in italic */}
        <div className="absolute top-8 left-6 sm:left-12 z-20 pointer-events-none space-y-1">
          <Eyebrow>Cartography</Eyebrow>
          <h1 className="font-serif italic text-3xl sm:text-5xl text-ink font-normal tracking-tight">
            Where memories live.
          </h1>
        </div>

        {/* Selected Pin Card: small white card with hairline border */}
        {selected && (
          <div className="absolute bottom-8 left-6 sm:left-12 z-30 w-full max-w-sm bg-surface border border-hairline rounded-editorial p-6 text-ink shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-start justify-between gap-4">
              <Eyebrow>Chapter {selected.chapterNumber}</Eyebrow>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close preview"
                className="text-muted hover:text-ink text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="font-serif italic text-2xl text-ink font-normal leading-snug">
                {selected.title}
              </h2>
              <p className="text-xs text-muted font-sans uppercase tracking-wider">
                {selected.place?.label} · by {selected.authorName}
              </p>
            </div>

            <p className="text-sm text-muted font-sans line-clamp-2 leading-relaxed">
              {selected.pages[0]}
            </p>

            <div className="pt-2">
              <TextLink href={`/book/${selected.id}`}>
                Read chapter
              </TextLink>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-canvas/80 z-20 flex items-center justify-center">
            <p className="font-serif italic text-2xl text-muted animate-pulse">
              Tracing coordinates...
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
