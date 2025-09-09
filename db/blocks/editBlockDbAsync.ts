import { Block } from "@/interfaces/Block";
import { serializeBlock } from "@/json/serializeBlock";
import { db } from "../db";

export async function editBlockDbAsync(
  block: Block
): Promise<void> {
  await db.runAsync(
    `
    UPDATE blocks 
    SET payload = $payload, updatedAt = $updatedAt
    WHERE id = $id;
    `, {
      $payload: serializeBlock(block),
      $id: block.id,
      $updatedAt: new Date().toISOString(),
    }
  );
  return;
}
