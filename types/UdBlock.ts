import { UD_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';

export interface UdBlock {
    readonly blockTypeId: typeof UD_BLOCK_TYPE_ID;
    blockType: 'Ud';
    udName: string;
}