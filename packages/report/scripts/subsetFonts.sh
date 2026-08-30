#!/usr/bin/env bash
#
# Regenerates the report's embedded fonts.
#
# Why this exists: pdf-lib's runtime subsetter (`embedFont(..., { subset: true })`)
# produces broken glyph mappings for NotoSans — most characters render as .notdef
# boxes. Verified by rendering the same string with subset:true and subset:false;
# only the latter is correct. So we subset OFFLINE and embed with subset:false.
#
# The pre-subsetted faces are ~11 KB against ~615 KB for the full NotoSans (4,503
# glyphs, almost none of which a borehole log uses), and font METRICS are unchanged:
# widthOfTextAtSize returns bit-identical values before and after, so layout does not
# move. That is what makes this safe.
#
# Requires fonttools (`pip install fonttools`). Run from the repo root:
#   bash packages/report/scripts/subsetFonts.sh
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SRC="$REPO_ROOT/packages/report/assets/src"
OUT="$REPO_ROOT/packages/report/assets"

# ASCII printable, plus the symbols a borehole log actually prints: degree, micro,
# multiply, divide, plus-minus, vulgar fractions, en/em dash, curly quotes, ellipsis.
UNICODES="U+0020-007E,U+00A0,U+00B0,U+00B1,U+00B5,U+00BC,U+00BD,U+00BE,U+00D7,U+00F7,U+2013,U+2014,U+2018-201D,U+2026"

for WEIGHT in Regular Bold Italic; do
  IN="$SRC/NotoSans-$WEIGHT.ttf"
  if [ ! -f "$IN" ]; then
    echo "skip   NotoSans-$WEIGHT.ttf (not present in $SRC)"
    continue
  fi
  pyftsubset "$IN" \
    --unicodes="$UNICODES" \
    --layout-features='' \
    --no-hinting \
    --desubroutinize \
    --output-file="$OUT/NotoSans-$WEIGHT.ttf"
  printf 'wrote  NotoSans-%s.ttf  %s\n' "$WEIGHT" "$(du -h "$OUT/NotoSans-$WEIGHT.ttf" | cut -f1)"
done

echo
echo "Now copy into the two app asset trees (they are duplicated deliberately — reaching"
echo "across a pnpm symlink through Metro's and Vite's asset pipelines is the kind of thing"
echo "that works locally and fails on EAS):"
echo "  cp $OUT/NotoSans-*.ttf $REPO_ROOT/apps/mobile/assets/fonts/report/"
echo "  cp $OUT/NotoSans-*.ttf $REPO_ROOT/apps/web/public/report/"
