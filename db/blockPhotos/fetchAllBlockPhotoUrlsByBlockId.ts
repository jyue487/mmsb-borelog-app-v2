import { powersync } from "@/powersync/system";

export async function fetchAllBlockPhotoUrlsByBlockId(blockId: string): Promise<{ id: string; localUri: string; }[]> {
  const rows = await powersync.getAll<{ id: string, local_uri: string }>(
    `
      SELECT a.id, a.local_uri
      FROM block_photos bp
      JOIN attachments a ON a.id = bp.id
      WHERE bp.block_id = ?
        AND a.local_uri IS NOT NULL
      ORDER BY bp.created_at
    `,
    [blockId]
  );

  return rows.map((row) => ({ id: row.id, localUri: row.local_uri }));
}