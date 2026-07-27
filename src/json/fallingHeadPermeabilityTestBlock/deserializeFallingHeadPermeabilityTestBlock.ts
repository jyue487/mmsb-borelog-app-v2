import { BaseBlock } from "@/src/interfaces/Block";
import { FallingHeadPermeabilityTestBlock } from "@/src/interfaces/FallingHeadPermeabilityTestBlock";
import { parseUntilObject } from "@/src/utils/json/parseUntilObject";
import { deserializeDateTime } from "../deserializeDateTime";
import { deserializeDayWorkStatus } from "../deserializeDayWorkStatus";

export function deserializeFallingHeadPermeabilityTestBlock(json: string): BaseBlock & FallingHeadPermeabilityTestBlock {
    const parsed = parseUntilObject<Record<string, any>>(json);
    const block: BaseBlock & FallingHeadPermeabilityTestBlock = {
        id: parsed.id,
        boreholeId: parsed.boreholeId,
        blockTypeId: parsed.blockTypeId,
        symbol: parsed.symbol,
        permeabilityTestIndex: parsed.permeabilityTestIndex,
        dayWorkStatus: deserializeDayWorkStatus(parsed.dayWorkStatus),
        topDepthInMetres: parsed.topDepthInMetres,
        baseDepthInMetres: parsed.baseDepthInMetres,
        description: parsed.description,
        createdAt: deserializeDateTime(parsed.createdAt),
        updatedAt: deserializeDateTime(parsed.updatedAt),
    };
    return block;
}