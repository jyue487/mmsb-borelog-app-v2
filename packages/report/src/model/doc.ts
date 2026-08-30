import type { FontId } from '../text/measure';
import type { HAlign, VAlign } from './table';

/**
 * The geometric tier: everything resolved to coordinates, ready for a backend to draw.
 *
 * COORDINATE SYSTEM: origin top-left, y increases DOWNWARD — the way the report is
 * authored and read. PDF's native space is bottom-left with y increasing upward, so the
 * backend flips exactly once, at the point of drawing:
 *
 *     pdfY = pageHeightPt - y - height
 *
 * Doing the flip in one place is deliberate. Mixing the two conventions is the single most
 * likely source of silent off-by-a-page-height bugs in this layer.
 *
 * A ReportDoc is plain JSON — no functions, no font handles, no pdf-lib types. That is what
 * makes a whole report snapshot-testable in Node with no device and no PDF.
 */

export interface TextRun {
	text: string;
	fontId: FontId;
	sizePt: number;
}

export interface TextLine {
	runs: TextRun[];
}

export type DrawNode =
	| { kind: 'line'; x1: number; y1: number; x2: number; y2: number; thicknessPt: number }
	| { kind: 'rect'; x: number; y: number; w: number; h: number; thicknessPt: number }
	| {
			kind: 'text';
			x: number;
			y: number;
			w: number;
			h: number;
			lines: TextLine[];
			leadingPt: number;
			align: HAlign;
			valign: VAlign;
			/** Rotated 90° for the vertical SCALE label. */
			rotate?: 90;
	  }
	| { kind: 'image'; imageId: 'logo' | 'signature'; x: number; y: number; w: number; h: number };

export interface ReportPage {
	pageNumber: number;
	totalPages: number;
	nodes: DrawNode[];
}

export type ReportWarning =
	| { kind: 'descriptionClipped'; pageNumber: number; startTick: number }
	| { kind: 'negativeBlockHeight'; blockId: string; startTick: number }
	| { kind: 'pageBudgetExhausted'; pageNumber: number };

export interface ReportDoc {
	pageWidthPt: number;
	pageHeightPt: number;
	/** pageNumber/totalPages already resolved — no second pass, no thunks. */
	pages: ReportPage[];
	warnings: ReportWarning[];
}
