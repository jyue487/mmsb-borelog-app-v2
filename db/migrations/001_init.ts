import { 
    SPT_BLOCK_TYPE_ID,
    CORING_BLOCK_TYPE_ID,
    CAVITY_BLOCK_TYPE_ID,
    UD_BLOCK_TYPE_ID,
    MZ_BLOCK_TYPE_ID,
    PS_BLOCK_TYPE_ID,
    HA_BLOCK_TYPE_ID,
    WASH_BORING_BLOCK_TYPE_ID,
    CONCRETE_SLAB_BLOCK_TYPE_ID,
    CONCRETE_PREMIX_BLOCK_TYPE_ID,
    END_OF_BOREHOLE_BLOCK_TYPE_ID,
} from "@/interfaces/Block";
import { Migration } from "@/interfaces/Migration";
import { SQLiteDatabase } from "expo-sqlite";

export const MIGRATION_001: Migration = {
    version: 1,
    name: 'Initial schema setup',
    run: async (db: SQLiteDatabase) => {
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
        await db.execAsync(
            `
            CREATE TABLE IF NOT EXISTS blockTypes (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL UNIQUE
            );
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
    },
} as const;