import { BaseBlock } from "@/src/interfaces/Block";
import { VaneShearTestBlock } from "@/src/interfaces/VaneShearTestBlock";
import { parseUntilObject } from "@/src/utils/json/parseUntilObject";
import { deserializeDateTime } from "../deserializeDateTime";
import { deserializeDayWorkStatus } from "../deserializeDayWorkStatus";

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