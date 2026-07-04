import { EditBoreholeParams } from "@/interfaces/Borehole";
import { SQLiteDatabase, SQLiteRunResult } from "expo-sqlite";
import { PowerSyncDatabase } from "@powersync/react-native";

export async function editBoreholeDbAsync(
	db: PowerSyncDatabase,
	editBoreholeParams: EditBoreholeParams
): Promise<void> {
	await db.execute(
		`
			UPDATE 
				boreholes 
			SET 
				name = ?,
				type_of_boring = ?,
				type_of_rig = ?,
				diameter_of_boring = ?,
				easting_in_metres = ?,
				northing_in_metres = ?,
				reduced_level_in_metres = ?,
				driller_name = ?,
				verifier_name = ?,
				verifier_signature_base64 = ?,
				verifier_sign_date = ?
			WHERE 
				id = ?
		`, [
			editBoreholeParams.name,
			editBoreholeParams.typeOfBoring,
			editBoreholeParams.typeOfRig,
			editBoreholeParams.diameterOfBoring,
			editBoreholeParams.eastingInMetres,
			editBoreholeParams.northingInMetres,
			editBoreholeParams.reducedLevelInMetres,
			editBoreholeParams.drillerName,
			editBoreholeParams.verifierName,
			editBoreholeParams.verifierSignatureBase64,
			editBoreholeParams.verifierSignDate?.toISOString() ?? null,
			editBoreholeParams.id,
		]
	);
	return;
}