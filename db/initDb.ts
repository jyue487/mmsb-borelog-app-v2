import { SQLiteDatabase } from "expo-sqlite";
import { runMigrations } from "./runMigrations";

export async function initDb(db: SQLiteDatabase): Promise<void> {
    // Set journal mode
    await db.execAsync('PRAGMA journal_mode = WAL;');

    // Enable foreign key constraints
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Optional: verify PRAGMA values
    const journal = await db.getFirstAsync('PRAGMA journal_mode;');
    const fk = await db.getFirstAsync('PRAGMA foreign_keys;');
    console.log('Journal mode:', journal); // should be 'wal'
    console.log('Foreign keys enabled:', fk); // should be 1

    let currentDbVersionResult = await db.getFirstAsync<{user_version: number}>('PRAGMA user_version');
    console.log('currentDbVersion:', currentDbVersionResult);
    
    console.log('Started running database migration...');

    runMigrations(db, currentDbVersionResult?.user_version ?? 0);

    console.log('Finished running database migration...');

    currentDbVersionResult = await db.getFirstAsync('PRAGMA user_version');
    console.log('currentDbVersionResult:', currentDbVersionResult);

    return;
}