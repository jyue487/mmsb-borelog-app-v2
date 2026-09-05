import type { Borehole } from '@mmsb/core';

import { FOOTER_HEIGHT_PT, HAIRLINE_PT, type PageGeometry } from '../layout/pageGeometry';
import type { DrawNode, ImageId } from '../model/doc';
import type { HAlign } from '../model/table';
import { getDate } from '../format/datetime';
import type { FontId, TextMeasurer } from '../text/measure';
import { box, hRule, line, run, textNode, vRule } from './drawText';

/**
 * The page footer: the sample-symbol legend, the two N-value consistency tables, and the
 * two sign-off columns — the checker (which also carries the drilling facts) and the verifier.
 *
 * Ported from `renderFooterToHtml.ts`. Everything but the two sign-off columns is static, so
 * most of this file is the same constant text the old renderer inlined as HTML.
 */

const SMALL_PT = 4.5;
const LABEL_PT = 5;

/**
 * Row pitch in the two sign-off columns.
 *
 * The driller block used to sit at `SMALL_PT * 3.4` while the signature block next to it used
 * `* 2.5`; now that both columns carry a name, a `Signature:` label, an image and a date, they
 * share one pitch — six rows plus an image is exactly what FOOTER_HEIGHT_PT holds.
 */
const LINE_STEP_PT = SMALL_PT * 2.5;

const SYMBOL_LEGEND: readonly [string, string][] = [
	['P', 'Standard Penetration Test (SPT)'],
	['UD', '50mm dia. undisturbed sample'],
	['PS', 'Piston Sample'],
	['MZ', 'Mazier Sample'],
	['D', 'Disturbed Sample'],
	['VS', 'Vane Shear Test'],
	['W', 'Water Sample'],
	['C', 'Core Sample (Rock)'],
];

/**
 * `[lower bound, upper bound, term]`, where a null upper bound is an open-ended row.
 *
 * Split rather than written as `'0 - 2'` because the dash is a column, not punctuation: the
 * rows align on it, with exactly one space either side. A pre-joined string cannot be
 * aligned without being taken apart again.
 */
type ConsistencyRow = readonly [string, string | null, string];

const COHESIVE: readonly ConsistencyRow[] = [
	['0', '2', 'Very Soft'],
	['2', '4', 'Soft'],
	['4', '8', 'Firm'],
	['8', '15', 'Stiff'],
	['15', '30', 'Very Stiff'],
	['> 30', null, 'Hard'],
];

const NON_COHESIVE: readonly ConsistencyRow[] = [
	['0', '4', 'Very Loose'],
	['4', '10', 'Loose'],
	['10', '30', 'Medium Dense'],
	['30', '50', 'Dense'],
	['> 50', null, 'Very Dense'],
];

/** One row of a block aligned on a shared separator; see `pivotedBlock`. */
interface PivotedRow {
	/** Right-aligned into the separator column. */
	left: string;
	/** Left-aligned out of it, or null for a row with no separator at all. */
	right: string | null;
	/** An optional third column, left-aligned after the widest `right`. */
	trailing: string;
}

/**
 * A block of one-line rows aligned on a shared separator — `P = Standard Penetration Test`,
 * `8 - 15  Stiff`.
 *
 * The separator sits in a column of its own with exactly one space of the real font on each
 * side of it, the left parts right-aligned into that column and the right parts left-aligned
 * out of it. The block is then centred as a whole, so the legend reads as one object rather
 * than as text abandoned against the left edge of its cell. A row with no separator (`> 30`)
 * is right-aligned across the pair, which puts it under the upper bounds where it belongs.
 */
function pivotedBlock(
	rows: readonly PivotedRow[],
	separator: string,
	leftFontId: FontId,
	colX: number,
	colW: number,
	topY: number,
	stepPt: number,
	sizePt: number,
	measurer: TextMeasurer,
): DrawNode[] {
	const widthOf = (text: string, fontId: FontId = 'regular') => measurer.widthOf(text, fontId, sizePt);
	const spaceW = widthOf(' ');
	const separatorW = widthOf(separator);

	const paired = rows.filter((row) => row.right !== null);
	const leftW = Math.max(0, ...paired.map((row) => widthOf(row.left, leftFontId)));
	const rightW = Math.max(0, ...paired.map((row) => widthOf(row.right as string)));
	const trailingW = Math.max(0, ...rows.map((row) => widthOf(row.trailing)));

	const pairW = Math.max(
		leftW + spaceW + separatorW + spaceW + rightW,
		...rows.filter((row) => row.right === null).map((row) => widthOf(row.left, leftFontId)),
	);
	const gapW = trailingW === 0 ? 0 : spaceW * 2;
	const blockX = colX + (colW - (pairW + gapW + trailingW)) / 2;
	const separatorX = blockX + leftW + spaceW;

	const nodes: DrawNode[] = [];
	rows.forEach((row, index) => {
		const rowY = topY + index * stepPt;
		const put = (text: string, textX: number, textW: number, align: HAlign, fontId: FontId = 'regular') => {
			if (text === '') return;
			nodes.push(textNode([line(run(text, sizePt, fontId))], textX, rowY, textW, stepPt, stepPt, align));
		};
		if (row.right === null) {
			put(row.left, blockX, pairW, 'right', leftFontId);
		} else {
			put(row.left, blockX, leftW, 'right', leftFontId);
			put(separator, separatorX, separatorW, 'left');
			put(row.right, separatorX + separatorW + spaceW, rightW, 'left');
		}
		put(row.trailing, blockX + pairW + gapW, trailingW, 'left');
	});
	return nodes;
}

export function buildFooter(
	borehole: Borehole,
	geometry: PageGeometry,
	dateStarted: Date | null,
	dateFinished: Date | null,
	measurer: TextMeasurer,
): DrawNode[] {
	const nodes: DrawNode[] = [];
	const x = geometry.contentX;
	const y = geometry.footerY;
	const width = geometry.contentWidthPt;
	const padding = 4;

	nodes.push(box(x, y, width, FOOTER_HEIGHT_PT, HAIRLINE_PT));

	// Four columns, matching the old widths (26% / 14% / 17% / rest split in two).
	const notesW = width * 0.26;
	const cohesiveW = width * 0.14;
	const nonCohesiveW = width * 0.17;
	const drillerW = (width - notesW - cohesiveW - nonCohesiveW) * 0.45;

	const notesX = x;
	const cohesiveX = notesX + notesW;
	const nonCohesiveX = cohesiveX + cohesiveW;
	const drillerX = nonCohesiveX + nonCohesiveW;
	const signatureX = drillerX + drillerW;

	for (const divider of [cohesiveX, nonCohesiveX, drillerX, signatureX]) {
		nodes.push(vRule(divider, y, FOOTER_HEIGHT_PT, HAIRLINE_PT));
	}

	const heading = (text: string, colX: number, colW: number) => {
		nodes.push(
			textNode([line(run(text, LABEL_PT, 'bold'))], colX + padding, y + padding, colW - padding * 2, LABEL_PT * 1.3, LABEL_PT * 1.3, 'center'),
		);
		nodes.push(hRule(colX, y + padding * 2 + LABEL_PT, colW, HAIRLINE_PT * 0.7));
	};

	// --- NOTES: the sample-symbol legend ----------------------------------------------------
	heading('NOTES:', notesX, notesW);
	const legendTop = y + padding * 3 + LABEL_PT;
	const legendStep = SMALL_PT * 1.5;
	nodes.push(
		...pivotedBlock(
			SYMBOL_LEGEND.map(([symbol, meaning]) => ({ left: symbol, right: meaning, trailing: '' })),
			'=',
			'bold',
			notesX + padding,
			notesW - padding * 2,
			legendTop,
			legendStep,
			SMALL_PT,
			measurer,
		),
	);

	// --- the two N-value tables --------------------------------------------------------------
	const consistencyTable = (title: string, rows: readonly ConsistencyRow[], colX: number, colW: number) => {
		heading(title, colX, colW);
		nodes.push(
			...pivotedBlock(
				rows.map(([low, high, term]) => ({ left: low, right: high, trailing: term })),
				'-',
				'regular',
				colX + padding,
				colW - padding * 2,
				legendTop,
				legendStep,
				SMALL_PT,
				measurer,
			),
		);
	};
	consistencyTable('Cohesive Soil (N)', COHESIVE, cohesiveX, cohesiveW);
	consistencyTable('Non Cohesive Soil (N)', NON_COHESIVE, nonCohesiveX, nonCohesiveW);

	// --- the two sign-off columns --------------------------------------------------------------
	//
	// Both are a stack of one-line rows at LINE_STEP_PT, with the signature image sitting in
	// the band the rows leave over. `Signature:` labels its image from the line above rather
	// than beside it, so the ink gets the column's full usable width.
	const signatureW = x + width - signatureX;

	/** The empty band a column leaves for its signature, once its rows are placed. */
	interface SignatureBand {
		x: number;
		y: number;
		w: number;
		h: number;
	}

	/**
	 * Draws one column's rows and returns the band left over for its signature: the full
	 * usable width, and everything between the last row above and the date row below.
	 */
	const signOffColumn = (
		colX: number,
		colW: number,
		rowsAbove: string[],
		dateRow: string,
	): SignatureBand => {
		rowsAbove.forEach((text, index) => {
			nodes.push(
				textNode(
					[line(run(text, SMALL_PT))],
					colX + padding,
					y + padding + index * LINE_STEP_PT,
					colW - padding * 2,
					LINE_STEP_PT,
					LINE_STEP_PT,
				),
			);
		});
		// The date is bottom-anchored so it lines up across both columns regardless of how
		// many rows sit above the image.
		const dateY = y + FOOTER_HEIGHT_PT - padding - LINE_STEP_PT;
		nodes.push(
			textNode(
				[line(run(dateRow, SMALL_PT))],
				colX + padding,
				dateY,
				colW - padding * 2,
				LINE_STEP_PT,
				LINE_STEP_PT,
			),
		);
		const bandY = y + padding + rowsAbove.length * LINE_STEP_PT;
		return { x: colX + padding, y: bandY, w: colW - padding * 2, h: dateY - bandY };
	};

	const checkerBand = signOffColumn(
		drillerX,
		drillerW,
		[
			`Driller: ${borehole.drillerName}`,
			`Date Started: ${dateStarted === null ? '' : getDate(dateStarted)}`,
			`Date Finished: ${dateFinished === null ? '' : getDate(dateFinished)}`,
			`Checked by: ${borehole.checkerName}`,
			'Signature:',
		],
		`Date: ${borehole.checkerSignDate === null ? '' : getDate(borehole.checkerSignDate)}`,
	);
	const verifierBand = signOffColumn(
		signatureX,
		signatureW,
		[`Verified by: ${borehole.verifierName}`, 'Signature:'],
		`Date: ${borehole.verifierSignDate === null ? '' : getDate(borehole.verifierSignDate)}`,
	);

	// Both signatures are drawn into a box of the SAME height, centred in whatever band their
	// column left. The checker column carries the drilling facts above its sign-off, so its
	// band is less than half the verifier's; letting each image fill its own band printed the
	// two sign-offs at visibly different scales. Since the renderer fits an image inside its
	// box preserving aspect ratio, an equal height means an equal scale for any signature
	// narrower than the shorter band's width-to-height ratio — which trimmed captures are.
	const signatureBoxH = Math.min(checkerBand.h, verifierBand.h);
	const signature = (band: SignatureBand, imageId: ImageId): DrawNode => ({
		kind: 'image',
		imageId,
		x: band.x,
		y: band.y + (band.h - signatureBoxH) / 2,
		w: band.w,
		h: signatureBoxH,
	});

	if (borehole.checkerSignatureBase64.length > 0) {
		nodes.push(signature(checkerBand, 'checkerSignature'));
	}
	if (borehole.verifierSignatureBase64.length > 0) {
		nodes.push(signature(verifierBand, 'verifierSignature'));
	}

	return nodes;
}
