import type { Block, Borehole } from '@mmsb/core';

import { sortAndReindexAllBlocks } from '../blocks/sortAndReindexAllBlocks';
import { BLOCK_COLUMNS, mapBlockRow } from './blockRow';
import { supabase } from './supabase.server';

/**
 * Loads every borehole's blocks in one query and groups them by borehole.
 *
 * One `.in()` rather than a request per borehole: a project-wide Excel export would
 * otherwise fire a few dozen round trips before it could write anything.
 *
 * Each borehole's blocks are sorted and reindexed exactly as BoreholePage does on read,
 * because the per-type counters (`sptIndex`, `disturbedSampleIndex`, …) are recomputed in
 * memory rather than stored — and those counters become the sample references the exported
 * workbook carries.
 */
export async function fetchBlocksByBoreholeIds(
	boreholes: readonly Borehole[],
): Promise<Map<string, Block[]>> {
	const byBoreholeId = new Map<string, Block[]>();
	if (boreholes.length === 0) {
		return byBoreholeId;
	}

	const { data, error } = await supabase
		.from('blocks')
		.select(BLOCK_COLUMNS)
		.in(
			'borehole_id',
			boreholes.map((borehole) => borehole.id),
		)
		// Defensive, matching BoreholePage: blocks are hard deleted today, so this matches
		// every row. It is here so the export is already right if they move to soft deletion.
		.is('deleted_at', null);

	if (error) {
		throw error;
	}

	for (const row of data ?? []) {
		const block = mapBlockRow(row);
		const existing = byBoreholeId.get(block.boreholeId);
		if (existing === undefined) {
			byBoreholeId.set(block.boreholeId, [block]);
		} else {
			existing.push(block);
		}
	}

	for (const [boreholeId, blocks] of byBoreholeId) {
		byBoreholeId.set(boreholeId, sortAndReindexAllBlocks(blocks));
	}

	return byBoreholeId;
}
