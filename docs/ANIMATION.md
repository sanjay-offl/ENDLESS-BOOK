# Animation Pipeline

How the hero character gets from the source artwork in
`collection-ready-animation-male-character/` to a Lottie JSON served by the web app.

This is a manual, desktop-only pipeline. Everything in this document happens in
After Effects on your machine. Nothing here runs in CI, and no After Effects files
are committed to the repo.

> **This document describes the optional upgrade path, not what is running
> today.** The character currently in the app is built by a fully scripted
> **EPS → pose SVG → GSAP** pipeline that needs no GUI, no After Effects, and no
> `sudo`. It is documented in
> [Automated pipeline — what is actually implemented](#automated-pipeline--what-is-actually-implemented)
> at the end of this file, and is the reason `CharacterAnimation.tsx` has a
> `poses` render mode. Read that section first; read the rest only if you
> decide you want skeletal animation and are willing to rig and hand off to
> Bodymovin.

## Why this exists

> **Resolved.** `LottieHero.tsx` used to embed a **third-party Lottie from
> lottie.host** as an `<iframe>`, which added a third-party runtime request on
> the critical path of the landing page, rendered in a separate document that
> could not be styled, paused, or theme-locked from the surrounding page, and
> could not match the editorial design system (see `DECISIONS.md` §16, and the
> palette tokens in `apps/web/src/styles/globals.css`). That component has been
> **deleted**; the hero now renders the self-hosted
> [`CharacterAnimation`](#the-react-component) instead. The rest of this
> document is what you would follow *if* you later want to upgrade to true
> skeletal animation.

## Required software

- Adobe After Effects 2022 or newer
- [Bodymovin](https://aescripts.com/bodymovin/) (free) — AE-to-Lottie exporter
- [ZXP Installer](https://aescripts.com/zxp-installer/) (free) — installs the `.zxp`
- Optional but recommended: [Duik](https://rainboxlab.org/tools/duik) (free) — rigging

Duik is only a rigging convenience. If you would rather build controllers by hand
on the layer transform levels, you can skip it. Everything below works without it.

## 1. Install the plugins

### Bodymovin

1. Download the `.zxp` from [aescripts.com/bodymovin](https://aescripts.com/bodymovin/).
2. Open ZXP Installer and drag the `.zxp` onto it.
3. Restart After Effects completely.
4. Confirm: **Window > Extensions > Bodymovin**.

### Duik

1. Download from [rainboxlab.org/tools/duik](https://rainboxlab.org/tools/duik).
2. Install the `.zxp` with ZXP Installer, the same way.
3. Confirm: **Window > Extensions > Duik Bassel**.

> macOS: if ZXP Installer is blocked, right-click it and choose **Open** on first
> launch. ZXP files are not signed.
>
> Plugins install into your user plugin folder, not this repo, so there is nothing to
> commit and nothing to undo if you uninstall them.

## 2. Prepare the artwork

Source files, all from `collection-ready-animation-male-character/`:

| File | Role |
|---|---|
| `5505145.eps` | Primary vector source. Import this one. |
| `5505147.ai` | Illustrator working file, useful for layer surgery before import. |
| `5505133.jpg` | Raster reference / colour reference only. Do not animate from it. |

In After Effects:

1. **File > Import > File…** and select `5505145.eps`.
2. In the Import dialog set **Footage Matte** to *Alpha Matte* so the transparent
   background survives the import.
3. Add the `.eps` to a new **1920 x 1080** composition at **60 fps**.
4. Keep the art on a single layer to start. You will separate parts in the next
   step, and separating them while the file is still a flat import is much easier
   than trying to cut it apart after rigging.

### Separating the parts

A puppet rig needs the moving pieces to be independent: head, torso, both arms
(upper/fore/hand), both legs, and hair if it swings.

1. Open the `.eps` in Illustrator and check **Layers** — if the art came in with
   named sub-layers, import each one separately and keep the naming. It will save
   you a lot of guessing.
2. If it is a single flat path, use the **Object Selection Tool** to click each
   region and note its approximate bounds before separating.
3. Back in AE, use `Layer > Masks and Shapes` to cut the parts apart, or re-import
   as separate files. One layer per riggable part.
4. Rename layers by what they are (`head`, `arm_l_upper`, `arm_l_fore`,
   `arm_l_hand`, `leg_l_upper`, and so on). Renaming here makes step 4 painless.

## 3. Rig the character

> **Read this before you rig.** Duik's IK controllers are driven by **expressions**
> on null objects. **Bodymovin does not export expressions** — it drops them
> silently, and the render comes out as a rig locked in T-pose. If you skip the
> bake in step 3.4, you will not find out until the JSON is in the browser.
>
> Two ways out. **Baking with Duik** converts your current pose to real keyframes on
> the layers and strips the expressions, but you get keyframes for the pose you
> happened to be in, not a reusable rig. **Keyframing the layers directly** skips
> Duik's IK entirely and is the better fit: Lottie is a baked vector format, so a
> "rig" is a parented hierarchy of nulls with ordinary rotation keyframes. Duik's
> controls, joint limits, and FK/IK switching solve a problem Lottie cannot
> represent.
>
> Recommendation: **use Duik only for the Structure** (parenting the parts, setting
> pivots), and animate with plain rotation keyframes on the layers. This is the
> only approach that survives export without a conversion step.

### 3.1 Set the pivots first

Pivot (anchor) placement has to happen **before** any parenting, or the joints land
in the wrong place and you redo it. With the Pan Behind tool (`Y`), set each
anchor:

| Joint | Position |
|---|---|
| Neck | base of the head, where it meets the torso |
| Shoulder | top of the upper arm layer |
| Elbow | mid upper-arm, where the forearm begins |
| Wrist | end of the forearm, at the hand |
| Hip | top of the leg layer |
| Knee | mid leg, at the bend |
| Ankle | bottom of the leg |

Joints that should rotate when the body moves: neck, shoulder, hip. Elbow and
knee only matter if you animate them directly.

### 3.2 Build the hierarchy

Parent the parts with **Layer > Set Parent (`Ctrl+Shift+[`)** so the chain runs
root to leaf:

```
ctrl_root            (null, whole character)
└── ctrl_body
    ├── torso
    │   ├── head
    │   ├── arm_l_upper → arm_l_fore → arm_l_hand
    │   └── arm_r_upper → arm_r_fore → arm_r_hand
    ├── leg_l_upper → leg_l_fore → leg_l_foot
    └── leg_r_upper → leg_r_fore → leg_r_foot
```

`ctrl_root` is the important one. A single position keyframe on it moves the entire
character, which is how you place her in the composition once and forget about it.

Name your nulls. `ctrl_root` beats `Null 17` when you reopen the file in six
months.

### 3.3 (Optional) Duik Structure panel

If you want Duik's Structure tools for the parenting above, open
**Window > Extensions > Duik Bassel** and use its Structure panel. Auto-rig
features are Duik Pro and not in the free Duik Bassel; the free panel covers
layer structure and null parenting only. **Pose with the controllers only if you
plan to bake in 3.4.** Otherwise keyframe the layers.

### 3.4 Bake (only if you used Duik IK)

If you created IK chains, you **must** convert before export:

- Duik's **IK-to-FK** conversion bakes the current pose to keyframes on the real
  layers and removes the expressions.
- Check the result: open any null, and its `Rotation`/`Position` properties must
  show keyframes rather than an expression. **Any remaining `expression` property
  means it will be dropped on export.**
- Simplest verification is to export and open the JSON in a browser before doing
  any more work.

### 3.5 Pre-compose to `Character_Rig`

Select all the body part layers, then **Composition > Pre-compose** and name it
`Character_Rig`. This is the master composition from the plan: one rigged
character, animated once, reused by every state.

Bodymovin flattens pre-comps into the JSON, so this structure is safe to export.

## 4. Nest per-state timeline compositions

Create one composition per animation state, each containing `Character_Rig` as a
single nested layer:

```
Character_Rig          (the master, rigged and animated)
├── Idle               (Character_Rig nested, idle loop)
├── Wave               (Character_Rig nested, greeting)
└── Read               (Character_Rig nested, reading)
```

In each state comp:

1. Create the comp with the **same dimensions and frame rate** as `Character_Rig`.
   Mismatched frame rate is the single most common cause of wrongly-paced
   playback.
2. Drag `Character_Rig` in. Adjust its position per state if needed.
3. Animate on the nested layer, or enter the comp to adjust the pose.

**You still have to render and export each state comp separately.** Bodymovin
renders one composition at a time, and each render produces its own JSON:

```
hero-idle.json
hero-wave.json
hero-read.json
```

## 5. Animate the loop

Target a **seamless loop** of **3–6 seconds**. It plays continuously next to the
headline, so:

- Ease in and out of the extremes. Linear motion is the fastest way to make a
  character look mechanical.
- Keep the amplitude small. A quiet idle (breathing, a slight weight shift, hair
  settling) suits the calm editorial tone better than a big gesture.
- Make the first and last frame identical. Bodymovin will loop, but only seamlessly
  if the pose matches. Leave a one-frame hold at each end rather than a hard cut.
- The final pose must not change the character's position in the composition. Any
  drift accumulates over a loop and is very visible on a page that also has a
  fixed hero image.

## 6. Export with Bodymovin

**Window > Extensions > Bodymovin**, then **Render**. Export each state comp
separately, switching the active comp between renders.

| Setting | Value | Why |
|---|---|---|
| Format | `json` | The app renders with `lottie-web`, not SVG or canvas export. |
| Assets folder | `assets/` | Only needed if the rig uses raster assets. Shape layers need none. |
| File name | Match the state, e.g. `hero-idle` | One JSON per state comp. |
| Quality | Best | Vector art, so size cost is low. |
| Frame rate | **Match the composition**, default 60 | Must match, or playback speed is wrong. |
| Looping | Yes | Set it in the JSON, do not only loop it in JS. |
| Expressions | None | Bodymovin ignores expressions entirely. See the warning in step 3. |
| Save as `lottie` (dotLottie) | Off | `dotlottie` is a zipped container. The app wants plain JSON. |

You want the output as flat as possible: a pure shape-layer rig should export to a
single JSON per state, with no assets folder at all.

Keep the files small. Aim for well under 200 KB **each**, and under 400 KB for the
whole set. Check sizes before committing; hero animations load on the landing page,
so a couple of megabytes is a real cost to every visitor. If a file is large, the
usual culprits are unneeded raster layers, excessive keyframes, and null
controllers left in the comp that export as visible nodes.

> With per-state exports, do not preload them all. The hero plays one state; the
> others load on demand. Three idle files in one bundle is a lot of JSON for
> something most visitors never see.

## 7. Where the exports go

Copy the exports into the web app:

```
apps/web/public/media/hero-idle.json
apps/web/public/media/hero-wave.json
apps/web/public/media/hero-read.json
apps/web/public/media/assets/        # only if Bodymovin produced one
```

`public/` is served as-is, so the URL is `/media/hero-idle.json`. The existing
`apps/web/public/media/README.md` documents the other media in this folder; add
the animations there when you commit them.

**Do not commit the After Effects project** (`.aep`, `.aepx`) or the intermediate
`.ai`/`.eps` working files. They are large, binary, and vendor-specific. The
exported JSON is the source of truth for the web app. Keep the `.aep` in local
backup.

## 8. Wiring the exports into the app

This part is a code change, and it is the last step. The current component is an
iframe wrapper around a remote URL; a self-hosted JSON needs a real Lottie
renderer.

Install the player:

```bash
cd apps/web && npm install lottie-web
```

`LottieHero.tsx` no longer exists, so there is no call site to preserve — the
hero renders `CharacterAnimation` directly. If you go ahead with a Lottie
upgrade, add a `lottie` render mode to `CharacterAnimation.tsx` and leave the
existing `poses` / `sprite` / `none` modes alone; the component API does not
have to change. Points that still matter:

1. Take a `state` prop (`"idle" | "wave" | "read"`), defaulting to `"idle"`, and map
   it to `/media/hero-${state}.json`.
2. Fetch the JSON at runtime rather than importing it. Keeps the bundle small and
   lets you swap a state file without a rebuild.
3. Instantiate with `renderer: "svg"`. SVGs match the vector source art and stay
   crisp at the `max-w-[460px]` size the hero uses. The `canvas` renderer is
   faster for complex files but rasterises, and `html` only handles a small subset
   of shape features.
4. **Destroy the old instance before creating the new one** when `state` changes,
   or you leak a running `requestAnimationFrame` loop per switch. The effect return
   handles this if you return `anim.destroy()`.
5. Loop it, and match the existing easing so the transition does not
   change when you swap the renderer.
6. Keep `pointer-events-none` and `aria-hidden="true"`. For a decorative hero it
   should stay hidden from assistive tech.

One design note: the character should sit on the paper canvas
(`--canvas: #F6F3EC`), so export with a transparent background and let the page
show through. If the rig has a baked-in background layer, remove it in AE rather
than fighting it with blend modes in CSS.

## Checklist before committing

- [ ] Every state JSON is in `apps/web/public/media/`
- [ ] Under 200 KB each
- [ ] No `.aep`, `.ai`, or `.eps` in the commit
- [ ] Loops are seamless: first and last frames match
- [ ] Transparent background
- [ ] No raster assets, or `assets/` is committed alongside
- [ ] No `expression` properties left in any rig null
- [ ] Opened each JSON in a browser and confirmed it actually animates
- [x] The third-party iframe is gone (`LottieHero.tsx` deleted) — already done
- [ ] Animation instance is destroyed on unmount and on state change
- [ ] Checked on a real phone, not just desktop
- [ ] Lines added to `apps/web/public/media/README.md`

## References

- [Bodymovin](https://aescripts.com/bodymovin/) — exporter docs
- [ZXP Installer](https://aescripts.com/zxp-installer/)
- [Duik](https://rainboxlab.org/tools/duik) — rigging
- [lottie-web](https://github.com/airbnb/lottie-web) — the browser player
- [LottieFiles format reference](https://lottiefiles.github.io/lottie-docs/) — if an export looks wrong in the browser, this explains which features are supported

---

# Automated pipeline — what is actually implemented

Everything below runs from the command line, is deterministic, and is safe to
re-run. See `DECISIONS.md` §17 and §18 for why it exists.

## One command

```bash
npm run tools:setup   # once: creates .venv-tools/ (lxml, cairosvg, svgwrite, numpy, pillow)
npm run character     # convert -> extract -> optimise -> verify
```

Order matters — `optimise` rewrites the pose files, so it must run *after*
`extract` has produced them. `optimise-poses.sh` aborts with a clear message if
the poses directory is empty.

`npm run tools:setup` deliberately uses `python3 -m venv` and `pip` **inside
`.venv-tools/`** so nothing needs `sudo`. The venv is gitignored.

## Requirements

| Tool | Needed for | If missing |
| --- | --- | --- |
| `gs` (Ghostscript) + `pdftocairo` (poppler-utils) | EPS → SVG fallback | required — without a converter the pipeline cannot start |
| Inkscape | EPS → SVG, preferred | optional; the script detects and skips it |
| `svgo` (npm devDependency) | optimisation | required for the optimise step |
| Python ≥3.10 + `.venv-tools` | extraction & verification | see `npm run tools:setup` |

The pipeline itself never needs `sudo` — the Python venv, `svgo`, and the
scripts all live inside the repo. Only the two system converters may need it,
and only if they are not already present:

```bash
sudo apt-get install -y ghostscript poppler-utils
# optional, and improves the output:
sudo apt-get install -y inkscape
```

Inkscape is a preference, not a requirement, because it preserves the Illustrator
layer structure — which is what makes the extractor's Strategy A (group
clustering) usable. Without it the `gs` fallback runs and the extractor uses
Strategy B instead. See below.

## Stage 1 — `scripts/convert-character.sh`

```bash
npm run character:convert
```

1. Prefers `inkscape` (EPS → SVG directly).
2. **Falls back to `gs -dEPSCrop` → `pdftocairo -svg`** when Inkscape is absent.
3. Strips the EPS's baked-in opaque background `<rect>` so the character
   composites on `--canvas` instead of showing a grey box. Set
   `KEEP_BACKGROUND=1` to keep it.
4. Runs one conservative svgo pass.

Output:

- `apps/web/public/character/character-source.svg` (1.3 MB `5505145.eps` → **240 KB**)
- `apps/web/public/character/character-preview.png` (129 KB, for eyeballing the sheet)

> **The fallback produces a flat SVG.** The Ghostscript round trip resolves
> Illustrator groups, so the output is 714 flat paths with **zero `<g>` layers**.
> Layer names are not preserved by EPS → SVG in any case. This is the reason the
> extractor needs Strategy B.

## Stage 2 — `scripts/extract-poses.py`

```bash
npm run character:extract
# optional: remap names positionally
.venv-tools/bin/python scripts/extract-poses.py --names idle,wave,thinking,celebrating,encouraging,walk
```

**Strategy A — group clustering** (used when the SVG is layered):

- Greedily assign unassigned paths to a group until the group looks like a
  complete figure.
- Crop each group, normalise its frame, emit.

**Strategy B — geometric figure detection** (used for the flat fallback SVG):

1. Rasterise the sheet and run 8-connected union-find component labelling.
2. Keep only **figure-sized** components: area ≥ 15% of the largest component
   **and** height ≥ 30% of the sheet height. This drops props, floating
   particles, and detached head/body fragments.
3. Order the survivors into rows and columns (reading order). The current sheet
   yields 7 figure-sized components in a 2-row grid (3 top, 4 bottom, the last
   being a merged blob) out of 53 components total.
4. **Attribute paths to figures** by rendering each of the 714 paths in
   isolation and matching its ink against the component label map. This is
   exact: a single path cannot bridge two separate components.
5. Crop, reframe, and emit.

**Canonical framing** — the part that is easy to get wrong and impossible to
eyeball. All six poses share one frame and one foot baseline:

```
frame:      150.06 × 256.36 user units
feet sit:   22.5–22.9 units above the frame bottom
```

An early iteration used the *raster pixel* height as a *user-unit* value **and**
applied footroom on the wrong side, which clipped every figure's feet. That class
of bug can no longer ship because `verify-poses.py` asserts the baseline.

**Pose names are positional.** Since the source is a numbered sheet and layer
names do not survive conversion, the six figures are named in reading order:
`idle`, `wave`, `thinking` (top row) then `celebrating`, `encouraging`, `walk`
(bottom row). This is recorded in `manifest.json` under `notes` and can be
overridden with `--names`. **Confirm the names against the preview PNG before
relying on them** — the silhouette of the second figure does show a raised arm
consistent with a wave, but the rest are inferred from position only.

Outputs:

- `apps/web/public/character/poses/<pose>.svg` × 6
- `apps/web/public/character/poses/pose-full.svg` (105 KB, for the `sprite` mode)
- `apps/web/public/character/poses/manifest.json`
- `apps/web/src/components/ui/character-poses.generated.ts` — **auto-generated,
  do not hand-edit.** Carries `HAS_SEPARATE_POSES`, `POSE_FILES`,
  `SHEET_VIEW_BOX`, `POSE_VIEW_BOX`, `SPRITE_FOCUS_POSE`.

## Stage 3 — `scripts/optimise-poses.sh`

```bash
npm run character:optimise
```

Prints a per-file savings table (345 KB → **151 KB, 56% saved** across all seven
files, including `pose-full.svg`) and asserts that every output still has its
`viewBox`. The six individual poses total **46 KB**; the other 105 KB is
`pose-full.svg`, which is only fetched if the component falls back to sprite
mode.

**Note on svgo 4:** the flag list in older notes does not apply. svgo 4
(1) rejects inline JSON passed to `--config`, (2) loads config via dynamic
`import()`, so a `.json` config fails with `ERR_IMPORT_ATTRIBUTE_MISSING` — use
the `.mjs` configs; and (3) dropped `removeViewBox` from `preset-default`, so it
can no longer be used as an override. The scripts, not the flag list, are the
source of truth:

- `scripts/svgo.config.mjs` — conservative, for the source sheet
- `scripts/svgo.poses.config.mjs` — aggressive, for the poses

## Stage 4 — `scripts/verify-poses.py`

```bash
npm run character:verify
```

Fails loudly on: inconsistent frame sizes, an inconsistent foot baseline, any
figure clipped by its own frame, or two poses too similar to be distinct
(current max IoU **76.1%**). Run this in CI if you add it.

## The React component

`apps/web/src/components/ui/CharacterAnimation.tsx` exposes one API in every
mode:

```tsx
<CharacterAnimation state="thinking" className="..." />
```

States: `idle` · `wave` · `thinking` · `celebrating` · `encouraging` · `walk`.

Render modes, chosen **at runtime**, no rebuild required:

| Mode | Behaviour |
| --- | --- |
| `poses` | 6 independent SVGs, cross-faded with GSAP (the default today) |
| `sprite` | one sheet, animated with a GSAP `x` transform window |
| `none` | a single static SVG |

`HAS_SEPARATE_POSES` in `character-poses.generated.ts` selects between the first
two; `prefers-reduced-motion` forces `none`.

Two behaviours that are easy to regress:

- `onComplete` is held in a **ref**. An inline arrow function from the parent is
  a new identity every render, which would tear down and restart the GSAP
  timeline on every render.
- The completion handler is attached with `tl.eventCallback("onComplete", …)`,
  not `tl.then(…)`, for the same reason.

A plain `<img>` is used rather than `next/image` — these are 7–8 KB local SVGs
and the Image Optimization pipeline adds nothing. The import carries a scoped
`eslint-disable` with that rationale.

## Where it is used

- `app/page.tsx` — `wave` in the hero, settling to `idle` after 3.2s.
- `app/write/page.tsx` — the character tracks where the writer is in the form
  (`charState`, recomputed from `step`, `weaving`, `isFocused`, `isSubmitted`):

  | Condition | Pose |
  | --- | --- |
  | the Page Weaver is running (`weaving`) | `thinking` |
  | submitted (`isSubmitted`) | `celebrating` |
  | `step === "review"` | `encouraging` |
  | `step === "pages"` and a field is focused | `walk` |
  | otherwise | `idle` |

  `onFieldFocus` / `onFieldBlur` are attached to all three fields and only matter
  on the `pages` step. Note the step union is `"review"` / `"pages"` (etc.) — not
  the numeric `step === 5` the original brief used.

  Submitting sets `isSubmitted` rather than navigating immediately, otherwise
  the celebrating pose is never on screen long enough to read; the navigation to
  `/me` is delayed by 1.2s. `celebrating` plays once and the component's
  `onComplete` falls back to `idle`.

## Checklist before committing

- [ ] `npm run character:verify` passes
- [ ] `character-poses.generated.ts` was regenerated, not hand-edited
- [ ] `manifest.json` is committed alongside the pose SVGs
- [ ] The preview PNG matches the names you assigned
- [ ] No `.eps` or `.ai` added to `apps/web/public/`
- [ ] Total pose payload still under ~60 KB
- [ ] `prefers-reduced-motion` renders a static pose (test with the OS setting
      on, not devtools emulation)
- [ ] Checked on a real phone, not just desktop

