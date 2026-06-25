import { AddProjectParams, Project } from "@/interfaces/Project";
import { throwError } from "@/utils/error/throwError";
import { PowerSyncDatabase } from '@powersync/react-native';
import { randomUUID } from 'expo-crypto';

export async function addProjectDbAsync(
    db: PowerSyncDatabase, 
    projectParams: AddProjectParams
): Promise<Project> {
    const id = randomUUID();
    const result = await db.execute(
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