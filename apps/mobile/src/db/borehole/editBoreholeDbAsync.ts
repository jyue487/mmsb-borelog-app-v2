import { EditBoreholeParams } from "@/src/interfaces/Borehole";
import { PowerSyncDatabase } from "@powersync/react-native";

// `name` is deliberately absent from the SET list even though EditBoreholeParams
// carries it. Renaming a borehole is an owner/admin action on the dashboard, and
// the boreholes_name_immutable trigger enforces that server-side by RAISING
// (packages/supabase/policies/boreholes.sql). Connector.ts rethrows instead of
// calling transaction.complete(), which is what makes PowerSync retry — so a
// single rejected rename would stall every upload queued behind it on this
// device. Not writing the column is what guarantees that cannot happen.
export async function editBoreholeDbAsync(
	db: PowerSyncDatabase,
	editBoreholeParams: EditBoreholeParams
): Promise<void> {
	await db.execute(
		`
			UPDATE 
				boreholes 
			SET 
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