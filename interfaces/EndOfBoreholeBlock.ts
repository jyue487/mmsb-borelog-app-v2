import { DayWorkStatus } from '@/constants/DayWorkStatus';
import { END_OF_BOREHOLE_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface EndOfBoreholeBlock {
    blockTypeId: typeof END_OF_BOREHOLE_BLOCK_TYPE_ID;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    description: string;
    otherInstallations: string;
    customInstallations: string;
    installationDepthInMetres: number | null;
    remarks: string;
}