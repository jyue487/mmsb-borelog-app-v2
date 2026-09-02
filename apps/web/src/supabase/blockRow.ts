import { parseBlock, type Block } from '@mmsb/core';

// Single source of truth for the blocks columns every query selects. There are no
// generated DB types, so a column missing from this list fails silently as
// `undefined` rather than at compile time.
export const BLOCK_COLUMNS =
  'id, borehole_id, block_type_id, payload, created_at, updated_at';

export type BlockRow = {
  id: string;
  borehole_id: string;
  block_type_id: number;
  payload: string;
  created_at: string | null;
  updated_at: string | null;
};

export function mapBlockRow(row: BlockRow): Block {
  return parseBlock(row);
}
