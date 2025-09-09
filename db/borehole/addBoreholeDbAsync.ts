import { AddBoreholeParams, Borehole } from "@/interfaces/Borehole";
import { SQLiteDatabase } from "expo-sqlite";

export async function addBoreholeDbAsync(
    db: SQLiteDatabase,
    projectId: number,
    addBoreholeParams: AddBoreholeParams
): Promise<Borehole> {
    const result = await db.runAsync(
        `
        INSERT INTO boreholes (
          projectId,
          name,
          typeOfBoring,
          typeOfRig,
          diameterOfBoring,
          eastingInMetres,
          northingInMetres,
          reducedLevelInMetres,
          drillerName,
          verifierName,
          verifierSignatureBase64,
          verifierSignDate
        ) VALUES (
          $projectId,
          $name,
          $typeOfBoring,
          $typeOfRig,
          $diameterOfBoring,
          $eastingInMetres,
          $northingInMetres,
          $reducedLevelInMetres,
          $drillerName,
          $verifierName,
          $verifierSignatureBase64,
          $verifierSignDate
        )
        `, {
          $projectId: projectId,
          $name: addBoreholeParams.name,
          $typeOfBoring: addBoreholeParams.typeOfBoring,
          $typeOfRig: addBoreholeParams.typeOfRig,
          $diameterOfBoring: addBoreholeParams.diameterOfBoring,
          $eastingInMetres: addBoreholeParams.eastingInMetres,
          $northingInMetres: addBoreholeParams.northingInMetres,
          $reducedLevelInMetres: addBoreholeParams.reducedLevelInMetres,
          $drillerName: addBoreholeParams.drillerName,
          $verifierName: addBoreholeParams.verifierName,
          $verifierSignatureBase64: addBoreholeParams.verifierSignatureBase64,
          $verifierSignDate: addBoreholeParams.verifierSignDate?.toISOString() ?? null,
        }
    );
    return {
        id: result.lastInsertRowId,
        projectId: projectId,
        ...addBoreholeParams
    }
}