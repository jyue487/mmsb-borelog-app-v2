import type { Borehole } from '@mmsb/core';

// Single source of truth for the boreholes columns every query selects, the same
// role projectRow.ts plays for projects. There are no generated DB types, so a
// column missing from one of these lists fails silently as `undefined` rather
// than at compile time — and this list was previously copy-pasted into three
// call sites, which is exactly how that drift starts.
export const BOREHOLE_COLUMNS = `
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
`;

type BoreholeRow = {
  id: string;
  project_id: string;
  name: string;
  type_of_boring: string | null;
  type_of_rig: string | null;
  diameter_of_boring: string | null;
  easting_in_metres: number | null;
  northing_in_metres: number | null;
  reduced_level_in_metres: number | null;
  driller_name: string | null;
  verifier_name: string | null;
  verifier_signature_base64: string | null;
  verifier_sign_date: string | null;
};

export function mapBoreholeRow(row: BoreholeRow): Borehole {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    typeOfBoring: row.type_of_boring ?? '',
    typeOfRig: row.type_of_rig ?? '',
    diameterOfBoring: row.diameter_of_boring ?? '',
    eastingInMetres: row.easting_in_metres,
    northingInMetres: row.northing_in_metres,
    reducedLevelInMetres: row.reduced_level_in_metres,
    drillerName: row.driller_name ?? '',
    verifierName: row.verifier_name ?? '',
    verifierSignatureBase64: row.verifier_signature_base64 ?? '',
    // Hardcoded null, matching what ProjectPage and BoreholePage each did with
    // their own copy of this mapping. `verifier_sign_date` is still selected and
    // still discarded; docs/follow-ups.md item 2 is unchanged by the extraction.
    verifierSignDate: null,
  };
}
