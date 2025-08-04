import { DayWorkStatus } from '@/constants/DayWorkStatus';
import { VANE_SHEAR_TEST_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface VaneShearTestBlock {
    id: number;
    blockTypeId: typeof VANE_SHEAR_TEST_BLOCK_TYPE_ID;
    vaneShearTestIndex: number;
    dayWorkStatus: DayWorkStatus;
    topDepthInMetres: number;
    baseDepthInMetres: number;
    readonly description: 'Vane Shear Test';
}