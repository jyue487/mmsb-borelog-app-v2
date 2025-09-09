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
            reducedLevelInMetres = $reducedLevelInMetres,
            drillerName = $drillerName,
            verifierName = $verifierName,
            verifierSignatureBase64 = $verifierSignatureBase64,
            verifierSignDate = $verifierSignDate
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
            $drillerName: editBoreholeParams.drillerName,
            $verifierName: editBoreholeParams.verifierName,
            $verifierSignatureBase64: editBoreholeParams.verifierSignatureBase64,
            $verifierSignDate: editBoreholeParams.verifierSignDate?.toISOString() ?? null,
            $id: editBoreholeParams.id,
        }
    );
    return result;
}