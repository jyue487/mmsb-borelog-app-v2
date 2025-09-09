import { Borehole } from "@/interfaces/Borehole";
import { db } from "../db";
import { deserializeDateTime } from "@/json/deserializeDateTime";

export async function fetchBoreholeByIdAsync(boreholeId: number): Promise<Borehole> {
    const result: any = await db.getFirstAsync('SELECT * FROM boreholes WHERE id = ?', boreholeId);
    if (!result) {
        throw new Error(`Error. No such borehole.`);
    }
    const borehole: Borehole = {
        id: result.id,
        projectId: result.projectId,
        name: result.name,
        typeOfBoring: result.typeOfBoring,
        typeOfRig: result.typeOfRig,
        diameterOfBoring: result.diameterOfBoring,
        eastingInMetres: result.eastingInMetres,
        northingInMetres: result.northingInMetres,
        reducedLevelInMetres: result.reducedLevelInMetres,
        drillerName: result.drillerName,
        verifierName: result.verifierName,
        verifierSignatureBase64: result.verifierSignatureBase64,
        verifierSignDate: (result.verifierSignDate === null) ? null : deserializeDateTime(result.verifierSignDate),
    };
    return borehole;
}