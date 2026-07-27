import { BaseBlock } from "@/src/interfaces/Block";
import { HaBlock } from "@/src/interfaces/HaBlock";
import { parseUntilObject } from "@/src/utils/json/parseUntilObject";
import { deserializeColourProperties } from "../deserializeColourProperties";
import { deserializeDateTime } from "../deserializeDateTime";
import { deserializeDayWorkStatus } from "../deserializeDayWorkStatus";
import { deserializeSoilProperties } from "../deserializeSoilProperties";

export function deserializeHaBlock(json: string): BaseBlock & HaBlock {
    const parsed = parseUntilObject<Record<string, any>>(json);
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