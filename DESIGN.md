# Editorial Design System

A visual and motion design system for **What I Saw When I Was a Kid** (The Endless Book), inspired by the calm, literary, and confident aesthetic of **pear.no**.

---

## 1. Core Principles

1. **Light Only**: Strict light-mode color canvas (`#F6F3EC`). Never adds dark mode. High contrast, warm, and natural like physical book stock.
2. **Editorial Typography**: Large, high-contrast italic serif headlines paired with quiet, neutral sans-serif body copy and small uppercase eyebrows.
3. **Generous Whitespace**: Unhurried vertical rhythm (120px to 200px on desktop) and narrow reading measures (max 560px for editorial text, 62 characters for chapter reading).
4. **Restraint Over Decoration**: Zero drop shadows, zero background blurs, zero decorative illustration vectors. Hairline borders (1px at 12% opacity) and subtle hairline dividers only.
5. **Slow, Physical Motion**: Staggered line-by-line slide reveals from behind masks, quiet button label rolls, calm reader page crossfades with 12px horizontal translation, and absolute respect for `prefers-reduced-motion`.

---

## 2. Color Palette & Tokens

| Token | CSS Variable / Tailwind | Hex Value / RGBA | Role & Application |
|---|---|---|---|
| **Canvas** | `--canvas` / `canvas` | `#F6F3EC` | Global page background, warm off-white book paper |
| **Surface** | `--surface` / `surface` | `#FFFFFF` | Dialog panels, cards, inputs, dropdown menus |
| **Ink** | `--ink` / `ink` | `#0B0A09` | Primary typography, theme color, primary pill button |
| **Muted Ink** | `--muted-ink` / `muted` | `#6B675F` | Subtitles, author bylines, reading time, secondary text |
| **Hairline** | `--hairline` / `hairline` | `rgba(11, 10, 9, 0.12)` | Subtle 1px dividers, borders, section boundaries |
| **Accent** | `--accent` / `accent` | `#E8B93C` | Golden pear yellow. Used **only** for map pins, text selection, "New" dot, diff underlines. Never large fills. |
| **Cerulean** | `--cerulean` / `cerulean` | `#5B8DB8` | Used exclusively inside the painterly artwork or as an 8% soft gradient tint. |

---

## 3. Typography Scale & Fonts

### Font Families
- **Display & Headlines**: `Instrument Serif` (`--font-serif`), italic by default. Fallback: Fraunces, Georgia.
- **Interface & Body**: `Inter` (`--font-sans`), weights 400, 500, 600.
- **Indian Regional Scripts**:
  - Tamil: `Noto Serif Tamil` (`--font-tamil`)
  - Hindi: `Noto Serif Devanagari` (`--font-devanagari`)
  - Telugu: `Noto Serif Telugu` (`--font-telugu`)
  - Malayalam: `Noto Serif Malayalam` (`--font-malayalam`)
  - Kannada: `Noto Serif Kannada` (`--font-kannada`)
  *Note*: Regional scripts are rendered in upright normal weight (non-italic) to preserve script integrity.

### Fluid Typography Scale (CSS `clamp`)
- **Hero Headline**: `clamp(4.5rem, 10vw, 10rem)` (72px to 160px), line-height `0.98`, letter-spacing `-0.03em`.
- **Section Headline**: `clamp(2.5rem, 5.5vw, 5.5rem)` (40px to 88px), line-height `1.02`, letter-spacing `-0.025em`.
- **Chapter Title (Reader)**: `clamp(2.25rem, 4vw, 4rem)` (40px to 64px), line-height `1.05`.
- **Reader Body**: `clamp(1.25rem, 1.6vw, 1.375rem)` (20px to 22px), line-height `1.8`, max measure `62ch`.
- **Eyebrows / Labels**: `12px` (`0.75rem`), uppercase, letter-spacing `0.18em`, font-semibold.

---

## 4. Layout & Spacing Rules

- **Grid**: 12-column layout, max-width `1280px`.
- **Horizontal Padding**: `24px` on mobile (`px-6`), `64px` on desktop (`px-16`).
- **Vertical Spacing**:
  - Between major sections: `120px` to `200px` on desktop (`py-28 lg:py-44`), `72px` to `96px` on mobile (`py-16 sm:py-24`).
  - Text columns: `max-w-editorial` (`560px`).
- **Borders & Radii**:
  - Borders: `1px solid var(--hairline)`.
  - Corner Radii: Softly rounded at 8px (`rounded-editorial`) or pill (`rounded-full`). No heavy rounded frames.

---

## 5. Motion & Animation (`lib/motion.ts`)

- **Headline Line Reveal**: Each text line sits inside an `overflow-hidden` container and slides up (`y: 108% -> 0%`) with GSAP `power3.out` (1.0s duration, staggered by `0.08s`).
- **Section Entrance**: Sections rise 24px and fade in as they reach 85% of the viewport via `ScrollTrigger` (played once).
- **Hero Artwork Parallax**: Slow settling scale from `1.06` to `1.0` and subtle y-parallax on scroll.
- **Button Roll on Hover**: Two duplicated labels stacked vertically in an overflow-hidden slot. Hover slides the top label up by `-100%` while the bottom label rolls into place.
- **Link Underline Draw**: Pseudo-element `transform: scaleX(0)` transitions to `scaleX(1)` from left to right on hover.
- **Reader Page Turns**: 500ms crossfade accompanied by a gentle 12px horizontal translation (direction aware).
- **Reduced Motion**: All transforms and delays are bypassed when `prefers-reduced-motion: reduce` is detected.

---

## 6. Media Architecture

- Media files are placed in `public/media/`:
  - `hero.jpg`: Fine art oil painting asset of the wheel cart at golden hour.
  - `hero-loop.mp4`: Muted, looping video slot for the hero backdrop.
  - `footer-loop.mp4`: Muted, looping video slot behind the closing footer line.
- The `VideoBackdrop` component uses an `IntersectionObserver` to automatically pause videos when off-screen to preserve CPU and battery life. If video files are not supplied, it smoothly falls back to painterly gradients and poster art.
