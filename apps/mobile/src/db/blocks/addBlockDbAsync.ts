
import { Block } from "@/src/interfaces/Block";
import { serializeBlock } from "@/src/json/serializeBlock";
import { powersync } from "@/src/powersync/system";

export async function addBlockDbAsync(
  block: Block,
): Promise<Block> {
  console.log(serializeBlock(block));
  await powersync.execute(
      `
      INSERT INTO blocks (
        id,
        borehole_id,
        block_type_id,
        payload,
        created_at,
        updated_at
      ) VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
      )
      `, [
        block.id,
        block.boreholeId,
        block.blockTypeId,
        serializeBlock(block),
        new Date().toISOString(),
        null,
      ]
  );
  return {
    ...block,
    id: block.id,
    createdAt: new Date(),
    updatedAt: null,
  }
}
