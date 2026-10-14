import { DEFAULT_SPT_N_MAX } from "@mmsb/core";

import { AddProjectParams, Project } from "@/src/interfaces/Project";
import { PowerSyncDatabase } from '@powersync/react-native';
import { randomUUID } from 'expo-crypto';

export async function addProjectDbAsync(
	db: PowerSyncDatabase,
	projectParams: AddProjectParams
): Promise<Project> {
	const id = randomUUID();
	await db.execute(
		`
			INSERT INTO projects (
				id,
				code,
				title,
				location,
				client,
				consultant,
				spt_n_max
			) VALUES (
				?,
				?,
				?,
				?,
				?,
				?,
				?
			)
		`, [
			id,
			projectParams.code,
			projectParams.title,
			projectParams.location,
			projectParams.client,
			projectParams.consultant,
			// Explicit rather than left to the column default: a PowerSync insert uploads every
			// column of the local view, so an omitted spt_n_max would upsert a null into a
			// NOT NULL column and the upload would fail.
			DEFAULT_SPT_N_MAX
		]
	);
	return {
		id: id,
		...projectParams,
		sptNMax: DEFAULT_SPT_N_MAX,
	};
}