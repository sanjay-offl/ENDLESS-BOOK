#!/usr/bin/env bash
#
# optimise-poses.sh - run svgo over every pose SVG produced by
# scripts/extract-poses.py, then report the savings.
#
# Usage:  bash scripts/optimise-poses.sh
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
POSES="$ROOT_DIR/apps/web/public/character/poses"
SVGO_BIN="$ROOT_DIR/apps/web/node_modules/.bin/svgo"
SVGO_CONF="$ROOT_DIR/scripts/svgo.poses.config.mjs"

if [ ! -d "$POSES" ]; then
  echo "FATAL: $POSES not found.  Run:  python3 scripts/extract-poses.py" >&2
  exit 1
fi

if [ ! -x "$SVGO_BIN" ]; then
  echo "svgo not found at $SVGO_BIN" >&2
  echo "Install with:  cd apps/web && npm install --save-dev svgo" >&2
  exit 1
fi

printf '%-22s %10s %10s %8s\n' "FILE" "BEFORE" "AFTER" "SAVED"
printf '%-22s %10s %10s %8s\n' "----------------------" "--------" "--------" "------"

total_before=0
total_after=0

shopt -s nullglob
for f in "$POSES"/*.svg; do
  before=$(stat -c %s "$f")
  "$SVGO_BIN" "$f" --output="$f" --config="$SVGO_CONF" >/dev/null 2>&1 \
    || { printf '%-22s %10s %10s %8s\n' "$(basename "$f")" "$(numfmt --to=iec "$before")" "FAILED" "-"; continue; }
  after=$(stat -c %s "$f")
  total_before=$((total_before + before))
  total_after=$((total_after + after))
  saved=$(( (before - after) * 100 / (before > 0 ? before : 1) ))
  printf '%-22s %10s %10s %7s%%\n' \
    "$(basename "$f")" "$(numfmt --to=iec "$before")" "$(numfmt --to=iec "$after")" "$saved"
done

printf '%-22s %10s %10s %7s%%\n' "----------------------" "--------" "--------" "------"
printf '%-22s %10s %10s\n' "TOTAL" \
  "$(numfmt --to=iec "$total_before")" "$(numfmt --to=iec "$total_after")"

# Sanity check: svgo must not have stripped the viewBox we rely on for cropping.
echo
for f in "$POSES"/pose-*.svg; do
  if ! grep -q 'viewBox=' "$f"; then
    echo "ERROR: $(basename "$f") lost its viewBox - poses would render uncropped." >&2
    exit 1
  fi
done
echo "viewBox preserved on all pose files."
