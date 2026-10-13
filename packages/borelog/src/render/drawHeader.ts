import type { PDFImage } from 'pdf-lib';

import type { BoreholeInformation, ProjectInformation } from '../model';
import type { Canvas } from './canvas';
import * as cfg from './config';
import { mm } from './config';
import { Paragraph, ShrinkToFit } from './paragraph';

/** `logics/draw/draw_header.py` */

const FONT_SIZE = 9;
const CELL_PADDING_LEFT = 2 * mm;

function drawCompanyLogoHeader(c: Canvas, companyLogo: PDFImage): void {
	c.saveState();
	const MMSB_LOGO_HEADER_PADDING = 2 * mm;
	c.drawImage(
		companyLogo,
		cfg.DATETIME_COLUMN_LEFT + MMSB_LOGO_HEADER_PADDING + 2 * mm,
		cfg.MMSB_LOGO_HEADER_CELL_BOTTOM + MMSB_LOGO_HEADER_PADDING,
		0.25 * cfg.MMSB_LOGO_HEADER_CELL_WIDTH,
		cfg.MMSB_LOGO_HEADER_HEIGHT - 2 * MMSB_LOGO_HEADER_PADDING,
	);
	const MMSB_LOGO_HEADER_FONT_SIZE = 16;
	const centreX = 0.5 * (cfg.MMSB_LOGO_HEADER_CELL_LEFT + 0.25 * cfg.MMSB_LOGO_HEADER_CELL_WIDTH + cfg.MMSB_LOGO_HEADER_CELL_RIGHT);
	c.setFontSize(MMSB_LOGO_HEADER_FONT_SIZE);
	c.setFillColor([0.1, 0.3, 0.6]);
	c.drawCentredString(centreX, cfg.MMSB_LOGO_HEADER_CELL_TOP - MMSB_LOGO_HEADER_PADDING - MMSB_LOGO_HEADER_FONT_SIZE, 'MAXI MEKAR SDN BHD');
	const NO_SYARIKAT_FONT_SIZE = 8;
	c.setFontSize(NO_SYARIKAT_FONT_SIZE);
	c.drawCentredString(
		centreX,
		cfg.MMSB_LOGO_HEADER_CELL_TOP - MMSB_LOGO_HEADER_PADDING - MMSB_LOGO_HEADER_FONT_SIZE - 2 * NO_SYARIKAT_FONT_SIZE,
		'No. Syarikat: 199701009605 (425101-V)',
	);
	c.restoreState();
}

function drawBhNoCell(c: Canvas, bhNo: string, numPages: number): void {
	const para = new Paragraph(
		c.fonts,
		`<para align='center'>Borehole No<br/><font size=12><b>${bhNo}</b></font><br/>Sheet ${c.getPageNumber()} of ${numPages}</para>`,
		{ fontSize: FONT_SIZE, leading: 16 },
	);
	const [w, h] = para.wrap(cfg.BOREHOLE_NO_CELL_WIDTH, cfg.BOREHOLE_NO_CELL_HEIGHT);
	para.drawOn(
		c,
		cfg.BOREHOLE_NO_CELL_LEFT + (cfg.BOREHOLE_NO_CELL_WIDTH - w) / 2,
		cfg.BOREHOLE_NO_CELL_BOTTOM + (cfg.BOREHOLE_NO_CELL_HEIGHT - h) / 2 - 0.75 * mm,
	);
}

/** A label, then its value shrunk to fit the rest of the cell. Project name and location. */
function drawLabelledShrunkCell(c: Canvas, label: string, value: string, cellTop: number, cellWidth: number, cellHeight: number): void {
	const para = new Paragraph(c.fonts, value ? value : '-', { fontSize: FONT_SIZE, leading: FONT_SIZE });
	const labelWidth = c.stringWidth(label, 'Helvetica', FONT_SIZE);
	const maxWidth = cellWidth - (labelWidth + CELL_PADDING_LEFT);
	const kif = new ShrinkToFit(para, maxWidth, cellHeight);
	c.drawString(cfg.MMSB_LOGO_HEADER_CELL_LEFT + CELL_PADDING_LEFT, cellTop - FONT_SIZE, label);
	const [, h] = kif.wrap();
	kif.drawOn(c, cfg.MMSB_LOGO_HEADER_CELL_LEFT + CELL_PADDING_LEFT + labelWidth, cellTop - h);
}

function drawHoleType(c: Canvas): void {
	const para = new Paragraph(c.fonts, "<para align='center'>Hole Type<br/>Rotary<br/></para>", { fontSize: FONT_SIZE });
	const [, h] = para.wrap(cfg.HOLE_TYPE_CELL_WIDTH, cfg.HOLE_TYPE_CELL_HEIGHT);
	para.drawOn(c, cfg.HOLE_TYPE_CELL_LEFT, cfg.HOLE_TYPE_CELL_BOTTOM + (cfg.HOLE_TYPE_CELL_HEIGHT - h) / 2);
}

function drawLevel(c: Canvas, levelInMetres: string): void {
	const levelDescription = levelInMetres ? `${levelInMetres} m RL` : '-';
	const para = new Paragraph(c.fonts, `<para align='center'>Level<br/>${levelDescription}<br/></para>`, { fontSize: FONT_SIZE });
	const [, h] = para.wrap(cfg.LEVEL_CELL_WIDTH, cfg.CLIENT_CELL_HEIGHT);
	para.drawOn(c, cfg.LEVEL_CELL_LEFT, cfg.CLIENT_CELL_BOTTOM + (cfg.CLIENT_CELL_HEIGHT - h) / 2);
}

export function drawHeader(c: Canvas, proj: ProjectInformation, bh: BoreholeInformation, numPages: number, companyLogo: PDFImage): number {
	drawCompanyLogoHeader(c, companyLogo);

	c.saveState();
	c.setFontSize(FONT_SIZE);
	c.setLineWidth(0.6);

	c.drawCentredString(
		0.5 * (cfg.DEEP_BORING_LOG_CELL_LEFT + cfg.DEEP_BORING_LOG_CELL_RIGHT),
		cfg.DEEP_BORING_LOG_CELL_BOTTOM + (cfg.DEEP_BORING_LOG_CELL_HEIGHT - FONT_SIZE) / 2,
		'DEEP BORING LOG',
	);
	c.drawCentredString(
		0.5 * (cfg.DEEP_BORING_LOG_CELL_LEFT + cfg.DEEP_BORING_LOG_CELL_RIGHT),
		cfg.MMSB_LOGO_HEADER_CELL_BOTTOM + (cfg.PROJECT_NAME_CELL_HEIGHT - FONT_SIZE) / 2,
		`Project No: ${proj.id ? proj.id : ''}`,
	);
	drawBhNoCell(c, bh.id, numPages);
	drawLabelledShrunkCell(c, 'Project Name: ', proj.name, cfg.PROJECT_NAME_CELL_TOP, cfg.PROJECT_NAME_CELL_WIDTH, cfg.PROJECT_NAME_CELL_HEIGHT);
	drawLabelledShrunkCell(c, 'Location: ', proj.location, cfg.LOCATION_CELL_TOP, cfg.LOCATION_CELL_WIDTH, cfg.LOCATION_CELL_HEIGHT);

	// Dates, co-ordinates, client
	c.drawString(
		cfg.DATES_CELL_LEFT + CELL_PADDING_LEFT,
		cfg.CLIENT_CELL_TOP + (cfg.LOCATION_CELL_HEIGHT - FONT_SIZE) / 2 + 0.5 * mm,
		`Dates: ${bh.startDate}-${bh.endDate}`,
	);
	const coordStr = bh.eastingInMetres && bh.northingInMetres ? `${bh.eastingInMetres}E, ${bh.northingInMetres}N` : '-';
	c.drawString(cfg.DATES_CELL_LEFT + CELL_PADDING_LEFT, cfg.CLIENT_CELL_BOTTOM + (cfg.CLIENT_CELL_HEIGHT - FONT_SIZE) / 2 + 0.5 * mm, `Co-ords: ${coordStr}`);
	const clientStr = proj.client ? proj.client : '-';
	c.drawString(cfg.MMSB_LOGO_HEADER_CELL_LEFT + CELL_PADDING_LEFT, cfg.CLIENT_CELL_BOTTOM + (cfg.CLIENT_CELL_HEIGHT - FONT_SIZE) / 2 + 0.5 * mm, `Client: ${clientStr}`);

	// Hole type, level
	drawHoleType(c);
	drawLevel(c, bh.glInMetres);

	// Horizontal rules
	c.line(cfg.MMSB_LOGO_HEADER_CELL_LEFT, cfg.MMSB_LOGO_HEADER_CELL_BOTTOM, cfg.STRATUMDESC_COLUMN_RIGHT, cfg.MMSB_LOGO_HEADER_CELL_BOTTOM);
	c.line(cfg.MMSB_LOGO_HEADER_CELL_LEFT, cfg.LOCATION_CELL_TOP, cfg.STRATUMDESC_COLUMN_RIGHT, cfg.LOCATION_CELL_TOP);
	c.line(cfg.MMSB_LOGO_HEADER_CELL_LEFT, cfg.CLIENT_CELL_TOP, cfg.STRATUMDESC_COLUMN_RIGHT, cfg.CLIENT_CELL_TOP);
	c.line(cfg.DEEP_BORING_LOG_CELL_LEFT, cfg.DEEP_BORING_LOG_CELL_BOTTOM, cfg.DEEP_BORING_LOG_CELL_RIGHT, cfg.DEEP_BORING_LOG_CELL_BOTTOM);
	// Vertical rules
	c.line(cfg.DEEP_BORING_LOG_CELL_LEFT, cfg.MMSB_LOGO_HEADER_CELL_TOP, cfg.DEEP_BORING_LOG_CELL_LEFT, cfg.MMSB_LOGO_HEADER_CELL_BOTTOM);
	c.line(cfg.DEEP_BORING_LOG_CELL_RIGHT, cfg.MMSB_LOGO_HEADER_CELL_TOP, cfg.DEEP_BORING_LOG_CELL_RIGHT, cfg.MMSB_LOGO_HEADER_CELL_BOTTOM);
	c.line(cfg.DATES_CELL_LEFT, cfg.LOCATION_CELL_TOP, cfg.DATES_CELL_LEFT, cfg.CLIENT_CELL_BOTTOM);
	c.line(cfg.DATES_CELL_RIGHT, cfg.LOCATION_CELL_TOP, cfg.DATES_CELL_RIGHT, cfg.CLIENT_CELL_BOTTOM);
	c.line(cfg.HOLE_TYPE_CELL_LEFT, cfg.LOCATION_CELL_TOP, cfg.HOLE_TYPE_CELL_LEFT, cfg.CLIENT_CELL_BOTTOM);

	c.restoreState();
	return cfg.CLIENT_CELL_BOTTOM;
}
