import { BaseBlock } from "@/interfaces/Block";
import { SptBlock } from "@/interfaces/SptBlock";
import { serializeSptBlock } from "@/json/sptBlock/serializeSptBlock";
import { SQLiteDatabase } from "expo-sqlite";

export async function editSptBlockDbAsync(db: SQLiteDatabase, sptBlock: BaseBlock & SptBlock): Promise<void> {
  await db.runAsync(
    `
    UPDATE blocks 
    SET payload = $payload
    WHERE id = $blockId;
    `, {
      $payload: serializeSptBlock(sptBlock),
      $blockId: sptBlock.blockId,
    }
  );
  return;
}
