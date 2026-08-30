import type { PDFFont } from 'pdf-lib';

import { DEFAULT_LINE_HEIGHT_FACTOR, type FontId, type TextMeasurer } from '../text/measure';

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

export function createPdfLibMeasurer(fonts: EmbeddedFonts): TextMeasurer {
	const pick = (fontId: FontId): PDFFont => fonts[fontId] ?? fonts.regular;

	return {
		widthOf: (text, fontId, sizePt) => pick(fontId).widthOfTextAtSize(text, sizePt),
		lineHeightOf: (fontId, sizePt) => pick(fontId).heightAtSize(sizePt) * DEFAULT_LINE_HEIGHT_FACTOR,
		capHeightOf: (fontId, sizePt) => pick(fontId).heightAtSize(sizePt, { descender: false }),
	};
}
