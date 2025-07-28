import { Migration } from "@/interfaces/Migration";
import { MIGRATION_001 } from "./001_init";

export const MIGRATIONS: Migration[] = [
    MIGRATION_001,
] as const;