import { Migration } from "@/interfaces/Migration";
import { MIGRATION_001 } from "./001_createProjects";
import { MIGRATION_002 } from "./002_createBoreholes";
import { MIGRATION_003 } from "./003_createBlockTypes";
import { MIGRATION_004 } from "./004_createBlocks";
import { MIGRATION_005 } from "./005_initBlockTypes";

export const MIGRATIONS: Migration[] = [
    MIGRATION_001,
    MIGRATION_002,
    MIGRATION_003,
    MIGRATION_004,
    MIGRATION_005
] as const;