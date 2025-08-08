import { 
    Block, 
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
import { editAndReindexSptBlocksAsync } from "./sptBlock/editAndReindexSptBlocksAsync";
import { throwError } from "../error/throwError";
import { editAndReindexCoringBlocksAsync } from "./coringBlock/editAndReindexCoringBlocksAsync";
import { editCavityBlockAsync } from "./cavityBlock/editCavityBlockAsync";
import { editAndReindexUdBlocksAsync } from "./udBlock/editAndReindexUdBlocksAsync";
import { editAndReindexMzBlocksAsync } from "./mzBlock/editAndReindexMzBlocksAsync";
import { editAndReindexPsBlocksAsync } from "./psBlock/editAndReindexPsBlocksAsync";
import { editAndReindexHaBlocksAsync } from "./haBlock/editAndReindexHaBlocksAsync";
import { editWashBoringBlockAsync } from "./washBoringBlock/editWashBoringBlockAsync";
import { editConcreteSlabBlockAsync } from "./concreteSlabBlock/editConcreteSlabBlockAsync";
import { editAsphaltBlockAsync } from "./asphaltBlock/editAsphaltBlockAsync";
import { editEndOfBoreholeBlockAsync } from "./endOfBoreholeBlock/editEndOfBoreholeBlockAsync";
import { editCustomBlockAsync } from "./customBlock/editCustomBlockAsync";
import { editAndReindexVaneShearTestBlocksAsync } from "./vaneShearTestBlock/editAndReindexVaneShearTestBlocksAsync";
import { editAndReindexFallingHeadPermeabilityTestBlocksAsync } from "./fallingHeadPermeabilityTestBlock/editAndReindexFallingHeadPermeabilityTestBlocksAsync";
import { editAndReindexRisingHeadPermeabilityTestBlocksAsync } from "./risingHeadPermeabilityTestBlock/editAndReindexRisingHeadPermeabilityTestBlocksAsync";
import { editAndReindexConstantHeadPermeabilityTestBlocksAsync } from "./constantHeadPermeabilityTestBlock/editAndReindexConstantHeadPermeabilityTestBlocksAsync";
import { editAndReindexLugeonTestBlocksAsync } from "./lugeonTestBlock/editAndReindexLugeonTestBlocksAsync";
import { editAndReindexPressuremeterTestBlocksAsync } from "./pressuremeterTestBlock/editAndReindexPressuremeterTestBlocksAsync";

export async function editBlockAsync(
    blocks: Block[],
    oldBlockId: number,
    newBlock: Block,
): Promise<Block[]> {
    switch (newBlock.blockTypeId) {
    case SPT_BLOCK_TYPE_ID:
        return await editAndReindexSptBlocksAsync(blocks, oldBlockId, newBlock);
    case CORING_BLOCK_TYPE_ID:
        return await editAndReindexCoringBlocksAsync(blocks, oldBlockId, newBlock);
    case CAVITY_BLOCK_TYPE_ID:
        return await editCavityBlockAsync(blocks, oldBlockId, newBlock);
    case UD_BLOCK_TYPE_ID:
        return await editAndReindexUdBlocksAsync(blocks, oldBlockId, newBlock);
    case MZ_BLOCK_TYPE_ID:
        return await editAndReindexMzBlocksAsync(blocks, oldBlockId, newBlock);
    case PS_BLOCK_TYPE_ID:
        return await editAndReindexPsBlocksAsync(blocks, oldBlockId, newBlock);
    case HA_BLOCK_TYPE_ID:
        return await editAndReindexHaBlocksAsync(blocks, oldBlockId, newBlock);
    case WASH_BORING_BLOCK_TYPE_ID:
        return await editWashBoringBlockAsync(blocks, oldBlockId, newBlock);
    case CONCRETE_SLAB_BLOCK_TYPE_ID:
        return await editConcreteSlabBlockAsync(blocks, oldBlockId, newBlock);
    case ASPHALT_BLOCK_TYPE_ID:
        return await editAsphaltBlockAsync(blocks, oldBlockId, newBlock);
    case END_OF_BOREHOLE_BLOCK_TYPE_ID:
        return await editEndOfBoreholeBlockAsync(blocks, oldBlockId, newBlock);
    case CUSTOM_BLOCK_TYPE_ID:
        return await editCustomBlockAsync(blocks, oldBlockId, newBlock);
    case VANE_SHEAR_TEST_BLOCK_TYPE_ID:
        return await editAndReindexVaneShearTestBlocksAsync(blocks, oldBlockId, newBlock);
    case FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
        return await editAndReindexFallingHeadPermeabilityTestBlocksAsync(blocks, oldBlockId, newBlock);
    case RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
        return await editAndReindexRisingHeadPermeabilityTestBlocksAsync(blocks, oldBlockId, newBlock);
    case CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
        return await editAndReindexConstantHeadPermeabilityTestBlocksAsync(blocks, oldBlockId, newBlock);
    case LUGEON_TEST_BLOCK_TYPE_ID:
        return await editAndReindexLugeonTestBlocksAsync(blocks, oldBlockId, newBlock);
    case PRESSUREMETER_TEST_BLOCK_TYPE_ID:
        return await editAndReindexPressuremeterTestBlocksAsync(blocks, oldBlockId, newBlock);
    default:
        throwError('No Such Block');
    }
}