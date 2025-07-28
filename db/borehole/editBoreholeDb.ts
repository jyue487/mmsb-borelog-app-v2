import { EditBoreholeParams } from "@/interfaces/Borehole";
import { SQLiteDatabase,SQLiteRunResult } from "expo-sqlite";

export async function editBoreholeDb(
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
            diameterOfBoring = $diameterOfBoring,
            eastingInMetres = $eastingInMetres,
            northingInMetres = $northingInMetres,
            reducedLevelInMetres = $reducedLevelInMetres
        WHERE 
            id = $id
        `, {
            $name: editBoreholeParams.name,
            $typeOfBoring: editBoreholeParams.typeOfBoring,
            $diameterOfBoring: editBoreholeParams.diameterOfBoring,
            $eastingInMetres: editBoreholeParams.eastingInMetres,
            $northingInMetres: editBoreholeParams.northingInMetres,
            $reducedLevelInMetres: editBoreholeParams.reducedLevelInMetres,
            $id: editBoreholeParams.id,
        }
    );
    return result;
}