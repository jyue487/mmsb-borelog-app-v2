import { db } from "../db";

export async function deleteBlockByBlockIdDbAsync(blockId: number) {
    await db.runAsync('DELETE FROM blocks WHERE id = ?', blockId);
}