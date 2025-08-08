import * as SQLite from 'expo-sqlite';

export const db: SQLite.SQLiteDatabase = await SQLite.openDatabaseAsync('mmsb.db');