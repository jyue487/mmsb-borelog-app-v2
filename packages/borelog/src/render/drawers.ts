import type { PDFImage } from 'pdf-lib';

import type { CoreInformation, GeologyInformation, ProgressInformation, SampleInformation, SptInformation } from '../model';
import { pyFixed } from '../py/number';
import { colors, type Canvas } from './canvas';
import * as cfg from './config';
import { getYFromDepthInMetres, mm } from './config';
import { Paragraph } from './paragraph';

/**
 * `logics/draw/drawers/*.py`. Each drawer walks its own list down the hole, one page at a
 * time, keeping its place between pages — they are stateful by design, so they stay classes.
 */

const fmt2 = (x: number) => pyFixed(x, 2);
const fmt3 = (x: number) => pyFixed(x, 3);

const DATE_FONT_SIZE = 6;
const DATE_OFFSET = DATE_FONT_SIZE;

export class ProgressDrawer {
	private i = 0;
	private readonly list: readonly ProgressInformation[];

	constructor(list: readonly ProgressInformation[]) {
		this.list = list;
	}

	private drawProgress(c: Canvas, pageNumber: number, progress: ProgressInformation, offset: number): void {
		const dt = `${progress.dateOfProgress} ${progress.timeOfProgressHhmm}`;
		const wl = progress.waterLevelInMetres;
		let y = getYFromDepthInMetres(progress.holeDepthInMetres, pageNumber) + offset;
		y = Math.min(cfg.BODY_Y_TOP - DATE_OFFSET, Math.max(cfg.BODY_Y_BOTTOM + 0.5 * mm, y));
		c.saveState();
		c.setFontSize(DATE_FONT_SIZE);
		c.drawCentredString(0.5 * (cfg.DATETIME_COLUMN_LEFT + cfg.DATETIME_COLUMN_RIGHT), y, dt);
		c.drawCentredString(0.5 * (cfg.WL_COLUMN_LEFT + cfg.WL_COLUMN_RIGHT), y, wl);
		c.restoreState();
		this.i++;
	}

	/** A shift's start is printed below its line, so one exactly on a page break goes to the next page. */
	private handleDrawStart(c: Canvas, pageNumber: number, progress: ProgressInformation): boolean {
		if (progress.holeDepthInMetres >= pageNumber * cfg.NUM_METRES_PER_PAGE) return false;
		this.drawProgress(c, pageNumber, progress, -DATE_OFFSET);
		return true;
	}

	/** A shift's end is printed above its line, so one exactly on a page break stays on this page. */
	private handleDrawEnd(c: Canvas, pageNumber: number, progress: ProgressInformation): boolean {
		if (progress.holeDepthInMetres > pageNumber * cfg.NUM_METRES_PER_PAGE) return false;
		this.drawProgress(c, pageNumber, progress, 0);
		return true;
	}

	drawOnPage(c: Canvas, pageNumber: number): void {
		while (this.i < this.list.length && this.list[this.i].holeDepthInMetres <= pageNumber * cfg.NUM_METRES_PER_PAGE) {
			const continueDrawing =
				this.i % 2 === 0
					? this.handleDrawStart(c, pageNumber, this.list[this.i])
					: this.handleDrawEnd(c, pageNumber, this.list[this.i]);
			if (!continueDrawing) return;
		}
	}
}

const SPT_FONT_SIZE = 6.5;

export class SptGraphDrawer {
	private i = 0;
	private readonly list: readonly SptInformation[];
	private readonly sptNMax: number;

	constructor(list: readonly SptInformation[], sptNMax: number) {
		this.list = list;
		this.sptNMax = sptNMax;
	}

	/**
	 * The axis runs 0 to SPT-N Max across the column. The Python program fixed it at 50, so an
	 * SPT100 project's N > 50 plotted past the column; an N above SPT-N Max still would.
	 */
	private getXFromNValue(nValue: number): number {
		return cfg.GRAPH_COLUMN_LEFT + (nValue / this.sptNMax) * cfg.GRAPH_COLUMN_WIDTH;
	}

	drawOnPage(c: Canvas, pageNumber: number): void {
		let x0: number | null = null;
		let y0: number | null = null;
		while (this.i < this.list.length && this.list[this.i].testDepthInMetres < pageNumber * cfg.NUM_METRES_PER_PAGE) {
			const spt = this.list[this.i];
			const y = getYFromDepthInMetres(spt.testDepthInMetres, pageNumber);
			c.saveState();
			c.setFontSize(SPT_FONT_SIZE);
			c.setStrokeColor(colors.blue);
			const x = this.getXFromNValue(spt.nValue);
			if (x0 !== null && y0 !== null) c.line(x0, y0, x, y);

			const r = 0.75 * mm;
			c.setFillColor(colors.grey);
			c.setStrokeColor(colors.black);
			c.setLineWidth(0.7);
			if (x0 !== null && y0 !== null) c.circle(x0, y0, r, true, true);
			c.circle(x, y, r, true, true);
			x0 = x;
			y0 = y;
			c.restoreState();
			this.i++;
		}
	}
}

const CORE_FONT_SIZE = 6.5;

export class CoreDrawer {
	private i = 0;
	private readonly list: readonly CoreInformation[];

	constructor(list: readonly CoreInformation[]) {
		this.list = list;
	}

	drawOnPage(c: Canvas, pageNumber: number): void {
		while (this.i < this.list.length && this.list[this.i].topDepthInMetres < pageNumber * cfg.NUM_METRES_PER_PAGE) {
			const core = this.list[this.i];
			const y = getYFromDepthInMetres(core.topDepthInMetres, pageNumber);
			c.saveState();
			c.setFontSize(CORE_FONT_SIZE);
			const topOffset = -CORE_FONT_SIZE;
			c.drawCentredString(0.5 * (cfg.RESULTSLEFT_COLUMN_LEFT + cfg.RESULTSLEFT_COLUMN_RIGHT), y + topOffset, core.tcr);
			c.drawCentredString(0.5 * (cfg.RESULTSRIGHT_COLUMN_LEFT + cfg.RESULTSRIGHT_COLUMN_RIGHT), y + topOffset, core.rqd);
			c.restoreState();
			this.i++;
		}
	}
}

const SAMPLE_FONT_SIZE = 6.5;

export class SampleDrawer {
	private i = 0;
	private sptI = 0;
	private yCheckpoint: number = cfg.BODY_Y_TOP;
	private readonly list: readonly SampleInformation[];
	private readonly sptList: readonly SptInformation[];

	constructor(list: readonly SampleInformation[], sptList: readonly SptInformation[]) {
		this.list = list;
		this.sptList = sptList;
	}

	drawOnPage(c: Canvas, pageNumber: number): void {
		this.yCheckpoint = cfg.BODY_Y_TOP;

		// A core run carried over from the previous page: close its box on this one.
		if (this.i - 1 >= 0) {
			const sample = this.list[this.i - 1];
			c.saveState();
			c.setLineWidth(0.6);
			if (sample.sampleType === 'C') {
				const y = getYFromDepthInMetres(sample.baseDepthInMetres, c.getPageNumber());
				c.line(cfg.RESULTS_COLUMN_LEFT, cfg.BODY_Y_TOP, cfg.RESULTS_COLUMN_LEFT, y);
				c.line(cfg.RESULTS_COLUMN_RIGHT, cfg.BODY_Y_TOP, cfg.RESULTS_COLUMN_RIGHT, y);
				c.line(cfg.RESULTSLEFT_COLUMN_LEFT, y, cfg.RESULTSRIGHT_COLUMN_RIGHT, y);
			}
			c.restoreState();
		}

		while (this.i < this.list.length && this.list[this.i].topDepthInMetres < pageNumber * cfg.NUM_METRES_PER_PAGE) {
			const sample = this.list[this.i];
			const yTop = getYFromDepthInMetres(sample.topDepthInMetres, pageNumber);
			const y = Math.min(this.yCheckpoint, yTop);
			const topDoubleOffset = -2 * SAMPLE_FONT_SIZE;
			const topOffset = -SAMPLE_FONT_SIZE;
			c.saveState();
			c.setFontSize(SAMPLE_FONT_SIZE);
			c.setLineWidth(0.6);

			const depth1X = 0.5 * (cfg.DEPTH1_COLUMN_LEFT + cfg.DEPTH1_COLUMN_RIGHT);
			const typeX = 0.5 * (cfg.TYPE_COLUMN_LEFT + cfg.TYPE_COLUMN_RIGHT);
			const depth2X = 0.5 * (cfg.DEPTH2_COLUMN_LEFT + cfg.DEPTH2_COLUMN_RIGHT);
			const sampleRecX = 0.5 * (cfg.SAMPLEREC_COLUMN_LEFT + cfg.SAMPLEREC_COLUMN_RIGHT);
			const resultsX = 0.5 * (cfg.RESULTSLEFT_COLUMN_LEFT + cfg.RESULTSRIGHT_COLUMN_RIGHT);
			const interval = `${fmt3(sample.topDepthInMetres)}-${fmt3(sample.baseDepthInMetres)}`;

			if (sample.sampleType === 'C') {
				// A core run: depths, reference, and a box down the SCR column to its base.
				c.drawCentredString(depth1X, y + topOffset, interval);
				c.drawCentredString(typeX, y + topOffset, sample.sampleReference);
				c.drawCentredString(depth2X, y + topOffset, fmt2(sample.topDepthInMetres));
				c.line(cfg.RESULTSLEFT_COLUMN_LEFT, y, cfg.RESULTSRIGHT_COLUMN_RIGHT, y);
				const yMax = Math.max(cfg.BODY_Y_BOTTOM, getYFromDepthInMetres(sample.baseDepthInMetres, pageNumber));
				c.line(cfg.RESULTS_COLUMN_LEFT, y, cfg.RESULTS_COLUMN_LEFT, yMax);
				c.line(cfg.RESULTS_COLUMN_RIGHT, y, cfg.RESULTS_COLUMN_RIGHT, yMax);
				c.line(cfg.RESULTSLEFT_COLUMN_LEFT, yMax, cfg.RESULTSRIGHT_COLUMN_RIGHT, yMax);
				this.yCheckpoint = Math.min(this.yCheckpoint, y + topOffset - 1 * mm);
				const nextIsNotCore = this.i + 1 < this.list.length && this.list[this.i + 1].sampleType !== 'C';
				if (nextIsNotCore || this.i === this.list.length - 1) {
					const offset = yMax === cfg.BODY_Y_BOTTOM ? 0 : topOffset;
					c.drawCentredString(depth2X, Math.max(yMax + offset, cfg.BODY_Y_BOTTOM + 0.5 * mm), fmt2(sample.baseDepthInMetres));
				}
			} else if (sample.sampleType === 'D') {
				// An SPT: takes the next SPT row, in order — not matched by depth.
				c.drawCentredString(depth1X, y + topOffset, fmt2(sample.topDepthInMetres));
				c.drawCentredString(typeX, y + topOffset, 'SPT');
				if (this.sptI >= this.sptList.length) {
					throw new Error('Number of rows in SPT sheet does not match SPT samples in Sample sheet');
				}
				const s = this.sptList[this.sptI].reportedResult;
				const nValueStr = s.split('(')[0];
				// Python's s[s.find('(') : s.find(')') + 1], -1 and all.
				const nValueStrDetails = s.slice(s.indexOf('('), s.indexOf(')') + 1);
				c.drawCentredString(resultsX, y - SAMPLE_FONT_SIZE, nValueStr);
				c.drawCentredString(resultsX, y - 2 * SAMPLE_FONT_SIZE, nValueStrDetails);

				c.drawCentredString(depth1X, y + topDoubleOffset, interval);
				c.drawCentredString(typeX, y + topDoubleOffset, sample.sampleReference);
				c.drawCentredString(depth2X, y + topOffset, fmt2(sample.topDepthInMetres));
				c.drawCentredString(sampleRecX, y + topOffset, sample.sampleRecovery);

				this.yCheckpoint = Math.min(this.yCheckpoint, y + topDoubleOffset - 1 * mm);
				this.sptI++;
			} else {
				c.drawCentredString(depth1X, y + topOffset, interval);
				c.drawCentredString(typeX, y + topOffset, sample.sampleReference);
				c.drawCentredString(depth2X, y + topOffset, fmt2(sample.topDepthInMetres));
				c.drawCentredString(sampleRecX, y + topOffset, sample.sampleRecovery);
				this.yCheckpoint = Math.min(this.yCheckpoint, y + topOffset - 1 * mm);
			}

			c.restoreState();
			this.i++;
		}
	}
}

const GEOLOGY_FONT_SIZE = 6.5;
const EOB_FONT_SIZE = 6;
const STRAT_DESC_PADDING_LEFT = 3 * mm;
const STRAT_DESC_PADDING_RIGHT = 3 * mm;
const STRAT_DESC_MAX_WIDTH =
	cfg.STRATUMDESC_COLUMN_WIDTH - cfg.SCALE_TICKS_COLUMN_WIDTH - (STRAT_DESC_PADDING_LEFT + STRAT_DESC_PADDING_RIGHT);

const endOfBorehole = (geology: GeologyInformation) => `End of Borehole at ${fmt2(geology.baseDepthInMetres)} m`;

/** The legend pattern and the stratum description; also the end-of-borehole line. */
export class GeologyDrawer {
	private i = 0;
	private yCheckpoint: number = cfg.BODY_Y_TOP;
	private readonly list: readonly GeologyInformation[];
	/** `strat_desc_overflow`: what is left of each description to print on the next page. */
	private readonly overflow = new Map<number, Paragraph | null>();
	private readonly fontsOf: Canvas['fonts'];
	private readonly legendFor: (code: string) => PDFImage;

	constructor(list: readonly GeologyInformation[], fonts: Canvas['fonts'], legendFor: (code: string) => PDFImage) {
		this.list = list;
		this.fontsOf = fonts;
		this.legendFor = legendFor;
	}

	private description(geology: GeologyInformation): Paragraph {
		return new Paragraph(this.fontsOf, geology.stratumDescription, { fontSize: GEOLOGY_FONT_SIZE, leading: GEOLOGY_FONT_SIZE });
	}

	/**
	 * Whether the last stratum's description runs off what would be the last page, which
	 * then gets a page of its own. Measured against the whole page above that stratum.
	 */
	hasOverflow(numPages: number): boolean {
		const geology = this.list[this.list.length - 1];
		const yTop = getYFromDepthInMetres(geology.topDepthInMetres, numPages);
		const y = Math.min(this.yCheckpoint, yTop);
		const parts = this.description(geology).split(STRAT_DESC_MAX_WIDTH, y - cfg.BODY_Y_BOTTOM);
		return parts.length === 0 || parts.length > 1;
	}

	private drawLegend(c: Canvas, x: number, y: number, w: number, h: number, code: string): void {
		c.saveState();
		const image = this.legendFor(code);
		const targetW = w;
		const targetH = (targetW * image.height) / image.width;
		let yLegend = y + h;
		for (let i = 0; i < Math.floor(h / targetH); i++) {
			c.drawImage(image, x, yLegend - targetH, targetW, targetH);
			yLegend -= targetH;
		}
		c.clipRect(x, y, targetW, targetH);
		c.drawImage(image, x, yLegend - targetH, targetW, targetH);
		c.restoreState();

		c.saveState();
		c.setLineWidth(0.6);
		c.line(x, y + h, x + w, y + h);
		c.line(x, y, x + w, y);
		c.restoreState();
	}

	drawOnPage(c: Canvas, pageNumber: number): void {
		this.yCheckpoint = cfg.BODY_Y_TOP;
		const x = cfg.STRATUMDESC_COLUMN_LEFT;
		const padL = STRAT_DESC_PADDING_LEFT;
		const padR = STRAT_DESC_PADDING_RIGHT;
		const centreX = 0.5 * (cfg.STRATUMDESC_COLUMN_LEFT + cfg.SCALE_TICKS_COLUMN_LEFT);

		// The stratum carried over from the previous page.
		if (this.i - 1 >= 0) {
			const geology = this.list[this.i - 1];
			const yBase = getYFromDepthInMetres(geology.baseDepthInMetres, c.getPageNumber());
			let ph = 0;

			if (geology.legendCode !== '') {
				this.drawLegend(c, cfg.LEGEND_COLUMN_LEFT, yBase, cfg.LEGEND_COLUMN_WIDTH, cfg.COLUMN_HEADER_BOTTOM - yBase, geology.legendCode);
			}

			const overflow = this.overflow.get(this.i - 1) ?? null;
			if (overflow !== null) {
				[, ph] = overflow.wrap(STRAT_DESC_MAX_WIDTH, cfg.BODY_Y_TOP - cfg.BODY_Y_BOTTOM);
				overflow.drawOn(c, x + padL, cfg.BODY_Y_TOP - ph);
			}

			// End of borehole, when the last stratum was the one carried over.
			if (this.i - 1 === this.list.length - 1) {
				const yTop = cfg.BODY_Y_TOP;
				const paddingBottom = 1 * mm;
				c.saveState();
				c.setFont('Helvetica', EOB_FONT_SIZE);
				c.setLineWidth(0.6);
				c.setDash(2, 2);
				if (ph + paddingBottom > yTop - yBase) {
					const yExtend = yTop - ph - paddingBottom;
					const rho = (yBase - cfg.BODY_Y_TOP) / (yBase - yExtend);
					const ax = cfg.STRATUMDESC_COLUMN_LEFT + rho * (padL / 2);
					const bx = cfg.STRATUMDESC_COLUMN_LEFT + padL / 2;
					const cx = cfg.SCALE_TICKS_COLUMN_LEFT - rho * (padR / 2);
					const dx = cfg.SCALE_TICKS_COLUMN_LEFT - padR / 2;
					c.line(ax, yTop, bx, yExtend);
					c.line(cx, yTop, dx, yExtend);
					c.line(bx, yExtend, dx, yExtend);
					c.drawCentredString(centreX, yExtend - EOB_FONT_SIZE, endOfBorehole(geology));
				} else {
					const yMax = Math.max(cfg.BODY_Y_BOTTOM, getYFromDepthInMetres(geology.baseDepthInMetres, pageNumber));
					c.line(cfg.STRATUMDESC_COLUMN_LEFT, yMax, cfg.SCALE_TICKS_COLUMN_LEFT, yMax);
					c.drawCentredString(centreX, yMax - EOB_FONT_SIZE, endOfBorehole(geology));
				}
				c.restoreState();
			}
		}

		while (this.i < this.list.length && this.list[this.i].topDepthInMetres < pageNumber * cfg.NUM_METRES_PER_PAGE) {
			const geology = this.list[this.i];
			const yTop = getYFromDepthInMetres(geology.topDepthInMetres, c.getPageNumber());
			const yBase = getYFromDepthInMetres(geology.baseDepthInMetres, c.getPageNumber());
			const y = Math.min(this.yCheckpoint, yTop);
			c.saveState();
			c.setFontSize(GEOLOGY_FONT_SIZE);
			const para = this.description(geology);
			const maxHeight = y - cfg.BODY_Y_BOTTOM;
			const parts = para.split(STRAT_DESC_MAX_WIDTH, maxHeight);
			let yParaBottom: number;
			if (parts.length === 0) {
				// No room for even two lines: the whole description starts on the next page.
				yParaBottom = y;
				this.overflow.set(this.i, para);
			} else {
				const [, ph] = parts[0].wrap(STRAT_DESC_MAX_WIDTH, maxHeight);
				parts[0].drawOn(c, x + padL, y - ph);
				yParaBottom = y - ph;
				this.overflow.set(this.i, parts.length > 1 ? parts[1] : null);
			}

			if (geology.legendCode !== '') {
				const yMax = Math.max(cfg.BODY_Y_BOTTOM, getYFromDepthInMetres(geology.baseDepthInMetres, pageNumber));
				this.drawLegend(c, cfg.LEGEND_COLUMN_LEFT, yMax, cfg.LEGEND_COLUMN_WIDTH, yTop - yMax, geology.legendCode);
			}

			// The rule above the description: diagonals when the description above pushed it down.
			c.setLineWidth(0.6);
			if (y >= yTop) {
				c.line(x, y, cfg.SCALE_TICKS_COLUMN_LEFT, y);
			} else {
				const prev = this.list[this.i - 1];
				const yBasePrev = getYFromDepthInMetres(prev.baseDepthInMetres, c.getPageNumber());
				if (yBasePrev > y) {
					c.line(cfg.STRATUMDESC_COLUMN_LEFT, yBasePrev, cfg.STRATUMDESC_COLUMN_LEFT + padL / 2, y);
					c.line(cfg.SCALE_TICKS_COLUMN_LEFT, yBasePrev, cfg.SCALE_TICKS_COLUMN_LEFT - padR / 2, y);
					c.line(cfg.STRATUMDESC_COLUMN_LEFT + padL / 2, y, cfg.SCALE_TICKS_COLUMN_LEFT - padR / 2, y);
				} else {
					c.line(x, y, cfg.SCALE_TICKS_COLUMN_LEFT, y);
				}
			}

			this.yCheckpoint = Math.min(yParaBottom, this.yCheckpoint);

			// End of borehole
			if (this.i === this.list.length - 1) {
				const eobTop = y;
				const paddingBottom = 0.4 * mm;
				c.saveState();
				c.setFont('Helvetica', EOB_FONT_SIZE);
				c.setLineWidth(0.6);
				c.setDash(2, 2);
				const [, ph] = para.wrap(STRAT_DESC_MAX_WIDTH, maxHeight);
				if (this.yCheckpoint >= cfg.BODY_Y_BOTTOM) {
					if (ph + paddingBottom > eobTop - yBase) {
						// The description is taller than the stratum: extend it down to the text.
						const yExtend = this.yCheckpoint - paddingBottom;
						c.line(cfg.STRATUMDESC_COLUMN_LEFT, yBase, cfg.STRATUMDESC_COLUMN_LEFT + padL / 2, yExtend);
						c.line(cfg.SCALE_TICKS_COLUMN_LEFT, yBase, cfg.SCALE_TICKS_COLUMN_LEFT - padR / 2, yExtend);
						c.line(cfg.STRATUMDESC_COLUMN_LEFT + padL / 2, yExtend, cfg.SCALE_TICKS_COLUMN_LEFT - padR / 2, yExtend);
						c.drawCentredString(centreX, yExtend - EOB_FONT_SIZE, endOfBorehole(geology));
					} else {
						const yMax = Math.max(cfg.BODY_Y_BOTTOM, getYFromDepthInMetres(geology.baseDepthInMetres, pageNumber));
						c.line(cfg.STRATUMDESC_COLUMN_LEFT, yMax, cfg.SCALE_TICKS_COLUMN_LEFT, yMax);
						c.drawCentredString(centreX, yMax - EOB_FONT_SIZE, endOfBorehole(geology));
					}
				} else {
					// Not enough room: the end of borehole moves to the next page, but the
					// diagonals start here.
					const rho = (yBase - cfg.BODY_Y_BOTTOM) / (ph - (eobTop - yBase));
					c.line(cfg.STRATUMDESC_COLUMN_LEFT, yBase, cfg.STRATUMDESC_COLUMN_LEFT + rho * (padL / 2), cfg.BODY_Y_BOTTOM);
					c.line(cfg.SCALE_TICKS_COLUMN_LEFT, yBase, cfg.SCALE_TICKS_COLUMN_LEFT - rho * (padR / 2), cfg.BODY_Y_BOTTOM);
				}
				c.restoreState();
			}
			c.restoreState();
			this.i++;
		}
	}
}
