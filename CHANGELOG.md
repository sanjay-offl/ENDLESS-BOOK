# Changelog

## [1.1.3] - 2026-09-30

### Animated Character — Automated EPS → Pose SVG → GSAP Pipeline

The hero character is now a real, self-hosted, animated illustration. The
third-party Lottie `<iframe>` placeholder is gone.

#### Third-party embed removed

- **`components/scenes/LottieHero.tsx` deleted.** It embedded
  `https://lottie.host/embed/...` as an `<iframe>` — a third-party request on
  the critical path of the landing page, in a separate document that could not
  be styled, paused, or theme-locked from the page. Nothing references it now,
  and the home page bundle shrank from 5.7 kB to 5.39 kB. No `<iframe>` or
  `lottie.host` references remain in `apps/web/src/`.

#### Asset pipeline (new, fully scripted, no GUI required)

- **`scripts/convert-character.sh`** — converts
  `collection-ready-animation-male-character/*.eps` into
  `apps/web/public/character/character-source.svg` plus a PNG preview. Prefers
  Inkscape; **falls back automatically to `gs` + `pdftocairo`** when Inkscape is
  not installed, so the pipeline runs on a bare Ubuntu box with no `sudo`. Strips
  the EPS's baked-in opaque background `<rect>` so the character composites on
  the site canvas (`KEEP_BACKGROUND=1` disables the strip).
- **`scripts/extract-poses.py`** — splits the character sheet into 6 individual
  pose SVGs. Two strategies:
  - *Strategy A* (group clustering) for layered Illustrator SVGs, which keep
    their `<g>` groups.
  - *Strategy B* (geometric figure detection) for the flat SVG that the
    `gs`/`pdftocairo` fallback produces: rasterize, union-find 8-connected
    component labelling, filter to figure-sized components, order into a
    reading-order grid, then attribute each of the 714 source paths to a
    component by rendering it in isolation and matching ink. Props and detached
    head/body parts are excluded by the height filter.
- **`scripts/optimise-poses.sh`** — svgo pass with a per-file savings table and
  a hard assertion that every output keeps its `viewBox`.
- **`scripts/verify-poses.py`** — CI-style checks: frame consistency, foot
  baseline consistency, clipping, and pose distinctness (max IoU 76.1%).
- **`scripts/svgo.config.mjs`**, **`scripts/svgo.poses.config.mjs`** — two ESM
  svgo configs. Conservative for the source sheet, aggressive for the poses.
- Emits `apps/web/public/character/poses/manifest.json` and
  `apps/web/src/components/ui/character-poses.generated.ts` (typed geometry
  constants: `HAS_SEPARATE_POSES`, `POSE_FILES`, `SHEET_VIEW_BOX`,
  `POSE_VIEW_BOX`, `SPRITE_FOCUS_POSE`).

Result: 1.3 MB EPS → 240 KB source → 6 poses of **7.5–8.3 KB each (46 KB
total)**, a 105 KB `pose-full.svg`, and a 56% svgo saving (345 KB → 151 KB across
all seven files).

#### Frontend

- **`components/ui/CharacterAnimation.tsx`** (new) — one component, three
  render modes, runtime-selected with no rebuild:
  - `poses` — 6 independent SVG files cross-faded with GSAP
  - `sprite` — single sprite sheet with a GSAP `x` transform window
  - `none` — static image
  Component API is identical in all three modes. Six states: `idle`, `wave`,
  `thinking`, `celebrating`, `encouraging`, `walk`.
- **`hooks/usePrefersReducedMotion.ts`**, **`hooks/useMounted.ts`** (new).
  `prefers-reduced-motion` disables all animation and shows the static pose.
- **`components/ui/VideoBackdrop.tsx`** — rewritten. `src`/`poster` prop names
  (the old `videoSrc`/`posterSrc` are still accepted). A memoised module-scope
  `HEAD` probe checks the media file before playing, so a missing asset
  degrades to a gradient or the poster instead of a 404. Playback pauses via
  `IntersectionObserver` when off-screen.
- **`app/write/page.tsx`** — two-column layout with a sticky character that
  tracks the form's progress: `thinking` while the Page Weaver runs,
  `encouraging` on the review step, `walk` while a field is focused on the
  pages step, `celebrating` on submit, `idle` otherwise. `onFieldFocus` /
  `onFieldBlur` are attached to all three fields. A new `isSubmitted` state
  replaces the previous immediate navigation so the celebrating pose is
  actually visible before the 1.2s redirect to `/me`.
- **`app/page.tsx`** — the hero now renders the self-hosted character, playing
  `wave` on arrival and settling to `idle` after 3.2s. A second instance sits
  in "The Book" holding `idle`. Added an offline banner driven by the `/health`
  probe.

#### Fixes

- **API connection (`ERR_CONNECTION_REFUSED`)** — the client base URL is now
  read from `NEXT_PUBLIC_API_URL` instead of a hardcoded host, and
  `apps/web/src/app/layout.tsx` sets `suppressHydrationWarning` on `<html>` and
  `<body>`.
- **404 video** — `VideoBackdrop` now probes the source with `HEAD` and falls
  back to the poster or a gradient, so `public/media/` being empty no longer
  produces a broken request.
- **Hydration mismatch** — resolved by the `suppressHydrationWarning` change
  plus mount-gating the reduced-motion probe.
- **CORS** — kept on the existing pydantic-settings architecture, widened the
  default to ports 3000/3001/3002 and read `CORS_ORIGINS` as a direct override.
- **Pre-existing backend blockers fixed**:
  - missing `MagicMock` import in `tests/test_agents.py`
  - added `tests/conftest.py` with an in-memory fake Firestore that **fails
    loudly if any real GCP client is constructed**, so the suite is hermetic
  - `[tool.hatch.build.targets.wheel] packages = ["app"]` in `apps/api/pyproject.toml`
  - PEP 735 `[dependency-groups] dev` so plain `uv run pytest` works
  - Pydantic `ConfigDict` migration
- `/v1/chapters` still returns 500 on a machine with no Google ADC
  (`DefaultCredentialsError`). This is an environment issue, not a code
  defect — the route is correctly mounted at `/v1/chapters` and the test suite
  passes against the fake Firestore.

#### Tooling

- `npm run tools:setup` — creates `.venv-tools` (lxml, cairosvg, svgwrite,
  numpy, pillow) with no `sudo`.
- `npm run character` — runs the full pipeline (convert → optimise → extract →
  verify). `svgo` is a devDependency; `lottie-react` is installed and available.

#### Documentation

- `DECISIONS.md` §17 (GSAP pose SVGs over Lottie) and §18 (scripted lxml /
  geometric detection over a GUI tool).
- `docs/ANIMATION.md` and `SETUP.md` document the real, runnable pipeline,
  including the no-`sudo` `gs` + `pdftocairo` backend.

#### Gate

`tsc --noEmit` clean · `npm run lint` clean · `npm run build` success (10 routes)
· `pytest tests/ -v` **10 passed** · `verify-poses.py` **6/6 ok**

## [1.1.0] - 2026-09-30

### Editorial Redesign (pear.no Aesthetic)

#### Frontend
- **Design System Overhaul**: Retired glassmorphism (frosted cards, blurs, glow shadows), paper grain noise overlay, and dusk/marigold palette in favor of a calm, warm off-white canvas (`#F6F3EC`), deep ink (`#0B0A09`), muted text (`#6B675F`), hairline borders, and single golden pear accent (`#E8B93C`).
- **Typography**: Integrated `Instrument Serif` (regular & italic) for display headlines, `Inter` for interface and body copy, and `Noto Serif` regional fonts for Tamil, Devanagari, Telugu, Malayalam, and Kannada with automatic script-aware upright weight switching.
- **New Editorial UI Component Set (`components/ui`)**:
  - `Button`: Primary near-black pill with double-label vertical roll on hover, secondary text link with arrow.
  - `TextLink`: Underlined italic text link with animated draw-on-hover.
  - `NavBar`: Slim fixed top bar that transitions from transparent to solid off-white with hairline border on scroll (no blur).
  - `Footer`: Large italic sign-off ("The book never ends."), small caps legal line, contact link, and looping video backdrop slot.
  - `Section`: 1280px max-width, generous vertical spacing (120-200px desktop), and ScrollTrigger entrance.
  - `Eyebrow`: 12px uppercase tracking-wide labels.
  - `DisplayHeading`: Large italic headlines with line-masked slide-up reveal.
  - `Figure`: Oversized italic numeral anchor ("3") with explanatory story measure.
  - `ChapterRow`: Editorial chapter item with hairline top border, no boxes.
  - `FAQ`: "Asked before" accordion with plain question-and-answer pairs, plus/minus indicator, and hairline dividers.
  - `Field` & `TextArea`: Underline inputs with no boxes or cards.
  - `Modal`: Clean white surface with hairline border, no background blur.
  - `Toast`: Hairline status notifications with accent dot.
  - `VideoBackdrop`: Media backdrop with IntersectionObserver auto-pause when off-screen and painterly poster fallback.
  - `PageTransition`: Route transition with ScrollTrigger cleanup.
- **Page Rewrites**:
  - Home: Hero with painterly golden hour backdrop, The Book statements, Figure 3, ChapterRow listing, Chapter One feature block, Full Disclosure block, Asked Before FAQ, and Footer.
  - Book (`/book`): Clean 2-column editorial list with plain italic text filter toggles (Newest, Featured, By place).
  - Reader (`/book/[chapterId]`): Calm reading room, 62ch line length, Indian Noto font switching, underline dropdown, and crossfade page slide.
  - Write (`/write`): One question per screen, thin underline inputs, round outlined recording button with accent dot, and 2-column diff modal.
  - Map (`/map`): Full-bleed desaturated map, ink dot pins with accent ring, floating italic title, and white preview card.
  - About (`/about`): Narrow-column origin story with painterly artwork, large italic pull quotes, and founder sign-off.
  - Founder & Me Dashboards: Quiet plain tables with hairline row dividers, small caps headers, and minimal status dots.
- **Motion System (`lib/motion.ts`)**: Line reveals, ScrollTrigger section rises, slow hero parallax, reader page transitions, and complete `prefers-reduced-motion` compliance.
- **Media Architecture (`public/media`)**: Slots for `hero.jpg`, `hero-loop.mp4`, and `footer-loop.mp4`.

## [1.0.0] - 2026-09-29

### Initial Release

#### Frontend
- Landing page with animated SVG hero scene (street at dusk, wheel cart, mother and child)
- Floating memory objects (bangles, kite, toy train, marble, paper boat, pencil)
- Glassmorphism design system (GlassCard, GlassButton, GlassInput, GlassModal, GlassNav)
- Book index page with chapter cards
- Chapter reader with page-turn animation, keyboard navigation, language switcher
- Write flow with 5-step guided process (title, pages, place, icon, review)
- Voice recording with Speech-to-Text integration
- AI Page Weaver with side-by-side diff and accept/reject
- Memory Map with MapLibre GL JS and glowing pins
- My Chapters page with edit and delete
- Founder dashboard with moderation queue, analytics, and chapter management
- About page
- GSAP animations: parallax, page turns, floating objects, scroll triggers
- Reduced motion support
- Responsive design (360px, 768px, 1440px)

#### Backend
- FastAPI with async endpoints
- Firebase Authentication with custom claims (founder role)
- Firestore CRUD with transactions for chapter numbering
- Speech-to-Text with multi-language support (English, Tamil, Hindi, Telugu, Malayalam, Kannada)
- Translation with Firestore caching
- AI Page Weaver agent (Google ADK + Gemini)
- AI Moderator agent (Google ADK + Gemini)
- Pub/Sub async moderation pipeline
- BigQuery analytics event streaming
- Vector search for similar chapters
- Signed URL uploads for Cloud Storage
- Structured JSON logging with request IDs
- Health and readiness endpoints
- Rate limiting and CORS

#### Infrastructure
- Multi-stage Dockerfiles (web + api)
- Cloud Build pipeline with tests, lint, type check, build, deploy
- Firestore security rules
- Firestore composite indexes
- Pub/Sub topic and push subscription
- Non-root container users

#### Documentation
- README with quick start
- SETUP.md with complete gcloud commands
- COSTS.md with free tier design
- DECISIONS.md with architecture rationale
- .env.example with all required variables
- Seed script with chapter one and 3 sample chapters
- Unit tests for API routers and agents
- Moderation flow tests
