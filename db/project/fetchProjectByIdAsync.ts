import { Project } from "@/interfaces/Project";
import { SQLiteDatabase, SQLiteRunResult } from "expo-sqlite";

export async function fetchProjectByIdAsync(db: SQLiteDatabase, projectId: number) {
    const result: Project | null = await db.getFirstAsync<Project>('SELECT * FROM projects WHERE id = ?', projectId);
    return result;
}