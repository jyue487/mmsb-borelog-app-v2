import { db } from "../db";
import { powersync } from "@/powersync/system";

export async function deleteBlockByBlockIdDbAsync(blockId: string) {
    await powersync.execute('DELETE FROM blocks WHERE id = ?', [blockId]);
}