import { Migration } from "@/interfaces/Migration";
import { SQLiteDatabase } from "expo-sqlite";

export const MIGRATION_002: Migration = {
    version: 2,
    name: 'Create boreholes',
    run: async (db: SQLiteDatabase) => {
        await db.execAsync('DROP TABLE IF EXISTS boreholes;');
        await db.execAsync(
            `
            CREATE TABLE IF NOT EXISTS boreholes (
                id INTEGER PRIMARY KEY,
                projectId INTEGER NOT NULL,
                name TEXT NOT NULL,
                typeOfBoring TEXT,
                typeOfRig TEXT,
                diameterOfBoring TEXT,
                eastingInMetres REAL,
                northingInMetres REAL,
                reducedLevelInMetres REAL,
                FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
            );
            `
        );
        const res = (await db.getAllAsync('PRAGMA table_info(boreholes)'));
        for (const row of res) {
            console.log(row);
        }
    },
} as const;