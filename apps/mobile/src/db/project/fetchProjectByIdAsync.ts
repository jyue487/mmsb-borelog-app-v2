import { parseSptNMax } from "@mmsb/core";

import { Project } from "@/src/interfaces/Project";
import { powersync } from "@/src/powersync/system";

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
        sptNMax: parseSptNMax(result.spt_n_max),
    };
    return project;
}