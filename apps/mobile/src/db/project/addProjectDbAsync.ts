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
				consultant
			) VALUES (
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
			projectParams.consultant
		]
	);
	return {
		id: id,
		...projectParams,
	};
}