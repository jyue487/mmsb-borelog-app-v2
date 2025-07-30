import { Borehole } from "@/interfaces/Borehole";
import { SQLiteDatabase, SQLiteRunResult } from "expo-sqlite";

export async function fetchBoreholeByIdAsync(db: SQLiteDatabase, boreholeId: number): Promise<Borehole | null> {
    const result: Borehole | null = await db.getFirstAsync<Borehole>('SELECT * FROM boreholes WHERE id = ?', boreholeId);
    return result;
}