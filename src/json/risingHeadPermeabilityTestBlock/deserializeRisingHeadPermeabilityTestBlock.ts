import { BaseBlock } from "@/src/interfaces/Block";
import { RisingHeadPermeabilityTestBlock } from "@/src/interfaces/RisingHeadPermeabilityTestBlock";
import { parseUntilObject } from "@/src/utils/json/parseUntilObject";
import { deserializeDateTime } from "../deserializeDateTime";
import { deserializeDayWorkStatus } from "../deserializeDayWorkStatus";

export function deserializeRisingHeadPermeabilityTestBlock(json: string): BaseBlock & RisingHeadPermeabilityTestBlock {
    const parsed = parseUntilObject<Record<string, any>>(json);
    const block: BaseBlock & RisingHeadPermeabilityTestBlock = {
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