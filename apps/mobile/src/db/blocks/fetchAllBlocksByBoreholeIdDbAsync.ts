import { Block, parseBlock } from '@mmsb/core';
import { powersync } from "@/src/powersync/system";

export async function fetchAllBlocksByBoreholeIdDbAsync(boreholeId: string): Promise<Block[]> {
  const result = await powersync.getAll('SELECT * FROM blocks WHERE borehole_id = ?', [boreholeId]);
  return result.map((row: any): Block => parseBlock(row));
}
