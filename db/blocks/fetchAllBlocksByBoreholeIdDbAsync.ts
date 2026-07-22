import { Block } from "@/interfaces/Block";
import { deserializeBlock } from "@/json/deserializeBlock";
import { db } from "../db";
import { powersync } from "@/powersync/system";

export async function fetchAllBlocksByBoreholeIdDbAsync(boreholeId: string): Promise<Block[]> {
  const result = await powersync.getAll('SELECT * FROM blocks WHERE borehole_id = ?', [boreholeId]);
  const blocks: Block[] = result.map((row: any): Block => {
    const block: Block = deserializeBlock(row);
    return {
      ...block,
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
  return blocks;
}