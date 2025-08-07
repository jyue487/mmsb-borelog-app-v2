import { BaseBlock } from "@/interfaces/Block";
import { SptBlock } from "@/interfaces/SptBlock";

export function deserializeSptBlock(json: string): BaseBlock & SptBlock {
    const parsed = JSON.parse(json);
    const sptBlock: BaseBlock & SptBlock = {
        id: parsed.id,
        blockId: parsed.blockId,
        boreholeId: parsed.boreholeId,
        blockTypeId: parsed.blockTypeId,
        sptIndex: parsed.sptIndex,
        disturbedSampleIndex: parsed.disturbedSampleIndex,
        dayWorkStatus: {
            dayWorkStatusType: parsed.dayWorkStatus.dayWorkStatusType,
            date: new Date(parsed.dayWorkStatus.date),
            time: new Date(parsed.dayWorkStatus.time),
            waterLevelInMetres: parsed.dayWorkStatus.waterLevelInMetres,
            casingDepthInMetres: parsed.dayWorkStatus.casingDepthInMetres,
        },
        topDepthInMetres: parsed.topDepthInMetres,
        baseDepthInMetres: parsed.baseDepthInMetres,
        description: parsed.description,
        seatingIncBlows1: parsed.seatingIncBlows1,
        seatingIncPen1: parsed.seatingIncPen1,
        seatingIncBlows2: parsed.seatingIncBlows2,
        seatingIncPen2: parsed.seatingIncPen2,
        mainIncBlows1: parsed.mainIncBlows1,
        mainIncPen1: parsed.mainIncPen1,
        mainIncBlows2: parsed.mainIncBlows2,
        mainIncPen2: parsed.mainIncPen2,
        mainIncBlows3: parsed.mainIncBlows3,
        mainIncPen3: parsed.mainIncPen3,
        mainIncBlows4: parsed.mainIncBlows4,
        mainIncPen4: parsed.mainIncPen4,
        sptNValue: parsed.sptNValue,
        totalMainPenetrationInMillimetres: parsed.totalMainPenetrationInMillimetres,
        recoveryInPercentage: parsed.recoveryInPercentage,
        recoveryLengthInMillimetres: parsed.recoveryLengthInMillimetres,
        colourProperties: {
            dominantColour: (parsed.colourProperties.dominantColour === null) ? null : {
                level: parsed.colourProperties.dominantColour.level,
                colourTag: parsed.colourProperties.dominantColour.colourTag,
                colourTagFontColour: parsed.colourProperties.dominantColour.colourTagFontColour,
                colourNameForSoilDescription: parsed.colourProperties.dominantColour.colourNameForSoilDescription,
                colourCode: parsed.colourProperties.dominantColour.colourCode,
                colourFamily: parsed.colourProperties.dominantColour.colourFamily,
            },
            secondaryColour: (parsed.colourProperties.secondaryColour === null) ? null : {
                level: parsed.colourProperties.secondaryColour.level,
                colourTag: parsed.colourProperties.secondaryColour.colourTag,
                colourTagFontColour: parsed.colourProperties.secondaryColour.colourTagFontColour,
                colourNameForSoilDescription: parsed.colourProperties.secondaryColour.colourNameForSoilDescription,
                colourCode: parsed.colourProperties.secondaryColour.colourCode,
                colourFamily: parsed.colourProperties.secondaryColour.colourFamily,
            },
        },
        soilProperties: {
            dominantSoilType: parsed.soilProperties.dominantSoilType,
            secondarySoilType: parsed.soilProperties.secondarySoilType,
            otherProperties: parsed.soilProperties.otherProperties,
            customOtherProperties: parsed.soilProperties.customOtherProperties,
        },
        isSeatingIncBlows1Active: parsed.isSeatingIncBlows1Active,
        isSeatingIncBlows2Active: parsed.isSeatingIncBlows2Active,
        isMainIncBlows1Active: parsed.isMainIncBlows1Active,
        isMainIncBlows2Active: parsed.isMainIncBlows2Active,
        isMainIncBlows3Active: parsed.isMainIncBlows3Active,
        isMainIncBlows4Active: parsed.isMainIncBlows4Active,
        isSeatingIncPen1Active: parsed.isSeatingIncPen1Active,
        isSeatingIncPen2Active: parsed.isSeatingIncPen2Active,
        isMainIncPen1Active: parsed.isMainIncPen1Active,
        isMainIncPen2Active: parsed.isMainIncPen2Active,
        isMainIncPen3Active: parsed.isMainIncPen3Active,
        isMainIncPen4Active: parsed.isMainIncPen4Active,
    };
    console.log(sptBlock);
    return sptBlock;
}