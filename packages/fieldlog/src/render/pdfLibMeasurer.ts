import type { PDFFont } from 'pdf-lib';

import type { FontId, TextMeasurer } from '../text/measure';

/**
 * Adapts embedded pdf-lib fonts to the platform-free TextMeasurer interface.
 *
 * This is the only place the model layer's measurements meet a real font, and it is why
 * the layout is identical on every device: `widthOfTextAtSize` is computed from the
 * embedded font's own metric tables, not from the host's text engine. The Stage 0 spike
 * confirmed the same call returns `147.985500` on Hermes, in Chrome and in Node.
 */
export interface EmbeddedFonts {
	regular: PDFFont;
	bold: PDFFont;
	/** Falls back to `regular` until NotoSans-Italic is added; see the Stage 3 decision. */
	italic: PDFFont;
}

/** NotoSans' own ratio, used only if pdf-lib's internals move under us. */
const FALLBACK_CAP_HEIGHT_RATIO = 0.714;

/**
 * Cap height as a fraction of the em, read from the font's own OS/2 table.
 *
 * pdf-lib exposes no accessor for it, and the obvious stand-in is wrong:
 * `heightAtSize(size, { descender: false })` returns the ASCENDER, which for NotoSans is
 * 1.069 em against a cap height of 0.714 em. Every vertical placement in the report is
 * expressed against the cap box, so the ascender pushed text down by 0.355 em — 2.5pt at
 * body size. That is why the SPT divide rule sat hard under the blow count instead of
 * midway to the penetration below it, and why "top-aligned" columns lined up by a quantity
 * proportional to their type size, which is to say not aligned at all.
 *
 * `embedder.font` is the fontkit font pdf-lib parsed; reaching for it is the price of the
 * metric being right, and the fallback keeps a future pdf-lib from breaking the layout.
 */
function capHeightRatio(font: PDFFont): number {
	const parsed = (font as unknown as { embedder?: { font?: { capHeight?: number; unitsPerEm?: number } } }).embedder?.font;
	if (parsed?.capHeight === undefined || !parsed.unitsPerEm) {
		return FALLBACK_CAP_HEIGHT_RATIO;
	}
	return parsed.capHeight / parsed.unitsPerEm;
}

export function createPdfLibMeasurer(fonts: EmbeddedFonts): TextMeasurer {
	const pick = (fontId: FontId): PDFFont => fonts[fontId] ?? fonts.regular;
	// Parsed once per document, not once per line of text.
	const capRatios: Record<FontId, number> = {
		regular: capHeightRatio(pick('regular')),
		bold: capHeightRatio(pick('bold')),
		italic: capHeightRatio(pick('italic')),
	};

	return {
		widthOf: (text, fontId, sizePt) => pick(fontId).widthOfTextAtSize(text, sizePt),
		capHeightOf: (fontId, sizePt) => capRatios[fontId] * sizePt,
	};
}
