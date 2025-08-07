import { Project } from "@/interfaces/Project";
import { SQLiteDatabase, SQLiteRunResult } from "expo-sqlite";

export async function fetchProjectByIdAsync(db: SQLiteDatabase, projectId: number): Promise<Project> {
    const result: Project | null = await db.getFirstAsync<Project>('SELECT * FROM projects WHERE id = ?', projectId);
    if (!result) {
    throw new Error(`Error. No such project.`);
    }
    return result;
}