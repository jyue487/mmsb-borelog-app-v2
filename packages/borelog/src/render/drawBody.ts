import type { PDFImage } from 'pdf-lib';

import type { BoreholeInformation } from '../model';
import type { Canvas } from './canvas';
import * as cfg from './config';
import { mm } from './config';
import { Paragraph, ShrinkToFit } from './paragraph';

/** `logics/draw/draw_body.py` */

const REMARKS_FONT_SIZE = 8;
const REMARKS_TOP_PADDING = REMARKS_FONT_SIZE;
const COLUMN_HEADER_FONT_SIZE = 7;
/** reportlab `TableStyle` FONT with no leading: 1.2 × size. */
const COLUMN_HEADER_LEADING = COLUMN_HEADER_FONT_SIZE * 1.2;
/** Helvetica's AFM ascender and descender, per 1000 units. */
const HELVETICA_ASCENT = 718;
const HELVETICA_DESCENT = -207;

const COLUMN_WIDTHS = [
	cfg.DATETIME_COLUMN_WIDTH,
	cfg.WL_COLUMN_WIDTH,
	cfg.DEPTH1_COLUMN_WIDTH,
	cfg.TYPE_COLUMN_WIDTH,
	cfg.RESULTSLEFT_COLUMN_WIDTH,
	cfg.RESULTS_COLUMN_WIDTH,
	cfg.RESULTSRIGHT_COLUMN_WIDTH,
	cfg.DEPTH2_COLUMN_WIDTH,
	cfg.SAMPLEREC_COLUMN_WIDTH,
	cfg.LEGEND_COLUMN_WIDTH,
	cfg.GRAPH_COLUMN_WIDTH,
	cfg.STRATUMDESC_COLUMN_WIDTH,
];
const ROW_HEIGHTS = [cfg.SAMPLES_AND_IN_SITU_TESTING_CELL_HEIGHT, cfg.TYPE_CELL_HEIGHT];

type HeaderCell = string | { markup: string };

/** The two-row column header: [col, row] to [col, row] spans, and what each holds. */
const COLUMN_HEADER_CELLS: { from: [number, number]; to: [number, number]; value: HeaderCell }[] = [
	{ from: [0, 0], to: [0, 1], value: 'Date/Time' },
	{ from: [1, 0], to: [1, 1], value: 'WL' },
	{ from: [2, 0], to: [6, 0], value: 'Samples & In Situ Testing' },
	{ from: [7, 0], to: [7, 1], value: { markup: "<para align='center'>Depth<br/>(m)</para>" } },
	{ from: [8, 0], to: [8, 1], value: { markup: "<para align='center'>Sample<br/>Rec(%)</para>" } },
	{ from: [9, 0], to: [9, 1], value: 'Legend' },
	{ from: [10, 0], to: [10, 1], value: '' },
	{ from: [11, 0], to: [11, 1], value: 'Stratum Description' },
	{ from: [2, 1], to: [2, 1], value: 'Depth(m)' },
	{ from: [3, 1], to: [3, 1], value: 'Type' },
	{ from: [4, 1], to: [6, 1], value: '' },
];

/**
 * reportlab's `Table` for `make_column_header_table`: every cell centred and middle-aligned
 * with no padding, a 0.6 pt grid that skips the inside of spans, drawn after the cells.
 */
function drawColumnHeaderTable(c: Canvas, x: number, top: number): number {
	const colLefts = COLUMN_WIDTHS.reduce<number[]>((acc, w) => [...acc, acc[acc.length - 1] + w], [x]);
	const rowTops = ROW_HEIGHTS.reduce<number[]>((acc, h) => [...acc, acc[acc.length - 1] - h], [top]);
	const height = ROW_HEIGHTS.reduce((a, b) => a + b, 0);

	c.saveState();
	c.setFillColor([0, 0, 0]);
	c.setFont('Helvetica', COLUMN_HEADER_FONT_SIZE);
	const rects = COLUMN_HEADER_CELLS.map(({ from, to, value }) => {
		const left = colLefts[from[0]];
		const width = colLefts[to[0] + 1] - left;
		const bottom = rowTops[to[1] + 1];
		const rowHeight = rowTops[from[1]] - bottom;
		if (typeof value === 'string') {
			if (value !== '') {
				const y = bottom + (rowHeight + COLUMN_HEADER_LEADING) / 2 - COLUMN_HEADER_FONT_SIZE;
				c.drawCentredString(left + width * 0.5, y, value);
			}
		} else {
			const para = new Paragraph(c.fonts, value.markup, { fontSize: COLUMN_HEADER_FONT_SIZE, leading: COLUMN_HEADER_FONT_SIZE });
			const [w, h] = para.wrap(width, rowHeight);
			para.drawOn(c, left + (width - w) / 2, bottom + (rowHeight + h) / 2 - h);
		}
		return { left, bottom, width, height: rowHeight };
	});
	c.setLineWidth(0.6);
	c.setLineCap(1);
	for (const r of rects) {
		c.line(r.left, r.bottom, r.left + r.width, r.bottom);
		c.line(r.left, r.bottom + r.height, r.left + r.width, r.bottom + r.height);
		c.line(r.left, r.bottom, r.left, r.bottom + r.height);
		c.line(r.left + r.width, r.bottom, r.left + r.width, r.bottom + r.height);
	}
	c.restoreState();
	return height;
}

function drawTopRuler(c: Canvas, numTicks = 50, fontSize = 5): void {
	c.saveState();
	c.setLineWidth(0.3);
	const dx = cfg.GRAPH_COLUMN_WIDTH / numTicks;
	let x = cfg.GRAPH_COLUMN_LEFT;
	const y = cfg.COLUMN_HEADER_BOTTOM;
	for (let i = 0; i <= numTicks; i++) {
		if (i > 0 && i < numTicks && i % 10 === 0) {
			c.line(x, y, x, y + 2 * mm);
			c.setFontSize(fontSize);
			c.drawCentredString(x, y + 2.5 * mm, String(i));
		} else {
			c.line(x, y, x, y + 1 * mm);
		}
		x += dx;
	}
	c.restoreState();
}

export function drawColumnHeader(c: Canvas, x: number, y: number): number {
	const h = drawColumnHeaderTable(c, x, y);
	c.saveState();
	c.setFontSize(COLUMN_HEADER_FONT_SIZE);
	c.setLineWidth(0.6);
	const RESULTS_COLUMN_HEADER_CELL_TOP = cfg.CLIENT_CELL_BOTTOM - cfg.SAMPLES_AND_IN_SITU_TESTING_CELL_HEIGHT;
	const RESULTS_COLUMN_HEADER_CELL_HEIGHT = (1 / 3) * (cfg.COLUMN_HEADER_HEIGHT - cfg.SAMPLES_AND_IN_SITU_TESTING_CELL_HEIGHT);
	const RESULTS_COLUMN_HEADER_CELL_BOTTOM = RESULTS_COLUMN_HEADER_CELL_TOP - RESULTS_COLUMN_HEADER_CELL_HEIGHT;
	c.line(cfg.RESULTSLEFT_COLUMN_LEFT, RESULTS_COLUMN_HEADER_CELL_BOTTOM, cfg.RESULTSRIGHT_COLUMN_RIGHT, RESULTS_COLUMN_HEADER_CELL_BOTTOM);
	c.drawCentredString(
		0.5 * (cfg.RESULTSLEFT_COLUMN_LEFT + cfg.RESULTSRIGHT_COLUMN_RIGHT),
		RESULTS_COLUMN_HEADER_CELL_BOTTOM + 0.5 * (RESULTS_COLUMN_HEADER_CELL_HEIGHT - COLUMN_HEADER_FONT_SIZE) + 0.3 * mm,
		'Results',
	);
	c.line(cfg.RESULTS_COLUMN_LEFT, cfg.COLUMN_HEADER_BOTTOM, cfg.RESULTS_COLUMN_LEFT, RESULTS_COLUMN_HEADER_CELL_BOTTOM);
	c.line(cfg.RESULTS_COLUMN_RIGHT, cfg.COLUMN_HEADER_BOTTOM, cfg.RESULTS_COLUMN_RIGHT, RESULTS_COLUMN_HEADER_CELL_BOTTOM);
	const ascent = (HELVETICA_ASCENT * COLUMN_HEADER_FONT_SIZE) / 1000;
	const descent = (HELVETICA_DESCENT * COLUMN_HEADER_FONT_SIZE) / 1000;
	const labelY = 0.5 * (RESULTS_COLUMN_HEADER_CELL_BOTTOM + cfg.COLUMN_HEADER_BOTTOM) - (ascent + descent) / 2;
	c.drawCentredString(0.5 * (cfg.RESULTSLEFT_COLUMN_LEFT + cfg.RESULTSLEFT_COLUMN_RIGHT), labelY, 'TCR%');
	c.drawCentredString(0.5 * (cfg.RESULTS_COLUMN_LEFT + cfg.RESULTS_COLUMN_RIGHT), labelY, 'SCR%');
	c.drawCentredString(0.5 * (cfg.RESULTSRIGHT_COLUMN_LEFT + cfg.RESULTSRIGHT_COLUMN_RIGHT), labelY, 'RQD%');
	c.restoreState();
	return y - h;
}

export function drawBody(c: Canvas, y: number, pageNumber: number): number {
	const y1 = y;
	const y2 = cfg.BODY_Y_BOTTOM;
	c.saveState();
	c.setLineWidth(0.6);
	for (const x of cfg.COLUMN_SEPARATORS_X) c.line(x, y1, x, y2);

	const interval = (10 / 50) * cfg.GRAPH_COLUMN_WIDTH;
	let graphX = cfg.GRAPH_COLUMN_LEFT + interval;
	while (graphX < cfg.GRAPH_COLUMN_RIGHT) {
		c.line(graphX, y1, graphX, y2);
		graphX += interval;
	}

	c.line(cfg.SCALE_TICKS_COLUMN_LEFT, y1, cfg.SCALE_TICKS_COLUMN_LEFT, y2);
	const scaleTickMinorWidth = 0.5 * mm;
	const scaleTickMajorWidth = 1 * mm;
	const scaleYInterval = (y2 - y1) / cfg.NUM_TICKS_PER_PAGE;
	const scaleTickFontSize = 5;
	c.setFontSize(scaleTickFontSize);
	for (let i = 1; i < cfg.NUM_TICKS_PER_PAGE; i++) {
		const tickY = y1 + i * scaleYInterval;
		if (i % 10 === 0) {
			c.line(cfg.SCALE_TICKS_COLUMN_LEFT, tickY, cfg.SCALE_TICKS_COLUMN_LEFT + scaleTickMajorWidth, tickY);
			c.drawString(
				cfg.SCALE_TICKS_COLUMN_LEFT + scaleTickMajorWidth + 0.2 * mm,
				tickY - scaleTickFontSize / 3,
				String(Math.floor(i / 10) + (pageNumber - 1) * cfg.NUM_METRES_PER_PAGE),
			);
		} else {
			c.line(cfg.SCALE_TICKS_COLUMN_LEFT, tickY, cfg.SCALE_TICKS_COLUMN_LEFT + scaleTickMinorWidth, tickY);
		}
	}

	drawTopRuler(c);

	c.restoreState();
	return y2;
}

export function drawFooter(c: Canvas, y: number, bh: BoreholeInformation, numPages: number, footerLogo: PDFImage): void {
	c.saveState();
	c.setLineWidth(0.6);
	c.line(cfg.DATETIME_COLUMN_LEFT, y, cfg.STRATUMDESC_COLUMN_RIGHT, y);
	const STAMP_CELL_WIDTH = 15 * mm;
	const STAMP_PADDING_LEFT = 2.5 * mm;
	const STAMP_PADDING_RIGHT = 2.5 * mm;
	const STAMP_PADDING_BOTTOM = 4.5 * mm;
	const STAMP_WIDTH = STAMP_CELL_WIDTH - (STAMP_PADDING_LEFT + STAMP_PADDING_RIGHT);
	const STAMP_HEIGHT = STAMP_WIDTH;
	const STAMP_CELL_RIGHT = cfg.STRATUMDESC_COLUMN_RIGHT;
	const STAMP_CELL_LEFT = STAMP_CELL_RIGHT - STAMP_CELL_WIDTH;
	c.line(STAMP_CELL_LEFT, y, STAMP_CELL_LEFT, cfg.BOTTOM_MARGIN);
	c.setFontSize(REMARKS_FONT_SIZE);
	c.drawString(cfg.DATETIME_COLUMN_LEFT + 3 * mm, cfg.BODY_Y_BOTTOM - REMARKS_FONT_SIZE - REMARKS_TOP_PADDING, 'Remarks:');
	if (c.getPageNumber() === numPages) {
		const remarks = new Paragraph(c.fonts, bh.generalRemarks ? bh.generalRemarks : '', {
			fontSize: REMARKS_FONT_SIZE,
			leading: REMARKS_FONT_SIZE,
		});
		const maxWidth = STAMP_CELL_LEFT - cfg.WL_COLUMN_LEFT;
		const maxHeight = cfg.FOOTER_HEIGHT - REMARKS_TOP_PADDING;
		const kif = new ShrinkToFit(remarks, maxWidth, maxHeight);
		const [, kh] = kif.wrap();
		kif.drawOn(c, cfg.WL_COLUMN_LEFT, cfg.BODY_Y_BOTTOM - kh - REMARKS_TOP_PADDING);
	} else {
		c.saveState();
		const fs = 5;
		c.setFontSize(fs);
		c.drawCentredString(0.5 * (cfg.STRATUMDESC_COLUMN_LEFT + cfg.SCALE_TICKS_COLUMN_LEFT), cfg.BODY_Y_BOTTOM - fs - 1 * mm, 'Continued next sheet');
		c.restoreState();
	}

	c.drawImage(footerLogo, STAMP_CELL_LEFT + STAMP_PADDING_LEFT, cfg.BOTTOM_MARGIN + STAMP_PADDING_BOTTOM, STAMP_WIDTH, STAMP_HEIGHT);
	const LOGGED_BY_FONT_SIZE = 5;
	const LOGGED_BY_PADDING_BOTTOM = 1.2 * mm;
	c.setFontSize(LOGGED_BY_FONT_SIZE);
	c.drawCentredString(0.5 * (STAMP_CELL_LEFT + STAMP_CELL_RIGHT), cfg.BOTTOM_MARGIN + LOGGED_BY_FONT_SIZE + LOGGED_BY_PADDING_BOTTOM, 'Logged By');
	// Hardcoded in the Python program; Holes column K (the logger) is read but unused.
	c.drawCentredString(0.5 * (STAMP_CELL_LEFT + STAMP_CELL_RIGHT), cfg.BOTTOM_MARGIN + LOGGED_BY_PADDING_BOTTOM, 'IZWAN');

	c.restoreState();
}

export function drawOuterFrame(c: Canvas): void {
	c.saveState();
	c.setLineWidth(2);
	c.rect(cfg.LEFT_MARGIN, cfg.BOTTOM_MARGIN, cfg.ROW_WIDTH, cfg.PAGE_HEIGHT - (cfg.TOP_MARGIN + cfg.BOTTOM_MARGIN));
	c.restoreState();
}
