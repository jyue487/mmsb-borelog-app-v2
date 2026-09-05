import type { PageSlice, PlacedRow } from '../layout/paginate';
import type { PageGeometry } from '../layout/pageGeometry';
import type { ReportWarning } from '../model/doc';
import type { PrefitDescription } from '../model/table';
import { descriptionTokens } from '../rows/blockRowSpec';
import { fitTextAcrossBoxes } from '../text/fitTextToBox';
import type { TextMeasurer } from '../text/measure';
import { DESCRIPTION_LINE_HEIGHT_FACTOR, descriptionBoxPt } from './buildBodyNodes';

/**
 * Lays out the descriptions of blocks whose interval crosses a page break.
 *
 * This exists because of where the seam falls. `paginate()` is text-free by design — it must
 * be able to say where a block lands without a font — and `buildBodyNodes` fits text but sees
 * one page at a time, so neither can answer "how much of this paragraph goes above the fold".
 * `buildReportDoc` is the first place that holds every page at once, so the question is
 * settled here, before any row is built.
 *
 * The rule is one size for the whole block. Fitting each part against its own box would set
 * the four-line fragment at the bottom of a page larger or smaller than its continuation at
 * the top of the next, and a reader would see one sentence change size mid-word across the
 * fold. Lines are then dealt out in order: each part takes as many as its box holds, and the
 * rest carry over — which is exactly "write as much as fits here, continue on the next page".
 *
 * Blocks that fit on one page are not touched. They are nearly all of them, and their cell
 * still fits itself in `buildBodyNodes`, so the common path costs nothing.
 */
export type PrefitDescriptions = Map<string, PrefitDescription>;

/** Rows are matched to their fit by block and part, since one block now spans several rows. */
export function prefitKey(blockId: string, partIndex: number): string {
	return `${blockId}#${partIndex}`;
}

function isBlockRow(row: PlacedRow): row is Extract<PlacedRow, { kind: 'block' }> {
	return row.kind === 'block';
}

export function fitDescriptions(
	slices: PageSlice[],
	geometry: PageGeometry,
	measurer: TextMeasurer,
	warnings: ReportWarning[],
): PrefitDescriptions {
	// Parts arrive in reading order — pages ascend, and rows within a page ascend — so
	// grouping by block id preserves the order the text has to flow in.
	const parts = new Map<string, { row: Extract<PlacedRow, { kind: 'block' }>; pageNumber: number }[]>();
	for (const slice of slices) {
		for (const row of slice.rows) {
			if (!isBlockRow(row)) {
				continue;
			}
			const group = parts.get(row.block.id);
			if (group === undefined) {
				parts.set(row.block.id, [{ row, pageNumber: slice.pageNumber }]);
			} else {
				group.push({ row, pageNumber: slice.pageNumber });
			}
		}
	}

	const prefits: PrefitDescriptions = new Map();

	for (const group of parts.values()) {
		if (group.length < 2) {
			continue;
		}

		const first = group[0].row;
		const boxes = group.map(({ row }) => descriptionBoxPt(row.tickCount, geometry));
		const fit = fitTextAcrossBoxes(
			descriptionTokens(first.block, first.testBlock),
			boxes[0].widthPt,
			boxes.map((box) => box.heightPt),
			measurer,
			DESCRIPTION_LINE_HEIGHT_FACTOR,
		);

		if (fit.overflowed) {
			// Reported against the part the text starts on, once for the block. Each part would
			// otherwise raise its own and the same clipped description would be listed twice.
			warnings.push({
				kind: 'descriptionClipped',
				pageNumber: group[0].pageNumber,
				startTick: first.startTick,
			});
		}

		for (const [index, { row }] of group.entries()) {
			prefits.set(prefitKey(row.block.id, row.partIndex), {
				sizePt: fit.sizePt,
				lineHeightPt: fit.lineHeightPt,
				lines: fit.perBox[index] ?? [],
			});
		}
	}

	return prefits;
}
