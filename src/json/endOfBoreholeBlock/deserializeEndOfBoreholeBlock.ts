import { BaseBlock } from "@/src/interfaces/Block";
import { EndOfBoreholeBlock } from "@/src/interfaces/EndOfBoreholeBlock";
import { parseUntilObject } from "@/src/utils/json/parseUntilObject";
import { deserializeDateTime } from "../deserializeDateTime";
import { deserializeDayWorkStatus } from "../deserializeDayWorkStatus";

export function deserializeEndOfBoreholeBlock(json: string): BaseBlock & EndOfBoreholeBlock {
    const parsed = parseUntilObject<Record<string, any>>(json);
    const block: BaseBlock & EndOfBoreholeBlock = {
        id: parsed.id,
        boreholeId: parsed.boreholeId,
        blockTypeId: parsed.blockTypeId,
        dayWorkStatus: deserializeDayWorkStatus(parsed.dayWorkStatus),
        topDepthInMetres: parsed.topDepthInMetres,
        baseDepthInMetres: parsed.baseDepthInMetres,
        description: parsed.description,
        otherInstallations: parsed.otherInstallations,
        customInstallations: parsed.customInstallations,
        installationDepthInMetres: parsed.installationDepthInMetres,
        installationDate: deserializeDateTime(parsed.installationDate),
        installationTime: deserializeDateTime(parsed.installationTime),
        waterLevelInMetres: parsed.waterLevelInMetres,
        remarks: parsed.remarks,
        createdAt: deserializeDateTime(parsed.createdAt),
        updatedAt: deserializeDateTime(parsed.updatedAt),
    };
    return block;
}