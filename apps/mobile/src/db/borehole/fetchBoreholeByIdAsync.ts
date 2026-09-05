import { Borehole, toDate } from '@mmsb/core';
import { powersync } from "@/src/powersync/system";

export async function fetchBoreholeByIdAsync(boreholeId: string): Promise<Borehole> {
    const result: any = await powersync.get('SELECT * FROM boreholes WHERE id = ?', [boreholeId]);
    if (!result) {
        throw new Error(`Error. No such borehole.`);
    }
    const borehole: Borehole = {
        id: result.id,
        projectId: result.project_id,
        name: result.name,
        typeOfBoring: result.type_of_boring,
        typeOfRig: result.type_of_rig,
        diameterOfBoring: result.diameter_of_boring,
        eastingInMetres: result.easting_in_metres,
        northingInMetres: result.northing_in_metres,
        reducedLevelInMetres: result.reduced_level_in_metres,
        drillerName: result.driller_name,
        checkerName: result.checker_name,
        checkerSignatureBase64: result.checker_signature_base64,
        checkerSignDate: toDate(result.checker_sign_date),
        verifierName: result.verifier_name,
        verifierSignatureBase64: result.verifier_signature_base64,
        verifierSignDate: toDate(result.verifier_sign_date),
    };
    return borehole;
}