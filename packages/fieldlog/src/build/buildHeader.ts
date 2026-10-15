import type { Borehole } from '@mmsb/core';

import { HEADER_HEIGHT_PT, HAIRLINE_PT, type PageGeometry } from '../layout/pageGeometry';
import type { DrawNode } from '../model/doc';
import type { ReportProject } from '../model/input';
import { box, hRule, labelledLine, line, run, textNode, vRule } from './drawText';
import { fitSingleLine } from '../text/fitSingleLine';
import { breakIntoLines } from '../text/lineBreak';
import { DEFAULT_LINE_HEIGHT_FACTOR, type TextMeasurer } from '../text/measure';

/**
 * The page header: logo, company name, sheet number, and the two metadata columns.
 *
 * Ported from `renderHeaderToHtml.ts`. The old version nested tables inside a table and
 * relied on `vertical-align` and `display: inline-block` to place things; here the same
 * layout is a handful of coordinates, which is both shorter and unambiguous.
 *
 * The logo is referenced by id, not embedded here — the backend embeds it once per document
 * and reuses the handle. The old renderer inlined a 604 KB base64 PNG on *every page*, so a
 * 12-page log carried ~8 MB of duplicated image before any content.
 */

const TITLE_SIZE_PT = 15;
const SHEET_SIZE_PT = 9;
const FIELD_SIZE_PT = 7;
const BOREHOLE_NAME_SIZE_PT = 12;
const LOGO_HEIGHT_PT = 26;
/**
 * The logo's own proportions (the asset is 512x257). The box has to match them: the backend
 * fits an image inside its box and centres it, so a box of the wrong shape pads the logo
 * with slack that then reads as a gap between it and the wordmark.
 */
const LOGO_WIDTH_PT = LOGO_HEIGHT_PT * 1.99;
/** Logo and wordmark are one lockup in the corner, not two things at opposite ends of a band. */
const LOGO_INSET_PT = 3;
const LOGO_GAP_PT = 4;
const PADDING_PT = 6;
/** How far `PROJECT:` may wrap before it goes back to ellipsising. */
const PROJECT_TITLE_MAX_LINES = 3;
const PROJECT_TITLE_LEADING_PT = FIELD_SIZE_PT * DEFAULT_LINE_HEIGHT_FACTOR;

/**
 * The project title, wrapped to at most three lines of 7pt bold.
 *
 * Deliberately NOT routed through `parseRichText`: a title is user-typed plain text, and a
 * `<` in one is a character, not the start of a tag. `breakIntoLines` still does the wrapping
 * — it is the same greedy pass the description cells use, so a single word wider than the
 * column is split rather than left to overflow.
 *
 * Anything past the third line collapses back into one string and goes through
 * `fitSingleLine`, so the ellipsis this field has always had survives; it just happens two
 * lines later than it used to.
 */
function wrapProjectTitle(title: string, maxWidthPt: number, measurer: TextMeasurer): string[] {
	const laidOut = breakIntoLines(
		[{ kind: 'text', text: title, italic: false, bold: true }],
		maxWidthPt,
		FIELD_SIZE_PT,
		measurer,
	);
	// One run per line, since the whole title is a single style.
	const texts = laidOut.map((laidOutLine) => laidOutLine.runs.map((textRun) => textRun.text).join(''));

	// `breakIntoLines` returns nothing at all for an empty title; the field still needs its label.
	if (texts.length === 0) {
		return [''];
	}
	if (texts.length <= PROJECT_TITLE_MAX_LINES) {
		return texts;
	}
	const kept = texts.slice(0, PROJECT_TITLE_MAX_LINES - 1);
	kept.push(
		fitSingleLine(texts.slice(PROJECT_TITLE_MAX_LINES - 1).join(' '), maxWidthPt, FIELD_SIZE_PT, 'bold', measurer),
	);
	return kept;
}

export function buildHeader(
	project: ReportProject,
	borehole: Borehole,
	geometry: PageGeometry,
	pageNumber: number,
	totalPages: number,
	measurer: TextMeasurer,
): DrawNode[] {
	const nodes: DrawNode[] = [];
	const x = geometry.contentX;
	const y = geometry.headerY;
	const width = geometry.contentWidthPt;

	nodes.push(box(x, y, width, HEADER_HEIGHT_PT, HAIRLINE_PT));

	// --- top band: logo + company name, then the sheet counter -----------------------------
	const titleBandHeight = 34;
	// 55% split, as in the old `<td style="width: 55%">`.
	const titleWidth = width * 0.55;

	nodes.push({
		kind: 'image',
		imageId: 'logo',
		x: x + LOGO_INSET_PT,
		y: y + LOGO_INSET_PT,
		w: LOGO_WIDTH_PT,
		h: LOGO_HEIGHT_PT,
	});
	const wordmarkX = x + LOGO_INSET_PT + LOGO_WIDTH_PT + LOGO_GAP_PT;
	nodes.push(
		textNode(
			[line(run('MAXI MEKAR SDN BHD', TITLE_SIZE_PT, 'bold'))],
			wordmarkX,
			y,
			x + titleWidth - wordmarkX - PADDING_PT,
			titleBandHeight,
			TITLE_SIZE_PT * 1.15,
			'left',
			'middle',
		),
	);
	nodes.push(
		textNode(
			[line(run(`SHEET   ${pageNumber}   of   ${totalPages}`, SHEET_SIZE_PT))],
			x + titleWidth + PADDING_PT,
			y,
			width - titleWidth - PADDING_PT * 2,
			titleBandHeight,
			SHEET_SIZE_PT * 1.15,
			'center',
			'middle',
		),
	);

	nodes.push(hRule(x, y + titleBandHeight, width, HAIRLINE_PT));
	nodes.push(vRule(x + titleWidth, y, titleBandHeight, HAIRLINE_PT));

	// --- lower band: two metadata columns ---------------------------------------------------
	const fieldsY = y + titleBandHeight;
	const fieldsHeight = HEADER_HEIGHT_PT - titleBandHeight;
	const splitX = x + width * 0.55;
	nodes.push(vRule(splitX, fieldsY, fieldsHeight, HAIRLINE_PT));

	const leftWidth = splitX - x - PADDING_PT * 2;
	const rightWidth = x + width - splitX - PADDING_PT * 2;
	const usableHeight = fieldsHeight - PADDING_PT * 2;
	const lineStep = usableHeight / 5;

	// The project title was the one field with `text-overflow: ellipsis`; with real metrics the
	// wrap points can be computed rather than left to the engine, so it now takes up to three
	// lines instead of being cut off at one.
	//
	// The extra lines come out of the OTHER fields' leading, never out of HEADER_HEIGHT_PT:
	// that constant feeds BODY_HEIGHT_PT and so TICK_PITCH_PT, and growing it would shorten
	// every description box on every page of every report. The four 7pt fields sit at a very
	// loose 1.89x leading and can afford it; BOREHOLE NO keeps a full `lineStep` because its
	// value is set at 12pt and does not fit in less. So `fieldStep` falls back to exactly
	// `lineStep` when the title fits on one line, which keeps short-title logs byte-identical.
	const titleLabelWidth = measurer.widthOf('PROJECT: ', 'regular', FIELD_SIZE_PT);
	const titleWrapWidth = leftWidth - titleLabelWidth;
	const titleLines = wrapProjectTitle(project.title, titleWrapWidth, measurer);
	const extraTitleLines = titleLines.length - 1;
	const fieldStep = (usableHeight - lineStep - extraTitleLines * PROJECT_TITLE_LEADING_PT) / 4;

	let cursorY = fieldsY + PADDING_PT;

	nodes.push(
		textNode(
			[labelledLine('PROJECT: ', titleLines[0], FIELD_SIZE_PT)],
			x + PADDING_PT,
			cursorY,
			leftWidth,
			fieldStep,
			fieldStep,
			'left',
			'middle',
		),
	);
	cursorY += fieldStep;

	if (extraTitleLines > 0) {
		// Hanging indent: continuation lines start under the value, not under the label, so the
		// three lines read as one field rather than as three unlabelled ones.
		nodes.push(
			textNode(
				titleLines.slice(1).map((text) => line(run(text, FIELD_SIZE_PT, 'bold'))),
				x + PADDING_PT + titleLabelWidth,
				cursorY,
				titleWrapWidth,
				extraTitleLines * PROJECT_TITLE_LEADING_PT,
				PROJECT_TITLE_LEADING_PT,
				'left',
				'middle',
			),
		);
		cursorY += extraTitleLines * PROJECT_TITLE_LEADING_PT;
	}

	for (const textLine of [
		labelledLine('LOCATION: ', project.location, FIELD_SIZE_PT),
		labelledLine('CLIENT: ', project.client, FIELD_SIZE_PT),
		labelledLine('CONSULTANT: ', project.consultant, FIELD_SIZE_PT),
	]) {
		nodes.push(textNode([textLine], x + PADDING_PT, cursorY, leftWidth, fieldStep, fieldStep, 'left', 'middle'));
		cursorY += fieldStep;
	}

	nodes.push(
		textNode(
			[line(run('BOREHOLE NO:  ', FIELD_SIZE_PT), run(borehole.name, BOREHOLE_NAME_SIZE_PT, 'bold'))],
			x + PADDING_PT,
			cursorY,
			leftWidth,
			lineStep,
			lineStep,
			'left',
			'middle',
		),
	);

	const groundLevel =
		borehole.reducedLevelInMetres === null ? '' : `${borehole.reducedLevelInMetres.toFixed(3)}m (RL)`;
	// Blank unless BOTH coordinates are present, as before.
	const coordinate =
		borehole.eastingInMetres === null || borehole.northingInMetres === null
			? ''
			: `(${borehole.eastingInMetres.toFixed(3)}E, ${borehole.northingInMetres.toFixed(3)}N)`;

	const rightFields = [
		labelledLine('TYPE OF BORING: ', borehole.typeOfBoring, FIELD_SIZE_PT),
		labelledLine('TYPE OF RIG: ', borehole.typeOfRig, FIELD_SIZE_PT),
		labelledLine('DIA. OF BORING: ', borehole.diameterOfBoring, FIELD_SIZE_PT),
		labelledLine('GROUND LEVEL: ', groundLevel, FIELD_SIZE_PT),
		labelledLine('COORDINATE: ', coordinate, FIELD_SIZE_PT),
	];

	// The right column is five uniform slots, as it always was — only the left one has a field
	// that can grow, so only it needs a cursor. The two columns stay level while the title fits
	// on one line and drift apart when it does not, which is the price of not growing the band.
	rightFields.forEach((textLine, index) => {
		nodes.push(
			textNode([textLine], splitX + PADDING_PT, fieldsY + PADDING_PT + index * lineStep, rightWidth, lineStep, lineStep, 'left', 'middle'),
		);
	});

	return nodes;
}
