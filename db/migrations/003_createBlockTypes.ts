import { Migration } from "@/interfaces/Migration";
import { SQLiteDatabase } from "expo-sqlite";

export const MIGRATION_003: Migration = {
    version: 3,
    name: 'Create blockTypes',
    run: async (db: SQLiteDatabase) => {
        await db.execAsync(
            `
            DROP TABLE IF EXISTS blockTypes;
            `
        );
        await db.execAsync(
            `
            CREATE TABLE IF NOT EXISTS blockTypes (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL UNIQUE
            );
            `
        );
        const res = (await db.getAllAsync('PRAGMA table_info(blockTypes)'));
        for (const row of res) {
            console.log(row);
        }
    },
} as const;