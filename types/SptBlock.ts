import { SPT_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';

export interface SptBlock {
    block_id: number;
    readonly block_type_id: typeof SPT_BLOCK_TYPE_ID;
    block_type: 'Spt';
    topDepthInMetres: number;
    baseDepthInMetres: number;
    soilDescription: string;
    seatingIncBlows1: number;
    seatingIncBlows2: number;
    mainIncBlows1: number;
    mainIncBlows2: number;
    mainIncBlows3: number;
    mainIncBlows4: number;
}