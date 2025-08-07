import { BaseBlock } from "@/interfaces/Block";
import { SptBlock } from "@/interfaces/SptBlock";
import { serializeSptBlock } from "@/json/sptBlock/serializeSptBlock";
import { SQLiteDatabase } from "expo-sqlite";

export async function addSptBlockDbAsync(
    db: SQLiteDatabase,
    sptBlock: BaseBlock & SptBlock,
): Promise<BaseBlock & SptBlock> {
    const result = await db.runAsync(
        `
        INSERT INTO blocks (
          boreholeId,
          blockTypeId,
          payload
        ) VALUES (
          $boreholeId,
          $blockTypeId,
          $payload
        )
        `, {
          $boreholeId: sptBlock.boreholeId,
          $blockTypeId: sptBlock.blockTypeId,
          $payload: serializeSptBlock(sptBlock)
        }
    );
    return {
      ...sptBlock,
      id: result.lastInsertRowId,
      blockId: result.lastInsertRowId,
    }
}
