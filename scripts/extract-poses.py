#!/usr/bin/env python3
"""
Auto-extract pose SVGs from the flat character kit SVG produced by
scripts/convert-character.sh.

    EPS  --(inkscape | gs+pdftocairo)-->  character-source.svg
                                             |
                        (this script)       v
                          apps/web/public/character/poses/
                            pose-idle.svg ... pose-walk.svg
                            pose-full.svg        (fallback sprite)
                            manifest.json

Two strategies, chosen automatically:

  A. GROUP CLUSTERING  - used when the SVG has top-level <g>/<symbol>/<use>
     elements (this is what Inkscape produces when it preserves Illustrator
     layers). Groups are sorted by their translate() X and chunked into 6.

  B. GEOMETRIC FIGURE DETECTION - used when the SVG is a flat path soup,
     which is what Ghostscript + pdftocairo produce from an EPS.
       1. rasterise the sheet and label 4-connected ink components
       2. keep "figure-sized" components (tall + large) => the poses
       3. order them into a grid (rows by Y, columns by X) => reading order
       4. for every <path>, render it in isolation and attribute it to the
          single figure component it overlaps. Because distinct components
          cannot be joined by a single path, this attribution is exact.
       5. crop each figure to a CANONICAL frame (same size + same foot
          baseline for all six) so the character never jumps between states
       6. drop every path that does not belong to that figure => small files

Outputs manifest.json describing what was found.

Usage:
    python3 scripts/extract-poses.py [--names idle,wave,thinking,...]
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import shutil
import sys
from pathlib import Path

try:
    import numpy as np
except ImportError:  # pragma: no cover
    sys.exit("ERROR: numpy is required.  .venv-tools/bin/pip install numpy")

try:
    import cairosvg
except ImportError:  # pragma: no cover
    sys.exit("ERROR: cairosvg is required.  .venv-tools/bin/pip install cairosvg")

try:
    from lxml import etree
except ImportError:  # pragma: no cover
    sys.exit("ERROR: lxml is required.  .venv-tools/bin/pip install lxml")


# --------------------------------------------------------------------------
# Paths
# --------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "apps/web/public/character/character-source.svg"
DEST = ROOT / "apps/web/public/character/poses"
TS_OUT = ROOT / "apps/web/src/components/ui/character-poses.generated.ts"

SVG_NS = "http://www.w3.org/2000/svg"
DRAWABLE = {
    "path", "g", "symbol", "use", "rect", "circle", "ellipse",
    "line", "polyline", "polygon", "text", "image",
}

DEFAULT_NAMES = ["idle", "wave", "thinking", "celebrating", "encouraging", "walk"]

# Canonical framing (multipliers of the measured figure box).
FRAME_HEIGHT_FACTOR = 1.16   # headroom above the figure
FRAME_WIDTH_FACTOR = 1.22    # side margin (widest pose drives the width)
FRAME_FOOTROOM = 0.09        # space below the feet, as a fraction of frame height

# Figure detection thresholds.
MIN_AREA_RATIO = 0.15        # of the largest component
MIN_HEIGHT_RATIO = 0.30      # of the sheet height
ROW_SPLIT_RATIO = 0.50      # Y-centre gap, as a fraction of median figure height


def local(tag) -> str:
    return etree.QName(tag).localname if isinstance(tag, str) else ""


# ==========================================================================
# Strategy A - top level group clustering
# ==========================================================================
def parse_transform_translate(transform_str: str):
    if not transform_str:
        return 0.0, 0.0
    m = re.search(r"translate\(\s*([-\d.]+)[\s,]+([-\d.]+)", transform_str)
    if m:
        return float(m.group(1)), float(m.group(2))
    m = re.search(r"translate\(\s*([-\d.]+)\s*\)", transform_str)
    if m:
        return float(m.group(1)), 0.0
    return 0.0, 0.0


def get_viewbox(root):
    vb = root.get("viewBox", "")
    if vb:
        parts = [float(x) for x in vb.replace(",", " ").split()]
        if len(parts) == 4:
            return parts
    w = float(re.sub(r"[a-z%]+$", "", (root.get("width") or "800").strip()) or 800)
    h = float(re.sub(r"[a-z%]+$", "", (root.get("height") or "800").strip()) or 800)
    return [0.0, 0.0, w, h]


def cluster_by_x(groups, n_clusters=6):
    """Simple X-position clustering into n columns."""
    if not groups:
        return []
    positions = sorted(groups, key=lambda t: t[1])
    chunk = max(1, len(positions) // n_clusters)
    clusters = [
        [g for g, _ in positions[i:i + chunk]]
        for i in range(0, len(positions), chunk)
    ]
    return clusters[:n_clusters]


# ==========================================================================
# Strategy B - geometry
# ==========================================================================
def render_alpha(svg_bytes: bytes, width: int, height: int) -> np.ndarray:
    """Rasterise SVG bytes and return a boolean alpha mask."""
    png = cairosvg.svg2png(
        bytestring=svg_bytes,
        output_width=width,
        output_height=height,
    )
    import io
    from PIL import Image

    img = Image.open(io.BytesIO(png)).convert("RGBA")
    return np.asarray(img)[:, :, 3] > 8


def label_components(mask: np.ndarray) -> tuple[np.ndarray, int]:
    """Two-pass union-find 8-connected labelling. Returns (labels, count)."""
    h, w = mask.shape
    labels = np.zeros((h, w), dtype=np.int32)
    parent: list[int] = [0]
    next_label = 1

    def find(a: int) -> int:
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    def union(a: int, b: int) -> int:
        ra, rb = find(a), find(b)
        if ra == rb:
            return ra
        if ra < rb:
            parent[rb] = ra
            return ra
        parent[ra] = rb
        return rb

    # ---- forward pass -------------------------------------------------
    for y in range(h):
        row = mask[y]
        if not row.any():
            continue
        cur = labels[y]
        prev = labels[y - 1] if y > 0 else None
        for x in np.nonzero(row)[0]:
            lab = 0
            if x > 0 and cur[x - 1]:
                lab = find(int(cur[x - 1]))
            if prev is not None:
                for nx in (x - 1, x, x + 1):
                    if 0 <= nx < w and prev[nx]:
                        up = find(int(prev[nx]))
                        lab = up if not lab else union(lab, up)
            if not lab:
                lab = next_label
                parent.append(lab)
                next_label += 1
            cur[x] = lab

    # ---- flatten to dense ids ----------------------------------------
    remap: dict[int, int] = {}
    for raw in range(1, next_label):
        root = find(raw)
        if root not in remap:
            remap[root] = len(remap) + 1
    lut = np.zeros(next_label, dtype=np.int32)
    for raw in range(1, next_label):
        lut[raw] = remap[find(raw)]
    return lut[labels], len(remap)


def component_stats(labels: np.ndarray, count: int) -> list[dict]:
    """Area + bbox for every labelled component."""
    stats = []
    for cid in range(1, count + 1):
        ys, xs = np.nonzero(labels == cid)
        if ys.size == 0:
            continue
        stats.append({
            "id": cid,
            "area": int(ys.size),
            "x0": int(xs.min()), "y0": int(ys.min()),
            "x1": int(xs.max()), "y1": int(ys.max()),
        })
    stats.sort(key=lambda s: s["area"], reverse=True)
    return stats


def order_into_grid(figures: list[dict], median_h: float) -> list[dict]:
    """Sort figures into rows by Y-centre, then into columns by X-centre."""
    by_y = sorted(figures, key=lambda f: f["y0"])
    rows: list[list[dict]] = []
    for fig in by_y:
        if rows and (fig["y0"] - rows[-1][-1]["y0"]) < ROW_SPLIT_RATIO * median_h:
            rows[-1].append(fig)
        else:
            rows.append([fig])
    ordered: list[dict] = []
    for row in rows:
        ordered.extend(sorted(row, key=lambda f: f["x0"]))
    return ordered


def path_bbox(el) -> tuple[float, float, float, float] | None:
    """Conservative bbox for a drawable element, from its geometry attributes."""
    tag = local(el.tag)
    try:
        if tag == "rect":
            x, y = float(el.get("x", 0)), float(el.get("y", 0))
            return x, y, x + float(el.get("width", 0)), y + float(el.get("height", 0))
        if tag in ("circle", "ellipse"):
            cx, cy = float(el.get("cx", 0)), float(el.get("cy", 0))
            if tag == "circle":
                r = float(el.get("r", 0))
                return cx - r, cy - r, cx + r, cy + r
            rx, ry = float(el.get("rx", 0)), float(el.get("ry", 0))
            return cx - rx, cy - ry, cx + rx, cy + ry
        if tag == "line":
            x1, y1 = float(el.get("x1", 0)), float(el.get("y1", 0))
            x2, y2 = float(el.get("x2", 0)), float(el.get("y2", 0))
            return min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2)
        if tag in ("polygon", "polyline"):
            nums = [float(v) for v in re.findall(r"-?\d*\.?\d+(?:e[-+]?\d+)?",
                                                 el.get("points", ""))]
            xs, ys = nums[0::2], nums[1::2]
            return min(xs), min(ys), max(xs), max(ys)
        if tag == "path":
            return path_data_bbox(el.get("d", ""))
        if tag in ("g", "symbol", "use"):
            boxes = [b for b in (path_bbox(c) for c in el) if b]
            if not boxes:
                return None
            return (min(b[0] for b in boxes), min(b[1] for b in boxes),
                    max(b[2] for b in boxes), max(b[3] for b in boxes))
    except (TypeError, ValueError):
        return None
    return None


_PATH_NUM = re.compile(r"[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?")
_PATH_CMD = re.compile(r"([MmLlHhVvCcSsQqTtAaZz])")


def path_data_bbox(d: str):
    """Bounding box of SVG path data (control points included => conservative)."""
    if not d:
        return None
    tokens = _PATH_CMD.split(d)
    xs: list[float] = []
    ys: list[float] = []
    cx = cy = 0.0
    for i in range(1, len(tokens) - 1, 2):
        cmd = tokens[i]
        args = [float(v) for v in _PATH_NUM.findall(tokens[i + 1])]
        if cmd in ("Z", "z"):
            continue
        # Relative commands are promoted with the current point.
        rel = cmd.islower()
        k = {"M": 1, "L": 1, "T": 1, "H": 1, "V": 1,
             "C": 3, "S": 2, "Q": 2, "A": 1}.get(cmd.upper(), 0)
        if not k:
            continue
        for a in range(0, len(args) - k + 1, k):
            chunk = args[a:a + k]
            if cmd in ("H", "h"):
                px = (cx + chunk[0]) if rel else chunk[0]
                xs.append(px)
                cx = px
            elif cmd in ("V", "v"):
                py = (cy + chunk[0]) if rel else chunk[0]
                ys.append(py)
                cy = py
            elif cmd in ("A", "a"):
                px = (cx + chunk[0]) if rel else chunk[0]
                py = (cy + chunk[1]) if rel else chunk[1]
                xs.append(px); ys.append(py); cx, cy = px, py
            else:
                pts = [(chunk[0], chunk[1])] if k == 1 else list(zip(chunk[0::2], chunk[1::2]))
                for ox, oy in pts:
                    px = (cx + ox) if rel else ox
                    py = (cy + oy) if rel else oy
                    xs.append(px); ys.append(py)
                cx, cy = pts[-1]
    if not xs or not ys:
        return None
    return min(xs), min(ys), max(xs), max(ys)


def silhouette(mask: np.ndarray, bands: int = 8) -> list[dict]:
    """Width/centroid of the silhouette per horizontal band. Diagnostic only."""
    h = mask.shape[0]
    out = []
    for b in range(bands):
        y0, y1 = int(h * b / bands), max(int(h * (b + 1) / bands), int(h * b / bands) + 1)
        band = mask[y0:y1]
        if not band.any():
            out.append({"band": b, "widthRatio": 0.0, "centerXRatio": 0.5})
            continue
        cols = np.nonzero(band.any(axis=0))[0]
        out.append({
            "band": b,
            "widthRatio": round(float(cols[-1] - cols[0] + 1) / mask.shape[1], 3),
            "centerXRatio": round(float((cols[0] + cols[-1]) / 2) / mask.shape[1], 3),
        })
    return out


# ==========================================================================
# Writers
# ==========================================================================
def write_pose_svg(root, view_box, keep_elements, nsmap, out_path: Path) -> int:
    """Clone the root, keep only `keep_elements`, crop via the viewBox.

    `view_box` may be a 4-tuple or an already formatted "x y w h" string.
    """
    if isinstance(view_box, str):
        vb = [float(v) for v in view_box.replace(",", " ").split()]
    else:
        vb = [float(v) for v in view_box]

    new_root = etree.Element(f"{{{SVG_NS}}}svg", nsmap=nsmap)
    for key in ("preserveAspectRatio", "xmlns:xlink"):
        val = root.get(key)
        if val:
            new_root.set(key, val)
    new_root.set("viewBox", fmt(vb))
    new_root.set("width", f"{vb[2]:g}")
    new_root.set("height", f"{vb[3]:g}")

    for tag in ("defs", "style", "linearGradient", "radialGradient", "clipPath", "mask"):
        for node in root.iter(f"{{{SVG_NS}}}{tag}"):
            if local(node.tag) in ("defs", "style") and node.getparent() is root:
                new_root.append(copy.deepcopy(node))
                break

    for el in keep_elements:
        new_root.append(copy.deepcopy(el))

    etree.ElementTree(new_root).write(
        str(out_path), xml_declaration=True, encoding="UTF-8", pretty_print=True
    )
    return new_root


def fmt(vb) -> str:
    return f"{vb[0]:.3f} {vb[1]:.3f} {vb[2]:.3f} {vb[3]:.3f}"


# ==========================================================================
# Main
# ==========================================================================
def main() -> int:
    ap = argparse.ArgumentParser(description="Extract pose SVGs from the character sheet.")
    ap.add_argument("--names", default=",".join(DEFAULT_NAMES),
                    help="comma separated pose names, applied in reading order")
    ap.add_argument("--count", type=int, default=6, help="how many poses to emit")
    ap.add_argument("--scale", type=float, default=2.0,
                    help="raster px per SVG user unit (default 2.0)")
    args = ap.parse_args()

    names = [n.strip() for n in args.names.split(",") if n.strip()]
    want = min(args.count, len(names))

    if not SRC.exists():
        sys.exit(f"ERROR: {SRC} not found.  Run:  bash scripts/convert-character.sh")

    DEST.mkdir(parents=True, exist_ok=True)
    tree = etree.parse(str(SRC))
    root = tree.getroot()
    vx, vy, vw, vh = get_viewbox(root)
    print(f"Source      : {SRC}")
    print(f"Canvas      : viewBox={vx:g} {vy:g} {vw:g} {vh:g}")

    # Always ship the whole sheet as the fallback sprite.
    shutil.copy(SRC, DEST / "pose-full.svg")
    print(f"Fallback    : pose-full.svg (full sheet)")

    manifest = {
        "source": "character-source.svg",
        "fallback": True,
        "canvas": {"x": vx, "y": vy, "width": vw, "height": vh},
        "strategy": None,
        "poses": [],
        "droppedPaths": 0,
        "notes": [],
    }

    # ------------------------------------------------------------------
    # Strategy A: layered SVG
    # ------------------------------------------------------------------
    top_groups = [
        c for c in root
        if local(c.tag) in ("g", "symbol", "use")
    ]
    print(f"Top-level groups: {len(top_groups)}")

    if len(top_groups) >= args.count:
        print("\nStrategy A: clustering top-level groups by translate(X)...")
        manifest["strategy"] = "group-clustering"
        positioned = []
        for child in top_groups:
            tx, _ty = parse_transform_translate(child.get("transform", ""))
            positioned.append((child, tx))
        clusters = cluster_by_x(positioned, n_clusters=want)
        for i, cluster in enumerate(clusters):
            name = names[i]
            keep = [g for g, _ in cluster]
            out = DEST / f"pose-{name}.svg"
            write_pose_svg(root, f"{vx:g} {vy:g} {vw:g} {vh:g}", keep, root.nsmap, out)
            kb = out.stat().st_size // 1024
            print(f"  pose-{name}.svg  {kb:>4} KB  ({len(keep)} group(s))")
            manifest["poses"].append({
                "name": name, "file": f"pose-{name}.svg",
                "viewBox": f"{vx:g} {vy:g} {vw:g} {vh:g}",
                "elements": len(keep), "index": i,
            })
        manifest["fallback"] = False
        write_manifest(DEST, manifest)
        write_ts_module(manifest)
        print("Done.")
        return 0

    # ------------------------------------------------------------------
    # Strategy B: flat path soup
    # ------------------------------------------------------------------
    print("\nStrategy B: SVG is flat - detecting figures geometrically...")
    manifest["strategy"] = "geometric-figure-detection"

    rw, rh = int(vw * args.scale), int(vh * args.scale)
    full_mask = render_alpha(
        etree.tostring(root), rw, rh
    )
    print(f"  rasterised {rw}x{rh}, ink pixels: {int(full_mask.sum())}")

    labels, n_lab = label_components(full_mask)
    print(f"  connected components: {n_lab}")

    stats = component_stats(labels, n_lab)
    if not stats:
        sys.exit("ERROR: no ink found - is the SVG empty?")

    biggest = stats[0]["area"]
    figures = [
        s for s in stats
        if s["area"] >= MIN_AREA_RATIO * biggest
        and (s["y1"] - s["y0"] + 1) >= MIN_HEIGHT_RATIO * rh
    ]
    print(f"  figure-sized components: {len(figures)} "
          f"(of {n_lab} total; threshold area>={MIN_AREA_RATIO:.0%} of max, "
          f"height>={MIN_HEIGHT_RATIO:.0%} of sheet)")

    if len(figures) < 2:
        sys.exit("ERROR: fewer than 2 figure-sized components found. Cannot split poses.")

    heights = [f["y1"] - f["y0"] + 1 for f in figures]
    ordered = order_into_grid(figures, float(np.median(heights)))
    print("  reading order: " + ", ".join(
        f"({f['x0']},{f['y0']})-({f['x1']},{f['y1']})" for f in ordered))

    selected = ordered[:want]
    if len(selected) < want:
        manifest["notes"].append(
            f"Only {len(selected)} figure-sized components found; "
            f"{want - len(selected)} pose(s) will reuse the last frame."
        )
    selected_ids = {f["id"] for f in selected}

    # -- attribute every top-level path to exactly one figure ---------------
    # Every <path> is rasterised on its own and attributed to the single
    # figure-sized component it overlaps. This is exact: two components that
    # are 4-connected cannot be joined by one path, so a path's ink always
    # lands in exactly one component (or in background/prop artwork, which is
    # discarded).
    print(f"\n  attributing {sum(1 for c in root if local(c.tag) in DRAWABLE)} "
          f"drawable element(s) to figures...")
    drawables = [c for c in root if local(c.tag) in DRAWABLE and c.get("fill") != "none"]
    assigned: dict[int, list] = {cid: [] for cid in selected_ids}
    dropped = 0

    for el in drawables:
        solo = etree.Element(f"{{{SVG_NS}}}svg", nsmap=root.nsmap)
        solo.set("viewBox", f"{vx:g} {vy:g} {vw:g} {vh:g}")
        solo.append(copy.deepcopy(el))
        try:
            m = render_alpha(etree.tostring(solo), rw, rh)
        except Exception:
            m = np.zeros((rh, rw), dtype=bool)
        target: int | None = None
        if m.any():
            ids, counts = np.unique(labels[m], return_counts=True)
            best, best_n = 0, 0
            for cid, n in zip(ids.tolist(), counts.tolist()):
                if cid in selected_ids and n > best_n:
                    best, best_n = cid, n
            target = best or None
        if target is not None:
            assigned[target].append(el)
        else:
            dropped += 1

    # Safety net: a figure that matched no path falls back to bbox overlap.
    for fig in selected:
        if assigned[fig["id"]]:
            continue
        fx0, fx1 = fig["x0"], fig["x1"]
        fy0, fy1 = fig["y0"], fig["y1"]
        for el in drawables:
            if el in [e for lst in assigned.values() for e in lst]:
                continue
            b = path_bbox(el)
            if not b:
                continue
            pad = 4 * args.scale
            if (b[0] * args.scale < fx1 + pad and b[2] * args.scale > fx0 - pad
                    and b[1] * args.scale < fy1 + pad and b[3] * args.scale > fy0 - pad):
                assigned[fig["id"]].append(el)
        print(f"    (component {fig['id']} recovered {len(assigned[fig['id']])} "
              f"path(s) via bbox fallback)")

    manifest["droppedPaths"] = dropped
    for cid in sorted(assigned):
        print(f"    component {cid}: {len(assigned[cid]):>3} path(s)")

    # -- canonical frame ---------------------------------------------------
    # All six poses share ONE frame size and ONE foot baseline, so the
    # character keeps a constant scale and planted feet across every state.
    # (fig_h / fig_w arrive in raster pixels; convert to user units here.)
    fig_h = max(f["y1"] - f["y0"] + 1 for f in selected) / args.scale
    fig_w = max(f["x1"] - f["x0"] + 1 for f in selected) / args.scale
    frame_h = fig_h * FRAME_HEIGHT_FACTOR
    frame_w = fig_w * FRAME_WIDTH_FACTOR
    footroom = frame_h * FRAME_FOOTROOM
    print(f"\n  canonical frame: {frame_w:.1f} x {frame_h:.1f} user units "
          f"(figure {fig_w:.0f} x {fig_h:.0f}), footroom {footroom:.1f}")

    for i, fig in enumerate(selected):
        name = names[i]
        paths = assigned[fig["id"]]
        if not paths:
            print(f"  !! component {fig['id']} produced no paths, skipping")
            continue
        # Centre horizontally on the figure, anchor the feet `footroom` up
        # from the bottom of the frame.
        cx_u = (fig["x0"] + fig["x1"]) / 2 / args.scale
        baseline_u = fig["y1"] / args.scale
        x0 = cx_u - frame_w / 2
        y0 = baseline_u + footroom - frame_h
        vb = [x0, y0, frame_w, frame_h]

        fig_top_u = fig["y0"] / args.scale
        if fig_top_u < y0 or baseline_u > y0 + frame_h:
            print(f"  !! {name}: frame clips the figure "
                  f"(figure y {fig_top_u:.1f}..{baseline_u:.1f} vs frame {y0:.1f}..{y0 + frame_h:.1f})")

        out = DEST / f"pose-{name}.svg"
        write_pose_svg(root, vb, paths, root.nsmap, out)

        # verification: does the emitted file actually contain this figure?
        verify = render_alpha(etree.tostring(etree.parse(str(out)).getroot()),
                              int(frame_w * args.scale), int(frame_h * args.scale))
        ys, xs = np.nonzero(verify)
        got = None
        if ys.size:
            got = {
                "x0": round(x0 + xs.min() / args.scale, 1),
                "x1": round(x0 + xs.max() / args.scale, 1),
                "y0": round(y0 + ys.min() / args.scale, 1),
                "y1": round(y0 + ys.max() / args.scale, 1),
            }
        kb = out.stat().st_size // 1024
        clipped = (got is not None
                   and (got["y0"] <= y0 + 0.6 or got["y1"] >= y0 + frame_h - 0.6))
        print(f"  pose-{name}.svg  {kb:>4} KB  {len(paths):>3} path(s)  "
              f"viewBox={fmt(vb)}{'  [CLIPPED]' if clipped else ''}")
        if got:
            print(f"        ink bbox  x {got['x0']}..{got['x1']}  y {got['y0']}..{got['y1']}")

        manifest["poses"].append({
            "name": name,
            "file": f"pose-{name}.svg",
            "viewBox": fmt(vb),
            "width": round(frame_w, 2),
            "height": round(frame_h, 2),
            "paths": len(paths),
            "sizeKB": kb,
            "sourceComponent": {
                "x0": round(fig["x0"] / args.scale, 1),
                "y0": round(fig["y0"] / args.scale, 1),
                "x1": round(fig["x1"] / args.scale, 1),
                "y1": round(fig["y1"] / args.scale, 1),
                "areaPx": fig["area"],
            },
            "renderedBBox": got,
            "silhouette": silhouette(
                verify[::max(1, verify.shape[0] // 64),
                       ::max(1, verify.shape[1] // 64)]
            ) if verify.any() else [],
            "index": i,
        })

    manifest["fallback"] = len(manifest["poses"]) < want
    manifest["notes"].append(
        "Pose names are assigned in sheet reading order (row-major). The EPS "
        "conversion does not preserve Illustrator layer names, so the mapping is "
        "positional - re-run with --names to remap."
    )
    write_manifest(DEST, manifest)
    write_ts_module(manifest)
    print("Done.")
    return 0


def write_manifest(dest: Path, manifest: dict) -> None:
    path = dest / "manifest.json"
    path.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"\nManifest written: {path}")
    print(f"  strategy : {manifest['strategy']}")
    print(f"  poses    : {len(manifest['poses'])}  fallback={manifest['fallback']}")


TS_HEADER = '''/**
 * AUTO-GENERATED by scripts/extract-poses.py - do not edit by hand.
 * Re-run:  .venv-tools/bin/python scripts/extract-poses.py
 *
 * Gives the React layer typed, exact geometry for the extracted poses so it
 * never has to guess crop offsets. `POSE_VIEWBOX` is only consumed by the
 * single-sprite fallback, which frames the `idle` region of the whole sheet.
 */
'''


def write_ts_module(manifest: dict) -> None:
    poses = manifest["poses"]
    names = [p["name"] for p in poses]
    sprite_pose = "idle" if "idle" in names else (names[0] if names else None)

    lines = [TS_HEADER, ""]
    lines.append("/** True when six individual pose SVGs were extracted. */")
    lines.append(f"export const HAS_SEPARATE_POSES = {str(not manifest['fallback']).lower()};")
    lines.append("")
    lines.append("/** Every extracted pose, in sheet reading order. */")
    lines.append("export const EXTRACTED_POSE_NAMES = [")
    for n in names:
        lines.append(f'  "{n}",')
    lines.append("] as const;")
    lines.append("")
    lines.append("/** URL of each pose SVG. */")
    lines.append("export const POSE_FILES: Record<string, string> = {")
    for p in poses:
        lines.append(f'  "{p["name"]}": "/character/poses/{p["file"]}",')
    lines.append("};")
    lines.append("")
    lines.append("/** Whole sheet, used when the poses could not be split. */")
    lines.append('export const SPRITE_FILE = "/character/poses/pose-full.svg";')
    lines.append("")
    lines.append("/** viewBox of the framed region inside the full sheet. */")
    lines.append("export const SHEET_VIEW_BOX = {")
    c = manifest["canvas"]
    lines.append(f'  x: {c["x"]:g},')
    lines.append(f'  y: {c["y"]:g},')
    lines.append(f'  width: {c["width"]:g},')
    lines.append(f'  height: {c["height"]:g},')
    lines.append("};")
    lines.append("")
    lines.append("/** viewBox of each emitted pose frame (identical for all poses). */")
    lines.append("export const POSE_VIEW_BOX: Record<string, { x: number; y: number; width: number; height: number }> = {")
    for p in poses:
        vx, vy, vw, vh = (float(v) for v in p["viewBox"].split())
        lines.append(f'  "{p["name"]}": {{ x: {vx:g}, y: {vy:g}, width: {vw:g}, height: {vh:g} }},')
    lines.append("};")
    lines.append("")
    lines.append("/** Pose whose region the single-sprite fallback frames. */")
    lines.append(f'export const SPRITE_FOCUS_POSE = "{sprite_pose}";')
    lines.append("")

    TS_OUT.parent.mkdir(parents=True, exist_ok=True)
    TS_OUT.write_text("\n".join(lines))
    print(f"TS module   : {TS_OUT}")


if __name__ == "__main__":
    raise SystemExit(main())
