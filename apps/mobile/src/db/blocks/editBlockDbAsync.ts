import { Block } from "@/src/interfaces/Block";
import { serializeBlock } from "@/src/json/serializeBlock";
import { powersync } from "@/src/powersync/system";

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
