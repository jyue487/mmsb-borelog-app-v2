import { SQLiteDatabase } from "expo-sqlite";

export interface Migration {
    version: number,
    name: string,
    run: (db: SQLiteDatabase) => Promise<void>;
};