import { Block, serializeBlock } from '@mmsb/core';
import { powersync } from "@/src/powersync/system";

/**
 * Updates a block in place, keeping its id.
 *
 * Keeping the id is the whole point. Editing used to be delete-then-add with a
 * fresh `randomUUID()` from the block's `checkAndReturn*`, which stranded every
 * photo already on the block: `block_photos.block_id` still pointed at the row
 * that had just been deleted, so the photos vanished from both apps and their
 * Storage objects became unreachable. See docs/follow-ups.md item 4.
 *
 * `block_type_id` is in the SET list because the form lets the operation type
 * change on an edit — `BLOCK_TYPE_ID_TO_OPERATION_TYPE` seeds the picker but does
 * not lock it. Updating only the payload would leave the column disagreeing with
 * the JSON it describes, which is what the deserializer dispatches on.
 *
 * `created_at` is deliberately untouched: it records when the block was logged,
 * not when it was last corrected.
 */
export async function editBlockDbAsync(
  block: Block
): Promise<void> {
  await powersync.execute(
    `
      UPDATE blocks
      SET payload = ?, block_type_id = ?, updated_at = ?
      WHERE id = ?;
    `, [
      serializeBlock(block),
      block.blockTypeId,
      new Date().toISOString(),
      block.id,
    ]
  );
}
