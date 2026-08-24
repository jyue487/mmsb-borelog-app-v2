import { createDefaultDayWorkStatus, type DayWorkStatus } from '../constants/DayWorkStatus';
import { type BaseBlock, CORING_BLOCK_TYPE_ID } from './Block';
import { type ColourProperties, createDefaultColourProperties } from './ColourProperties';
import { createDefaultRockProperties, type RockProperties } from './RockProperties';

export interface CoringBlock {
	blockTypeId: typeof CORING_BLOCK_TYPE_ID;
	rockSampleIndex: number;
	dayWorkStatus: DayWorkStatus;
	topDepthInMetres: number;
	baseDepthInMetres: number;
	description: string;
	coreRunInMetres: number;
	coreRecoveryInPercentage: number;
	rqdInPercentage: number;
	coreRecoveryInMetres: number;
	rqdInMetres: number;
	colourProperties: ColourProperties;
	rockProperties: RockProperties;
}

export function createDefaultCoringBlock(): BaseBlock & CoringBlock {
	return {
		id: '',
		boreholeId: '',
		blockTypeId: CORING_BLOCK_TYPE_ID,
		rockSampleIndex: -1,
		dayWorkStatus: createDefaultDayWorkStatus(),
		topDepthInMetres: -1,
		baseDepthInMetres: -1,
		description: '',
		coreRunInMetres: -1,
		coreRecoveryInPercentage: -1,
		rqdInPercentage: -1,
		coreRecoveryInMetres: -1,
		rqdInMetres: -1,
		colourProperties: createDefaultColourProperties(),
		rockProperties: createDefaultRockProperties(),
		createdAt: new Date(),
		updatedAt: null,
	};
}