# Architecture Decisions

This document records the key decisions made while building "What I Saw When I Was a Kid".

## 1. Why exactly 3 pages per chapter?

**Decision**: Every chapter is exactly 3 pages.

**Rationale**: 
- Short enough to read in one sitting (2-3 minutes)
- Long enough to tell a complete memory
- Creates a consistent rhythm across the book
- Makes the page-turning reader feel meaningful

## 2. Why MapLibre over Google Maps?

**Decision**: Use MapLibre GL JS with free OpenStreetMap tiles.

**Rationale**:
- No Google Maps billing (saves $200/month at scale)
- Same developer experience (MapLibre is a fork of Mapbox GL)
- Can switch to Google Maps via env flag if needed
- Free tiles from OpenFreeMap

## 3. Why Firestore over Cloud SQL?

**Decision**: Use Firestore as the primary database.

**Rationale**:
- Real-time listeners for live updates
- Free tier is generous for small community
- Native vector search support
- No server management
- Scales automatically

## 4. Why Pub/Sub for moderation?

**Decision**: Async moderation via Pub/Sub push.

**Rationale**:
- User doesn't wait for moderation
- Queue prevents API overload
- Retry logic built in
- Can add multiple moderators later
- Decouples moderation from chapter creation

## 5. Why Gemini over other LLMs?

**Decision**: Use Gemini for both Page Weaver and Moderator.

**Rationale**:
- Google GenAI SDK is well-maintained
- Free tier is generous (1,500 requests/day)
- Good multilingual support (important for Indian languages)
- Native JSON response mode for structured output
- Same provider as embeddings

## 6. Why Firebase Auth over custom auth?

**Decision**: Use Firebase Authentication with Google Sign-In.

**Rationale**:
- No password management
- Google Sign-In is familiar to users
- Custom claims for role-based access (founder vs member)
- Free tier is generous
- Works with Firestore security rules

## 7. Why client-side image resize?

**Decision**: Resize images on the client before upload.

**Rationale**:
- Reduces storage costs
- Reduces bandwidth costs
- Faster uploads on slow connections
- Better user experience

## 8. Why translation caching?

**Decision**: Cache translations in Firestore per chapter per language.

**Rationale**:
- Same text never translated twice
- Reduces Translation API costs
- Faster page loads for returning visitors
- Translations are immutable once created

## 9. Why GSAP over Framer Motion?

**Decision**: Use GSAP for all animations.

**Rationale**:
- More control over complex animations (DrawSVG, MorphSVG, MotionPath)
- Better performance (transform/opacity only)
- ScrollTrigger for scroll-based animations
- Industry standard for award-winning sites
- All plugins needed are included

## 10. Why Next.js App Router over Pages Router?

**Decision**: Use Next.js 15 App Router.

**Rationale**:
- Server components for better performance
- Streaming SSR
- Better caching
- Future-proof (App Router is the recommended approach)

## 11. Why Firestore Vector Search over Vertex AI Vector Search?

**Decision**: Use Firestore Vector Search with Vertex AI as documented upgrade path.

**Rationale**:
- Simpler setup (no separate index management)
- Included in Firestore free tier for small datasets
- Good enough for <10K chapters
- Can migrate to Vertex AI Vector Search later

## 12. Why BigQuery over Firestore for analytics?

**Decision**: Stream events directly to BigQuery.

**Rationale**:
- Firestore is not designed for analytics queries
- BigQuery sandbox is free
- SQL queries for founder dashboard
- No impact on Firestore performance
- Can export to Data Studio later

## 13. Why no GitHub Actions?

**Decision**: Use Cloud Build triggers instead of GitHub Actions.

**Rationale**:
- Cloud Build is already part of the deployment pipeline
- No need to manage GitHub secrets
- Native integration with Artifact Registry and Cloud Run
- Free tier: 120 build minutes/day

## 14. Why rounded locations only?

**Decision**: Store only city/locality level locations, never exact addresses.

**Rationale**:
- Privacy protection for authors
- Moderator flags exact addresses
- Map pins are approximate anyway
- Reduces liability

## 15. Why consent checkbox before publishing?

**Decision**: Require explicit consent before publishing.

**Rationale**:
- Legal protection
- Authors understand their work is public
- Can be used as evidence of consent
- Ethical responsibility

## 16. Why an editorial aesthetic (pear.no) over glassmorphism?

**Decision**: Adopt a calm, light-only, editorial design system driven by large italic serif headlines and generous whitespace, retiring glassmorphism and vector illustrations.

**Rationale**:
- **Literary Integrity**: An endless book of memories is inherently literary. High-contrast typography (`Instrument Serif` + `Inter`) and paper-like contrast honour the written word better than app-like glowing glass cards.
- **Atmosphere & Calm**: Nostalgia is reflective. Generous vertical breathing room (120-200px) and a quiet warm off-white canvas (`#F6F3EC`) create a contemplative reading room rather than a busy dashboard.
- **Multilingual Dignity**: Regional Indian languages (Tamil, Devanagari, Telugu, Malayalam, Kannada) look dignified in dedicated Noto Serif typography with script-appropriate upright weighting.
- **Performance & Simplicity**: Removing heavy CSS backdrop filters, procedural noise shaders, and SVG vector physics significantly reduces composite times and battery drain, keeping mobile Lighthouse scores above 90.

## 17. Why GSAP pose SVGs over Lottie?

**Decision**: Drive the character with **GSAP timelines over a set of six
pre-rendered pose SVGs**, and keep the original frame-by-frame Lottie/Bodymovin
route documented in `docs/ANIMATION.md` as an optional upgrade rather than
implementing it.

**Context**: The brief called for GSAP specifically, and the source asset is a
six-pose EPS *character sheet* — six already-drawn key poses, not a rig.

**Rationale**:
- **The asset is already pose-based.** A sheet of six drawn poses needs
  cross-fade and transform, not rigging. Lottie earns its complexity when you
  have interpolation to express; here there is nothing to interpolate that the
  six poses do not already state.
- **~8 KB instead of ~200 KB+.** Each pose SVG is 7.5–8.3 KB (47 KB for all
  six), against a 200 KB budget for a Lottie JSON of the same character. Lottie
  embeds a full keyframe graph per property; a pose is a handful of paths.
- **Styleable.** The SVGs inherit `currentColor` and page tokens, so the
  character follows the editorial palette (`--canvas: #F6F3EC`,
  `--accent: #E8B93C`) with no re-export per theme.
- **No third-party runtime on the critical path.** `gsap` is already a
  dependency for the rest of the site; `lottie-web` would be a second animation
  runtime for a decorative element.
- **Accessible by default.** A single decorative `<img>`/`svg` is
  `aria-hidden` and `pointer-events-none`; the pose state is just a string.
- **Both implementations still exist.** `CharacterAnimation.tsx` has a
  `sprite` mode (one sheet, animated with a GSAP `x` window) beside the
  `poses` mode, and selects at runtime. The component API is identical either
  way, so if a rig and a Bodymovin export are ever produced, dropping the JSON
  in is a mode change, not a rewrite.
- `lottie-react` is installed and available; it is simply not on the hot path.

**Trade-off accepted**: no true skeletal animation. The character transitions
between drawn poses with GSAP easing rather than interpolating limb joints. For a
decorative hero that reacts to user focus, this is invisible.

## 18. Why a scripted lxml + geometric-detection extractor over a visual tool?

**Decision**: Write `scripts/extract-poses.py` — an lxml/CSS-selector +
rasterisation + connected-component-labeling pipeline — instead of
extrapolating poses by hand in Inkscape or Illustrator, and run it in CI as
`verify-poses.py`.

**Rationale**:
- **Reproducible and re-runnable.** The next character sheet is a single
  `npm run character` away. Manual cropping is a one-time, error-prone,
  undocumented step that nobody can repeat.
- **Works without Inkscape.** `sudo apt-get` is not available on this machine,
  so `convert-character.sh` falls back to `gs` (EPS → PDF) plus
  `pdftocairo -svg` (PDF → SVG). That produces a **flat** SVG: 714 paths and
  zero `<g>` layers, because the Ghostscript round trip resolves the Illustrator
  group structure. The original group-clustering strategy therefore has nothing
  to cluster, so the extractor detects figures *geometrically* instead.
- **Geometry, not names.** Even with layers intact, EPS → SVG does not preserve
  Illustrator layer names, so "which group is the wave?" is not recoverable from
  the file. Component detection recovers *where* the figures are; naming is then
  applied positionally in reading order and recorded in `manifest.json` with a
  `--names` flag for remapping.
- **Automatically correct framing.** All six poses are emitted into one shared
  frame with one foot baseline (150.06 × 256.36 user units, feet 22.5–22.9 units
  from the bottom). This is not achievable by eye: an early version of the
  script used the raster pixel height as a user-unit value *and* applied
  footroom on the wrong side, which clipped every figure's feet. The invariant
  is now asserted in `verify-poses.py`.
- **Provably distinct.** `verify-poses.py` fails if any two poses are too
  similar, too differently framed, or clipped (max IoU 76.1%).
- **svgo v4 is stricter than the original brief assumed.** It rejects inline
  JSON on `--config` and loads config via dynamic `import()`, so `.json` configs
  fail with `ERR_IMPORT_ATTRIBUTE_MISSING`; `removeViewBox` also left
  `preset-default` and can no longer be used as an override. Hence two `.mjs`
  configs. The scripts are the source of truth, not the flag list in the brief.


