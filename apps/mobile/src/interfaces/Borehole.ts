export interface Borehole {
    id: string; // must
    projectId: string; // must
    name: string; // must
    typeOfBoring: string;
    typeOfRig: string;
    diameterOfBoring: string;
    eastingInMetres: number | null;
    northingInMetres: number | null;
    reducedLevelInMetres: number | null;
    drillerName: string;
    verifierName: string;
    verifierSignatureBase64: string;
    verifierSignDate: Date | null;
}

export type AddBoreholeParams = Omit<Borehole, 'id' | 'projectId'>;
export type EditBoreholeParams = Omit<Borehole, 'projectId'>;