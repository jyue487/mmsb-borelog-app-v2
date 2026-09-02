import { useState } from "react";
import { Pressable, type ViewProps } from "react-native";

import { AsphaltBlockComponent } from '@/src/components/blockComponents/AsphaltBlockComponent';
import { CavityBlockComponent } from '@/src/components/blockComponents/CavityBlockComponent';
import { ConcreteSlabBlockComponent } from '@/src/components/blockComponents/ConcreteSlabBlockComponent';
import { ConstantHeadPermeabilityTestBlockComponent } from '@/src/components/blockComponents/ConstantHeadPermeabilityTestBlockComponent';
import { CoringBlockComponent } from '@/src/components/blockComponents/CoringBlockComponent';
import { CustomBlockComponent } from '@/src/components/blockComponents/CustomBlockComponent';
import { EndOfBoreholeBlockComponent } from '@/src/components/blockComponents/EndOfBoreholeBlockComponent';
import { FallingHeadPermeabilityTestBlockComponent } from '@/src/components/blockComponents/FallingHeadPermeabilityTestBlockComponent';
import { HaBlockComponent } from '@/src/components/blockComponents/HaBlockComponent';
import { LugeonTestBlockComponent } from '@/src/components/blockComponents/LugeonTestBlockComponent';
import { MzBlockComponent } from '@/src/components/blockComponents/MzBlockComponent';
import { PressuremeterTestBlockComponent } from '@/src/components/blockComponents/PressuremeterTestBlockComponent';
import { PsBlockComponent } from '@/src/components/blockComponents/PsBlockComponent';
import { RisingHeadPermeabilityTestBlockComponent } from '@/src/components/blockComponents/RisingHeadPermeabilityTestBlockComponent';
import { SptBlockComponent } from '@/src/components/blockComponents/SptBlockComponent';
import { UdBlockComponent } from '@/src/components/blockComponents/UdBlockComponent';
import { VaneShearTestBlockComponent } from '@/src/components/blockComponents/VaneShearTestBlockComponent';
import { WashBoringBlockComponent } from '@/src/components/blockComponents/WashBoringBlockComponent';
import { BlockDetailsInputForm } from "@/src/components/blockDetailsInputForms/BlockDetailsInputForm";
import { styles } from "@/src/constants/styles";
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
} from '@mmsb/core';

export type BlockProps = ViewProps & {
	block: BaseBlock & Block;
	blocks: Block[];
	setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
};

function SpecificBlockComponent({ block, blocks, setBlocks, ...otherProps }: BlockProps) {
	switch (block.blockTypeId) {
		case SPT_BLOCK_TYPE_ID:
			return <SptBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />;
		case CORING_BLOCK_TYPE_ID:
			return <CoringBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		case CAVITY_BLOCK_TYPE_ID:
			return <CavityBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		case UD_BLOCK_TYPE_ID:
			return <UdBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		case MZ_BLOCK_TYPE_ID:
			return <MzBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		case PS_BLOCK_TYPE_ID:
			return <PsBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		case HA_BLOCK_TYPE_ID:
			return <HaBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		case WASH_BORING_BLOCK_TYPE_ID:
			return <WashBoringBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		case CONCRETE_SLAB_BLOCK_TYPE_ID:
			return <ConcreteSlabBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		case ASPHALT_BLOCK_TYPE_ID:
			return <AsphaltBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		case END_OF_BOREHOLE_BLOCK_TYPE_ID:
			return <EndOfBoreholeBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		case CUSTOM_BLOCK_TYPE_ID:
			return <CustomBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		case VANE_SHEAR_TEST_BLOCK_TYPE_ID:
			return <VaneShearTestBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		case FALLING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
			return <FallingHeadPermeabilityTestBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		case RISING_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
			return <RisingHeadPermeabilityTestBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		case CONSTANT_HEAD_PERMEABILITY_TEST_BLOCK_TYPE_ID:
			return <ConstantHeadPermeabilityTestBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		case LUGEON_TEST_BLOCK_TYPE_ID:
			return <LugeonTestBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		case PRESSUREMETER_TEST_BLOCK_TYPE_ID:
			return <PressuremeterTestBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		default:
			throw new Error('Unknown block type');
	}
}

export function BlockComponent({ block, blocks, setBlocks, ...otherProps }: BlockProps) {
	const [isEditState, setIsEditState] = useState<boolean>(false);

	if (isEditState) {
		return <BlockDetailsInputForm blocks={blocks} setBlocks={setBlocks} boreholeId={block.boreholeId} inputBlock={block} setIsVisible={setIsEditState} action='edit' />
	}

	return (
		<Pressable 
			onLongPress={() => setIsEditState(true)}
			style={({ pressed }) => [
				{ flexDirection: 'row'}, 
				pressed && { transform: [{ scale: 1.02 }], backgroundColor: 'white' },
				styles.block,
			]} 
			{...otherProps}>
			<SpecificBlockComponent block={block} blocks={blocks} setBlocks={setBlocks} />
		</Pressable>
	);
}