import React, { useEffect, useRef, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types for the Maps JS API (new Places API)
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    google?: {
      maps?: {
        importLibrary?: (lib: string) => Promise<unknown>;
      };
    };
    __gMapsResolvers?: Array<() => void>;
    __gMapsLoading?: boolean;
    __gMapsCB?: () => void;
  }
}

interface PlacePrediction {
  mainText: { text: string };
  text: { toString(): string };
  placeId: string;
}

interface Suggestion {
  placePrediction: PlacePrediction;
}

interface AutocompleteSuggestionStatic {
  fetchAutocompleteSuggestions(request: {
    input: string;
    includedPrimaryTypes?: string[];
    sessionToken?: unknown;
  }): Promise<{ suggestions: Suggestion[] }>;
}

interface PlacesLibrary {
  AutocompleteSuggestion: AutocompleteSuggestionStatic;
  AutocompleteSessionToken: new () => unknown;
}

// ---------------------------------------------------------------------------
// Key — read from Vite env var, with the restricted key as fallback.
// ---------------------------------------------------------------------------
const MAPS_API_KEY =
  (import.meta.env.VITE_MAPS_API_KEY as string | undefined) ??
  "AIzaSyDjCMzJVy_4eZcAOgFwzMEah_sS8J_DMIs";

// ---------------------------------------------------------------------------
// Load the Maps JS API exactly once (no `libraries` param — we use
// importLibrary so the new Places API (New) works without the legacy lib).
// ---------------------------------------------------------------------------
function loadMapsScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.google?.maps?.importLibrary) {
      resolve();
      return;
    }
    window.__gMapsResolvers ??= [];
    window.__gMapsResolvers.push(resolve);
    if (window.__gMapsLoading) return;
    window.__gMapsLoading = true;

    window.__gMapsCB = () => {
      (window.__gMapsResolvers ?? []).forEach((r) => r());
      window.__gMapsResolvers = [];
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&loading=async&callback=__gMapsCB`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface CityAutocompleteProps {
  value: string;
  onChange: (city: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CityAutocomplete({
  value,
  onChange,
  className,
  style,
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [placesLib, setPlacesLib] = useState<PlacesLibrary | null>(null);
  const [loadError, setLoadError] = useState(false);

  const sessionTokenRef = useRef<unknown>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load the Maps API and the Places library on mount
  useEffect(() => {
    loadMapsScript()
      .then(async () => {
        const lib = (await window.google!.maps!.importLibrary!(
          "places"
        )) as PlacesLibrary;
        setPlacesLib(lib);
        sessionTokenRef.current = new lib.AutocompleteSessionToken();
      })
      .catch(() => setLoadError(true));
  }, []);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (!placesLib || input.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }
      try {
        const { suggestions: results } =
          await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input,
            includedPrimaryTypes: ["locality", "administrative_area_level_3"],
            sessionToken: sessionTokenRef.current,
          });
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch {
        setSuggestions([]);
        setIsOpen(false);
      }
    },
    [placesLib]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setHighlightedIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 280);
  };

  const handleSelect = (s: Suggestion) => {
    const label = s.placePrediction.text.toString();
    setInputValue(label);
    onChange(label);
    setSuggestions([]);
    setIsOpen(false);
    // Refresh session token after a selection
    if (placesLib) {
      sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() =>
          inputValue.length >= 2 && suggestions.length > 0 && setIsOpen(true)
        }
        placeholder={
          loadError
            ? "e.g. Kyoto, Japan or Brooklyn, NY"
            : placesLib
            ? "Start typing your city…"
            : "e.g. Kyoto, Japan or Brooklyn, NY"
        }
        autoComplete="off"
        className={className}
        style={style}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        role="combobox"
      />

      {isOpen && suggestions.length > 0 && (
        <ul
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 2px)",
            left: 0,
            right: 0,
            zIndex: 200,
            listStyle: "none",
            margin: 0,
            padding: 0,
            backgroundColor: "var(--color-page)",
            border: "var(--border-width) solid var(--color-ink)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {suggestions.map((s, idx) => (
            <li
              key={s.placePrediction.placeId}
              role="option"
              aria-selected={idx === highlightedIndex}
              onMouseDown={() => handleSelect(s)}
              onMouseEnter={() => setHighlightedIndex(idx)}
              style={{
                padding: "0.65rem 1rem",
                fontFamily: "var(--font-editorial)",
                fontSize: "var(--text-sm)",
                cursor: "pointer",
                backgroundColor:
                  idx === highlightedIndex
                    ? "var(--color-ink)"
                    : "transparent",
                color:
                  idx === highlightedIndex
                    ? "var(--color-page)"
                    : "var(--color-ink)",
                borderBottom:
                  idx < suggestions.length - 1
                    ? "var(--border-thin) solid var(--color-ink)"
                    : "none",
                transition: "background-color 0.1s ease, color 0.1s ease",
              }}
            >
              <span style={{ fontWeight: 600 }}>
                {s.placePrediction.mainText.text}
              </span>
              <span style={{ opacity: 0.55, fontSize: "0.85em", marginLeft: "0.35rem" }}>
                {s.placePrediction.text
                  .toString()
                  .replace(s.placePrediction.mainText.text, "")
                  .replace(/^,\s*/, "")}
              </span>
            </li>
          ))}
          <li
            style={{
              padding: "0.35rem 1rem",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <img
              src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png"
              alt="Powered by Google"
              style={{ height: "14px", opacity: 0.6 }}
            />
          </li>
        </ul>
      )}
    </div>
  );
}
