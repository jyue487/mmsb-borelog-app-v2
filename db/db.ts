import * as SQLite from 'expo-sqlite';

export const db: SQLite.SQLiteDatabase = SQLite.openDatabaseSync('mmsb.db');