import { BaseBlock } from "@/interfaces/Block";
import { SptBlock } from "@/interfaces/SptBlock";
import { deserializeColourProperties } from "../deserializeColourProperties";
import { deserializeDayWorkStatus } from "../deserializeDayWorkStatus";
import { deserializeSoilProperties } from "../deserializeSoilProperties";
import { deserializeDateTime } from "../deserializeDateTime";

export function deserializeSptBlock(json: string): BaseBlock & SptBlock {
    const parsed = JSON.parse(json);
    const block: BaseBlock & SptBlock = {
        id: parsed.id,
        boreholeId: parsed.boreholeId,
        blockTypeId: parsed.blockTypeId,
        sptIndex: parsed.sptIndex,
        disturbedSampleIndex: parsed.disturbedSampleIndex,
        dayWorkStatus: deserializeDayWorkStatus(parsed.dayWorkStatus),
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
        colourProperties: deserializeColourProperties(parsed.colourProperties),
        soilProperties: deserializeSoilProperties(parsed.soilProperties),
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
        createdAt: deserializeDateTime(parsed.createdAt),
        updatedAt: deserializeDateTime(parsed.updatedAt),
    };
    return block;
}