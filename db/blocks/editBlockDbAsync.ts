import { Block } from "@/interfaces/Block";
import { serializeBlock } from "@/json/serializeBlock";
import { db } from "../db";
import { powersync } from "@/powersync/system";

export async function editBlockDbAsync(
  block: Block
): Promise<void> {
  await powersync.execute(
    `
      UPDATE blocks 
      SET payload = ?, updated_at = ?
      WHERE id = ?;
    `, [
      serializeBlock(block),
      block.id,
      new Date().toISOString(),
    ]
  );
  return;
}
