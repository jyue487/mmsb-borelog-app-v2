import { AddBoreholeParams, Borehole } from "@/interfaces/Borehole";
import { SQLiteDatabase } from "expo-sqlite";
import { PowerSyncDatabase } from "@powersync/react-native";
import { randomUUID } from "expo-crypto";

export async function addBoreholeDbAsync(
  db: PowerSyncDatabase,
  projectId: string,
  userId: string,
  addBoreholeParams: AddBoreholeParams
): Promise<Borehole> {
  const id = randomUUID();
  await db.writeTransaction(async (tx) => {
    await tx.execute(
      `
        INSERT INTO boreholes (
          id,
          project_id,
          name,
          type_of_boring,
          type_of_rig,
          diameter_of_boring,
          easting_in_metres,
          northing_in_metres,
          reduced_level_in_metres,
          driller_name,
          verifier_name,
          verifier_signature_base64,
          verifier_sign_date
        ) VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
      `, [
        id,
        projectId,
        addBoreholeParams.name,
        addBoreholeParams.typeOfBoring,
        addBoreholeParams.typeOfRig,
        addBoreholeParams.diameterOfBoring,
        addBoreholeParams.eastingInMetres,
        addBoreholeParams.northingInMetres,
        addBoreholeParams.reducedLevelInMetres,
        addBoreholeParams.drillerName,
        addBoreholeParams.verifierName,
        addBoreholeParams.verifierSignatureBase64,
        addBoreholeParams.verifierSignDate?.toISOString() ?? null
      ]
    );
    await tx.execute(
      `
      INSERT INTO borehole_to_user (id, borehole_id, user_id) 
      VALUES (uuid(), ?, ?)
      `, [id, userId]
    );
  });
  return {
    id: id,
    projectId: projectId,
    ...addBoreholeParams
  }
}