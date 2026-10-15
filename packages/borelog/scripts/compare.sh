#!/usr/bin/env bash
# Checks the port against the Python program it replaces, three ways, on every workbook in
# samples/ (gitignored — real client workbooks stay out of the repo):
#
#   1. parse:     every field of every row the parsers read, vs the Python parsers
#   2. paragraph: line breaks, heights, page splits and shrink-to-fit scales, vs reportlab
#   3. pixels:    each page of each borelog rasterised by Ghostscript, vs the Python PDF
#
#   MMSB_EXCEL2BORELOG=~/Desktop/mmsb_excel2borelog PYTHON=<python with reportlab, openpyxl, pillow> \
#     pnpm --filter @mmsb/borelog compare
#
# Needs `gs` on PATH. Nothing is written into the Python repo (no bytecode either).
# Expected today: parse 0, paragraph 0, pixels 2 (inside two SPT graph dots — a Bezier
# circle approximation). Any other difference is a change in what the borelog prints.
set -euo pipefail
cd "$(dirname "$0")/.."

: "${MMSB_EXCEL2BORELOG:?set MMSB_EXCEL2BORELOG to the Python repo}"
PYTHON="${PYTHON:-python3}"
DPI="${DPI:-200}"
export PYTHONDONTWRITEBYTECODE=1
shopt -s nullglob
samples=(samples/*.xlsx)
[ ${#samples[@]} -gt 0 ] || { echo "no workbooks in samples/"; exit 1; }

work=out/compare
rm -rf "$work"
mkdir -p "$work/ref" "$work/port" "$work/png/ref" "$work/png/port"
node_run() { node --import ./scripts/register.mjs "$@"; }

echo "== parse"
"$PYTHON" -I scripts/reference/dump_parsed.py "$MMSB_EXCEL2BORELOG" "${samples[@]}" > "$work/parsed-ref.json"
node_run scripts/dumpParsed.ts "${samples[@]}" > "$work/parsed-port.json"
"$PYTHON" -I scripts/reference/compare_json.py "$work/parsed-ref.json" "$work/parsed-port.json"

echo "== paragraph"
"$PYTHON" -I scripts/reference/paragraph_cases.py "$work/parsed-ref.json" "$work/cases.json"
"$PYTHON" -I scripts/reference/paragraph_check.py "$work/cases.json" "$work/paragraph-ref.json"
node_run scripts/paragraphCheck.ts "$work/cases.json" > "$work/paragraph-port.json"
"$PYTHON" -I scripts/reference/compare_json.py "$work/paragraph-ref.json" "$work/paragraph-port.json" "$work/cases.json"

echo "== pixels"
"$PYTHON" -I scripts/reference/render_reference.py "$MMSB_EXCEL2BORELOG" "$PWD/$work/ref" "${samples[@]/#/$PWD/}"
for f in "${samples[@]}"; do node_run scripts/render.ts "$f" "$work/port" --python > /dev/null; done
for pdf in "$work"/ref/*.pdf; do
	name=$(basename "$pdf" .pdf)
	key=$(printf '%s' "$name" | tr -c 'A-Za-z0-9' '_')
	gs -q -sDEVICE=pnggray -r"$DPI" -o "$work/png/ref/$key-%02d.png" "$pdf"
	gs -q -sDEVICE=pnggray -r"$DPI" -o "$work/png/port/$key-%02d.png" "$work/port/$name.pdf"
done
"$PYTHON" -I scripts/reference/pixel_diff.py "$work/png/ref" "$work/png/port"
