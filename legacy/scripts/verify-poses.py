#!/usr/bin/env python3
"""
Verify the emitted pose SVGs against manifest.json.

For every pose this script
  1. re-reads the viewBox and confirms the file is not empty,
  2. rasterises the pose and measures where the ink actually lands,
  3. checks that the ink sits inside the frame with a small margin
     (i.e. the figure is not cropped by the viewBox),
  4. checks that every pose shares the SAME frame size and the SAME
     foot baseline, so swapping state never makes the character jump,
  5. checks the six poses are visually distinct from one another.

Exit code 0 = all good, 1 = at least one failure.

Usage:  python3 scripts/verify-poses.py
"""

from __future__ import annotations

import io
import json
import sys
from pathlib import Path

try:
    import numpy as np
    import cairosvg
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit("ERROR: needs numpy, cairosvg and pillow.")

ROOT = Path(__file__).resolve().parent.parent
POSES = ROOT / "apps/web/public/character/poses"
MANIFEST = POSES / "manifest.json"

MARGIN = 1.0     # user units of breathing room required inside the frame
RENDER_PX = 400  # longest rendered edge


def render(svg_path: Path):
    png = cairosvg.svg2png(url=str(svg_path), output_width=RENDER_PX)
    img = Image.open(io.BytesIO(png)).convert("RGBA")
    return np.asarray(img)


def main() -> int:
    if not MANIFEST.exists():
        sys.exit(f"ERROR: {MANIFEST} not found.  Run scripts/extract-poses.py first.")
    manifest = json.loads(MANIFEST.read_text())
    poses = manifest.get("poses", [])
    if not poses:
        sys.exit("ERROR: manifest lists no poses.")

    failures: list[str] = []
    widths: set[float] = set()
    heights: set[float] = set()
    baselines: list[float] = []
    thumbs: dict[str, np.ndarray] = {}

    print(f"Verifying {len(poses)} pose(s) in {POSES}\n")
    header = f"{'POSE':<14}{'KB':>6}  {'VIEWBOX (x y w h)':<34}{'INK x':>13}{'INK y':>15}  STATUS"
    print(header)
    print("-" * len(header))

    for p in poses:
        name = p["name"]
        path = POSES / p["file"]
        if not path.exists():
            failures.append(f"{name}: {p['file']} is missing")
            print(f"{name:<14}{'-':>6}  {'-':<34}{'-':>13}{'-':>15}  MISSING")
            continue

        vx, vy, vw, vh = (float(v) for v in p["viewBox"].split())
        widths.add(round(vw, 2))
        heights.add(round(vh, 2))
        kb = path.stat().st_size / 1024

        arr = render(path)
        alpha = arr[:, :, 3] > 8
        # Derive the scale from the ACTUAL raster that came back rather than
        # assuming: cairosvg honours the SVG's intrinsic width/height ratio.
        sx = arr.shape[1] / vw
        sy = arr.shape[0] / vh
        ys, xs = np.nonzero(alpha)
        if ys.size == 0:
            failures.append(f"{name}: renders empty")
            print(f"{name:<14}{kb:>6.1f}  {p['viewBox']:<34}{'-':>13}{'-':>15}  EMPTY")
            continue

        # Ink bbox in user units.
        ix0, ix1 = vx + xs.min() / sx, vx + xs.max() / sx
        iy0, iy1 = vy + ys.min() / sy, vy + ys.max() / sy
        ink_x = f"{ix0:.0f}..{ix1:.0f}"
        ink_y = f"{iy0:.0f}..{iy1:.0f}"
        # Distance of the lowest ink above the bottom of the frame.
        baselines.append(round(vy + vh - iy1, 2))

        status = "ok"
        coverage = (ys.size / alpha.size)
        if iy0 < vy + MARGIN or iy1 > vy + vh - MARGIN:
            status = "CLIPPED"
            failures.append(f"{name}: ink touches the frame edge (clipped figure)")
        elif ix0 < vx + MARGIN or ix1 > vx + vw - MARGIN:
            status = "CLIPPED-X"
            failures.append(f"{name}: ink touches the side edges (clipped figure)")
        elif coverage > 0.97:
            status = "OVERFULL"
            failures.append(f"{name}: {coverage:.0%} of the frame is ink - wrong crop")
        elif coverage < 0.01:
            status = "NEARLY-EMPTY"
            failures.append(f"{name}: only {coverage:.2%} of the frame has ink")

        thumbs[name] = alpha
        print(f"{name:<14}{kb:>6.1f}  {p['viewBox']:<34}{ink_x:>13}{ink_y:>15}  {status}")

    # -- consistency --------------------------------------------------------
    print()
    if len(widths) > 1 or len(heights) > 1:
        failures.append(
            f"poses do not share one frame: widths={sorted(widths)} heights={sorted(heights)}")
    else:
        print(f"frame size    : consistent ({widths.pop():.2f} x {heights.pop():.2f})")

    if baselines:
        lo, hi = min(baselines), max(baselines)
        if hi - lo > 2.0:
            failures.append(
                f"foot baselines differ by {hi - lo:.1f} units - the character will jump")
        else:
            print(f"foot baseline : consistent ({lo:.1f}-{hi:.1f} units from frame bottom)")

    # -- distinctness -------------------------------------------------------
    names = [n for n in thumbs]
    if len(names) >= 2:
        small = {
            n: np.asarray(
                Image.fromarray((thumbs[n].astype(np.uint8) * 255)).resize((64, 64)),
                dtype=bool,
            )
            for n in names
        }
        worst = None
        for i in range(len(names)):
            for j in range(i + 1, len(names)):
                a, b = small[names[i]], small[names[j]]
                inter = np.logical_and(a, b).sum()
                union = np.logical_or(a, b).sum()
                iou = inter / union if union else 0.0
                if worst is None or iou > worst[0]:
                    worst = (iou, names[i], names[j])
        if worst and worst[0] > 0.97:
            failures.append(
                f"{worst[1]} and {worst[2]} are {worst[0]:.1%} identical - duplicate pose")
        elif worst:
            print(f"most similar  : {worst[1]} vs {worst[2]} at {worst[0]:.1%} IoU (distinct)")

    print()
    if failures:
        print(f"FAILED ({len(failures)}):")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("All pose SVGs verified OK.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
