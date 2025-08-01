import { Migration } from "@/interfaces/Migration";
import { SQLiteDatabase } from "expo-sqlite";

export const MIGRATION_001: Migration = {
    version: 1,
    name: 'Create projects',
    run: async (db: SQLiteDatabase) => {
        await db.execAsync('DROP TABLE IF EXISTS projects;');
        await db.execAsync(
            `
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY,
                code TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                location TEXT,
                client TEXT,
                consultant TEXT
            );
            `
        );
        const res = (await db.getAllAsync('PRAGMA table_info(projects)'));
        for (const row of res) {
            console.log(row);
        }
    },
} as const;