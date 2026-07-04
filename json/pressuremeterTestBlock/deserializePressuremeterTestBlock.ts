import { BaseBlock } from "@/interfaces/Block";
import { PressuremeterTestBlock } from "@/interfaces/PressuremeterTestBlock";
import { deserializeColourProperties } from "../deserializeColourProperties";
import { deserializeDayWorkStatus } from "../deserializeDayWorkStatus";
import { deserializeSoilProperties } from "../deserializeSoilProperties";
import { deserializeDateTime } from "../deserializeDateTime";
import { parseUntilObject } from "@/utils/json/parseUntilObject";

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