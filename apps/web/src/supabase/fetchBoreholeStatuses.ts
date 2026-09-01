import { END_OF_BOREHOLE_BLOCK_TYPE_ID, type Borehole } from '@mmsb/core';

import type { BoreholeStatus } from '../data/boreholeStatus';
import { supabase } from './supabase.server';

/**
 * Works out how far along each borehole's log is, in as few rows as possible.
 *
 * Deliberately not fetchBlocksByBoreholeIds: that one selects `payload` and deserializes
 * every block, which is the exact cost the project dashboard must not pay — it never
 * renders a block. All the status needs is two columns.
 *
 *   no blocks                        -> 'notStarted'
 *   an End of Borehole block exists  -> 'completed'
 *   blocks but no End of Borehole    -> 'inProgress'
 */

// PostgREST caps rows per response (1000 by default), and it does so silently: a
// truncated page is indistinguishable from the end of the table. A project with a few
// dozen logged boreholes runs well past that, and every borehole beyond the cap would
// render 'notStarted'. So the read is paged rather than a single select.
const PAGE_SIZE = 1000;

export async function fetchBoreholeStatuses(
	boreholes: readonly Borehole[],
): Promise<Map<string, BoreholeStatus>> {
	const statusByBoreholeId = new Map<string, BoreholeStatus>();
	if (boreholes.length === 0) {
		return statusByBoreholeId;
	}

	const boreholeIds = boreholes.map((borehole) => borehole.id);

	// Sets of borehole ids rather than the rows themselves, so memory stays O(boreholes)
	// no matter how many blocks the project holds.
	const started = new Set<string>();
	const ended = new Set<string>();

	for (let offset = 0; ; offset += PAGE_SIZE) {
		const { data, error } = await supabase
			.from('blocks')
			.select('borehole_id, block_type_id')
			.in('borehole_id', boreholeIds)
			// Defensive, matching fetchBlocksByBoreholeIds: blocks are hard deleted today,
			// so this matches every row. It is here so the status is already right if they
			// move to soft deletion.
			.is('deleted_at', null)
			// A stable order is what makes the paging above sound; without it two pages can
			// overlap or skip rows.
			.order('id', { ascending: true })
			.range(offset, offset + PAGE_SIZE - 1);

		if (error) {
			throw error;
		}

		const rows = data ?? [];

		for (const row of rows) {
			started.add(row.borehole_id);
			if (row.block_type_id === END_OF_BOREHOLE_BLOCK_TYPE_ID) {
				ended.add(row.borehole_id);
			}
		}

		if (rows.length < PAGE_SIZE) {
			break;
		}
	}

	// Every requested borehole gets an entry, so the caller never has to tell "absent"
	// apart from "no blocks".
	for (const boreholeId of boreholeIds) {
		statusByBoreholeId.set(
			boreholeId,
			ended.has(boreholeId)
				? 'completed'
				: started.has(boreholeId)
					? 'inProgress'
					: 'notStarted',
		);
	}

	return statusByBoreholeId;
}
