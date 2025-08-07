import { Block } from "@/interfaces/Block";
import { deserializeSptBlock } from "@/json/sptBlock/deserializeSptBlock";
import { SQLiteDatabase } from "expo-sqlite";

export async function fetchAllBlocksByBoreholeIdDbAsync(db: SQLiteDatabase, boreholeId: number): Promise<Block[]> {
    const result = await db.getAllAsync('SELECT * FROM blocks WHERE boreholeId = ?', boreholeId);
    const blocks: Block[] = result.map((row: any) => {
        const block: Block = deserializeSptBlock(row.payload);
        return {
            ...block,
            id: row.id,
            blockId: row.id,
        };
    });
    return blocks;
}