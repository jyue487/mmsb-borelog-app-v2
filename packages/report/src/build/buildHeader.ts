import type { Borehole } from '@mmsb/core';

import { HEADER_HEIGHT_PT, HAIRLINE_PT, type PageGeometry } from '../layout/pageGeometry';
import type { DrawNode } from '../model/doc';
import type { ReportProject } from '../model/input';
import { box, hRule, labelledLine, line, run, textNode, vRule } from './drawText';
import { fitSingleLine } from '../text/fitTextToBox';
import type { TextMeasurer } from '../text/measure';

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
const PADDING_PT = 6;

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
		x: x + PADDING_PT,
		y: y + (titleBandHeight - LOGO_HEIGHT_PT) / 2,
		w: LOGO_HEIGHT_PT * 2.2,
		h: LOGO_HEIGHT_PT,
	});
	nodes.push(
		textNode(
			[line(run('MAXI MEKAR SDN BHD', TITLE_SIZE_PT, 'bold'))],
			x + PADDING_PT + LOGO_HEIGHT_PT * 2.2 + PADDING_PT,
			y,
			titleWidth - LOGO_HEIGHT_PT * 2.2 - PADDING_PT * 3,
			titleBandHeight,
			TITLE_SIZE_PT * 1.15,
			'center',
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
			'left',
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
	const lineStep = (fieldsHeight - PADDING_PT * 2) / 5;

	// The project title was the one field with `text-overflow: ellipsis`; with real metrics
	// the truncation point can be computed rather than left to the engine.
	const titleLabelWidth = measurer.widthOf('PROJECT: ', 'regular', FIELD_SIZE_PT);
	const projectTitle = fitSingleLine(project.title, leftWidth - titleLabelWidth, FIELD_SIZE_PT, 'bold', measurer);

	const leftFields = [
		labelledLine('PROJECT: ', projectTitle, FIELD_SIZE_PT),
		labelledLine('LOCATION: ', project.location, FIELD_SIZE_PT),
		labelledLine('CLIENT: ', project.client, FIELD_SIZE_PT),
		labelledLine('CONSULTANT: ', project.consultant, FIELD_SIZE_PT),
		line(run('BOREHOLE NO:  ', FIELD_SIZE_PT), run(borehole.name, BOREHOLE_NAME_SIZE_PT, 'bold')),
	];

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

	leftFields.forEach((textLine, index) => {
		nodes.push(
			textNode([textLine], x + PADDING_PT, fieldsY + PADDING_PT + index * lineStep, leftWidth, lineStep, lineStep, 'left', 'middle'),
		);
	});
	rightFields.forEach((textLine, index) => {
		nodes.push(
			textNode([textLine], splitX + PADDING_PT, fieldsY + PADDING_PT + index * lineStep, rightWidth, lineStep, lineStep, 'left', 'middle'),
		);
	});

	return nodes;
}
