import { EditProjectParams } from "@/interfaces/Project";
import { SQLiteDatabase, SQLiteRunResult } from "expo-sqlite";

export async function editProjectDbAsync(
    db: SQLiteDatabase,
    editProjectParams: EditProjectParams,
): Promise<SQLiteRunResult> {
  const result: SQLiteRunResult = await db.runAsync(
      `
      UPDATE 
        projects 
      SET 
        title = $title,
        location = $location,
        client = $client,
        consultant = $consultant
      WHERE 
        id = $id
      `, {
        $title: editProjectParams.title,
        $location: editProjectParams.location,
        $client: editProjectParams.client,
        $consultant: editProjectParams.consultant,
        $id: editProjectParams.id
      }
  );
  return result;
}