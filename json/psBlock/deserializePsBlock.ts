import { BaseBlock } from "@/interfaces/Block";
import { PsBlock } from "@/interfaces/PsBlock";
import { deserializeColourProperties } from "../deserializeColourProperties";
import { deserializeDayWorkStatus } from "../deserializeDayWorkStatus";
import { deserializeSoilProperties } from "../deserializeSoilProperties";
import { deserializeDateTime } from "../deserializeDateTime";

export function deserializePsBlock(json: string): BaseBlock & PsBlock {
    const parsed = JSON.parse(json);
    const block: BaseBlock & PsBlock = {
        id: parsed.id,
        boreholeId: parsed.boreholeId,
        blockTypeId: parsed.blockTypeId,
        sampleIndex: parsed.sampleIndex,
        dayWorkStatus: deserializeDayWorkStatus(parsed.dayWorkStatus),
        topDepthInMetres: parsed.topDepthInMetres,
        baseDepthInMetres: parsed.baseDepthInMetres,
        soilDescription: parsed.soilDescription,
        recoveryInPercentage: parsed.recoveryInPercentage,
        penetrationDepthInMetres: parsed.penetrationDepthInMetres,
        topColourProperties: deserializeColourProperties(parsed.topColourProperties),
        topSoilProperties: deserializeSoilProperties(parsed.topSoilProperties),
        baseDitto: parsed.baseDitto,
        bottomColourProperties: deserializeColourProperties(parsed.bottomColourProperties),
        bottomSoilProperties: deserializeSoilProperties(parsed.bottomSoilProperties),
        recoveryLengthInMetres: parsed.recoveryLengthInMetres,
        createdAt: deserializeDateTime(parsed.createdAt),
        updatedAt: deserializeDateTime(parsed.updatedAt),
    };
    return block;
}