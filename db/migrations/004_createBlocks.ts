import { Migration } from "@/interfaces/Migration";
import { SQLiteDatabase } from "expo-sqlite";

export const MIGRATION_004: Migration = {
    version: 4,
    name: 'Create blocks',
    run: async (db: SQLiteDatabase) => {
        await db.execAsync(
            `
            DROP TABLE IF EXISTS blocks;
            `
        );
        await db.execAsync(
            `
            CREATE TABLE IF NOT EXISTS blocks (
                id INTEGER PRIMARY KEY,
                boreholeId INTEGER NOT NULL,
                blockTypeId INTEGER NOT NULL,
                FOREIGN KEY (boreholeId) REFERENCES boreholes(id) ON DELETE CASCADE,
                FOREIGN KEY (blockTypeId) REFERENCES blockTypes(id) ON DELETE CASCADE
            );
            `
        );
        const res = (await db.getAllAsync('PRAGMA table_info(blocks)'));
        for (const row of res) {
            console.log(row);
        }
    },
} as const;