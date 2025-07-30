import { AddProjectParams, Project } from "@/interfaces/Project";
import { SQLiteDatabase, SQLiteRunResult } from "expo-sqlite";

export async function addProjectDbAsync(
    db: SQLiteDatabase, 
    projectParams: AddProjectParams
): Promise<Project> {
    const result: SQLiteRunResult = await db.runAsync(
        `
        INSERT INTO projects (
            code,
            title,
            location,
            client,
            consultant
        ) VALUES (
            $code,
            $title,
            $location,
            $client,
            $consultant
        )
        `, {
            $code: projectParams.code,
            $title: projectParams.title,
            $location: projectParams.location,
            $client: projectParams.client,
            $consultant: projectParams.consultant
        }
    );
    return {
        id: result.lastInsertRowId,
        ...projectParams,
    };
}