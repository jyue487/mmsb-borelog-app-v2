import { BaseBlock } from "@/interfaces/Block";
import { FallingHeadPermeabilityTestBlock } from "@/interfaces/FallingHeadPermeabilityTestBlock";
import { deserializeColourProperties } from "../deserializeColourProperties";
import { deserializeDayWorkStatus } from "../deserializeDayWorkStatus";
import { deserializeSoilProperties } from "../deserializeSoilProperties";
import { deserializeDateTime } from "../deserializeDateTime";
import { parseUntilObject } from "@/utils/json/parseUntilObject";

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