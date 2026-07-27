import { BaseBlock } from "@/src/interfaces/Block";
import { CoringBlock } from "@/src/interfaces/CoringBlock";
import { parseUntilObject } from "@/src/utils/json/parseUntilObject";
import { deserializeColourProperties } from "../deserializeColourProperties";
import { deserializeDateTime } from "../deserializeDateTime";
import { deserializeDayWorkStatus } from "../deserializeDayWorkStatus";
import { deserializeRockProperties } from "../deserializeRockProperties";

export function deserializeCoringBlock(json: string): BaseBlock & CoringBlock {
    const parsed = parseUntilObject<Record<string, any>>(json);
    const block: BaseBlock & CoringBlock = {
        id: parsed.id,
        boreholeId: parsed.boreholeId,
        blockTypeId: parsed.blockTypeId,
        rockSampleIndex: parsed.rockSampleIndex,
        dayWorkStatus: deserializeDayWorkStatus(parsed.dayWorkStatus),
        topDepthInMetres: parsed.topDepthInMetres,
        baseDepthInMetres: parsed.baseDepthInMetres,
        description: parsed.description,
        coreRunInMetres: parsed.coreRunInMetres,
        coreRecoveryInPercentage: parsed.coreRecoveryInPercentage,
        rqdInPercentage: parsed.rqdInPercentage,
        coreRecoveryInMetres: parsed.coreRecoveryInMetres,
        rqdInMetres: parsed.rqdInMetres,
        colourProperties: deserializeColourProperties(parsed.colourProperties),
        rockProperties: deserializeRockProperties(parsed.rockProperties),
        createdAt: deserializeDateTime(parsed.createdAt),
        updatedAt: deserializeDateTime(parsed.updatedAt),
    };
    return block;
}