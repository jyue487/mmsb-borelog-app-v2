import { SQLiteDatabase } from "expo-sqlite";

export async function deleteBlockByBlockIdDbAsync(db: SQLiteDatabase, blockId: number) {
    await db.runAsync('DELETE FROM blocks WHERE id = ?', blockId);
}