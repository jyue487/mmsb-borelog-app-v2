import { UD_BLOCK_TYPE_ID } from '@/constants/BlockTypeId';

export interface UdBlock {
    readonly block_type_id: typeof UD_BLOCK_TYPE_ID;
    block_type: 'Ud';
    udName: string;
}