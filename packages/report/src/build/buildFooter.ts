import type { Borehole } from '@mmsb/core';

import { FOOTER_HEIGHT_PT, HAIRLINE_PT, type PageGeometry } from '../layout/pageGeometry';
import type { DrawNode } from '../model/doc';
import { LOGGED_BY_NAME } from '../model/input';
import { getDate } from '../format/datetime';
import { box, hRule, line, run, textNode, vRule } from './drawText';

/**
 * The page footer: the sample-symbol legend, the two N-value consistency tables, the
 * driller block and the signature block.
 *
 * Ported from `renderFooterToHtml.ts`. All of it is static except six values, so most of
 * this file is the same constant text the old renderer inlined as HTML.
 */

const SMALL_PT = 4.5;
const LABEL_PT = 5;

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

const COHESIVE: readonly [string, string][] = [
	['0 - 2', 'Very Soft'],
	['2 - 4', 'Soft'],
	['4 - 8', 'Firm'],
	['8 - 15', 'Stiff'],
	['15 - 30', 'Very Stiff'],
	['> 30', 'Hard'],
];

const NON_COHESIVE: readonly [string, string][] = [
	['0 - 4', 'Very Loose'],
	['4 - 10', 'Loose'],
	['10 - 30', 'Medium Dense'],
	['30 - 50', 'Dense'],
	['> 50', 'Very Dense'],
];

export function buildFooter(
	borehole: Borehole,
	geometry: PageGeometry,
	dateStarted: Date | null,
	dateFinished: Date | null,
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
		nodes.push(textNode([line(run(text, LABEL_PT, 'bold'))], colX + padding, y + padding, colW - padding * 2, LABEL_PT * 1.3, LABEL_PT * 1.3));
		nodes.push(hRule(colX, y + padding * 2 + LABEL_PT, colW, HAIRLINE_PT * 0.7));
	};

	// --- NOTES: the sample-symbol legend ----------------------------------------------------
	heading('NOTES:', notesX, notesW);
	const legendTop = y + padding * 3 + LABEL_PT;
	const legendStep = SMALL_PT * 1.5;
	SYMBOL_LEGEND.forEach(([symbol, meaning], index) => {
		const rowY = legendTop + index * legendStep;
		nodes.push(textNode([line(run(symbol, SMALL_PT, 'bold'))], notesX + padding, rowY, 16, legendStep, legendStep));
		nodes.push(textNode([line(run(`= ${meaning}`, SMALL_PT))], notesX + padding + 18, rowY, notesW - padding * 2 - 18, legendStep, legendStep));
	});

	// --- the two N-value tables --------------------------------------------------------------
	const consistencyTable = (
		title: string,
		rows: readonly [string, string][],
		colX: number,
		colW: number,
	) => {
		heading(title, colX, colW);
		rows.forEach(([range, term], index) => {
			const rowY = legendTop + index * legendStep;
			nodes.push(textNode([line(run(range, SMALL_PT))], colX + padding, rowY, colW * 0.42, legendStep, legendStep, 'right'));
			nodes.push(textNode([line(run(term, SMALL_PT))], colX + padding + colW * 0.45, rowY, colW * 0.55 - padding, legendStep, legendStep));
		});
	};
	consistencyTable('Cohesive Soil (N)', COHESIVE, cohesiveX, cohesiveW);
	consistencyTable('Non Cohesive Soil (N)', NON_COHESIVE, nonCohesiveX, nonCohesiveW);

	// --- driller block ------------------------------------------------------------------------
	const drillerLines = [
		`Driller: ${borehole.drillerName}`,
		// Hardcoded upstream at renderFooterToHtml.ts:21 — see LOGGED_BY_NAME for why it stays.
		`Logged by: ${LOGGED_BY_NAME}`,
		`Date Started: ${dateStarted === null ? '' : getDate(dateStarted)}`,
		`Date Finished: ${dateFinished === null ? '' : getDate(dateFinished)}`,
	];
	drillerLines.forEach((text, index) => {
		nodes.push(
			textNode(
				[line(run(text, SMALL_PT))],
				drillerX + padding,
				y + padding + index * (SMALL_PT * 3.4),
				drillerW - padding * 2,
				SMALL_PT * 3.4,
				SMALL_PT * 3.4,
			),
		);
	});

	// --- signature block -----------------------------------------------------------------------
	const signatureW = x + width - signatureX;
	nodes.push(
		textNode(
			[line(run(`Checked by: ${borehole.verifierName}`, SMALL_PT))],
			signatureX + padding,
			y + padding,
			signatureW - padding * 2,
			SMALL_PT * 2.5,
			SMALL_PT * 2.5,
		),
	);
	nodes.push(
		textNode(
			[line(run('Signature:', SMALL_PT))],
			signatureX + padding,
			y + padding + SMALL_PT * 2.5,
			signatureW * 0.3,
			SMALL_PT * 2.5,
			SMALL_PT * 2.5,
		),
	);
	if (borehole.verifierSignatureBase64.length > 0) {
		const signatureBoxY = y + padding + SMALL_PT * 4;
		const signatureBoxH = FOOTER_HEIGHT_PT - (signatureBoxY - y) - SMALL_PT * 4 - padding;
		nodes.push({
			kind: 'image',
			imageId: 'signature',
			x: signatureX + signatureW * 0.32,
			y: signatureBoxY,
			w: signatureW * 0.62,
			h: signatureBoxH,
		});
	}
	nodes.push(
		textNode(
			[line(run(`Date: ${borehole.verifierSignDate === null ? '' : getDate(borehole.verifierSignDate)}`, SMALL_PT))],
			signatureX + padding,
			y + FOOTER_HEIGHT_PT - SMALL_PT * 3,
			signatureW - padding * 2,
			SMALL_PT * 2.5,
			SMALL_PT * 2.5,
		),
	);

	return nodes;
}
