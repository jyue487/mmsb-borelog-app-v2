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
          reducedLevelInMetres
        ) VALUES (
          $projectId,
          $name,
          $typeOfBoring,
          $typeOfRig,
          $diameterOfBoring,
          $eastingInMetres,
          $northingInMetres,
          $reducedLevelInMetres
        )
        `, {
          $projectId: projectId,
          $name: addBoreholeParams.name,
          $typeOfBoring: addBoreholeParams.typeOfBoring,
          $typeOfRig: addBoreholeParams.typeOfRig,
          $diameterOfBoring: addBoreholeParams.diameterOfBoring,
          $eastingInMetres: addBoreholeParams.eastingInMetres,
          $northingInMetres: addBoreholeParams.northingInMetres,
          $reducedLevelInMetres: addBoreholeParams.reducedLevelInMetres
        }
    );
    return {
        id: result.lastInsertRowId,
        projectId: projectId,
        ...addBoreholeParams
    }
}