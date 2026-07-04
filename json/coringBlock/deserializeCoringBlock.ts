import { BaseBlock } from "@/interfaces/Block";
import { CoringBlock } from "@/interfaces/CoringBlock";
import { deserializeDayWorkStatus } from "../deserializeDayWorkStatus";
import { deserializeColourProperties } from "../deserializeColourProperties";
import { deserializeRockProperties } from "../deserializeRockProperties";
import { deserializeDateTime } from "../deserializeDateTime";
import { parseUntilObject } from "@/utils/json/parseUntilObject";

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