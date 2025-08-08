import { Project } from "@/interfaces/Project";
import { db } from "../db";

export async function fetchProjectByIdAsync(projectId: number): Promise<Project> {
    const result: Project | null = await db.getFirstAsync<Project>('SELECT * FROM projects WHERE id = ?', projectId);
    if (!result) {
    throw new Error(`Error. No such project.`);
    }
    return result;
}