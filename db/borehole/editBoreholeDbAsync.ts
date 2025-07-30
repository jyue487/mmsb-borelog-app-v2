import { EditBoreholeParams } from "@/interfaces/Borehole";
import { SQLiteDatabase, SQLiteRunResult } from "expo-sqlite";

export async function editBoreholeDbAsync(
    db: SQLiteDatabase,
    editBoreholeParams: EditBoreholeParams
): Promise<SQLiteRunResult> {
    const result: SQLiteRunResult = await db.runAsync(
        `
        UPDATE 
            boreholes 
        SET 
            name = $name,
            typeOfBoring = $typeOfBoring,
            typeOfRig = $typeOfRig,
            diameterOfBoring = $diameterOfBoring,
            eastingInMetres = $eastingInMetres,
            northingInMetres = $northingInMetres,
            reducedLevelInMetres = $reducedLevelInMetres
        WHERE 
            id = $id
        `, {
            $name: editBoreholeParams.name,
            $typeOfBoring: editBoreholeParams.typeOfBoring,
            $typeOfRig: editBoreholeParams.typeOfRig,
            $diameterOfBoring: editBoreholeParams.diameterOfBoring,
            $eastingInMetres: editBoreholeParams.eastingInMetres,
            $northingInMetres: editBoreholeParams.northingInMetres,
            $reducedLevelInMetres: editBoreholeParams.reducedLevelInMetres,
            $id: editBoreholeParams.id,
        }
    );
    return result;
}