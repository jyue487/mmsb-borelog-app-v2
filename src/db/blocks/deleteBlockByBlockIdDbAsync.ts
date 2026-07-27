import { powersync } from "@/src/powersync/system";

export async function deleteBlockByBlockIdDbAsync(blockId: string) {
    await powersync.execute('DELETE FROM blocks WHERE id = ?', [blockId]);
}