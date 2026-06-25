import { EditProjectParams } from "@/interfaces/Project";
import { SQLiteDatabase, SQLiteRunResult } from "expo-sqlite";
import { PowerSyncDatabase } from '@powersync/react-native';

export async function editProjectDbAsync(
  db: PowerSyncDatabase,
  editProjectParams: EditProjectParams,
): Promise<void> {
  await db.execute(
    `
    UPDATE 
      projects 
    SET 
      title = ?,
      location = ?,
      client = ?,
      consultant = ?
    WHERE 
      id = ?
    `, [
      editProjectParams.title,
      editProjectParams.location,
      editProjectParams.client,
      editProjectParams.consultant,
      editProjectParams.id
    ]
  );
  return;
}