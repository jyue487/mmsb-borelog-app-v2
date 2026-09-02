import { AddBoreholeParams, Borehole } from '@mmsb/core';
import { PowerSyncDatabase } from "@powersync/react-native";
import { randomUUID } from "expo-crypto";

export async function addBoreholeDbAsync(
  db: PowerSyncDatabase,
  projectId: string,
  userId: string,
  addBoreholeParams: AddBoreholeParams
): Promise<Borehole> {
  const id = randomUUID();
  // A single statement, so no transaction. This used to be a writeTransaction
  // wrapping this insert and a second one into `borehole_to_user`, which existed
  // only to make the pair atomic. That table was dropped from Postgres when
  // assignment moved to `project_to_user`, and the insert had been failing in the
  // CRUD queue ever since — Connector.ts rethrows by design, so the unacknowledged
  // entry blocked every later upload behind it. See docs/follow-ups.md item 0b.
  await db.execute(
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
          verifier_sign_date,
          created_by
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
        addBoreholeParams.verifierSignDate?.toISOString() ?? null,
        userId
      ]
  );
  return {
    id: id,
    projectId: projectId,
    ...addBoreholeParams
  }
}