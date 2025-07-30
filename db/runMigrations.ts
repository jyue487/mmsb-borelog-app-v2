import { SQLiteDatabase } from "expo-sqlite";
import { MIGRATIONS } from "./migrations/migrations";

export async function runMigrations(db: SQLiteDatabase, currentDbVersion: number): Promise<void> {
    for (const m of MIGRATIONS) {
        if (currentDbVersion >= m.version) {
            continue;
        }
        console.log(`Running migration v${m.version}: ${m.name}`);
        try {
            await m.run(db);
            await db.execAsync(`PRAGMA user_version = ${m.version};`);
        } catch (err) {
            console.log(err);
        }
    }
}