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
    ASPHALT_BLOCK_TYPE_ID,
    END_OF_BOREHOLE_BLOCK_TYPE_ID,
    CUSTOM_BLOCK_TYPE_ID,
    VANE_SHEAR_TEST_BLOCK_TYPE_ID,
    FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
    RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
    CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
    LUGEON_TEST_BLOCK_TYPE_ID,
    PRESSUREMETER_TEST_BLOCK_TYPE_ID,
} from "@/interfaces/Block";
import { Migration } from "@/interfaces/Migration";
import { SQLiteDatabase } from "expo-sqlite";

export const MIGRATION_005: Migration = {
    version: 5,
    name: 'Init Block Types',
    run: async (db: SQLiteDatabase) => {

        const values = [
            [SPT_BLOCK_TYPE_ID, 'SPT_BLOCK_TYPE_ID'],
            [CORING_BLOCK_TYPE_ID, 'CORING_BLOCK_TYPE_ID'],
            [CAVITY_BLOCK_TYPE_ID, 'CAVITY_BLOCK_TYPE_ID'],
            [UD_BLOCK_TYPE_ID, 'UD_BLOCK_TYPE_ID'],
            [MZ_BLOCK_TYPE_ID, 'MZ_BLOCK_TYPE_ID'],
            [PS_BLOCK_TYPE_ID, 'PS_BLOCK_TYPE_ID'],
            [HA_BLOCK_TYPE_ID, 'HA_BLOCK_TYPE_ID'],
            [WASH_BORING_BLOCK_TYPE_ID, 'WASH_BORING_BLOCK_TYPE_ID'],
            [CONCRETE_SLAB_BLOCK_TYPE_ID, 'CONCRETE_SLAB_BLOCK_TYPE_ID'],
            [ASPHALT_BLOCK_TYPE_ID, 'ASPHALT_BLOCK_TYPE_ID'],
            [END_OF_BOREHOLE_BLOCK_TYPE_ID, 'END_OF_BOREHOLE_BLOCK_TYPE_ID'],
            [CUSTOM_BLOCK_TYPE_ID, 'CUSTOM_BLOCK_TYPE_ID'],
            [VANE_SHEAR_TEST_BLOCK_TYPE_ID, 'VANE_SHEAR_TEST_BLOCK_TYPE_ID'],
            [FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID, 'FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID'],
            [RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID, 'RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID'],
            [CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID, 'CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID'],
            [LUGEON_TEST_BLOCK_TYPE_ID, 'LUGEON_TEST_BLOCK_TYPE_ID'],
            [PRESSUREMETER_TEST_BLOCK_TYPE_ID, 'PRESSUREMETER_TEST_BLOCK_TYPE_ID'],
        ];
        const placeHolders = values.map(() => '(?, ?)').join(', ');

        await db.runAsync(
            `INSERT OR IGNORE INTO blockTypes (id , name) VALUES ${placeHolders};`, 
            values.flat()
        );
        const res = (await db.getAllAsync('SELECT * FROM blockTypes'));
        for (const row of res) {
            console.log(row);
        }
    },
} as const;