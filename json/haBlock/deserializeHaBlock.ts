import { BaseBlock } from "@/interfaces/Block";
import { HaBlock } from "@/interfaces/HaBlock";
import { deserializeColourProperties } from "../deserializeColourProperties";
import { deserializeDayWorkStatus } from "../deserializeDayWorkStatus";
import { deserializeSoilProperties } from "../deserializeSoilProperties";
import { deserializeDateTime } from "../deserializeDateTime";

export function deserializeHaBlock(json: string): BaseBlock & HaBlock {
    const parsed = JSON.parse(json);
    const block: BaseBlock & HaBlock = {
        id: parsed.id,
        boreholeId: parsed.boreholeId,
        blockTypeId: parsed.blockTypeId,
        haSampleIndex: parsed.haSampleIndex,
        dayWorkStatus: deserializeDayWorkStatus(parsed.dayWorkStatus),
        topDepthInMetres: parsed.topDepthInMetres,
        baseDepthInMetres: parsed.baseDepthInMetres,
        description: parsed.description,
        requireSample: parsed.requireSample,
        colourProperties: deserializeColourProperties(parsed.colourProperties),
        soilProperties: deserializeSoilProperties(parsed.soilProperties),
        createdAt: deserializeDateTime(parsed.createdAt),
        updatedAt: deserializeDateTime(parsed.updatedAt),
    };
    return block;
}