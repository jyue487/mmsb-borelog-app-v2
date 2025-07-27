import { END_OF_BOREHOLE_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';
import { Colour } from '@/constants/colour';
import { DayWorkStatus } from '@/constants/DayStatus';
import { RockType } from '@/constants/rock';
import { CORING_BLOCK_TYPE, END_OF_BOREHOLE_BLOCK_TYPE } from '@/interfaces/Block';

export interface EndOfBoreholeBlock {
    blockId: number;
    readonly blockTypeId: typeof END_OF_BOREHOLE_BLOCK_TYPE_ID;
    blockType: typeof END_OF_BOREHOLE_BLOCK_TYPE;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    description: string;
    otherInstallations: string;
    customInstallations: string;
    installationDepthInMetres: number | null;
    remarks: string;
}