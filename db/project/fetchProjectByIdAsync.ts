import { Project } from "@/interfaces/Project";
import { db } from "../db";
import { powersync } from "@/powersync/system";

export async function fetchProjectByIdAsync(projectId: string): Promise<Project> {
    const result: any = await powersync.get('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!result) {
        throw new Error(`Error. No such project.`);
    }
    const project: Project = {
        id: result.id,
        code: result.code,
        title: result.title,
        location: result.location,
        client: result.client,
        consultant: result.consultant,
    };
    return project;
}