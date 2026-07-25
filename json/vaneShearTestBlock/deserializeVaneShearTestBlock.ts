import { BaseBlock } from "@/interfaces/Block";
import { VaneShearTestBlock } from "@/interfaces/VaneShearTestBlock";
import { deserializeColourProperties } from "../deserializeColourProperties";
import { deserializeDayWorkStatus } from "../deserializeDayWorkStatus";
import { deserializeSoilProperties } from "../deserializeSoilProperties";
import { deserializeDateTime } from "../deserializeDateTime";
import { parseUntilObject } from "@/utils/json/parseUntilObject";

export function deserializeVaneShearTestBlock(json: string): BaseBlock & VaneShearTestBlock {
    const parsed = parseUntilObject<Record<string, any>>(json);
    const block: BaseBlock & VaneShearTestBlock = {
        id: parsed.id,
        boreholeId: parsed.boreholeId,
        blockTypeId: parsed.blockTypeId,
        symbol: parsed.symbol,
        vaneShearTestIndex: parsed.vaneShearTestIndex,
        dayWorkStatus: deserializeDayWorkStatus(parsed.dayWorkStatus),
        topDepthInMetres: parsed.topDepthInMetres,
        baseDepthInMetres: parsed.baseDepthInMetres,
        description: parsed.description,
        createdAt: deserializeDateTime(parsed.createdAt),
        updatedAt: deserializeDateTime(parsed.updatedAt),
    };
    return block;
}