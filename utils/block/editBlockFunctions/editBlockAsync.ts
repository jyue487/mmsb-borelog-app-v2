import { editBlockDbAsync } from "@/db/blocks/editBlockDbAsync";
import {
  ASPHALT_BLOCK_TYPE_ID,
  BaseBlock,
  Block,
  CAVITY_BLOCK_TYPE_ID,
  CONCRETE_SLAB_BLOCK_TYPE_ID,
  CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
  CORING_BLOCK_TYPE_ID,
  CUSTOM_BLOCK_TYPE_ID,
  END_OF_BOREHOLE_BLOCK_TYPE_ID,
  FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
  HA_BLOCK_TYPE_ID,
  LUGEON_TEST_BLOCK_TYPE_ID,
  MZ_BLOCK_TYPE_ID,
  PRESSUREMETER_TEST_BLOCK_TYPE_ID,
  PS_BLOCK_TYPE_ID,
  RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID,
  SPT_BLOCK_TYPE_ID,
  UD_BLOCK_TYPE_ID,
  VANE_SHEAR_TEST_BLOCK_TYPE_ID,
  WASH_BORING_BLOCK_TYPE_ID,
} from "@/interfaces/Block";
import { EndOfBoreholeBlock } from "@/interfaces/EndOfBoreholeBlock";
import { throwError } from "../../error/throwError";
import { checkAndReturnEndOfBoreholeBlock } from "../checkFunctions/checkAndReturnEndOfBoreholeBlock";
import { editAsphaltBlockAsync } from "./asphaltBlock/editAsphaltBlockAsync";
import { editCavityBlockAsync } from "./cavityBlock/editCavityBlockAsync";
import { editConcreteSlabBlockAsync } from "./concreteSlabBlock/editConcreteSlabBlockAsync";
import { editAndReindexConstantHeadPermeabilityTestBlocksAsync } from "./constantHeadPermeabilityTestBlock/editAndReindexConstantHeadPermeabilityTestBlocksAsync";
import { editAndReindexCoringBlocksAsync } from "./coringBlock/editAndReindexCoringBlocksAsync";
import { editCustomBlockAsync } from "./customBlock/editCustomBlockAsync";
import { editEndOfBoreholeBlockAsync } from "./endOfBoreholeBlock/editEndOfBoreholeBlockAsync";
import { editAndReindexFallingHeadPermeabilityTestBlocksAsync } from "./fallingHeadPermeabilityTestBlock/editAndReindexFallingHeadPermeabilityTestBlocksAsync";
import { editAndReindexHaBlocksAsync } from "./haBlock/editAndReindexHaBlocksAsync";
import { editAndReindexLugeonTestBlocksAsync } from "./lugeonTestBlock/editAndReindexLugeonTestBlocksAsync";
import { editAndReindexMzBlocksAsync } from "./mzBlock/editAndReindexMzBlocksAsync";
import { editAndReindexPressuremeterTestBlocksAsync } from "./pressuremeterTestBlock/editAndReindexPressuremeterTestBlocksAsync";
import { editAndReindexPsBlocksAsync } from "./psBlock/editAndReindexPsBlocksAsync";
import { editAndReindexRisingHeadPermeabilityTestBlocksAsync } from "./risingHeadPermeabilityTestBlock/editAndReindexRisingHeadPermeabilityTestBlocksAsync";
import { editAndReindexSptBlocksAsync } from "./sptBlock/editAndReindexSptBlocksAsync";
import { editAndReindexUdBlocksAsync } from "./udBlock/editAndReindexUdBlocksAsync";
import { editAndReindexVaneShearTestBlocksAsync } from "./vaneShearTestBlock/editAndReindexVaneShearTestBlocksAsync";
import { editWashBoringBlockAsync } from "./washBoringBlock/editWashBoringBlockAsync";

export async function editBlockAsync(
  blocks: Block[],
  oldBlockId: string,
  newBlock: Block,
): Promise<Block[]> {
  let editedBlocks: Block[] = [];
  switch (newBlock.blockTypeId) {
    case SPT_BLOCK_TYPE_ID:
      editedBlocks = await editAndReindexSptBlocksAsync(blocks, oldBlockId, newBlock);
      break;
    case CORING_BLOCK_TYPE_ID:
      editedBlocks = await editAndReindexCoringBlocksAsync(blocks, oldBlockId, newBlock);
      break;
    case CAVITY_BLOCK_TYPE_ID:
      editedBlocks = await editCavityBlockAsync(blocks, oldBlockId, newBlock);
      break;
    case UD_BLOCK_TYPE_ID:
      editedBlocks = await editAndReindexUdBlocksAsync(blocks, oldBlockId, newBlock);
      break;
    case MZ_BLOCK_TYPE_ID:
      editedBlocks = await editAndReindexMzBlocksAsync(blocks, oldBlockId, newBlock);
      break;
    case PS_BLOCK_TYPE_ID:
      editedBlocks = await editAndReindexPsBlocksAsync(blocks, oldBlockId, newBlock);
      break;
    case HA_BLOCK_TYPE_ID:
      editedBlocks = await editAndReindexHaBlocksAsync(blocks, oldBlockId, newBlock);
      break;
    case WASH_BORING_BLOCK_TYPE_ID:
      editedBlocks = await editWashBoringBlockAsync(blocks, oldBlockId, newBlock);
      break;
    case CONCRETE_SLAB_BLOCK_TYPE_ID:
      editedBlocks = await editConcreteSlabBlockAsync(blocks, oldBlockId, newBlock);
      break;
    case ASPHALT_BLOCK_TYPE_ID:
      editedBlocks = await editAsphaltBlockAsync(blocks, oldBlockId, newBlock);
      break;
    case END_OF_BOREHOLE_BLOCK_TYPE_ID:
      editedBlocks = await editEndOfBoreholeBlockAsync(blocks, oldBlockId, newBlock);
      break;
    case CUSTOM_BLOCK_TYPE_ID:
      editedBlocks = await editCustomBlockAsync(blocks, oldBlockId, newBlock);
      break;
    case VANE_SHEAR_TEST_BLOCK_TYPE_ID:
      editedBlocks = await editAndReindexVaneShearTestBlocksAsync(blocks, oldBlockId, newBlock);
      break;
    case FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
      editedBlocks = await editAndReindexFallingHeadPermeabilityTestBlocksAsync(blocks, oldBlockId, newBlock);
      break;
    case RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
      editedBlocks = await editAndReindexRisingHeadPermeabilityTestBlocksAsync(blocks, oldBlockId, newBlock);
      break;
    case CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
      editedBlocks = await editAndReindexConstantHeadPermeabilityTestBlocksAsync(blocks, oldBlockId, newBlock);
      break;
    case LUGEON_TEST_BLOCK_TYPE_ID:
      editedBlocks = await editAndReindexLugeonTestBlocksAsync(blocks, oldBlockId, newBlock);
      break;
    case PRESSUREMETER_TEST_BLOCK_TYPE_ID:
      editedBlocks = await editAndReindexPressuremeterTestBlocksAsync(blocks, oldBlockId, newBlock);
      break;
    default:
      throwError('No Such Block');
  }

  const lastBlock: Block = editedBlocks[editedBlocks.length - 1];
  if (editedBlocks.length === 1 || lastBlock.blockTypeId !== END_OF_BOREHOLE_BLOCK_TYPE_ID) {
    return editedBlocks;
  }
  const endOfBoreholeBlock: BaseBlock & EndOfBoreholeBlock = lastBlock;
  const checkedEndOfBoreholeBlock: BaseBlock & EndOfBoreholeBlock = checkAndReturnEndOfBoreholeBlock({
    blocks: editedBlocks,
    boreholeId: endOfBoreholeBlock.boreholeId,
    otherInstallations: endOfBoreholeBlock.otherInstallations,
    customInstallations: endOfBoreholeBlock.customInstallations,
    installationDepthInMetresStr: endOfBoreholeBlock.installationDepthInMetres?.toFixed(3) ?? '',
    remarks: endOfBoreholeBlock.remarks,
  });
  const editedEndOfBoreholeBlock: BaseBlock & EndOfBoreholeBlock = {
    ...checkedEndOfBoreholeBlock,
    id: endOfBoreholeBlock.id,
  };
  await editBlockDbAsync(editedEndOfBoreholeBlock);
  return [...editedBlocks.slice(0, -1), editedEndOfBoreholeBlock];
}