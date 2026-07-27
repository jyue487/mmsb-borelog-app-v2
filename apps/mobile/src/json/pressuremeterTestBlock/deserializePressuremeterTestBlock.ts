import { BaseBlock } from "@/src/interfaces/Block";
import { PressuremeterTestBlock } from "@/src/interfaces/PressuremeterTestBlock";
import { parseUntilObject } from "@/src/utils/json/parseUntilObject";
import { deserializeDateTime } from "../deserializeDateTime";
import { deserializeDayWorkStatus } from "../deserializeDayWorkStatus";

export function deserializePressuremeterTestBlock(json: string): BaseBlock & PressuremeterTestBlock {
    const parsed = parseUntilObject<Record<string, any>>(json);
    const block: BaseBlock & PressuremeterTestBlock = {
        id: parsed.id,
        boreholeId: parsed.boreholeId,
        blockTypeId: parsed.blockTypeId,
        symbol: parsed.symbol,
        pressuremeterTestIndex: parsed.pressuremeterTestIndex,
        dayWorkStatus: deserializeDayWorkStatus(parsed.dayWorkStatus),
        topDepthInMetres: parsed.topDepthInMetres,
        baseDepthInMetres: parsed.baseDepthInMetres,
        description: parsed.description,
        createdAt: deserializeDateTime(parsed.createdAt),
        updatedAt: deserializeDateTime(parsed.updatedAt),
    };
    return block;
}