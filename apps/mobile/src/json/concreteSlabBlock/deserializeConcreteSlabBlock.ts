import { BaseBlock } from "@/src/interfaces/Block";
import { ConcreteSlabBlock } from "@/src/interfaces/ConcreteSlabBlock";
import { parseUntilObject } from "@/src/utils/json/parseUntilObject";
import { deserializeDateTime } from "../deserializeDateTime";
import { deserializeDayWorkStatus } from "../deserializeDayWorkStatus";

export function deserializeConcreteSlabBlock(json: string): BaseBlock & ConcreteSlabBlock {
    const parsed = parseUntilObject<Record<string, any>>(json);
    const block: BaseBlock & ConcreteSlabBlock = {
        id: parsed.id,
        boreholeId: parsed.boreholeId,
        blockTypeId: parsed.blockTypeId,
        dayWorkStatus: deserializeDayWorkStatus(parsed.dayWorkStatus),
        topDepthInMetres: parsed.topDepthInMetres,
        baseDepthInMetres: parsed.baseDepthInMetres,
        description: parsed.description,
        createdAt: deserializeDateTime(parsed.createdAt),
        updatedAt: deserializeDateTime(parsed.updatedAt),
    };
    return block;
}