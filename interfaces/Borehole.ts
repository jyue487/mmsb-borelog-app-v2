export interface Borehole {
    id: number, // must
    projectId: number, // must
    name: string, // must
    typeOfBoring: string,
    diameterOfBoring: string,
    eastingInMetres: number | null,
    northingInMetres: number | null,
    reducedLevelInMetres: number | null,
}

export type AddBoreholeParams = Omit<Borehole, 'id' | 'projectId'>;
export type EditBoreholeParams = Omit<Borehole, 'projectId'>;