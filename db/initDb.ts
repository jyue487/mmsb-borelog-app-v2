import { SQLiteDatabase } from "expo-sqlite";

export async function initDb(db: SQLiteDatabase) {
    // Set journal mode
    await db.execAsync('PRAGMA journal_mode = WAL;');

    // Enable foreign key constraints
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Optional: verify PRAGMA values
    const journal = await db.getFirstAsync('PRAGMA journal_mode;');
    const fk = await db.getFirstAsync('PRAGMA foreign_keys;');
    console.log('Journal mode:', journal); // should be 'wal'
    console.log('Foreign keys enabled:', fk); // should be 1

    await db.execAsync(
        `
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY, 
            name TEXT NOT NULL
        );
        `
    );

    await db.execAsync(
        `
        CREATE TABLE IF NOT EXISTS boreholes (
            id INTEGER PRIMARY KEY,
            projectId INTEGER,
            name TEXT NOT NULL,
            FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
        );
        `
    );

    return;
}