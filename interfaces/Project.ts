export interface Project {
    id: number; // must
    code: string; // must
    title: string; //must
    location: string;
    client: string;
    consultant: string;
}

export type AddProjectParams = Omit<Project, 'id'>;
export type EditProjectParams = Omit<Project, 'code'>;