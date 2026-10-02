#!/usr/bin/env bash
#
# convert-character.sh
# ---------------------------------------------------------------------------
# Converts the Illustrator EPS character kit into a web-ready SVG + preview PNG.
#
# Conversion backends, tried in order:
#   1. inkscape            — preferred, preserves Illustrator layer/group names
#   2. ghostscript + pdftocairo — no-sudo fallback available on stock Ubuntu
#                            (gs renders the EPS to PDF, pdftocairo vectorises
#                             the PDF to SVG). Output is geometrically identical
#                            but the SVG is "flat" (no <g> layers preserved).
#
# Usage:
#   bash scripts/convert-character.sh
#
# Env overrides:
#   KIT_DIR                 source kit folder
#   OUT_DIR                 output folder
#   KEEP_BACKGROUND=1       keep the baked-in background <rect> (default: strip it)
#   SVG_DPI=120             raster resolution for the preview PNG
#   TOOLS_PYTHON            python interpreter used for SVG post-processing
#
set -euo pipefail

KIT_DIR="${KIT_DIR:-/home/sanjay/ENDLESS BOOK/collection-ready-animation-male-character}"
OUT_DIR="${OUT_DIR:-/home/sanjay/ENDLESS BOOK/apps/web/public/character}"
EPS="$KIT_DIR/5505145.eps"
SVG="$OUT_DIR/character-source.svg"
PNG="$OUT_DIR/character-preview.png"
SVG_DPI="${SVG_DPI:-120}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS_PYTHON="${TOOLS_PYTHON:-$ROOT_DIR/.venv-tools/bin/python}"

mkdir -p "$OUT_DIR"

say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m[warn]\033[0m %s\n' "$*"; }
ok() { printf '\033[32m[ok]\033[0m %s\n' "$*"; }

# ---------------------------------------------------------------------------
# 0. Sanity checks
# ---------------------------------------------------------------------------
say "Step 0: Pre-flight checks"
[ -f "$EPS" ] || { echo "FATAL: EPS source not found at $EPS" >&2; exit 1; }
ok "Found EPS source: $EPS ($(du -h "$EPS" | cut -f1))"

if [ -x "$TOOLS_PYTHON" ]; then
  ok "Python toolchain: $TOOLS_PYTHON"
else
  TOOLS_PYTHON="$(command -v python3 || true)"
  [ -n "$TOOLS_PYTHON" ] || { echo "FATAL: no python3 available" >&2; exit 1; }
  warn "No .venv-tools found, falling back to system python3 ($TOOLS_PYTHON)."
  warn "If lxml/cairosvg are missing, create it:  python3 -m venv .venv-tools"
  warn "                                          .venv-tools/bin/pip install lxml cairosvg svgwrite"
fi

BACKEND=""

# ---------------------------------------------------------------------------
# 1. EPS -> SVG
# ---------------------------------------------------------------------------
if command -v inkscape >/dev/null 2>&1; then
  say "Step 1: Converting EPS to SVG via Inkscape CLI..."
  if inkscape "$EPS" \
        --export-type=svg \
        --export-plain-svg \
        --export-filename="$SVG" \
        >/dev/null 2>&1 && [ -s "$SVG" ]; then
    BACKEND="inkscape"
    ok "Done: character-source.svg (inkscape, layer names preserved)"
  else
    warn "Inkscape export failed, falling back to ghostscript."
  fi
fi

if [ -z "$BACKEND" ]; then
  if command -v gs >/dev/null 2>&1 && command -v pdftocairo >/dev/null 2>&1; then
    say "Step 1: Converting EPS to SVG via ghostscript + pdftocairo (no-sudo path)..."
    TMP_PDF="$(mktemp -t character-src-XXXXXX.pdf)"
    trap 'rm -f "$TMP_PDF"' EXIT
    gs -dSAFER -dBATCH -dNOPAUSE -dEPSCrop \
       -sDEVICE=pdfwrite -r"$SVG_DPI" -dCompatibilityLevel=1.7 \
       -o "$TMP_PDF" "$EPS" >/dev/null 2>&1
    # -svg emits a viewBox in the same user units as the EPS BoundingBox.
    pdftocairo -svg "$TMP_PDF" "$SVG" >/dev/null 2>&1
    [ -s "$SVG" ] || { echo "FATAL: pdftocairo produced no output" >&2; exit 1; }
    BACKEND="ghostscript"
    ok "Done: character-source.svg (ghostscript+pdftocairo, flat path soup)"
  else
    echo "FATAL: neither inkscape nor (gs + pdftocairo) is available." >&2
    echo "       Install with:  sudo apt-get install -y inkscape" >&2
    exit 1
  fi
fi

# ---------------------------------------------------------------------------
# 2. EPS -> high-res PNG preview (for visual inspection)
# ---------------------------------------------------------------------------
say "Step 2: Rendering high-res PNG preview for inspection..."
if command -v inkscape >/dev/null 2>&1; then
  inkscape "$EPS" --export-type=png --export-filename="$PNG" \
    --export-dpi="$SVG_DPI" >/dev/null 2>&1 || true
fi
if [ ! -s "$PNG" ]; then
  if command -v gs >/dev/null 2>&1; then
    gs -dSAFER -dBATCH -dNOPAUSE -dEPSCrop -sDEVICE=png16m \
       -r"$SVG_DPI" -dTextAlphaBits=4 -dGraphicsAlphaBits=4 \
       -sOutputFile="$PNG" "$EPS" >/dev/null 2>&1 || true
  fi
fi
if [ -s "$PNG" ]; then
  ok "Done: character-preview.png ($(du -h "$PNG" | cut -f1))"
else
  warn "Could not render character-preview.png (non-fatal, it is only for inspection)."
fi

# ---------------------------------------------------------------------------
# 3. Normalise the SVG for the web
#    - pin width/height + viewBox so every renderer agrees on the canvas
#    - strip the opaque full-bleed background rect baked into the EPS
#    - add a transparent background rect of our own
# ---------------------------------------------------------------------------
say "Step 3: Normalising SVG (canvas, background handling)..."
"$TOOLS_PYTHON" - "$SVG" "${KEEP_BACKGROUND:-0}" <<'PYEOF'
import re, sys
from lxml import etree

svg_path, keep_bg = sys.argv[1], sys.argv[2] == "1"
tree = etree.parse(svg_path)
root = tree.getroot()
SVG_NS = "http://www.w3.org/2000/svg"

# --- 1. Resolve the canvas from viewBox (or width/height as a fallback) ------
def parse_viewbox(r):
    vb = r.get("viewBox")
    if vb:
        try:
            p = [float(x) for x in vb.replace(",", " ").split()]
            if len(p) == 4:
                return p
        except ValueError:
            pass
    w = r.get("width") or "750"
    h = r.get("height") or "500"
    w = float(re.sub(r"[a-z%]+$", "", w.strip()) or 750)
    h = float(re.sub(r"[a-z%]+$", "", h.strip()) or 500)
    return [0.0, 0.0, w, h]

vx, vy, vw, vh = parse_viewbox(root)
root.set("viewBox", f"{vx:g} {vy:g} {vw:g} {vh:g}")
root.set("width", f"{vw:g}")
root.set("height", f"{vh:g}")

# --- 2. Identify and remove the baked-in opaque background ------------------
# The Illustrator EPS carries a full-bleed flat <rect> as its first child.
# Test: an <rect> (or any shape) with no stroke whose painted area covers
# >=90% of the canvas and sits at the very start of the document.
def num(el, attr, default=0.0):
    try:
        return float(el.get(attr, default))
    except (TypeError, ValueError):
        return default

def has_visible_fill(el):
    f = el.get("fill")
    if f is None:
        return False
    return f.strip().lower() not in ("none", "transparent")

removed = 0
if not keep_bg:
    for child in list(root):
        tag = etree.QName(child.tag).localname if isinstance(child.tag, str) else ""
        if tag != "rect":
            break  # only inspect leading children
        x, y = num(child, "x"), num(child, "y")
        w, h = num(child, "width"), num(child, "height")
        covers = (x <= vx and y <= vy and x + w >= vx + vw and y + h >= vy + vh)
        if covers and has_visible_fill(child) and child.get("stroke") in (None, "none"):
            root.remove(child)
            removed += 1
        else:
            break

print(f"  viewBox pinned to {vx:g} {vy:g} {vw:g} {vh:g}")
print(f"  background rects removed: {removed}")

# --- 3. Re-add an explicit transparent background so renderers agree --------
if not keep_bg and root.get("data-has-bg") != "1":
    bg = etree.Element(f"{{{SVG_NS}}}rect", nsmap=root.nsmap)
    bg.set("id", "character-background")
    bg.set("x", f"{vx:g}")
    bg.set("y", f"{vy:g}")
    bg.set("width", f"{vw:g}")
    bg.set("height", f"{vh:g}")
    bg.set("fill", "none")
    root.insert(0, bg)

# --- 4. Drop an inherited background colour style if present ---------------
for el in root.iter():
    st = el.get("style") or ""
    if "background" in st:
        el.set("style", re.sub(r"background[^;]*;?", "", st))

tree.write(svg_path, xml_declaration=True, encoding="UTF-8")
PYEOF
ok "SVG normalised"

# ---------------------------------------------------------------------------
# 4. Optimise with svgo
# ---------------------------------------------------------------------------
say "Step 4: Optimising source SVG with svgo..."
# NOTE: svgo >= 4 requires --config to be a FILE PATH (v2/v3 accepted inline JSON).
SVGO_BIN="$ROOT_DIR/apps/web/node_modules/.bin/svgo"
SVGO_CONF="$ROOT_DIR/scripts/svgo.config.mjs"
if [ -x "$SVGO_BIN" ]; then
  "$SVGO_BIN" "$SVG" --output="$SVG" --config="$SVGO_CONF" >/dev/null 2>&1 \
    && ok "SVG optimised" \
    || warn "svgo pass failed (left file as-is)."
elif (cd "$ROOT_DIR/apps/web" && npx --no-install svgo --version >/dev/null 2>&1); then
  (cd "$ROOT_DIR/apps/web" && npx --no-install svgo "$SVG" --output="$SVG" \
     --config="$SVGO_CONF" >/dev/null 2>&1) \
    && ok "SVG optimised" || warn "svgo pass failed (left file as-is)."
else
  warn "svgo not installed in apps/web; skipping optimisation."
  warn "Install with:  cd apps/web && npm install --save-dev svgo"
fi

# ---------------------------------------------------------------------------
# 5. Report
# ---------------------------------------------------------------------------
say "Step 5: Result"
printf 'backend : %s\n' "$BACKEND"
printf 'svg     : %s (%s)\n' "$SVG" "$(du -h "$SVG" | cut -f1)"
[ -s "$PNG" ] && printf 'preview : %s (%s)\n' "$PNG" "$(du -h "$PNG" | cut -f1)"
printf 'paths   : %s\n' "$(grep -o '<path' "$SVG" | wc -l | tr -d ' ')"
printf 'groups  : %s\n' "$(grep -o '<g[ >]' "$SVG" | wc -l | tr -d ' ')"

say "Next step:  python3 scripts/extract-poses.py"
ls -lh "$OUT_DIR"
