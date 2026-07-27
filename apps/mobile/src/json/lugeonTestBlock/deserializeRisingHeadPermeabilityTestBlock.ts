import { BaseBlock } from "@/src/interfaces/Block";
import { LugeonTestBlock } from "@/src/interfaces/LugeonTestBlock";
import { parseUntilObject } from "@/src/utils/json/parseUntilObject";
import { deserializeDateTime } from "../deserializeDateTime";
import { deserializeDayWorkStatus } from "../deserializeDayWorkStatus";

export function deserializeLugeonTestBlock(json: string): BaseBlock & LugeonTestBlock {
    const parsed = parseUntilObject<Record<string, any>>(json);
    const block: BaseBlock & LugeonTestBlock = {
        id: parsed.id,
        boreholeId: parsed.boreholeId,
        blockTypeId: parsed.blockTypeId,
        symbol: parsed.symbol,
        lugeonTestIndex: parsed.lugeonTestIndex,
        dayWorkStatus: deserializeDayWorkStatus(parsed.dayWorkStatus),
        topDepthInMetres: parsed.topDepthInMetres,
        baseDepthInMetres: parsed.baseDepthInMetres,
        description: parsed.description,
        createdAt: deserializeDateTime(parsed.createdAt),
        updatedAt: deserializeDateTime(parsed.updatedAt),
    };
    return block;
}