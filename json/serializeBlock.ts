import { 
    Block,
    BlockTypeId,
    SPT_BLOCK_TYPE_ID,
    CORING_BLOCK_TYPE_ID,
    CAVITY_BLOCK_TYPE_ID,
    UD_BLOCK_TYPE_ID,
    MZ_BLOCK_TYPE_ID,
    PS_BLOCK_TYPE_ID,
    HA_BLOCK_TYPE_ID,
    WASH_BORING_BLOCK_TYPE_ID,
    CONCRETE_SLAB_BLOCK_TYPE_ID,
    ASPHALT_BLOCK_TYPE_ID,
    END_OF_BOREHOLE_BLOCK_TYPE_ID,
    CUSTOM_BLOCK_TYPE_ID,
    VANE_SHEAR_TEST_BLOCK_TYPE_ID,
    FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
    RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
    CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
    LUGEON_TEST_BLOCK_TYPE_ID,
    PRESSUREMETER_TEST_BLOCK_TYPE_ID,
} from "@/interfaces/Block";
import { throwError } from "@/utils/error/throwError";
import { serializeSptBlock } from "./sptBlock/serializeSptBlock";
import { serializeCoringBlock } from "./coringBlock/serializeCoringBlock";
import { serializeCavityBlock } from "./cavityBlock/serializeCavityBlock";
import { serializeUdBlock } from "./udBlock/serializeUdBlock";
import { serializeMzBlock } from "./mzBlock/serializeMzBlock";
import { serializePsBlock } from "./psBlock/serializePsBlock";
import { serializeHaBlock } from "./haBlock/serializeHaBlock";
import { serializeWashBoringBlock } from "./washBoringBlock/serializeWashBoringBlock";
import { serializeConcreteSlabBlock } from "./concreteSlabBlock/serializeConcreteSlabBlock";
import { serializeAsphaltBlock } from "./asphaltBlock/serializeAsphaltBlock";
import { serializeEndOfBoreholeBlock } from "./endOfBoreholeBlock/serializeEndOfBoreholeBlock";
import { serializeCustomBlock } from "./customBlock/serializeCustomBlock";
import { serializeVaneShearTestBlock } from "./vaneShearTestBlock/serializeVaneShearTestBlock";
import { serializeFallingHeadPermeabilityTestBlock } from "./fallingHeadPermeabilityTestBlock/serializeFallingHeadPermeabilityTestBlock";
import { serializeRisingHeadPermeabilityTestBlock } from "./risingHeadPermeabilityTestBlock/serializeRisingHeadPermeabilityTestBlock";
import { serializeConstantHeadPermeabilityTestBlock } from "./constantHeadPermeabilityTestBlock/serializeConstantHeadPermeabilityTestBlock";
import { serializeLugeonTestBlock } from "./lugeonTestBlock/serializeLugeonTestBlock";
import { serializePressuremeterTestBlock } from "./pressuremeterTestBlock/serializePressuremeterTestBlock";

export function serializeBlock(block: Block): string {
    switch (block.blockTypeId) {
    case SPT_BLOCK_TYPE_ID:
        return serializeSptBlock(block);
    case CORING_BLOCK_TYPE_ID:
        return serializeCoringBlock(block);
    case CAVITY_BLOCK_TYPE_ID:
        return serializeCavityBlock(block);
    case UD_BLOCK_TYPE_ID:
        return serializeUdBlock(block);
    case MZ_BLOCK_TYPE_ID:
        return serializeMzBlock(block);
    case PS_BLOCK_TYPE_ID:
        return serializePsBlock(block);
    case HA_BLOCK_TYPE_ID:
        return serializeHaBlock(block);
    case WASH_BORING_BLOCK_TYPE_ID:
        return serializeWashBoringBlock(block);
    case CONCRETE_SLAB_BLOCK_TYPE_ID:
        return serializeConcreteSlabBlock(block);
    case ASPHALT_BLOCK_TYPE_ID:
        return serializeAsphaltBlock(block);
    case END_OF_BOREHOLE_BLOCK_TYPE_ID:
        return serializeEndOfBoreholeBlock(block);
    case CUSTOM_BLOCK_TYPE_ID:
        return serializeCustomBlock(block);
    case VANE_SHEAR_TEST_BLOCK_TYPE_ID:
        return serializeVaneShearTestBlock(block);
    case FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
        return serializeFallingHeadPermeabilityTestBlock(block);
    case RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
        return serializeRisingHeadPermeabilityTestBlock(block);
    case CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
        return serializeConstantHeadPermeabilityTestBlock(block);
    case LUGEON_TEST_BLOCK_TYPE_ID:
        return serializeLugeonTestBlock(block);
    case PRESSUREMETER_TEST_BLOCK_TYPE_ID:
        return serializePressuremeterTestBlock(block);
    default:
        throwError('No such block');
    }
};