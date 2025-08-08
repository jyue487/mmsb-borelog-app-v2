import { Block } from "@/interfaces/Block";
import { serializeBlock } from "@/json/serializeBlock";
import { SQLiteDatabase } from "expo-sqlite";

export async function addBlockDbAsync(
    db: SQLiteDatabase,
    block: Block,
): Promise<Block> {

    const result = await db.runAsync(
        `
        INSERT INTO blocks (
          boreholeId,
          blockTypeId,
          payload,
          createdAt,
          updatedAt
        ) VALUES (
          $boreholeId,
          $blockTypeId,
          $payload,
          $createdAt,
          $updatedAt
        )
        `, {
          $boreholeId: block.boreholeId,
          $blockTypeId: block.blockTypeId,
          $payload: serializeBlock(block),
          $createdAt: new Date().toISOString(),
          $updatedAt: null,
        }
    );
    return {
      ...block,
      id: result.lastInsertRowId,
      createdAt: new Date(),
      updatedAt: null,
    }
}
