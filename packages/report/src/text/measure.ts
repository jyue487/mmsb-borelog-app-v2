/**
 * Text measurement, decoupled from pdf-lib.
 *
 * The whole point of leaving HTML was to stop guessing text size from `description.length`
 * and start measuring it. But the model layer must stay platform-free, so it talks to this
 * interface rather than to a `PDFFont` — which also means the layout can be exercised in
 * Node with a stub measurer, no PDF and no device involved.
 */

export type FontId = 'regular' | 'bold' | 'italic';

export interface TextMeasurer {
	/** Advance width of `text` at `sizePt`, in points. */
	widthOf(text: string, fontId: FontId, sizePt: number): number;
	/** Distance between baselines at `sizePt`, in points. */
	lineHeightOf(fontId: FontId, sizePt: number): number;
	/** Cap height at `sizePt`, for vertical centring. */
	capHeightOf(fontId: FontId, sizePt: number): number;
}

/** Matches the old stylesheet's `--base-line-height`. */
export const DEFAULT_LINE_HEIGHT_FACTOR = 1.15;

/**
 * A measurer for tests and snapshots: every glyph is a fixed fraction of the point size.
 * Deliberately crude — it exists so pagination and wrapping can be exercised without
 * embedding a font, not to approximate NotoSans.
 */
export function createFixedWidthMeasurer(widthFactor = 0.5): TextMeasurer {
	return {
		widthOf: (text, _fontId, sizePt) => text.length * widthFactor * sizePt,
		lineHeightOf: (_fontId, sizePt) => sizePt * DEFAULT_LINE_HEIGHT_FACTOR,
		capHeightOf: (_fontId, sizePt) => sizePt * 0.7,
	};
}
