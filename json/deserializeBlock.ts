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
import { deserializeSptBlock } from "./sptBlock/deserializeSptBlock";
import { throwError } from "@/utils/error/throwError";
import { deserializeCoringBlock } from "./coringBlock/deserializeCoringBlock";
import { deserializeCavityBlock } from "./cavityBlock/deserializeCavityBlock";
import { deserializeUdBlock } from "./udBlock/deserializeUdBlock";
import { deserializeMzBlock } from "./mzBlock/deserializeMzBlock";
import { deserializePsBlock } from "./psBlock/deserializePsBlock";
import { deserializeHaBlock } from "./haBlock/deserializeHaBlock";
import { deserializeWashBoringBlock } from "./washBoringBlock/deserializeWashBoringBlock";
import { deserializeConcreteSlabBlock } from "./concreteSlabBlock/deserializeConcreteSlabBlock";
import { deserializeAsphaltBlock } from "./asphaltBlock/deserializeAsphaltBlock";
import { deserializeEndOfBoreholeBlock } from "./endOfBoreholeBlock/deserializeEndOfBoreholeBlock";
import { deserializeCustomBlock } from "./customBlock/deserializeCustomBlock";
import { deserializeVaneShearTestBlock } from "./vaneShearTestBlock/deserializeVaneShearTestBlock";
import { deserializeFallingHeadPermeabilityTestBlock } from "./fallingHeadPermeabilityTestBlock/deserializeFallingHeadPermeabilityTestBlock";
import { deserializeRisingHeadPermeabilityTestBlock } from "./risingHeadPermeabilityTestBlock/deserializeRisingHeadPermeabilityTestBlock";
import { deserializeConstantHeadPermeabilityTestBlock } from "./constantHeadPermeabilityTestBlock/deserializeConstantHeadPermeabilityTestBlock";
import { deserializeLugeonTestBlock } from "./lugeonTestBlock/deserializeRisingHeadPermeabilityTestBlock";
import { deserializePressuremeterTestBlock } from "./pressuremeterTestBlock/deserializePressuremeterTestBlock";

export function deserializeBlock(row: any): Block {
    switch (row.blockTypeId as BlockTypeId) {
    case SPT_BLOCK_TYPE_ID:
        return deserializeSptBlock(row.payload);
    case CORING_BLOCK_TYPE_ID:
        return deserializeCoringBlock(row.payload);
    case CAVITY_BLOCK_TYPE_ID:
        return deserializeCavityBlock(row.payload);
    case UD_BLOCK_TYPE_ID:
        return deserializeUdBlock(row.payload);
    case MZ_BLOCK_TYPE_ID:
        return deserializeMzBlock(row.payload);
    case PS_BLOCK_TYPE_ID:
        return deserializePsBlock(row.payload);
    case HA_BLOCK_TYPE_ID:
        return deserializeHaBlock(row.payload);
    case WASH_BORING_BLOCK_TYPE_ID:
        return deserializeWashBoringBlock(row.payload);
    case CONCRETE_SLAB_BLOCK_TYPE_ID:
        return deserializeConcreteSlabBlock(row.payload);
    case ASPHALT_BLOCK_TYPE_ID:
        return deserializeAsphaltBlock(row.payload);
    case END_OF_BOREHOLE_BLOCK_TYPE_ID:
        return deserializeEndOfBoreholeBlock(row.payload);
    case CUSTOM_BLOCK_TYPE_ID:
        return deserializeCustomBlock(row.payload);
    case VANE_SHEAR_TEST_BLOCK_TYPE_ID:
        return deserializeVaneShearTestBlock(row.payload);
    case FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
        return deserializeFallingHeadPermeabilityTestBlock(row.payload);
    case RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
        return deserializeRisingHeadPermeabilityTestBlock(row.payload);
    case CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
        return deserializeConstantHeadPermeabilityTestBlock(row.payload);
    case LUGEON_TEST_BLOCK_TYPE_ID:
        return deserializeLugeonTestBlock(row.payload);
    case PRESSUREMETER_TEST_BLOCK_TYPE_ID:
        return deserializePressuremeterTestBlock(row.payload);
    default:
        throwError('No such block');
    }
};