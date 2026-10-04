import React, { useEffect, useRef, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types — we only use what we need from the Maps JS API types
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          AutocompleteService: new () => GoogleAutocompleteService;
          PlacesServiceStatus: { OK: string };
        };
      };
    };
    __gPlacesResolvers?: Array<() => void>;
    __gPlacesLoading?: boolean;
  }
}

interface GoogleAutocompleteService {
  getPlacePredictions(
    request: {
      input: string;
      types?: string[];
    },
    callback: (
      results: Prediction[] | null,
      status: string
    ) => void
  ): void;
}

interface Prediction {
  description: string;
  place_id: string;
}

// ---------------------------------------------------------------------------
// The Google Maps API key for Places. Baked in at build time from the env var
// VITE_MAPS_API_KEY (set in .env.local for dev, Vercel env vars for prod).
// Restrict this key in Google Cloud Console to your Vercel domain +
// Maps JavaScript API + Places API (New) only.
// ---------------------------------------------------------------------------
const MAPS_API_KEY =
  (import.meta.env.VITE_MAPS_API_KEY as string | undefined) ??
  "AIzaSyDjCMzJVy_4eZcAOgFwzMEah_sS8J_DMIs";

// Loads the Maps JS API exactly once even if called from multiple components.
function loadMapsScript(): Promise<void> {
  return new Promise((resolve) => {
    // Already loaded
    if (window.google?.maps?.places) {
      resolve();
      return;
    }

    // Register resolver to be called when the script fires its callback
    window.__gPlacesResolvers ??= [];
    window.__gPlacesResolvers.push(resolve);

    if (window.__gPlacesLoading) return; // script tag already injected
    window.__gPlacesLoading = true;

    // The callback name needs to be on `window` before the script is parsed.
    (window as Window & { __gPlacesCB?: () => void }).__gPlacesCB = () => {
      (window.__gPlacesResolvers ?? []).forEach((r) => r());
      window.__gPlacesResolvers = [];
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places&callback=__gPlacesCB`;
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
  const [suggestions, setSuggestions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [serviceReady, setServiceReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const serviceRef = useRef<GoogleAutocompleteService | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load the Maps API on mount
  useEffect(() => {
    loadMapsScript()
      .then(() => {
        if (window.google?.maps?.places) {
          serviceRef.current = new window.google.maps.places.AutocompleteService();
          setServiceReady(true);
        }
      })
      .catch(() => setLoadError(true));
  }, []);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = useCallback(
    (input: string) => {
      if (!serviceReady || !serviceRef.current || input.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      serviceRef.current.getPlacePredictions(
        { input, types: ["(cities)"] },
        (results, status) => {
          const OK = window.google?.maps?.places?.PlacesServiceStatus.OK ?? "OK";
          if (status === OK && results) {
            setSuggestions(results);
            setIsOpen(true);
          } else {
            setSuggestions([]);
            setIsOpen(false);
          }
        }
      );
    },
    [serviceReady]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val); // keep parent in sync even for free-typed values
    setHighlightedIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 280);
  };

  const handleSelect = (pred: Prediction) => {
    setInputValue(pred.description);
    onChange(pred.description);
    setSuggestions([]);
    setIsOpen(false);
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
        onFocus={() => inputValue.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
        placeholder={
          loadError
            ? "e.g. Kyoto, Japan or Brooklyn, NY"
            : serviceReady
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
          {suggestions.map((pred, idx) => (
            <li
              key={pred.place_id}
              role="option"
              aria-selected={idx === highlightedIndex}
              onMouseDown={() => handleSelect(pred)}
              onMouseEnter={() => setHighlightedIndex(idx)}
              style={{
                padding: "0.65rem 1rem",
                fontFamily: "var(--font-editorial)",
                fontSize: "var(--text-sm)",
                cursor: "pointer",
                backgroundColor:
                  idx === highlightedIndex ? "var(--color-ink)" : "transparent",
                color:
                  idx === highlightedIndex ? "var(--color-page)" : "var(--color-ink)",
                borderBottom:
                  idx < suggestions.length - 1
                    ? "var(--border-thin) solid var(--color-ink)"
                    : "none",
                transition: "background-color 0.1s ease, color 0.1s ease",
              }}
            >
              {pred.description}
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
